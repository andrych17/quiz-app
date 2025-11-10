"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column, DataTableAction } from "@/components/ui/table/DataTable";
import type { FilterOption, TableFilters } from "@/components/ui/table/TableFilterBar";
import { encryptId } from "@/lib/encryption";
import type { Config as ApiConfig } from "@/types/api";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterValues, setFilterValues] = useState<TableFilters>({});
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Only load configs if user is admin
    if (isAdmin) {
      loadConfigs();
    } else {
      setLoading(false);
      setError("You don't have permission to manage system configuration");
    }
  }, [isAdmin, page, limit, filterValues]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.config.getConfigs();
      console.log('Config API response:', res);
      
      // Handle response with filtering and pagination
      const response = res.data as any;
      const configsData = response?.items || response?.data || res.data || [];
      let filteredConfigs = Array.isArray(configsData) ? configsData : [];
      
      // Apply client-side filtering for now
      if (filterValues.key && typeof filterValues.key === 'string') {
        filteredConfigs = filteredConfigs.filter(config => 
          config.key?.toLowerCase().includes(filterValues.key.toLowerCase())
        );
      }
      
      if (filterValues.group && typeof filterValues.group === 'string') {
        filteredConfigs = filteredConfigs.filter(config => 
          config.group?.toLowerCase().includes(filterValues.group.toLowerCase())
        );
      }
      
      if (filterValues.category) {
        filteredConfigs = filteredConfigs.filter(config => 
          config.category === filterValues.category
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedConfigs = filteredConfigs.slice(startIndex, startIndex + limit);
      
      setConfigs(paginatedConfigs);
      setTotal(filteredConfigs.length);
    } catch (err: any) {
      console.error('Failed to load configs', err);
      setError(err?.message || 'Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  // Kolom tabel dengan render yang lebih bersih
  const columns: Column[] = [
    {
      key: "group",
      label: "Group",
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
    }
  ];

  // Actions untuk tabel
  const actions: DataTableAction[] = isAdmin ? [
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row as ApiConfig),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (row) => handleDelete(row as ApiConfig),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      variant: 'danger'
    }
  ] : [];

  const handleCreate = () => {
    if (isAdmin) {
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

  // Filter options untuk tabel
  const filters: FilterOption[] = [
    {
      key: 'key',
      label: 'Key',
      type: 'text',
      placeholder: 'Search by key...'
    },
    {
      key: 'group',
      label: 'Group',
      type: 'text',
      placeholder: 'Search by group...'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'Choose Category',
      options: [
        { value: 'system', label: 'System' },
        { value: 'quiz', label: 'Quiz' },
        { value: 'security', label: 'Security' },
        { value: 'email', label: 'Email' }
      ]
    }
  ];

  const handleFilterChange = (filters: TableFilters) => {
    setFilterValues(filters);
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic here
    console.log('Sort:', column, direction);
  };

  const filterOptions = [
    { label: "All Categories", value: "all" },
    { label: "Application", value: "application" },
    { label: "Database", value: "database" },
    { label: "Email", value: "email" },
    { label: "Security", value: "security" }
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900">Access Denied</h3>
            <p className="text-red-700 mt-2">You don't have permission to manage system configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configurations...</p>
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
            onClick={() => loadConfigs()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system configuration and master data
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Configuration
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={configs}
          actions={actions}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No configurations found"
          emptyIcon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }
          }}
          showExport
          onExport={() => console.log('Export configurations')}
        />
      </div>

      {/* Footer Info */}
      <div className="text-sm text-gray-500 text-center">
        Showing {configs.length} of {total} configurations
      </div>
    </div>
  );
}
