"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BasePageLayout, DataTable, Column, DataTableAction, FilterOption, TableFilters } from "@/components/ui/enhanced";
import { encryptId } from "@/lib/encryption";
import { API } from "@/lib/api-client";
import type { User as ApiUser } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<TableFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const { user, isAdmin, canManageUsers } = useAuth();

  useEffect(() => {
    // Only load users if user can manage them
    if (canManageUsers) {
      loadUsers();
    } else {
      setLoading(false);
      setError("You don't have permission to manage users");
    }
  }, [canManageUsers, page, limit, filterValues]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.users.getUsers({ 
        page, 
        limit,
        ...filterValues // Apply filters
      });
      console.log('Users API response:', res);
      
      // Handle paginated response
      const response = res.data as any;
      const usersData = response?.items || response?.data || res.data || [];
      const totalCount = response?.total || response?.count || usersData.length;
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotal(totalCount);
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter options untuk tabel
  const filters: FilterOption[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Search by name...'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Search by email...'
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Choose Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      placeholder: 'Choose Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  // Kolom tabel dengan render yang sama seperti config
  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{String(value)}</div>
          <div className="text-sm text-gray-500">{String(row.email)}</div>
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
          String(value) === 'superadmin' 
            ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200' 
            : String(value) === 'admin'
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200'
            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
        }`}>
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (value, row) => {
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
  const actions: DataTableAction[] = canManageUsers ? [
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row as ApiUser),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (row) => handleDelete(row as ApiUser),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      variant: 'danger'
    }
  ] : [];

  const handleCreate = () => {
    if (canManageUsers) {
      router.push('/admin/users/create');
    }
  };

  const handleEdit = (user: ApiUser) => {
    router.push(`/admin/users/${encryptId(String(user.id))}`);
  };

  const handleDelete = (user: ApiUser) => {
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      (async () => {
        try {
          await API.users.deleteUser(Number(user.id));
          await loadUsers();
        } catch (err: any) {
          console.error('Delete user failed', err);
          alert(err?.message || 'Delete failed');
        }
      })();
    }
  };

  const handleFilterChange = (filters: TableFilters) => {
    setFilterValues(filters);
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic here
    console.log('Sort:', column, direction);
  };

  if (!canManageUsers) {
    return (
      <BasePageLayout
        title="User Management"
        subtitle="Access Denied"
        badge={{ text: "Restricted", variant: "red" }}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-red-900">Access Denied</h3>
          <p className="text-red-700 mt-2">You don't have permission to manage users.</p>
        </div>
      </BasePageLayout>
    );
  }

  return (
    <BasePageLayout
      title="User Management"
      subtitle="Kelola admin dan super admin users dengan permission lengkap"
      badge={{ text: `${users.length} Users`, variant: "blue" }}
      actions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      }
    >
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSort={handleSort}
        loading={loading}
        emptyMessage="Belum ada users"
        emptyIcon={
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        }
        pagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1); // Reset to first page when changing limit
          }
        }}
        showExport
        onExport={() => console.log('Export data')}
      />
    </BasePageLayout>
  );
}
