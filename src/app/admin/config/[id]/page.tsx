"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TabFormLayout, TabConfig } from "@/components/ui/enhanced";
import { BaseEditForm, TextField, TextArea } from "@/components/ui/common";
import { ConfigItem } from "@/types";
import { decryptId, encryptId } from "@/lib/encryption";

// Mock data (same as in page.tsx)
const mockConfigs: ConfigItem[] = [
  {
    id: "1",
    group: "Ministry Types",
    key: "pelayanan_anak",
    value: "Pelayanan Anak",
    description: "Pelayanan untuk anak-anak gereja",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-01-30T10:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "2",
    group: "Ministry Types", 
    key: "pelayanan_remaja",
    value: "Pelayanan Remaja",
    description: "Pelayanan untuk remaja gereja",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-01-29T14:30:00Z",
    createdBy: "admin",
    updatedBy: "superadmin",
    isActive: true,
    status: "active"
  },
  {
    id: "3",
    group: "Ministry Types",
    key: "worship_team",
    value: "Worship Team", 
    description: "Tim musik dan pujian",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-01-28T09:15:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "4",
    group: "Question Types",
    key: "multiple_choice",
    value: "Multiple Choice",
    description: "Pilihan ganda dengan satu jawaban benar",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2025-01-27T16:20:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "5",
    group: "Question Types",
    key: "multiple_select", 
    value: "Multiple Select",
    description: "Pilihan ganda dengan beberapa jawaban benar",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2025-01-26T11:45:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: false,
    status: "inactive"
  }
];

interface PageProps {
  params: Promise<{ id: string }>;
}

function ConfigDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    group: "",
    key: "",
    value: "",
    description: "",
    isActive: true
  });

  const isCreateMode = id === "new";

  // Tab configuration untuk form edit
  const tabs: TabConfig[] = [
    {
      id: 'general',
      name: 'General',
      icon: '⚙️'
    },
    {
      id: 'details',
      name: 'Details',
      icon: '📝'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '🔧'
    },
    {
      id: 'preview',
      name: 'Preview',
      icon: '👁️'
    }
  ];

  const loadConfig = useCallback(() => {
    setLoading(true);
    try {
      const decryptedId = decryptId(id);
      const foundConfig = mockConfigs.find(c => c.id === decryptedId);
      if (foundConfig) {
        setConfig(foundConfig);
        setFormData({
          group: foundConfig.group,
          key: foundConfig.key,
          value: foundConfig.value,
          description: foundConfig.description || "",
          isActive: foundConfig.isActive
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isCreateMode) {
      setIsEditMode(true);
      setLoading(false);
    } else {
      loadConfig();
    }
  }, [id, isCreateMode, loadConfig]);

  const handleSave = async () => {
    if (isCreateMode) {
      // Simulate creating new config
      const newConfig: ConfigItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current_user",
        updatedBy: "current_user",
        status: "active"
      };
      
      // In real app, this would be an API call
      console.log('Creating new config:', newConfig);
      router.push('/admin/config');
    } else {
      // Update existing config
      if (!config) return;
      
      const updatedConfig = {
        ...config,
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: "current_user"
      };
      
      setConfig(updatedConfig);
      setIsEditMode(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (isCreateMode) {
      router.push('/admin/config');
    } else {
      if (config) {
        setFormData({
          group: config.group,
          key: config.key,
          value: config.value,
          description: config.description || "",
          isActive: config.isActive
        });
      }
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    if (!config) return;
    
    if (confirm(`Are you sure you want to delete "${config.value}"?`)) {
      // Simulate delete
      router.push('/admin/config');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isCreateMode && !config) {
    return (
      <TabFormLayout
        title="Configuration Not Found"
        subtitle="The requested configuration does not exist"
        tabs={[{ id: 'error', name: 'Error', icon: '❌' }]}
        showSaveButton={false}
        showCancelButton={true}
        onCancel={() => router.push('/admin/config')}
      >
        {() => (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Not Found</h2>
            <p className="text-gray-600">The configuration you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        )}
      </TabFormLayout>
    );
  }

  // Show form for create or edit mode
  if (isCreateMode || isEditMode) {
    return (
      <BaseEditForm
        title={isCreateMode ? "Add New Configuration" : `Edit ${config?.value}`}
        subtitle={isCreateMode ? "Create a new system configuration" : "Update configuration details"}
        backUrl="/admin/config"
        backLabel="Back to Configurations"
        isCreateMode={isCreateMode}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuration Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Group *
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, group: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Group</option>
                  <option value="Ministry Types">Ministry Types</option>
                  <option value="Question Types">Question Types</option>
                  <option value="System Settings">System Settings</option>
                  <option value="User Roles">User Roles</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  placeholder="e.g., pelayanan_anak"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Value *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="e.g., Pelayanan Anak"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => setFormData({...formData, isActive: true})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => setFormData({...formData, isActive: false})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description for this configuration item"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Guidelines */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Use lowercase with underscores for configuration keys (e.g., pelayanan_anak)</li>
              <li>• Choose appropriate groups to organize related configurations</li>
              <li>• Display values should be user-friendly and descriptive</li>
              <li>• Inactive configurations won&apos;t appear in dropdowns or selections</li>
            </ul>
          </div>
        </div>
      </BaseEditForm>
    );
  }

  // Show detail view mode
  if (!config) return null; // This should never happen as we already checked above
  
  return (
    <BaseEditForm
      title={config.value}
      subtitle="View configuration details and settings"
      backUrl="/admin/config"
      backLabel="Back to Configurations"
      isCreateMode={false}
      onSave={handleEdit}
      onDelete={handleDelete}
      createdAt={config.createdAt}
      updatedAt={config.updatedAt}
    >
      <div className="space-y-8">
        {/* Configuration Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuration Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2l-2-2m-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                </svg>
                {config.group}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
              <code className="block text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-900 border border-gray-200">
                {config.key}
              </code>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Value</label>
              <p className="text-lg font-semibold text-gray-900">{config.value}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold ${
                config.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <span className={`w-2 h-2 mr-2 rounded-full ${
                  config.isActive ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {config.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {config.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Age</p>
                  <p className="text-xl font-bold text-blue-900">
                    {Math.floor((new Date().getTime() - new Date(config.createdAt || "").getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                  <p className="text-xs text-blue-600">since creation</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2l-2-2m-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Group Items</p>
                  <p className="text-xl font-bold text-green-900">
                    {mockConfigs.filter(c => c.group === config.group).length}
                  </p>
                  <p className="text-xs text-green-600">in same group</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Type</p>
                  <p className="text-xl font-bold text-purple-900">System</p>
                  <p className="text-xs text-purple-600">configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Configurations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Related Configurations</h3>
          <div className="space-y-3">
            {mockConfigs
              .filter(c => c.group === config.group && c.id !== config.id)
              .slice(0, 5)
              .map((relatedConfig) => (
                <div key={relatedConfig.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {relatedConfig.key}
                    </code>
                    <span className="text-sm font-medium text-gray-900">
                      {relatedConfig.value}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/config/${encryptId(relatedConfig.id)}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View →
                  </button>
                </div>
              ))}
            
            {mockConfigs.filter(c => c.group === config.group && c.id !== config.id).length === 0 && (
              <p className="text-gray-500 text-center py-4">No other configurations in this group</p>
            )}
          </div>
        </div>
      </div>
    </BaseEditForm>
  );
}

export default function ConfigDetailPage({ params }: PageProps) {
  const [id, setId] = useState<string>("");
  
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);
  
  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return <ConfigDetailContent id={id} />;
}
