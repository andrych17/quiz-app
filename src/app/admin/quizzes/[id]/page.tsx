"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/mockdb";
import { isExpired } from "@/lib/date";
import { attemptsToCsv } from "@/lib/csv";
import { Quiz, Question } from "@/types/index";

interface PageProps {
  params: Promise<{ id: string }>;
}

function QuizDetailContent({ id }: { id: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'text'>('multiple-choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizExpiry, setQuizExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadQuiz = useCallback(() => {
    const loadedQuiz = db.getQuizById(id);
    if (loadedQuiz) {
      setQuiz(loadedQuiz);
      setQuizTitle(loadedQuiz.title);
      setQuizExpiry(loadedQuiz.expiresAt ? new Date(loadedQuiz.expiresAt).toISOString().slice(0, 16) : "");
    }
  }, [id]);

  useEffect(() => {
    // No auth check needed for demo - just load quiz
    loadQuiz();
  }, [loadQuiz]);

  const handleSaveQuiz = () => {
    if (!quiz) return;
    const expiresAt = quizExpiry ? new Date(quizExpiry).toISOString() : null;
    db.updateQuiz(quiz.id, { title: quizTitle, expiresAt });
    loadQuiz();
    alert("Quiz updated successfully!");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !questionText.trim() || !correctAnswer.trim()) return;

    setLoading(true);
    if (editingQuestion) {
      // For editing, we need to remove and add the question since we don't have updateQuestion method
      db.removeQuestion(quiz.id, editingQuestion.id);
      db.addQuestion(quiz.id, {
        questionText: questionText.trim(),
        correctAnswer: correctAnswer.trim(),
        questionType,
        options: questionType === 'multiple-choice' ? options.filter(opt => opt.trim()) : undefined
      });
    } else {
      db.addQuestion(quiz.id, {
        questionText: questionText.trim(),
        correctAnswer: correctAnswer.trim(),
        questionType,
        options: questionType === 'multiple-choice' ? options.filter(opt => opt.trim()) : undefined
      });
    }
    
    loadQuiz();
    setQuestionText("");
    setCorrectAnswer("");
    setQuestionType('multiple-choice');
    setOptions(['', '', '', '']);
    setEditingQuestion(null);
    setShowQuestionModal(false);
    setLoading(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.questionText);
    setCorrectAnswer(question.correctAnswer);
    setQuestionType(question.questionType as 'multiple-choice' | 'text');
    setOptions(question.options || ['', '', '', '']);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!quiz) return;
    if (confirm("Are you sure you want to delete this question?")) {
      db.removeQuestion(quiz.id, questionId);
      loadQuiz();
    }
  };

  const togglePublish = () => {
    if (!quiz) return;
    db.updateQuiz(quiz.id, { isPublished: !quiz.isPublished });
    loadQuiz();
  };

  const exportAttempts = () => {
    if (!quiz || quiz.attempts.length === 0) {
      alert("No attempts to export");
      return;
    }

    const csvContent = attemptsToCsv(quiz.attempts);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quiz.title}-attempts.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyQuizLink = () => {
    if (!quiz) return;
    const url = `${window.location.origin}/q/${quiz.linkToken}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Quiz link copied to clipboard!");
    });
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-4xl mb-4">📝</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header with Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/quizzes" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="mr-1">←</span> Back to Quizzes
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">Manage questions and view attempts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyQuizLink}
              className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1"
            >
              🔗 Copy Link
            </button>
            <button
              onClick={togglePublish}
              className={`px-3 py-2 text-sm rounded font-medium ${
                quiz.isPublished
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {quiz.isPublished ? "📴 Unpublish" : "📢 Publish"}
            </button>
          </div>
        </div>
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={quizExpiry}
                onChange={(e) => setQuizExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded ${quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                {quiz.isPublished ? "Published" : "Draft"}
              </span>
              {quiz.expiresAt && isExpired(quiz.expiresAt) && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Expired</span>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions ({quiz.questions.length})</h2>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setQuestionText("");
                setCorrectAnswer("");
                setShowQuestionModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Question
            </button>
          </div>
          <div className="space-y-4">
            {quiz.questions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Text Input'}
                      </span>
                      <span className="text-sm text-gray-500">Question {question.order}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {question.questionText}
                    </h3>
                    {question.questionType === 'multiple-choice' && question.options ? (
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 mb-2">Options:</p>
                        <div className="space-y-1">
                          {question.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm font-mono text-gray-500">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className={`text-sm ${option === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                                {option}
                                {option === question.correctAnswer && (
                                  <span className="ml-2 text-green-600">✓ Correct</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 ml-4">
                        <strong>Correct Answer:</strong> <span className="text-green-600">{question.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {quiz.questions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No questions added yet.</p>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Participants ({quiz.attempts.length})</h3>
            {quiz.attempts.length > 0 && (
              <button
                onClick={exportAttempts}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Export All →
              </button>
            )}
          </div>

          {quiz.attempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quiz.attempts.slice(0, 5).map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attempt.participantName}</div>
                          <div className="text-sm text-gray-500">{attempt.nij || 'No ID'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.score >= 80 
                            ? 'bg-green-100 text-green-800'
                            : attempt.score >= 60
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.passed ? 'LULUS' : 'GAGAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {quiz.attempts.length > 5 && (
                <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
                  And {quiz.attempts.length - 5} more participants...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No Participants Yet</p>
              <p className="text-gray-600">Share the quiz link to start collecting responses from participants.</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type *
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as 'multiple-choice' | 'text')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="text">Text Input</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter the question..."
                  required
                />
              </div>

              {questionType === 'multiple-choice' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[index] = e.target.value;
                              setOptions(newOptions);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer *
                    </label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select correct answer...</option>
                      {options.map((option, index) => (
                        option.trim() && (
                          <option key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                </>
              )}

              {questionType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the correct answer..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                    setQuestionText("");
                    setCorrectAnswer("");
                    setQuestionType('multiple-choice');
                    setOptions(['', '', '', '']);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingQuestion ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <QuizDetailContent id={id} />;
}
