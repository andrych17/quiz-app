"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseIndexForm } from "@/components/ui/common/BaseIndexForm";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { db } from "@/lib/mockdb";
import { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const dbUsers = db.getUsers();
    setUsers(dbUsers);
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      filterable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
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
          value === 'superadmin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'superadmin' ? 'Super Admin' : 'Admin'}
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
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-1.5 h-1.5 mr-1 rounded-full ${
            value ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => value ? new Date(value).toLocaleDateString('id-ID', {
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
          <button
            onClick={() => handleEdit(row)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleView = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      const success = db.deleteUser(user.id);
      if (success) {
        loadUsers();
      }
    }
  };

  return (
    <BaseIndexForm
      title="User Management"
      subtitle="Manage admin and super admin users with comprehensive permissions"
      createUrl="/admin/users/create/edit"
      createLabel="Create New User"
    >
      <DataTable
        columns={columns}
        data={users}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </BaseIndexForm>
  );
}
