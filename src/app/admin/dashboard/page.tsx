"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/mockdb";
import { Quiz, Attempt } from "@/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalAttempts: 0,
    totalParticipants: 0,
    passedParticipants: 0,
    failedParticipants: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<(Attempt & { quizTitle: string })[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const adminEmail = localStorage.getItem("adminEmail");
    if (!adminEmail) return;

    const quizzes = db.listQuizzes(adminEmail);
    const publishedQuizzes = quizzes.filter(q => q.isPublished);
    
    // Get statistics from participants data
    const stats = db.getQuizStats();
    const recentActivity = db.getRecentActivity();
    
    setStats({
      totalQuizzes: quizzes.length,
      publishedQuizzes: publishedQuizzes.length,
      totalAttempts: stats.totalAttempts,
      totalParticipants: stats.totalParticipants,
      passedParticipants: stats.passedParticipants,
      failedParticipants: stats.failedParticipants,
    });
    
    setRecentAttempts(recentActivity);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview test dan peserta GMS Platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Test</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Test Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedQuizzes}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peserta Lulus</p>
              <p className="text-2xl font-bold text-green-600">{stats.passedParticipants}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peserta Tidak Lulus</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedParticipants}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terakhir</h2>
        </div>
        <div className="p-6">
          {recentAttempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.participantName}</p>
                    <p className="text-sm text-gray-600">NIJ: {attempt.nij}</p>
                    <p className="text-sm text-gray-600">Test: {attempt.quizTitle}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attempt.passed 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {attempt.passed ? "LULUS" : "TIDAK LULUS"}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Skor: {attempt.score} | {new Date(attempt.submittedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
