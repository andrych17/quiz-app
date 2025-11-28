"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BasePageLayout, DataTable, Column, DataTableAction, FilterOption, TableFilters, SortConfig } from "@/components/ui/enhanced";
import { ConfigAPI } from "@/lib/api-client";
import type { Config } from "@/types/api";
import { CONFIG_GROUPS } from "@/lib/constants/config";

export default function ConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<TableFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'DESC' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Memoize filter values to prevent unnecessary re-renders
  const memoizedFilterValues = useMemo(() => filterValues, [filterValues]);

  // Load configurations from API
  const loadConfigs = useCallback(async () => {
    console.log('⚙️ loadConfigs called');
    console.log('⚙️ Current filters:', memoizedFilterValues);
    console.log('⚙️ Page:', page, 'Limit:', limit);
    
    setLoading(true);
    setError(null);
    try {
      const params = { 
        page, 
        limit,
        ...memoizedFilterValues
      };
      console.log('⚙️ API call params:', params);
      
      const response = await ConfigAPI.getConfigs(params);
      console.log('⚙️ Config API response:', response);
      
      if (response.success && response.data) {
        // Handle paginated response
        const responseData = response.data as { items?: Config[], data?: Config[], total?: number, count?: number };
        const configsData = responseData?.items || responseData?.data || (Array.isArray(response.data) ? response.data : []);
        const totalCount = responseData?.total || responseData?.count || (Array.isArray(configsData) ? configsData.length : 0);
        
        console.log('⚙️ Configs data:', configsData);
        console.log('⚙️ Total count:', totalCount);
        
        setConfigs(configsData);
        setTotal(totalCount);
      } else {
        setError(response.message || 'Failed to load configurations');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error loading configs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, memoizedFilterValues]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleCreate = () => {
    router.push("/admin/config/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/config/${id}`);
  };

  const handleFilterChange = useCallback((newFilters: TableFilters) => {
    console.log('⚙️ Filter changed:', newFilters);
    setFilterValues(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleSort = useCallback((field: string, direction: 'ASC' | 'DESC') => {
    console.log('⚙️ Sort changed:', field, direction);
    setSortConfig({ field, direction });
    setPage(1); // Reset to first page when sort changes
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    console.log('⚙️ Limit changed:', newLimit);
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  // Filter options
  const filters: FilterOption[] = useMemo(() => [
    {
      key: 'group',
      label: 'Group',
      type: 'select' as const,
      placeholder: 'Choose Group',
      options: CONFIG_GROUPS
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select' as const,
      placeholder: 'Choose Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ], []);

  // Table columns
  const columns: Column[] = [
    {
      key: "group",
      label: "Group",
      render: (value: unknown) => (
        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      )
    },
    {
      key: "key",
      label: "Key",
      render: (value: unknown) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {String(value)}
        </code>
      )
    },
    {
      key: "value",
      label: "Value",
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">
          {String(value)}
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: unknown) => {
        const isActive = value === true || value === 'true' || value === 1 || value === '1';
        return (
          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
            isActive 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
          }`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${
              isActive ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }
    },
    {
      key: "order",
      label: "Order",
      render: (value: unknown) => (
        <span className="text-sm text-gray-600">
          {String(value || '-')}
        </span>
      )
    }
  ];

  // Table actions
  const actions: DataTableAction[] = [
    {
      label: "Edit",
      onClick: (row: Config) => handleEdit(row.id),
      variant: "secondary" as const
    }
  ];

  if (error) {
    return (
      <BasePageLayout
        title="System Configuration"
        actions={
          <button 
            onClick={loadConfigs}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        }
      >
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      </BasePageLayout>
    );
  }

  return (
    <BasePageLayout
      title="System Configuration"
      actions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Configuration
        </button>
      }
    >
      <DataTable
        data={configs}
        columns={columns}
        actions={actions}
        filters={filters}
        filterValues={filterValues}
        sortConfig={sortConfig}
        onFilterChange={handleFilterChange}
        onSort={handleSort}
        loading={loading}
        emptyMessage="Belum ada konfigurasi"
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
          onLimitChange: handleLimitChange
        }}
        showExport
        onExport={() => console.log('Export config data')}
      />
    </BasePageLayout>
  );
}
