"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import type { Quiz, Question } from "@/types/api";

export default function AdminQuizManagementPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isSuperadmin, isAdmin } = useAuth();

  // Form state for create/edit quiz
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    quizType: 'assessment' as 'assessment' | 'survey' | 'certification',
    serviceType: 'general',
    locationId: null as number | null,
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    isPublished: false,
    isActive: true
  });

  // Questions for selected quiz
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer' | 'essay',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    imageUrl: ''
  });

  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      setError("Access denied. Admin or Superadmin role required.");
      setLoading(false);
      return;
    }
    loadQuizzes();
  }, [isAdmin, isSuperadmin]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.quizzes.getQuizzes();

      if (response.success) {
        const quizData = (response.data as any)?.items || response.data || [];
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      }

    } catch (err: any) {
      console.error('Failed to load quizzes:', err);
      setError(err?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (quizId: number) => {
    try {
      const response = await API.questions.getQuestions();
      
      if (response.success) {
        const questionData = (response.data as any)?.items || response.data || [];
        // Filter questions by quizId
        const filteredQuestions = Array.isArray(questionData) 
          ? questionData.filter((q: any) => q.quizId === quizId)
          : [];
        setQuestions(filteredQuestions);
      }
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setError(err?.message || 'Failed to load questions');
    }
  };

  const handleCreateQuiz = async () => {
    try {
      setError(null);

      if (!quizForm.title || !quizForm.description) {
        setError('Title and description are required');
        return;
      }

      const createData = {
        title: quizForm.title,
        description: quizForm.description,
        quizType: quizForm.quizType,
        serviceType: quizForm.serviceType !== 'general' ? quizForm.serviceType : undefined,
        locationId: quizForm.locationId,
        timeLimit: quizForm.timeLimit,
        passingScore: quizForm.passingScore,
        maxAttempts: quizForm.maxAttempts,
        isPublished: quizForm.isPublished,
        isActive: quizForm.isActive
      };

      const response = await API.quizzes.createQuiz(createData);

      if (response.success) {
        alert('Quiz created successfully');
        setIsCreateMode(false);
        setQuizForm({
          title: '',
          description: '',
          quizType: 'assessment',
          serviceType: 'general',
          locationId: null,
          timeLimit: 30,
          passingScore: 70,
          maxAttempts: 1,
          isPublished: false,
          isActive: true
        });
        await loadQuizzes();
      }
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      setError(err?.message || 'Failed to create quiz');
    }
  };

  const handleUpdateQuiz = async (quizId: number, updateData: any) => {
    try {
      setError(null);

      const response = await API.quizzes.updateQuiz(quizId, updateData);

      if (response.success) {
        alert('Quiz updated successfully');
        await loadQuizzes();
      }
    } catch (err: any) {
      console.error('Failed to update quiz:', err);
      setError(err?.message || 'Failed to update quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      setError(null);

      const response = await API.quizzes.deleteQuiz(quizId);

      if (response.success) {
        alert('Quiz deleted successfully');
        await loadQuizzes();
      }
    } catch (err: any) {
      console.error('Failed to delete quiz:', err);
      setError(err?.message || 'Failed to delete quiz');
    }
  };

  const handleCreateQuestion = async (quizId: number) => {
    try {
      setError(null);

      if (!questionForm.text) {
        setError('Question text is required');
        return;
      }

      const createData = {
        question: questionForm.text,
        type: questionForm.type,
        options: questionForm.type === 'multiple_choice' 
          ? questionForm.options.filter(opt => opt.trim()) 
          : undefined,
        correctAnswer: questionForm.correctAnswer,
        points: questionForm.points,
        imageUrl: questionForm.imageUrl || undefined,
        quizId
      };

      const response = await API.questions.createQuestion(createData);

      if (response.success) {
        alert('Question added successfully');
        setQuestionForm({
          text: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 10,
          imageUrl: ''
        });
        await loadQuestions(quizId);
      }
    } catch (err: any) {
      console.error('Failed to create question:', err);
      setError(err?.message || 'Failed to create question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      setError(null);

      const response = await API.questions.deleteQuestion(questionId);

      if (response.success) {
        alert('Question deleted successfully');
        if (selectedQuiz) {
          await loadQuestions(selectedQuiz.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete question:', err);
      setError(err?.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz data...</p>
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
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📝 Quiz Management</h1>
          <p className="text-gray-600 mt-2">Create and manage quizzes with location and service restrictions</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isSuperadmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isSuperadmin ? 'Superadmin Access' : 'Admin Access'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsCreateMode(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          ➕ Create New Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Quizzes</h3>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Published</h3>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.filter(q => q.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Draft</h3>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.filter(q => !q.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-2xl">❓</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Questions</h3>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Quizzes</h2>
        </div>
        
        <div className="p-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No quizzes found. Create your first quiz!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          quiz.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {quiz.quizType?.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{quiz.description}</p>
                      
                      <div className="flex gap-4 text-sm text-gray-500 mb-2">
                        <span>⏱️ {(quiz as any).timeLimit || 30} minutes</span>
                        <span>📊 {(quiz as any).passingScore || 70}% passing</span>
                        <span>🔄 {(quiz as any).maxAttempts || 1} attempts</span>
                        <span>❓ {quiz.questions?.length || 0} questions</span>
                      </div>

                      {quiz.serviceType && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            📍 Service: {quiz.serviceType}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setIsQuestionMode(true);
                          loadQuestions(quiz.id);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        📝 Questions ({quiz.questions?.length || 0})
                      </button>
                      
                      <button
                        onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        ✏️ Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {isCreateMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Quiz</h2>
              <button
                onClick={() => {
                  setIsCreateMode(false);
                  setQuizForm({
                    title: '',
                    description: '',
                    quizType: 'assessment',
                    serviceType: 'general',
                    locationId: null,
                    timeLimit: 30,
                    passingScore: 70,
                    maxAttempts: 1,
                    isPublished: false,
                    isActive: true
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateQuiz(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Type</label>
                  <select
                    value={quizForm.quizType}
                    onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value as 'assessment' | 'survey' | 'certification' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="survey">Survey</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={quizForm.serviceType}
                    onChange={(e) => setQuizForm({ ...quizForm, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General (All Services)</option>
                    <option value="medical">Medical</option>
                    <option value="dental">Dental</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="radiology">Radiology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={quizForm.maxAttempts}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizForm.isPublished}
                    onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMode(false);
                    setQuizForm({
                      title: '',
                      description: '',
                      quizType: 'assessment',
                      serviceType: 'general',
                      locationId: null,
                      timeLimit: 30,
                      passingScore: 70,
                      maxAttempts: 1,
                      isPublished: false,
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {isQuestionMode && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions for: {selectedQuiz.title}</h2>
              <button
                onClick={() => {
                  setIsQuestionMode(false);
                  setSelectedQuiz(null);
                  setQuestions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Question Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Question</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                  <textarea
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                {questionForm.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                    {questionForm.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter correct answer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>

                <button
                  onClick={() => handleCreateQuestion(selectedQuiz.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>

              {/* Existing Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Existing Questions ({questions.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          Q{index + 1}: {(question as any).question || (question as any).text || 'Question text'}
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Type: {question.type} • Points: {question.points}
                      </div>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          Options: {question.options.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No questions added yet. Create your first question!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}