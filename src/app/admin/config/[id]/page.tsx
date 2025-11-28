/* Config Detail Page - Clean Unified Implementation */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfigAPI } from "@/lib/api-client";
import type { Config } from "@/types/api";
import { CONFIG_GROUPS, DEFAULT_CONFIG_STATUS, DEFAULT_CONFIG_ORDER } from "@/lib/constants/config";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConfigDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [paramId, setParamId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    group: "",
    key: "",
    value: "",
    description: "",
    order: DEFAULT_CONFIG_ORDER,
    isActive: DEFAULT_CONFIG_STATUS
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isCreateMode = paramId === "new";

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setParamId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!paramId) return;
    
    const loadConfig = async () => {
      if (!isCreateMode) {
        try {
          setLoading(true);
          const response = await ConfigAPI.getConfig(parseInt(paramId));
          
          if (response.success && response.data) {
            const config = response.data;
            setFormData({
              group: config.group,
              key: config.key,
              value: config.value,
              description: config.description || "",
              order: config.order || DEFAULT_CONFIG_ORDER,
              isActive: config.isActive
            });
          } else {
            setError(response.message || 'Failed to load configuration');
          }
        } catch (err) {
          setError('Failed to connect to server');
          console.error('Error loading config:', err);
        }
      }
      setLoading(false);
    };
    
    loadConfig();
  }, [paramId, isCreateMode]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate required fields
      if (!formData.group || !formData.key || !formData.value) {
        setError('Please fill in all required fields');
        return;
      }
      
      const configData = {
        group: formData.group,
        key: formData.key,
        value: formData.value,
        description: formData.description || undefined,
        order: formData.order,
        isActive: formData.isActive
      };
      
      let response;
      if (isCreateMode) {
        response = await ConfigAPI.createConfig(configData);
      } else {
        response = await ConfigAPI.updateConfig(parseInt(paramId), configData);
      }
      
      if (response.success) {
        router.push("/admin/config");
      } else {
        setError(response.message || 'Failed to save configuration');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!paramId || loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/config")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Configurations
        </button>
        <h1 className="text-2xl font-bold">
          {isCreateMode ? "Create Configuration" : "Edit Configuration"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Group <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Group</option>
              {CONFIG_GROUPS.map(group => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., jakarta_pusat, pelayanan_anak"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use a unique key identifier (e.g., "jakarta_pusat", "pelayanan_anak")
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jakarta Pusat, Pelayanan Anak"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The display value for this configuration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jakarta Central location, Service for church children"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional detailed description of this configuration item
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || DEFAULT_CONFIG_ORDER })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={String(DEFAULT_CONFIG_ORDER)}
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Display order for this configuration item
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Status: Active</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              All new configurations are automatically set to active status
            </p>
          </div>
        </div>

        {/* Preview of API payload (for development/testing) */}
        {(formData.group || formData.key || formData.value) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">API Payload Preview:</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify({
                group: formData.group,
                key: formData.key,
                value: formData.value,
                description: formData.description || undefined,
                order: formData.order,
                isActive: formData.isActive
              }, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => router.push("/admin/config")}
            className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isCreateMode ? "Create" : "Update")}
          </button>
        </div>
      </div>
    </div>
  );
}