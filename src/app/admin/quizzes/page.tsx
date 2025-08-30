"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/ui/common/DataTable";
import { Modal } from "@/components/ui/common/Modal";
import { FormField, TextField, TextArea, Select, Button } from "@/components/ui/common/FormControls";

// Types
interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: number;
  duration: number; // in minutes
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  participants: number;
}

// Mock data
const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: "Logic Test - Pelayanan Anak",
    description: "Test logika untuk calon pelayan anak-anak",
    questions: 20,
    duration: 30,
    status: "published",
    createdBy: "Admin",
    createdAt: "2025-08-25T10:00:00Z",
    participants: 15
  },
  {
    id: 2,
    title: "Leadership Assessment",
    description: "Assessment untuk posisi leadership dalam gereja",
    questions: 15,
    duration: 25,
    status: "published",
    createdBy: "Admin",
    createdAt: "2025-08-20T14:30:00Z",
    participants: 12
  },
  {
    id: 3,
    title: "Ministry Evaluation",
    description: "Evaluasi untuk berbagai bidang pelayanan",
    questions: 18,
    duration: 35,
    status: "draft",
    createdBy: "Admin",
    createdAt: "2025-08-28T09:15:00Z",
    participants: 0
  }
];

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: 10,
    duration: 30,
    status: "draft" as Quiz['status']
  });

  const columns: Column[] = [
    {
      key: "title",
      label: "Quiz",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: "questions",
      label: "Questions",
      render: (value) => (
        <span className="text-sm font-medium">{value} questions</span>
      )
    },
    {
      key: "duration",
      label: "Duration",
      render: (value) => (
        <span className="text-sm font-medium">{value} minutes</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const colors = {
          draft: 'bg-yellow-100 text-yellow-800',
          published: 'bg-green-100 text-green-800',
          archived: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors]}`}>
            {value === 'draft' && '📝 Draft'}
            {value === 'published' && '✅ Published'}
            {value === 'archived' && '📁 Archived'}
          </span>
        );
      }
    },
    {
      key: "participants",
      label: "Participants",
      render: (value) => (
        <div className="text-center">
          <div className="text-sm font-medium">{value}</div>
          <div className="text-xs text-gray-500">participants</div>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      })
    }
  ];

  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      questions: 10,
      duration: 30,
      status: "draft"
    });
    setEditingQuiz(null);
    setShowAddModal(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      duration: quiz.duration,
      status: quiz.status
    });
    setEditingQuiz(quiz);
    setShowAddModal(true);
  };

  const handleDelete = (quiz: Quiz) => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
    }
  };

  const handleSave = () => {
    if (editingQuiz) {
      // Edit existing quiz
      setQuizzes(quizzes.map(q => 
        q.id === editingQuiz.id 
          ? { ...q, ...formData }
          : q
      ));
    } else {
      // Add new quiz
      const newQuiz: Quiz = {
        id: Math.max(...quizzes.map(q => q.id)) + 1,
        ...formData,
        createdBy: "Admin",
        createdAt: new Date().toISOString(),
        participants: 0
      };
      setQuizzes([...quizzes, newQuiz]);
    }
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Quiz Management</h1>
            <p className="text-gray-600 mt-2">Kelola quiz dan assessment untuk jemaat</p>
          </div>
          <Button onClick={handleAdd}>
            ➕ Create Quiz
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Quizzes</h3>
              <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Published</h3>
              <p className="text-3xl font-bold text-green-600">
                {quizzes.filter(q => q.status === 'published').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Draft</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {quizzes.filter(q => q.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              <p className="text-3xl font-bold text-purple-600">
                {quizzes.reduce((sum, q) => sum + q.participants, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <DataTable
        columns={columns}
        data={quizzes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Add/Edit Quiz Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title={editingQuiz ? "Edit Quiz" : "Create New Quiz"}
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Quiz Title" required>
            <TextField
              value={formData.title}
              onChange={(value) => setFormData({...formData, title: value})}
              placeholder="Enter quiz title"
            />
          </FormField>
          
          <FormField label="Description" required>
            <TextArea
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Enter quiz description"
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Number of Questions" required>
              <TextField
                type="number"
                value={formData.questions.toString()}
                onChange={(value) => setFormData({...formData, questions: parseInt(value) || 0})}
                placeholder="10"
              />
            </FormField>
            
            <FormField label="Duration (minutes)" required>
              <TextField
                type="number"
                value={formData.duration.toString()}
                onChange={(value) => setFormData({...formData, duration: parseInt(value) || 0})}
                placeholder="30"
              />
            </FormField>
          </div>
          
          <FormField label="Status" required>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({...formData, status: value as "draft" | "published" | "archived"})}
              options={[
                { value: "draft", label: "📝 Draft" },
                { value: "published", label: "✅ Published" },
                { value: "archived", label: "📁 Archived" }
              ]}
            />
          </FormField>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingQuiz ? "Update" : "Create"} Quiz
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
