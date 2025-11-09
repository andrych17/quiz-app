"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseIndexForm } from "@/components/ui/common/BaseIndexForm";
import DataTable, { Column } from "@/components/ui/common/DataTable";
// Use a flexible type for quizzes returned by API to avoid conflicts between local mock types and API types
import type { Quiz as ApiQuiz } from "@/types/api";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isSuperadmin, canAccessAllQuizzes } = useAuth();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.quizzes.getQuizzes();
      setQuizzes(res.data || []);
    } catch (err: any) {
      console.error('Failed to load quizzes', err);
      setError(err?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: "title",
      label: "Quiz Title",
      filterable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{String(value)}</div>
          <div className="text-sm text-gray-500">
            {Array.isArray((row as Record<string, unknown>).questions) ? ((row as Record<string, unknown>).questions as unknown[]).length : 0} questions • Created by {String((row as Record<string, unknown>).createdBy || 'Unknown')}
          </div>
        </div>
      )
    },
    {
      key: "isPublished",
      label: "Status",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "true", label: "Published" },
        { value: "false", label: "Draft" }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          Boolean(value) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <span className={`w-1.5 h-1.5 mr-1 rounded-full ${
            Boolean(value) ? 'bg-green-400' : 'bg-yellow-400'
          }`}></span>
          {Boolean(value) ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: "questions",
      label: "Questions",
      render: (value) => (
        <div className="text-center">
          <div className="text-sm font-medium">{Array.isArray(value) ? value.length : 0}</div>
          <div className="text-xs text-gray-500">questions</div>
        </div>
      )
    },
    {
      key: "attempts",
      label: "Participants",
      render: (value) => (
        <div className="text-center">
          <div className="text-sm font-medium">{Array.isArray(value) ? value.length : 0}</div>
          <div className="text-xs text-gray-500">participants</div>
        </div>
      )
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (value) => {
        if (!value) return <span className="text-gray-400 text-sm">No expiry</span>;
        const dateValue = String(value);
        const isExpired = new Date(dateValue) < new Date();
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {new Date(dateValue).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {isExpired && (
              <div className="text-xs text-red-500">Expired</div>
            )}
          </div>
        );
      }
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(String(value)).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row as unknown as ApiQuiz)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          {(isSuperadmin || canAccessAllQuizzes) && (
            <button
              onClick={() => handleDelete(row as unknown as ApiQuiz)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  const handleEdit = (quiz: ApiQuiz) => {
    router.push(`/admin/quizzes/${quiz.id}/edit`);
  };

  const handleDelete = (quiz: ApiQuiz) => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      (async () => {
        try {
          await API.quizzes.deleteQuiz(Number(quiz.id));
          await loadQuizzes();
        } catch (err: any) {
          console.error('Delete failed', err);
          alert(err?.message || 'Delete failed');
        }
      })();
    }
  };

  return (
    <BaseIndexForm
      title="Quiz Management"
      subtitle={isSuperadmin ? "Manage all quizzes and assessments" : "Manage your assigned quizzes"}
      createUrl={isSuperadmin ? "/admin/quizzes/create/edit" : undefined}
      createLabel={isSuperadmin ? "Create New Quiz" : undefined}
    >
      {loading && (
        <div className="p-6 text-center">Loading quizzes...</div>
      )}

      {error && (
        <div className="p-6 text-center text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={quizzes as unknown as Record<string, unknown>[]}
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
