"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/lib/api-client";
import type { QuizSession, Quiz } from "@/types/api";

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.token as string;

  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionToken) {
      loadResults();
    }
  }, [sessionToken]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.sessions.getSession(sessionToken);

      if (response.success && response.data) {
        const sessionData = response.data;
        setSession(sessionData);

        // Load quiz data
        const quizResponse = await API.quizzes.getQuiz(sessionData.quizId);
        if (quizResponse.success && quizResponse.data) {
          setQuiz(quizResponse.data);
        }

        // Check if session is completed
        if ((sessionData as any).status !== 'completed') {
          setError('Quiz session is not completed yet.');
        }

      } else {
        setError('Quiz session not found or invalid.');
      }

    } catch (err: any) {
      console.error('Failed to load results:', err);
      setError(err?.message || 'Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error || 'Results not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const finalScore = (session as any).finalScore || 0;
  const passingScore = (quiz as any).passingScore || 70;
  const isPassed = finalScore >= passingScore;
  const totalAnswers = (session as any).answers ? (session as any).answers.length : 0;
  const totalQuestions = quiz.questions ? quiz.questions.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPassed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-4xl">
                {isPassed ? '🎉' : '📚'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isPassed ? 'Congratulations!' : 'Quiz Completed'}
            </h1>
            
            <p className={`text-xl mb-6 ${
              isPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPassed 
                ? 'You have successfully passed the quiz!' 
                : 'You did not meet the passing score this time.'}
            </p>

            <div className="text-6xl font-bold mb-2">
              <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                {finalScore}%
              </span>
            </div>
            
            <p className="text-gray-600">
              Your final score • Passing score: {passingScore}%
            </p>
          </div>

          {/* Quiz Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Summary</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{quiz.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Answered:</span>
                    <span className="font-medium">{totalAnswers} of {totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Final Score:</span>
                    <span className="font-medium">{finalScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passing Score:</span>
                    <span className="font-medium">{passingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      isPassed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPassed ? 'PASSED' : 'NOT PASSED'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Session Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started At:</span>
                    <span className="font-medium">
                      {session.startedAt 
                        ? new Date(session.startedAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed At:</span>
                    <span className="font-medium">
                      {session.completedAt 
                        ? new Date(session.completedAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {session.startedAt && session.completedAt
                        ? formatDuration(
                            new Date(session.completedAt).getTime() - 
                            new Date(session.startedAt).getTime()
                          )
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session ID:</span>
                    <span className="font-medium font-mono text-xs">
                      {sessionToken.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Breakdown</h2>
            
            <div className="space-y-4">
              {/* Score Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className="text-sm text-gray-600">{finalScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isPassed ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(finalScore, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <div className="flex items-center">
                    <div 
                      className="w-px h-4 bg-yellow-500 mr-1"
                      style={{ marginLeft: `${passingScore}%` }}
                    ></div>
                    <span className="text-xs text-yellow-600">Passing: {passingScore}%</span>
                  </div>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>

              {/* Answer Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalAnswers}</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((finalScore / 100) * totalQuestions)}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {totalQuestions - Math.round((finalScore / 100) * totalQuestions)}
                  </div>
                  <div className="text-sm text-gray-600">Incorrect Answers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
            
            <div className="space-y-4">
              {isPassed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-green-500 text-2xl mr-3">✅</span>
                    <div>
                      <h3 className="text-green-800 font-medium">Great Job!</h3>
                      <p className="text-green-700 text-sm">
                        You have successfully completed this quiz. Your results have been recorded.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-orange-500 text-2xl mr-3">📚</span>
                    <div>
                      <h3 className="text-orange-800 font-medium">Keep Learning!</h3>
                      <p className="text-orange-700 text-sm">
                        Don't worry - this is a learning opportunity. Review the material and try again when you're ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2"
                >
                  🖨️ Print Results
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  🏠 Go Home
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Thank you for taking the quiz! Results generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}