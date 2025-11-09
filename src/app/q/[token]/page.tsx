'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API } from '@/lib/api-client';
import { Quiz, ApiError } from '@/types/api';

export default function PublicQuizPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (token) {
      loadQuiz();
    }
  }, [token]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await API.quizzes.getPublicQuizByToken(token);
      
      if (response.success && response.data) {
        setQuiz(response.data);
        
        // Check if quiz is published and within time window
        if (!response.data.isPublished) {
          setError('This quiz is not currently available.');
        } else if (response.data.quizType === 'scheduled') {
          const now = new Date();
          const startTime = response.data.startDateTime ? new Date(response.data.startDateTime) : null;
          const endTime = response.data.endDateTime ? new Date(response.data.endDateTime) : null;
          
          if (startTime && now < startTime) {
            setError(`This quiz is not yet available. It will start on ${startTime.toLocaleString()}.`);
          } else if (endTime && now > endTime) {
            setError(`This quiz has ended. It was available until ${endTime.toLocaleString()}.`);
          }
        }
      } else {
        setError('Quiz not found or not available.');
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load quiz. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }

    if (!quiz) return;

    try {
      setIsStarting(true);
      
      // Start quiz session
      const response = await API.sessions.startSession({
        quizId: quiz.id,
        userEmail: userEmail.trim(),
      });

      if (response.success && response.data) {
        // Redirect to quiz taking interface
        const sessionToken = response.data.sessionToken;
        window.location.href = `/quiz/${sessionToken}`;
      } else {
        throw new Error('Failed to start quiz session');
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Failed to start quiz. Please try again.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600">{quiz.description}</p>
              )}
            </div>

            {/* Quiz Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Duration</span>
                </div>
                <p className="text-gray-900">
                  {quiz.durationMinutes ? `${quiz.durationMinutes} minutes` : 'No time limit'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Passing Score</span>
                </div>
                <p className="text-gray-900">
                  {quiz.passingScore ? `${quiz.passingScore}%` : 'Not specified'}
                </p>
              </div>

              {quiz.quizType === 'scheduled' && quiz.startDateTime && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-700">Schedule</span>
                  </div>
                  <p className="text-gray-900">
                    Available from {new Date(quiz.startDateTime).toLocaleString()} 
                    {quiz.endDateTime && ` to ${new Date(quiz.endDateTime).toLocaleString()}`}
                  </p>
                </div>
              )}
            </div>

            {/* Start Quiz Form */}
            <form onSubmit={handleStartQuiz} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email to start the quiz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used to track your quiz attempt and send results.
                </p>
              </div>

              <button
                type="submit"
                disabled={isStarting}
                className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStarting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Starting Quiz...</span>
                  </span>
                ) : (
                  'Start Quiz'
                )}
              </button>
            </form>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure you have a stable internet connection</li>
                <li>• Once started, the timer cannot be paused</li>
                <li>• Answer all questions to the best of your ability</li>
                <li>• Submit your quiz before the time expires</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Quiz System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
