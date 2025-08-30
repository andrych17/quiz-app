"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/mockdb";
import { isExpired } from "@/lib/date";
import { attemptsToCsv } from "@/lib/csv";
import { Quiz } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function QuizDetailContent({ id }: { id: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'text'>('multiple-choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizExpiry, setQuizExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // No auth check needed for demo - just load quiz
    loadQuiz();
  }, [id, router]);

  const loadQuiz = () => {
    const loadedQuiz = db.getQuizById(id);
    if (loadedQuiz) {
      setQuiz(loadedQuiz);
      setQuizTitle(loadedQuiz.title);
      setQuizExpiry(loadedQuiz.expiresAt ? new Date(loadedQuiz.expiresAt).toISOString().slice(0, 16) : "");
    }
  };

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

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setQuestionText(question.questionText);
    setCorrectAnswer(question.correctAnswer);
    setQuestionType(question.questionType || 'multiple-choice');
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

        {/* Peserta Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Peserta Test ({db.getParticipants(quiz.id).length})</h2>
            {db.getParticipants(quiz.id).length > 0 && (
              <button
                onClick={exportAttempts}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Export CSV
              </button>
            )}
          </div>
          {db.getParticipants(quiz.id).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      NIJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Skor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Waktu Submit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {db.getParticipants(quiz.id).map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participant.participantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.nij}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.score} / {quiz.questions.length}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          participant.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {participant.passed ? 'LULUS' : 'GAGAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(participant.submittedAt).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada peserta yang mengikuti test.</p>
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
