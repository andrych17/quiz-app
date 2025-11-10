"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/lib/api-client";
import type { Quiz, Question, QuizSession } from "@/types/api";

interface Answer {
  questionId: number;
  answer: string;
  selectedOptions?: string[];
}

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.token as string;

  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionToken) {
      loadSession();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [sessionToken]);

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPaused]);

  useEffect(() => {
    // Auto-save answers every 30 seconds
    if (session && answers.length > 0) {
      autoSaveRef.current = setInterval(() => {
        saveAnswersToSession();
      }, 30000);
    }

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [session, answers]);

  const loadSession = async () => {
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

        // Load questions
        const questionsResponse = await API.questions.getQuestions();
        if (questionsResponse.success && questionsResponse.data) {
          const allQuestions = (questionsResponse.data as any)?.items || questionsResponse.data || [];
          const quizQuestions = Array.isArray(allQuestions) 
            ? allQuestions.filter((q: any) => q.quizId === sessionData.quizId)
            : [];
          setQuestions(quizQuestions);
        }

        // Calculate time left
        if (sessionData.expiresAt) {
          const now = new Date();
          const expiry = new Date(sessionData.expiresAt);
          const secondsLeft = Math.floor((expiry.getTime() - now.getTime()) / 1000);
          setTimeLeft(Math.max(0, secondsLeft));
        }

        // Load existing answers if any
        if ((sessionData as any).answers) {
          setAnswers((sessionData as any).answers);
        }

        // Check if session is still valid
        if ((sessionData as any).status === 'completed') {
          router.push(`/quiz/${sessionToken}/results`);
          return;
        }

        if ((sessionData as any).status === 'expired') {
          setError('This quiz session has expired.');
          return;
        }

      } else {
        setError('Quiz session not found or invalid.');
      }

    } catch (err: any) {
      console.error('Failed to load session:', err);
      setError(err?.message || 'Failed to load quiz session');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswersToSession = async () => {
    if (!session || answers.length === 0) return;

    try {
      await API.sessions.saveAnswers(sessionToken, { answers });
    } catch (err: any) {
      console.error('Failed to auto-save answers:', err);
      // Don't show error to user for auto-save failures
    }
  };

  const handleAnswerChange = (questionId: number, answer: string, selectedOptions?: string[]) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, answer, selectedOptions }
            : a
        );
      } else {
        return [...prev, { questionId, answer, selectedOptions }];
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  const handleAutoSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save final answers
      await saveAnswersToSession();
      
      // Submit quiz
      const response = await API.sessions.submitSession(sessionToken, { answers });
      
      if (response.success) {
        router.push(`/quiz/${sessionToken}/results`);
      } else {
        setError('Failed to submit quiz. Please try again.');
      }
    } catch (err: any) {
      console.error('Auto-submit failed:', err);
      setError('Failed to submit quiz automatically.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save final answers
      await saveAnswersToSession();
      
      // Submit quiz
      const response = await API.sessions.submitSession(sessionToken, { answers });
      
      if (response.success) {
        router.push(`/quiz/${sessionToken}/results`);
      } else {
        setError('Failed to submit quiz. Please try again.');
      }
    } catch (err: any) {
      console.error('Manual submit failed:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const getAnswerForQuestion = (questionId: number) => {
    return answers.find(a => a.questionId === questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz session...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error || 'Session not found'}</p>
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? getAnswerForQuestion(currentQuestion.id) : null;
  const answeredCount = answers.filter(a => a.answer && a.answer.trim()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>•</span>
                <span>Answered: {answeredCount}/{questions.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pause/Resume Button */}
              <button
                onClick={handlePauseResume}
                className={`px-3 py-1 text-sm rounded ${
                  isPaused 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>

              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft <= 300 ? 'bg-red-100 text-red-800' : 
                timeLeft <= 600 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                <span className="text-lg">⏰</span>
                <span className="font-mono font-semibold">
                  {isPaused ? 'PAUSED' : formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
                <span className="text-sm text-gray-500">
                  {(currentQuestion as any).points || 10} points
                </span>
              </div>
              
              <p className="text-gray-800 text-lg leading-relaxed">
                {(currentQuestion as any).question || (currentQuestion as any).text || 'Question text'}
              </p>

              {(currentQuestion as any).imageUrl && (
                <div className="mt-4">
                  <img 
                    src={(currentQuestion as any).imageUrl} 
                    alt="Question image"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentAnswer?.selectedOptions?.includes(option) || false}
                        onChange={(e) => {
                          const currentOptions = currentAnswer?.selectedOptions || [];
                          let newOptions;
                          if (e.target.checked) {
                            newOptions = [...currentOptions, option];
                          } else {
                            newOptions = currentOptions.filter(opt => opt !== option);
                          }
                          handleAnswerChange(
                            currentQuestion.id,
                            newOptions.join(', '),
                            newOptions
                          );
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="flex-1 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option) => (
                    <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={currentAnswer?.answer === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="flex-1 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
                <div>
                  <textarea
                    value={currentAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    rows={currentQuestion.type === 'essay' ? 6 : 3}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>

            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((question, index) => {
              const isAnswered = getAnswerForQuestion(question.id)?.answer?.trim();
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : isAnswered 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Not answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit your quiz? You have answered {answeredCount} out of {questions.length} questions.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Time remaining: {formatTime(timeLeft)}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">⏸️</div>
            <h2 className="text-2xl font-semibold mb-2">Quiz Paused</h2>
            <p className="text-lg mb-6">Click Resume to continue your quiz</p>
            <button
              onClick={handlePauseResume}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
            >
              ▶️ Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* Auto-submit Warning */}
      {timeLeft <= 60 && timeLeft > 0 && !isPaused && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Time Running Out!</p>
              <p className="text-sm">Quiz will auto-submit in {timeLeft} seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}