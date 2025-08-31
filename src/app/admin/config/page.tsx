"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BaseIndexForm } from "@/components/ui/common/BaseIndexForm";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { ConfigItem } from "@/types";
import { encryptId } from "@/lib/encryption";

// Mock data
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
  },
  {
    id: "6",
    group: "Locations",
    key: "surabaya",
    value: "Surabaya",
    description: "Kota Surabaya, Jawa Timur",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "7",
    group: "Locations",
    key: "malang",
    value: "Malang",
    description: "Kota Malang, Jawa Timur",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "8",
    group: "Locations",
    key: "jakarta",
    value: "Jakarta",
    description: "DKI Jakarta",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "9",
    group: "Locations",
    key: "bandung",
    value: "Bandung",
    description: "Kota Bandung, Jawa Barat",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  },
  {
    id: "10",
    group: "Locations",
    key: "yogyakarta",
    value: "Yogyakarta",
    description: "Daerah Istimewa Yogyakarta",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    isActive: true,
    status: "active"
  }
];

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>(mockConfigs);
  const router = useRouter();

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
          {value}
        </span>
      )
    },
    {
      key: "key", 
      label: "Key",
      filterable: true,
      render: (value) => (
        <code className="text-sm font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg border border-gray-200 text-gray-800">
          {value}
        </code>
      )
    },
    {
      key: "value",
      label: "Value",
      render: (value) => (
        <span className="font-semibold text-gray-900 text-sm">{value}</span>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-2">{value}</span>
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
          value 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
        }`}>
          <span className={`w-2 h-2 mr-2 rounded-full ${
            value ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEdit(row)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
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

  const handleCreate = () => {
    router.push('/admin/config/new');
  };

  const handleView = (config: ConfigItem) => {
    router.push(`/admin/config/${encryptId(config.id)}`);
  };

  const handleEdit = (config: ConfigItem) => {
    router.push(`/admin/config/${encryptId(config.id)}`);
  };

  const handleDelete = (config: ConfigItem) => {
    if (confirm(`Are you sure you want to delete "${config.value}"?`)) {
      setConfigs(configs.filter(c => c.id !== config.id));
    }
  };

  // Group configs by group name for stats
  const groupedStats = configs.reduce((acc, config) => {
    acc[config.group] = (acc[config.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: "Total Configurations",
      value: configs.length,
      change: "+12%",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: "Active Items",
      value: configs.filter(c => c.isActive).length,
      change: "+5%",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Configuration Groups",
      value: Object.keys(groupedStats).length,
      change: "0%",
      changeType: "neutral" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m0 0l2 2m-2-2l-2-2m-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      title: "Last Updated",
      value: "Today",
      change: "Just now",
      changeType: "neutral" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <BaseIndexForm
      title="System Configuration"
      subtitle="Kelola konfigurasi sistem dan master data aplikasi"
      createLabel="Add Configuration"
      onCreateClick={handleCreate}
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
            data={configs}
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
