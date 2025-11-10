"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { BaseEditForm, TextField } from "@/components/ui/common";
import type { User, Quiz, UserQuizAssignment } from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<UserQuizAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isSuperadmin } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'user' | 'superadmin'
  });

  const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);

  // Extract userId from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const isCreateMode = userId === 'create';

  useEffect(() => {
    if (!userId) return;

    if (!isSuperadmin) {
      setError("Access denied. Superadmin role required.");
      setLoading(false);
      return;
    }
    
    if (isCreateMode) {
      setLoading(false);
    } else {
      loadUserData();
    }
  }, [userId, isSuperadmin, isCreateMode]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, quizzesRes, assignmentsRes] = await Promise.all([
        API.users.getUser(Number(userId)),
        API.quizzes.getQuizzes(),
        API.userQuizAssignments.getUserAssignments(Number(userId))
      ]);

      if (userRes.success && userRes.data) {
        const userData = userRes.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          password: '',
          role: userData.role || 'admin'
        });
      }

      if (quizzesRes.success) {
        const quizData = (quizzesRes.data as any)?.items || quizzesRes.data || [];
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      }

      if (assignmentsRes.success) {
        const assignmentData = (assignmentsRes.data as any)?.items || assignmentsRes.data || [];
        const userAssignments = Array.isArray(assignmentData) ? assignmentData : [];
        setAssignments(userAssignments);
        
        const assignedQuizIds = userAssignments.map(assignment => assignment.quizId);
        setSelectedQuizzes(assignedQuizIds);
      }

    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isCreateMode) {
      return handleCreateUser();
    } else {
      return handleUpdateUser();
    }
  };

  const handleCreateUser = async () => {
    try {
      setError(null);
      setSaving(true);

      if (!formData.name || !formData.email || !formData.password) {
        setError('Name, email, and password are required');
        return;
      }

      const createData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        assignedQuizIds: selectedQuizzes
      };

      const response = await API.users.createUser(createData);

      if (response.success) {
        alert('User created successfully');
        router.push('/admin/users');
      }
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!user) return;

    try {
      setError(null);
      setSaving(true);

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await API.users.updateUser(Number(userId), updateData);

      if (response.success) {
        // Update quiz assignments
        await handleUpdateQuizAssignments();
        
        alert('User updated successfully');
        router.push('/admin/users');
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuizAssignments = async () => {
    if (!user || isCreateMode) return;

    try {
      const currentAssignedIds = assignments.map(a => a.quizId);
      const toAdd = selectedQuizzes.filter(id => !currentAssignedIds.includes(id));
      const toRemove = assignments.filter(a => !selectedQuizzes.includes(a.quizId));

      if (toAdd.length > 0) {
        const addPromises = toAdd.map(quizId =>
          API.userQuizAssignments.createAssignment({ userId: Number(userId), quizId, isActive: true })
        );
        await Promise.all(addPromises);
      }

      if (toRemove.length > 0) {
        const removePromises = toRemove.map(assignment =>
          API.userQuizAssignments.removeAssignment(assignment.id)
        );
        await Promise.all(removePromises);
      }

    } catch (err: any) {
      console.error('Failed to update quiz assignments:', err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        setSaving(true);
        const response = await API.users.deleteUser(Number(userId));

        if (response.success) {
          alert('User deleted successfully');
          router.push('/admin/users');
        }
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        setError(err?.message || 'Failed to delete user');
      } finally {
        setSaving(false);
      }
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error || (!isCreateMode && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error || 'User not found'}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  // Prepare tabs for multi-step form
  const tabs = [
    {
      id: 'basic',
      label: 'Basic Information',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name {isCreateMode && <span className="text-red-500">*</span>}
              </label>
              <TextField
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                disabled={saving}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {isCreateMode && <span className="text-red-500">*</span>}
              </label>
              <TextField
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                disabled={saving}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isCreateMode ? 'Password' : 'Password (leave blank to keep current)'}
                {isCreateMode && <span className="text-red-500">*</span>}
              </label>
              <TextField
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                disabled={saving}
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'superadmin' })}
                disabled={saving}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base sm:text-sm"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quizzes',
      label: 'Quiz Assignments',
      badge: selectedQuizzes.length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Quiz Assignments</h3>
            <span className="text-sm text-gray-500">
              {selectedQuizzes.length} of {quizzes.length} quizzes assigned
            </span>
          </div>

          {/* Currently Assigned Quizzes */}
          {selectedQuizzes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Currently Assigned ({selectedQuizzes.length})
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quizzes.filter(quiz => selectedQuizzes.includes(quiz.id)).map((quiz) => (
                  <label key={quiz.id} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => setSelectedQuizzes(selectedQuizzes.filter(id => id !== quiz.id))}
                      className="mt-1 rounded text-green-600"
                      disabled={saving}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{quiz.title}</div>
                      <div className="text-sm text-gray-600 truncate">{quiz.description}</div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {quiz.quizType}
                        </span>
                        <span className={`flex items-center ${quiz.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${quiz.isPublished ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Available Quizzes to Assign */}
          {quizzes.filter(quiz => !selectedQuizzes.includes(quiz.id)).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Available Quizzes ({quizzes.filter(quiz => !selectedQuizzes.includes(quiz.id)).length})
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quizzes.filter(quiz => !selectedQuizzes.includes(quiz.id)).map((quiz) => (
                  <label key={quiz.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => setSelectedQuizzes([...selectedQuizzes, quiz.id])}
                      className="mt-1 rounded text-blue-600"
                      disabled={saving}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{quiz.title}</div>
                      <div className="text-sm text-gray-600 truncate">{quiz.description}</div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {quiz.quizType}
                        </span>
                        <span className={`flex items-center ${quiz.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${quiz.isPublished ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {quizzes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-lg font-medium">No quizzes available</p>
              <p className="mt-1">Quizzes will appear here when they are created.</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <BaseEditForm
      title={isCreateMode ? 'Create New User' : 'Edit User'}
      subtitle={isCreateMode ? 'Add a new admin user to the system' : 'Update user information and quiz assignments'}
      backUrl="/admin/users"
      backLabel="Back to Users"
      isCreateMode={isCreateMode}
      onSave={handleSave}
      onDelete={!isCreateMode ? handleDelete : undefined}
      isSaving={saving}
      canSave={!saving && !!formData.name && !!formData.email && (isCreateMode ? !!formData.password : true)}
      tabs={tabs}
      defaultTab="basic"
      createdAt={user?.createdAt}
      updatedAt={user?.updatedAt}
    />
  );
}