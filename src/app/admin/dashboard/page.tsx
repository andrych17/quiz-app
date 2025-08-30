"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 5,
    totalUsers: 3,
    totalParticipants: 47,
    completedToday: 8,
    activeQuizzes: 3,
    avgScore: 85.6
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "quiz_completed", user: "Alice Johnson", quiz: "Logic Test - Pelayanan Anak", time: "2 minutes ago", score: 92 },
    { id: 2, type: "new_participant", user: "Bob Smith", quiz: "Leadership Assessment", time: "15 minutes ago", score: null },
    { id: 3, type: "quiz_completed", user: "Carol Wilson", quiz: "Ministry Evaluation", time: "1 hour ago", score: 78 },
    { id: 4, type: "quiz_created", user: "Admin", quiz: "New Youth Assessment", time: "3 hours ago", score: null },
    { id: 5, type: "quiz_completed", user: "David Brown", quiz: "Logic Test - Pelayanan Anak", time: "5 hours ago", score: 88 }
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">Logic Test GMS Church - Overview</p>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Quizzes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Quizzes</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              <p className="text-sm text-green-600">{stats.activeQuizzes} active</p>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Admin Users</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-blue-600">All active</p>
            </div>
          </div>
        </div>

        {/* Total Participants */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-2xl">�</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Participants</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              <p className="text-sm text-green-600">{stats.completedToday} today</p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
              <p className="text-sm text-blue-600">Across all tests</p>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-orange-600 text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Completed Today</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              <p className="text-sm text-green-600">+25% from yesterday</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <span className="text-indigo-600 text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
              <div className="mt-2 space-y-1">
                <button className="text-sm text-blue-600 hover:underline block">Create Quiz</button>
                <button className="text-sm text-green-600 hover:underline block">View Reports</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📋 Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'quiz_completed' && (
                      <span className="text-green-500 text-xl">✅</span>
                    )}
                    {activity.type === 'new_participant' && (
                      <span className="text-blue-500 text-xl">👤</span>
                    )}
                    {activity.type === 'quiz_created' && (
                      <span className="text-purple-500 text-xl">➕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.type === 'quiz_completed' && `Completed "${activity.quiz}"`}
                      {activity.type === 'new_participant' && `Joined "${activity.quiz}"`}
                      {activity.type === 'quiz_created' && `Created "${activity.quiz}"`}
                      {activity.score && ` - Score: ${activity.score}%`}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Quizzes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🏆 Top Performing Quizzes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: "Logic Test - Pelayanan Anak", participants: 15, avgScore: 92.3, color: "green" },
                { name: "Leadership Assessment", participants: 12, avgScore: 87.8, color: "blue" },
                { name: "Ministry Evaluation", participants: 10, avgScore: 84.5, color: "purple" },
                { name: "Youth Assessment", participants: 8, avgScore: 81.2, color: "orange" },
                { name: "Worship Team Test", participants: 6, avgScore: 78.9, color: "pink" }
              ].map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{quiz.name}</h4>
                    <p className="text-xs text-gray-500">{quiz.participants} participants</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold text-${quiz.color}-600`}>
                      {quiz.avgScore}%
                    </p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
