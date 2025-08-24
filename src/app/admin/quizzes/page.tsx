"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/mockdb";
import { isExpired } from "@/lib/date";
import { Quiz } from "@/types";

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizExpiry, setNewQuizExpiry] = useState("");
  const [duplicateModal, setDuplicateModal] = useState<{ show: boolean; quiz?: Quiz | null }>({ show: false, quiz: null });
  const [duplicateTitle, setDuplicateTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log("AdminQuizzesPage rendered", { quizzes: quizzes.length });

  useEffect(() => {
    console.log("useEffect triggered");
    const adminEmail = localStorage.getItem("adminEmail");
    console.log("adminEmail from localStorage:", adminEmail);
    if (!adminEmail) {
      console.log("No adminEmail, redirecting to login");
      router.push("/admin/login");
      return;
    }
    loadQuizzes();
  }, [router]);

  const loadQuizzes = () => {
    console.log("loadQuizzes called");
    const adminEmail = localStorage.getItem("adminEmail");
    if (adminEmail) {
      const loadedQuizzes = db.listQuizzes(adminEmail);
      console.log("Loaded quizzes:", loadedQuizzes);
      setQuizzes(loadedQuizzes);
    }
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    setLoading(true);
    const adminEmail = localStorage.getItem("adminEmail");
    if (adminEmail) {
      const expiresAt = newQuizExpiry ? new Date(newQuizExpiry).toISOString() : null;
      db.createQuiz({
        title: newQuizTitle.trim(),
        expiresAt,
        createdBy: adminEmail,
      });
      loadQuizzes();
      setNewQuizTitle("");
      setNewQuizExpiry("");
      setShowCreateModal(false);
    }
    setLoading(false);
  };

  const togglePublish = (quizId: string, isPublished: boolean) => {
    db.updateQuiz(quizId, { isPublished: !isPublished });
    loadQuizzes();
  };

  const copyQuizLink = (token: string) => {
    const url = `${window.location.origin}/q/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Quiz link copied to clipboard!");
    });
  };

  const handleDuplicateQuiz = (quiz: Quiz) => {
    setDuplicateModal({ show: true, quiz });
    setDuplicateTitle(`${quiz.title} (Copy)`);
  };

  const submitDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTitle.trim() || !duplicateModal.quiz) return;

    setLoading(true);
    const adminEmail = localStorage.getItem("adminEmail");
    if (adminEmail) {
      db.duplicateQuiz(duplicateModal.quiz.id, duplicateTitle.trim());
      loadQuizzes();
      setDuplicateModal({ show: false, quiz: null });
      setDuplicateTitle("");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-600 mt-1">Create and manage your tests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Buat Test Baru
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peserta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tingkat Kelulusan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quizzes.map((quiz) => {
                const participants = db.getParticipants(quiz.id);
                const passedCount = participants.filter(p => p.passed).length;
                const totalParticipants = participants.length;
                const passRate = totalParticipants > 0 ? Math.round((passedCount / totalParticipants) * 100) : 0;
                
                return (
                <tr key={quiz.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                      </div>
                      {quiz.expiresAt && (
                        <div className="text-xs text-gray-500">
                          Expires: {new Date(quiz.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          quiz.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {quiz.isPublished ? "Published" : "Draft"}
                      </span>
                      {quiz.expiresAt && isExpired(quiz.expiresAt) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quiz.questions.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{totalParticipants}</div>
                      <div className="text-xs text-gray-500">
                        {passedCount} lulus, {totalParticipants - passedCount} gagal
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{passRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/quizzes/${quiz.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => togglePublish(quiz.id, quiz.isPublished)}
                      className={`${
                        quiz.isPublished ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {quiz.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDuplicateQuiz(quiz)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => copyQuizLink(quiz.linkToken)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Copy Link
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Quiz</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Test *
                </label>
                <input
                  id="title"
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul test"
                  required
                />
              </div>
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  id="expiry"
                  type="datetime-local"
                  value={newQuizExpiry}
                  onChange={(e) => setNewQuizExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Quiz Modal */}
      {duplicateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Duplikasi Test</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will create a copy of "{duplicateModal.quiz?.title}" with all questions and settings.
            </p>
            <form onSubmit={submitDuplicate} className="space-y-4">
              <div>
                <label htmlFor="duplicate-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Test Baru *
                </label>
                <input
                  id="duplicate-title"
                  type="text"
                  value={duplicateTitle}
                  onChange={(e) => setDuplicateTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan judul test baru"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setDuplicateModal({ show: false, quiz: null })}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Duplicating..." : "Duplicate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
