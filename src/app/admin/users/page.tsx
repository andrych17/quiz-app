"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseIndexForm } from "@/components/ui/common/BaseIndexForm";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { API } from "@/lib/api-client";
import type { User as ApiUser } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isSuperadmin, canManageUsers } = useAuth();

  useEffect(() => {
    // Only load users if user can manage them
    if (canManageUsers) {
      loadUsers();
    } else {
      setLoading(false);
      setError("You don't have permission to manage users");
    }
  }, [canManageUsers]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.users.getUsers({ page: 1, limit: 100 });
      setUsers(res.data?.items || []);
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      filterable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{String(value)}</div>
          <div className="text-sm text-gray-500">{String((row as Record<string, unknown>).email)}</div>
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "superadmin", label: "Superadmin" },
        { value: "admin", label: "Admin" }
      ],
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          String(value) === 'superadmin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {String(value) === 'superadmin' ? 'Super Admin' : 'Admin'}
        </span>
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
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          Boolean(value) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-1.5 h-1.5 mr-1 rounded-full ${
            Boolean(value) ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          {Boolean(value) ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => value ? new Date(String(value)).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : (
        <span className="text-gray-400 text-sm">Never logged in</span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          {canManageUsers && (
            <>
              <button
                onClick={() => handleEdit(row as unknown as ApiUser)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDelete(row as unknown as ApiUser)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          )}
          {!canManageUsers && (
            <span className="text-xs text-gray-400 italic">View only</span>
          )}
        </div>
      )
    }
  ];

  const handleEdit = (user: ApiUser) => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = (user: ApiUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
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

  return (
    <BaseIndexForm
      title="User Management"
      subtitle={canManageUsers ? "Manage admin and super admin users with comprehensive permissions" : "View users (read-only access)"}
      createUrl={canManageUsers ? "/admin/users/create/edit" : undefined}
      createLabel={canManageUsers ? "Create New User" : undefined}
    >
      {loading && <div className="p-6">Loading users...</div>}
      {error && <div className="p-6 text-red-600">{error}</div>}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={users as unknown as Record<string, unknown>[]}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      )}
    </BaseIndexForm>
  );
}
