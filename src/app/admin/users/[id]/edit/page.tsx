"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseEditForm } from "@/components/ui/common/BaseEditForm";
import { FormField, TextField, Select } from "@/components/ui/common/FormControls";
import { db } from "@/lib/mockdb";
import { User } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const tabs = [
  { id: 'general', name: 'General', icon: 'user' },
  { id: 'permissions', name: 'Permissions', icon: 'shield' }
];

function UserEditContent({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('general');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin" as "admin" | "superadmin",
    // Permissions
    assignedQuizzes: [] as string[],
    canCreateQuiz: false,
    canDeleteQuiz: false,
    canViewReports: true,
    canManageUsers: false
  });

  const isCreateMode = userId === 'create';

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
    } else {
      loadUser();
    }
  }, [userId, isCreateMode]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const foundUser = db.getUserById(userId);
      if (foundUser) {
        setUser(foundUser);
        setFormData(prev => ({
          ...prev,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role as "admin" | "superadmin"
        }));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields in General tab');
      setActiveTab('general');
      return;
    }

    setSaving(true);
    try {
      if (isCreateMode) {
        // Create new user
        const newUser = db.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin'
        });
        
        if (newUser) {
          // In real app, save permissions separately
          console.log('User permissions:', {
            userId: newUser.id,
            assignedQuizzes: formData.assignedQuizzes,
            canCreateQuiz: formData.canCreateQuiz,
            canDeleteQuiz: formData.canDeleteQuiz,
            canViewReports: formData.canViewReports,
            canManageUsers: formData.canManageUsers
          });
          
          router.push('/admin/users');
        } else {
          alert('Failed to create user');
        }
      } else {
        // Update existing user
        const updatedUser = db.updateUser(userId, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        
        if (updatedUser) {
          setUser(updatedUser);
          router.push('/admin/users');
        } else {
          alert('Failed to update user');
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert('Error saving user');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const success = db.deleteUser(userId);
        if (success) {
          router.push('/admin/users');
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert('Error deleting user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isCreateMode && !user) {
    return (
      <BaseEditForm
        title="User Not Found"
        subtitle="The requested user does not exist"
        backUrl="/admin/users"
        isCreateMode={false}
      >
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </BaseEditForm>
    );
  }

  const renderTabIcon = (iconType: string) => {
    switch (iconType) {
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-8">
      {/* Mode Notice */}
      <div className={`${isCreateMode ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
        <div className="flex items-center">
          <svg className={`w-5 h-5 ${isCreateMode ? 'text-green-400' : 'text-blue-400'} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreateMode ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
          </svg>
          <div>
            <h3 className={`text-sm font-semibold ${isCreateMode ? 'text-green-800' : 'text-blue-800'}`}>
              {isCreateMode ? 'Create Mode' : 'Edit Mode'}
            </h3>
            <p className={`text-sm ${isCreateMode ? 'text-green-600' : 'text-blue-600'}`}>
              {isCreateMode ? 'Fill in the user\'s basic information below.' : 'Update the user\'s information and save changes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField label="Full Name" required>
          <TextField
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter user full name"
            disabled={saving}
          />
        </FormField>
        
        <FormField label="Email Address" required>
          <TextField
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="Enter email address"
            disabled={saving}
          />
        </FormField>

        <FormField label="Role" required>
          <Select
            value={formData.role}
            onChange={(value) => setFormData(prev => ({ ...prev, role: value as "admin" | "superadmin" }))}
            options={[
              { value: "admin", label: "Admin" },
              { value: "superadmin", label: "Super Admin" }
            ]}
            disabled={saving}
          />
        </FormField>

        <FormField label={isCreateMode ? "Initial Status" : "Current Status"}>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold ${
              isCreateMode ? 'bg-green-100 text-green-800 border border-green-200' :
              user?.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 
              'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${
                isCreateMode ? 'bg-green-400' : 
                user?.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              {isCreateMode ? 'Active (Default)' : (user?.isActive ? 'Active' : 'Inactive')}
            </span>
            {isCreateMode && (
              <p className="text-xs text-gray-500 mt-1">New users are created as active by default</p>
            )}
          </div>
        </FormField>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-8">
      {/* Permissions Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-purple-800">Permission Configuration</h3>
            <p className="text-sm text-purple-600">Configure specific quiz access and system permissions for this user.</p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Permissions Coming Soon</h3>
        <p className="text-gray-600">
          Permission management system is being developed. For now, focus on basic user information in the General tab.
        </p>
      </div>
    </div>
  );

  const title = isCreateMode ? "Create New User" : `Edit User: ${user?.name}`;
  const subtitle = isCreateMode 
    ? "Add a new user to the system with appropriate permissions"
    : "Update user information and permissions";

  const canSave = formData.name.trim() && formData.email.trim();

  return (
    <BaseEditForm
      title={title}
      subtitle={subtitle}
      backUrl="/admin/users"
      isCreateMode={isCreateMode}
      onSave={handleSave}
      onDelete={isCreateMode ? undefined : handleDelete}
      isSaving={saving}
      canSave={true}
      createdAt={user?.createdAt}
      updatedAt={user?.updatedAt}
      createdBy={user?.createdBy}
      updatedBy={user?.updatedBy}
      isActive={user?.isActive}
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
            >
              {renderTabIcon(tab.icon)}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'permissions' && renderPermissionsTab()}
      </div>
    </BaseEditForm>
  );
}

export default async function UserEditPage({ params }: PageProps) {
  const { id } = await params;
  return <UserEditContent userId={id} />;
}
