"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/mockdb";
import { isExpired } from "@/lib/date";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    totalAttempts: 0,
    activeQuizzes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const adminEmail = localStorage.getItem("adminEmail");
    if (!adminEmail) {
      router.push("/admin/login");
      return;
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = () => {
    const adminEmail = localStorage.getItem("adminEmail");
    if (!adminEmail) return;

    const quizzes = db.listQuizzes(adminEmail);
    const published = quizzes.filter(q => q.isPublished);
    const active = published.filter(q => !isExpired(q.expiresAt));
    const totalAttempts = quizzes.reduce((sum, quiz) => sum + quiz.attempts.length, 0);

    setStats({
      totalQuizzes: quizzes.length,
      publishedQuizzes: published.length,
      totalAttempts,
      activeQuizzes: active.length,
    });

    // Get recent attempts for activity feed
    const allAttempts = quizzes.flatMap(quiz => 
      quiz.attempts.map(attempt => ({
        ...attempt,
        quizTitle: quiz.title,
        quizId: quiz.id
      }))
    );
    
    const sortedAttempts = allAttempts
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);

    setRecentActivity(sortedAttempts);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your quiz activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-gray-900">{stats.publishedQuizzes}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeQuizzes}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/quizzes"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="bg-blue-500 rounded-lg p-2 mr-3 group-hover:bg-blue-600 transition-colors">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Quizzes</p>
                    <p className="text-sm text-gray-600">Create and edit quizzes</p>
                  </div>
                </Link>

                <button
                  onClick={loadDashboardData}
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="bg-green-500 rounded-lg p-2 mr-3 group-hover:bg-green-600 transition-colors">
                    <span className="text-white text-lg">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refresh Data</p>
                    <p className="text-sm text-gray-600">Update dashboard stats</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Welcome Back! 👋</h3>
            <p className="text-blue-100 text-sm mb-4">
              Your quiz platform is running smoothly. Keep creating engaging content for your participants.
            </p>
            <Link
              href="/admin/quizzes"
              className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
            >
              Create New Quiz →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.participantName} completed{" "}
                          <Link
                            href={`/admin/quizzes/${activity.quizId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {activity.quizTitle}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {activity.score} • {new Date(activity.submittedAt).toLocaleDateString()} at{" "}
                          {new Date(activity.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Quiz attempts will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
