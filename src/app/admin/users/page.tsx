"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { Modal } from "@/components/ui/common/Modal";
import { FormField, TextField, Select, Button } from "@/components/ui/common/FormControls";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@gms.church",
    role: "superadmin",
    lastLogin: "2025-08-30T10:00:00Z",
    status: "active"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@gms.church", 
    role: "admin",
    lastLogin: "2025-08-29T14:30:00Z",
    status: "active"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@gms.church",
    role: "admin", 
    lastLogin: "2025-08-28T09:15:00Z",
    status: "inactive"
  }
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin"
  });

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
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
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'superadmin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'superadmin' ? '👑 Superadmin' : '🛡️ Admin'}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? '✅ Active' : '❌ Inactive'}
        </span>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];

  const handleAdd = () => {
    setFormData({ name: "", email: "", role: "admin" });
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  const handleSave = () => {
    if (editingUser) {
      // Edit existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Add new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        lastLogin: new Date().toISOString(),
        status: 'active'
      };
      setUsers([...users, newUser]);
    }
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 User Management</h1>
            <p className="text-gray-600 mt-2">Kelola pengguna admin dan superadmin</p>
          </div>
          <Button onClick={handleAdd}>
            ➕ Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-2xl">👑</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Superadmins</h3>
              <p className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.role === 'superadmin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Add/Edit User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Name" required>
            <TextField
              value={formData.name}
              onChange={(value) => setFormData({...formData, name: value})}
              placeholder="Enter user name"
            />
          </FormField>
          
          <FormField label="Email" required>
            <TextField
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({...formData, email: value})}
              placeholder="Enter email address"
            />
          </FormField>
          
          <FormField label="Role" required>
            <Select
              value={formData.role}
              onChange={(value) => setFormData({...formData, role: value})}
              options={[
                { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Superadmin" }
              ]}
            />
          </FormField>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? "Update" : "Add"} User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
