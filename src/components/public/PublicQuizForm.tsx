"use client";

import { useState } from "react";
import { publicSubmitSchema } from "@/lib/schemas";
import { db } from "@/lib/mockdb";
import { Quiz } from "@/types";

interface PublicQuizFormProps {
  quiz: Quiz;
}

export default function PublicQuizForm({ quiz }: PublicQuizFormProps) {
  const [result, setResult] = useState<{score: number; total: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const nij = String(form.get("nij") ?? "");
    
    // Build answers array based on question type
    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      answerText: selectedAnswers[q.id] || "",
      selectedOption: q.questionType === 'multiple-choice' && selectedAnswers[q.id] 
        ? q.options?.indexOf(selectedAnswers[q.id]) 
        : undefined
    }));

    try {
      const parsed = publicSubmitSchema.parse({ name, nij, answers });
      const attempt = db.submitAttempt(quiz.linkToken, { name, nij, answers });
      setResult({ score: attempt.score, total: quiz.questions.length });
      (e.currentTarget as HTMLFormElement).reset();
      setSelectedAnswers({});
    } catch (err: any) {
      setError(err.message ?? "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-2">Quiz Completed!</h2>
        <p className="text-green-700 mb-2">Thanks for submitting!</p>
        <p className="text-xl font-bold text-green-800 mb-4">
          Your score: {result.score} / {result.total}
        </p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors" 
          onClick={() => setResult(null)}
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input 
            id="name"
            name="name" 
            placeholder="Enter your full name" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="nij" className="block text-sm font-medium text-gray-700 mb-1">
            NIJ *
          </label>
          <input 
            id="nij"
            name="nij" 
            placeholder="Enter your NIJ" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
        {quiz.questions.map((q) => (
          <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-4">
              {q.order}. {q.questionText}
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
                      required
                    />
                    <span className="text-gray-700 text-sm">{String.fromCharCode(65 + index)}. {option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input 
                name={`q_${q.id}`}
                value={selectedAnswers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Type your answer..."
                required
              />
            )}
          </div>
        ))}
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Submitting..." : "Submit Quiz"}
      </button>
      
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </form>
  );
}
