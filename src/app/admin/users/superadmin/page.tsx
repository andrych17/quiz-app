"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import type { User, Quiz, UserQuizAssignment } from "@/types/api";

interface UserWithAssignments extends User {
  assignedQuizzes?: Quiz[];
}

export default function SuperadminUserManagementPage() {
  const [users, setUsers] = useState<UserWithAssignments[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<UserQuizAssignment[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithAssignments | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: currentUser, isSuperadmin } = useAuth();

  // Form state for create/edit user
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'user' | 'superadmin',
    assignedQuizIds: [] as number[]
  });

  // Quiz assignment state
  const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);

  useEffect(() => {
    if (!isSuperadmin) {
      setError("Access denied. Superadmin role required.");
      setLoading(false);
      return;
    }
    loadData();
  }, [isSuperadmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load users, quizzes, and assignments in parallel
      const [usersRes, quizzesRes, assignmentsRes] = await Promise.all([
        API.users.getUsers({ page: 1, limit: 100 }),
        API.quizzes.getQuizzes(),
        API.userQuizAssignments.getAssignments()
      ]);

      if (usersRes.success) {
        const userData = usersRes.data?.items || usersRes.data || [];
        setUsers(Array.isArray(userData) ? userData : []);
      }

      if (quizzesRes.success) {
        const quizData = quizzesRes.data || [];
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      }

      if (assignmentsRes.success) {
        const assignmentData = assignmentsRes.data?.items || assignmentsRes.data || [];
        setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
      }

    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setError(null);

      if (!userForm.name || !userForm.email || !userForm.password) {
        setError('Name, email, and password are required');
        return;
      }

      const createData = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        assignedQuizIds: userForm.assignedQuizIds
      };

      const response = await API.users.createUser(createData);

      if (response.success) {
        alert('User created successfully');
        setIsCreateMode(false);
        setUserForm({ name: '', email: '', password: '', role: 'admin', assignedQuizIds: [] });
        await loadData(); // Refresh data
      }
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: number, updateData: any) => {
    try {
      setError(null);

      const response = await API.users.updateUser(userId, updateData);

      if (response.success) {
        alert('User updated successfully');
        await loadData(); // Refresh data
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setError(null);

      const response = await API.users.deleteUser(userId);

      if (response.success) {
        alert('User deleted successfully');
        await loadData(); // Refresh data
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError(err?.message || 'Failed to delete user');
    }
  };

  const handleAssignQuizzes = async (userId: number) => {
    try {
      setError(null);

      // Create assignments for selected quizzes
      const promises = selectedQuizzes.map(quizId => 
        API.userQuizAssignments.createAssignment({ userId, quizId, isActive: true })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;

      if (successful > 0) {
        alert(`Successfully assigned ${successful} quizzes`);
        setIsAssignMode(false);
        setSelectedUser(null);
        setSelectedQuizzes([]);
        await loadData(); // Refresh data
      }
    } catch (err: any) {
      console.error('Failed to assign quizzes:', err);
      setError(err?.message || 'Failed to assign quizzes');
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this quiz assignment?')) return;

    try {
      setError(null);

      const response = await API.userQuizAssignments.removeAssignment(assignmentId);

      if (response.success) {
        alert('Quiz assignment removed successfully');
        await loadData(); // Refresh data
      }
    } catch (err: any) {
      console.error('Failed to remove assignment:', err);
      setError(err?.message || 'Failed to remove assignment');
    }
  };

  const getUserAssignedQuizzes = (userId: number) => {
    return assignments
      .filter(assignment => assignment.userId === userId)
      .map(assignment => {
        const quiz = quizzes.find(q => q.id === assignment.quizId);
        return quiz ? { ...quiz, assignmentId: assignment.id } : null;
      })
      .filter(Boolean);
  };

  const getUnassignedQuizzes = (userId: number) => {
    const assignedQuizIds = assignments
      .filter(assignment => assignment.userId === userId)
      .map(assignment => assignment.quizId);
    
    return quizzes.filter(quiz => !assignedQuizIds.includes(quiz.id));
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 User Management</h1>
          <p className="text-gray-600 mt-2">Manage admin users and their quiz assignments</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              Superadmin Access
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsCreateMode(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          ➕ Create New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-2xl">👨‍💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Admin Users</h3>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Quizzes</h3>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 text-2xl">🔗</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Assignments</h3>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
        </div>
        
        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const userQuizzes = getUserAssignedQuizzes(user.id);
                return (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'superadmin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role?.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">📧 {user.email}</p>
                        
                        {user.role === 'admin' && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              📝 Assigned Quizzes ({userQuizzes.length}):
                            </p>
                            {userQuizzes.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {userQuizzes.map((quiz: any) => (
                                  <span
                                    key={quiz.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {quiz.title}
                                    <button
                                      onClick={() => handleRemoveAssignment(quiz.assignmentId)}
                                      className="ml-1 text-red-500 hover:text-red-700"
                                      title="Remove assignment"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No quizzes assigned</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedQuizzes([]);
                              setIsAssignMode(true);
                            }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            📝 Assign Quiz
                          </button>
                        )}
                        
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ✏️ Edit
                        </button>
                        
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New User</h2>
              <button
                onClick={() => {
                  setIsCreateMode(false);
                  setUserForm({ name: '', email: '', password: '', role: 'admin', assignedQuizIds: [] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'admin' | 'user' | 'superadmin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {userForm.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Quizzes (Optional)</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {quizzes.map((quiz) => (
                      <label key={quiz.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={userForm.assignedQuizIds.includes(quiz.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserForm({
                                ...userForm,
                                assignedQuizIds: [...userForm.assignedQuizIds, quiz.id]
                              });
                            } else {
                              setUserForm({
                                ...userForm,
                                assignedQuizIds: userForm.assignedQuizIds.filter(id => id !== quiz.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{quiz.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMode(false);
                    setUserForm({ name: '', email: '', password: '', role: 'admin', assignedQuizIds: [] });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Assignment Modal */}
      {isAssignMode && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assign Quizzes to {selectedUser.name}</h2>
              <button
                onClick={() => {
                  setIsAssignMode(false);
                  setSelectedUser(null);
                  setSelectedQuizzes([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select quizzes to assign to this admin user. They will be able to manage these quizzes.
              </p>

              {(() => {
                const unassignedQuizzes = getUnassignedQuizzes(selectedUser.id);
                return unassignedQuizzes.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {unassignedQuizzes.map((quiz) => (
                      <label key={quiz.id} className="flex items-start space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedQuizzes.includes(quiz.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuizzes([...selectedQuizzes, quiz.id]);
                            } else {
                              setSelectedQuizzes(selectedQuizzes.filter(id => id !== quiz.id));
                            }
                          }}
                          className="mt-1 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.description}</div>
                          <div className="text-xs text-gray-400">
                            Type: {quiz.quizType} • 
                            Status: {quiz.isPublished ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    All available quizzes are already assigned to this user.
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsAssignMode(false);
                    setSelectedUser(null);
                    setSelectedQuizzes([]);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignQuizzes(selectedUser.id)}
                  disabled={selectedQuizzes.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
                >
                  Assign Selected ({selectedQuizzes.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}