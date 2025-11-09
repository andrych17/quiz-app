"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseIndexForm } from "@/components/ui/common/BaseIndexForm";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { encryptId } from "@/lib/encryption";
import type { Config as ApiConfig } from "@/types/api";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isSuperadmin } = useAuth();

  useEffect(() => {
    // Only load configs if user is superadmin
    if (isSuperadmin) {
      loadConfigs();
    } else {
      setLoading(false);
      setError("You don't have permission to manage system configuration");
    }
  }, [isSuperadmin]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.config.getConfigs();
      setConfigs(res.data || []);
    } catch (err: any) {
      console.error('Failed to load configs', err);
      setError(err?.message || 'Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: "group",
      label: "Group",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Ministry Types", label: "Ministry Types" },
        { value: "Question Types", label: "Question Types" },
        { value: "Locations", label: "Locations" }
      ],
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2l-2-2m-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
          </svg>
          {String(value)}
        </span>
      )
    },
    {
      key: "key", 
      label: "Key",
      filterable: true,
      render: (value) => (
        <code className="text-sm font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg border border-gray-200 text-gray-800">
          {String(value)}
        </code>
      )
    },
    {
      key: "value",
      label: "Value",
      render: (value) => (
        <span className="font-semibold text-gray-900 text-sm">{String(value)}</span>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-2">{String(value)}</span>
      )
    },
    {
      key: "isActive",
      label: "Status",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
          Boolean(value) 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
        }`}>
          <span className={`w-2 h-2 mr-2 rounded-full ${
            Boolean(value) ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          {Boolean(value) ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (value) => {
        const dateValue = String(value);
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {new Date(dateValue).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(dateValue).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          {isSuperadmin ? (
            <>
              <button
                onClick={() => handleEdit(row as unknown as ApiConfig)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDelete(row as unknown as ApiConfig)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Superadmin only</span>
          )}
        </div>
      )
    }
  ];

  const handleCreate = () => {
    if (isSuperadmin) {
      router.push('/admin/config/new');
    }
  };

  const handleEdit = (config: ApiConfig) => {
    router.push(`/admin/config/${encryptId(String(config.id))}`);
  };

  const handleDelete = (config: ApiConfig) => {
    if (confirm(`Are you sure you want to delete "${config.value}"?`)) {
      (async () => {
        try {
          await API.config.deleteConfig(Number(config.id));
          await loadConfigs();
        } catch (err: any) {
          console.error('Delete config failed', err);
          alert(err?.message || 'Delete failed');
        }
      })();
    }
  };

  return (
    <BaseIndexForm
      title="System Configuration"
      subtitle={isSuperadmin ? "Kelola konfigurasi sistem dan master data aplikasi" : "View system configuration (read-only access)"}
      createLabel={isSuperadmin ? "Add Configuration" : undefined}
      onCreateClick={isSuperadmin ? handleCreate : undefined}
    >

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuration Items</h3>
          <p className="text-sm text-gray-600 mt-1">Manage system configurations and master data</p>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={configs as unknown as Record<string, unknown>[]}
            searchable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
          />
        </div>
      </div>
    </BaseIndexForm>
  );
}
