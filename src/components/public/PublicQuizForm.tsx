"use client";

import { useState } from "react";
import { publicSubmitSchema } from "@/lib/schemas";
import { db } from "@/lib/mockdb";
import { Quiz } from "@/types";

interface PublicQuizFormProps {
  quiz: Quiz;
}

export default function PublicQuizForm({ quiz }: PublicQuizFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<{[key: string]: string[]}>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [participantInfo, setParticipantInfo] = useState({ name: "", nij: "" });

  const questionsPerPage = quiz.questionsPerPage || 5;
  const totalPages = Math.ceil(quiz.questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = quiz.questions.slice(startIndex, endIndex);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMultiSelectChange = (questionId: string, option: string, checked: boolean) => {
    setMultiSelectAnswers(prev => {
      const currentSelections = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentSelections, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentSelections.filter(item => item !== option)
        };
      }
    });
  };

  const handleParticipantInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const nij = String(form.get("nij") ?? "");
    
    if (!name.trim() || !nij.trim()) {
      setError("Nama dan NIJ harus diisi");
      return;
    }
    
    setParticipantInfo({ name: name.trim(), nij: nij.trim() });
    setCurrentPage(1); // Move to first question page
    setError(null);
  };

  function handleSubmit() {
    setError(null);
    setLoading(true);
    
    // Build answers array based on question type
    const answers = quiz.questions.map((q) => {
      if (q.questionType === 'multiple-select') {
        const selectedOptions = multiSelectAnswers[q.id] || [];
        return {
          questionId: q.id,
          answerText: selectedOptions.join(','),
          selectedOptions: selectedOptions.map(option => q.options?.indexOf(option) || 0)
        };
      } else if (q.questionType === 'multiple-choice') {
        return {
          questionId: q.id,
          answerText: selectedAnswers[q.id] || "",
          selectedOption: selectedAnswers[q.id] ? q.options?.indexOf(selectedAnswers[q.id]) : undefined
        };
      } else {
        return {
          questionId: q.id,
          answerText: selectedAnswers[q.id] || ""
        };
      }
    });

    try {
      publicSubmitSchema.parse({ 
        name: participantInfo.name, 
        nij: participantInfo.nij, 
        answers 
      });
      const result = db.submitAttempt(quiz.linkToken, { 
        name: participantInfo.name, 
        nij: participantInfo.nij, 
        answers 
      });
      setSubmitted(true);
      setMessage(result.message);
      setSelectedAnswers({});
      setMultiSelectAnswers({});
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Submit failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-green-500 text-4xl mb-4">✓</div>
        <h2 className="text-lg font-semibold text-green-800 mb-2">Test Selesai!</h2>
        <p className="text-green-700 mb-4">{message}</p>
        <p className="text-sm text-gray-600">
          Hasil test akan diumumkan kemudian. Silakan tutup halaman ini.
        </p>
      </div>
    );
  }

  // Participant information form (page 0)
  if (currentPage === 0) {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium mb-2">Petunjuk Pengerjaan:</p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Isi data diri dengan lengkap dan benar</li>
            <li>• Bacalah setiap soal dengan teliti</li>
            <li>• Untuk soal pilihan ganda tunggal, pilih satu jawaban yang paling tepat</li>
            <li>• Untuk soal pilihan ganda jamak, pilih semua jawaban yang benar</li>
            <li>• Pastikan semua soal telah dijawab sebelum menyelesaikan test</li>
            <li>• Test hanya dapat dikerjakan satu kali</li>
          </ul>
        </div>

        <form onSubmit={handleParticipantInfoSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          <div>
            <label htmlFor="nij" className="block text-sm font-medium text-gray-700 mb-2">
              NIJ (Nomor Induk Jilid) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nij"
              name="nij"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan NIJ Anda"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Mulai Test
          </button>
        </form>
      </div>
    );
  }

  // Check if current page has all required answers
  const isLastPage = currentPage === totalPages;
  const canProceed = currentQuestions.every(q => {
    if (q.questionType === 'multiple-select') {
      return multiSelectAnswers[q.id]?.length > 0;
    }
    return selectedAnswers[q.id]?.trim() !== '' && selectedAnswers[q.id] !== undefined;
  });

  // Test questions (pages 1+)
  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <div>
          Peserta: <strong>{participantInfo.name}</strong> (NIJ: {participantInfo.nij})
        </div>
        <div>
          Halaman {currentPage} dari {totalPages} • Soal {startIndex + 1}-{Math.min(endIndex, quiz.questions.length)} dari {quiz.questions.length}
        </div>
      </div>

      <div className="space-y-4">
        {currentQuestions.map((q) => (
          <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-4">
              {q.order}. {q.questionText}
              {q.questionType === 'multiple-select' && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Pilih semua yang benar
                </span>
              )}
            </h3>
            
            {q.questionType === 'multiple-choice' && q.options ? (
              <div className="space-y-3">
                {q.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={option}
                      checked={selectedAnswers[q.id] === option}
                      onChange={() => handleAnswerChange(q.id, option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{String.fromCharCode(65 + index)}. {option}</span>
                  </label>
                ))}
              </div>
            ) : q.questionType === 'multiple-select' && q.options ? (
              <div className="space-y-3">
                {q.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(multiSelectAnswers[q.id] || []).includes(option)}
                      onChange={(e) => handleMultiSelectChange(q.id, option, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                    />
                    <span className="text-gray-700 text-sm">{String.fromCharCode(65 + index)}. {option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                name={`q_${q.id}`}
                value={selectedAnswers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Ketik jawaban Anda..."
                rows={3}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-3">
          {currentPage > 1 && (
            <button
              type="button"
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              « Sebelumnya
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          {!isLastPage && (
            <button
              type="button"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!canProceed}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya »
            </button>
          )}
          
          {isLastPage && (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canProceed}
              className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Menyimpan..." : "Selesaikan Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
