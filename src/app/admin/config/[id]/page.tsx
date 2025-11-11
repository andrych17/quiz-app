/* Config Detail Page - Clean Unified Implementation */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    isActive: true
  });

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
    setLoading(false);
    
    if (!isCreateMode) {
      // Load existing config data here
      console.log("Loading config:", paramId);
    }
  }, [paramId, isCreateMode]);

  const handleSave = async () => {
    console.log("Saving config:", formData);
    router.push("/admin/config");
  };

  if (!paramId || loading) {
    return <div>Loading...</div>;
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group</label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Group</option>
              <option value="location">Location</option>
              <option value="service">Service Types</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., jakarta_pusat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., Jakarta Pusat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="mr-2"
                />
                Active
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="mr-2"
                />
                Inactive
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => router.push("/admin/config")}
            className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isCreateMode ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}