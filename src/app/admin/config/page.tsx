"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { Modal } from "@/components/ui/common/Modal";
import { FormField, TextField, Button } from "@/components/ui/common/FormControls";

// Types
interface ConfigItem {
  id: number;
  group: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

// Mock data
const mockConfigs: ConfigItem[] = [
  {
    id: 1,
    group: "Ministry Types",
    key: "pelayanan_anak",
    value: "Pelayanan Anak",
    description: "Pelayanan untuk anak-anak gereja",
    updatedAt: "2025-08-30T10:00:00Z"
  },
  {
    id: 2,
    group: "Ministry Types", 
    key: "pelayanan_remaja",
    value: "Pelayanan Remaja",
    description: "Pelayanan untuk remaja gereja",
    updatedAt: "2025-08-29T14:30:00Z"
  },
  {
    id: 3,
    group: "Ministry Types",
    key: "worship_team",
    value: "Worship Team", 
    description: "Tim musik dan pujian",
    updatedAt: "2025-08-28T09:15:00Z"
  },
  {
    id: 4,
    group: "Question Types",
    key: "multiple_choice",
    value: "Multiple Choice",
    description: "Pilihan ganda dengan satu jawaban benar",
    updatedAt: "2025-08-27T16:20:00Z"
  },
  {
    id: 5,
    group: "Question Types",
    key: "multiple_select", 
    value: "Multiple Select",
    description: "Pilihan ganda dengan beberapa jawaban benar",
    updatedAt: "2025-08-26T11:45:00Z"
  }
];

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>(mockConfigs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [formData, setFormData] = useState({
    group: "",
    key: "",
    value: "",
    description: ""
  });

  const columns: Column[] = [
    {
      key: "group",
      label: "Group",
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: "key", 
      label: "Key",
      render: (value) => (
        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {value}
        </code>
      )
    },
    {
      key: "value",
      label: "Value",
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (value) => new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  const handleAdd = () => {
    setFormData({
      group: "",
      key: "",
      value: "",
      description: ""
    });
    setEditingConfig(null);
    setShowAddModal(true);
  };

  const handleEdit = (config: ConfigItem) => {
    setFormData({
      group: config.group,
      key: config.key,
      value: config.value,
      description: config.description
    });
    setEditingConfig(config);
    setShowAddModal(true);
  };

  const handleDelete = (config: ConfigItem) => {
    if (confirm(`Are you sure you want to delete "${config.value}"?`)) {
      setConfigs(configs.filter(c => c.id !== config.id));
    }
  };

  const handleSave = () => {
    if (editingConfig) {
      // Edit existing config
      setConfigs(configs.map(c => 
        c.id === editingConfig.id 
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Add new config
      const newConfig: ConfigItem = {
        id: Math.max(...configs.map(c => c.id)) + 1,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      setConfigs([...configs, newConfig]);
    }
    setShowAddModal(false);
  };

  // Group configs by group name
  const groupedStats = configs.reduce((acc, config) => {
    acc[config.group] = (acc[config.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuration</h1>
            <p className="text-gray-600 mt-2">Kelola konfigurasi sistem dan master data</p>
          </div>
          <Button onClick={handleAdd}>
            ➕ Add Config
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-indigo-600 text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Configs</h3>
              <p className="text-3xl font-bold text-indigo-600">{configs.length}</p>
            </div>
          </div>
        </div>

        {Object.entries(groupedStats).map(([group, count]) => (
          <div key={group} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-2xl">
                  {group === 'Ministry Types' ? '⛪' : '❓'}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{group}</h3>
                <p className="text-3xl font-bold text-green-600">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Config Groups Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(groupedStats).map(([group, count]) => (
          <div key={group} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{group}</h3>
            <div className="space-y-2">
              {configs
                .filter(c => c.group === group)
                .slice(0, 3)
                .map(config => (
                  <div key={config.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{config.value}</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{config.key}</code>
                  </div>
                ))}
              {configs.filter(c => c.group === group).length > 3 && (
                <div className="text-sm text-gray-500">
                  +{configs.filter(c => c.group === group).length - 3} more...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Config Table */}
      <DataTable
        columns={columns}
        data={configs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Add/Edit Config Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title={editingConfig ? "Edit Configuration" : "Add New Configuration"}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Group" required>
            <TextField
              value={formData.group}
              onChange={(value) => setFormData({...formData, group: value})}
              placeholder="e.g., Ministry Types"
            />
          </FormField>
          
          <FormField label="Key" required>
            <TextField
              value={formData.key}
              onChange={(value) => setFormData({...formData, key: value})}
              placeholder="e.g., pelayanan_anak"
            />
          </FormField>
          
          <FormField label="Value" required>
            <TextField
              value={formData.value}
              onChange={(value) => setFormData({...formData, value: value})}
              placeholder="e.g., Pelayanan Anak"
            />
          </FormField>
          
          <FormField label="Description">
            <TextField
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Optional description"
            />
          </FormField>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingConfig ? "Update" : "Add"} Config
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
