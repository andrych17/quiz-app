import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Forward request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend endpoint doesn't exist, return mock stats
      console.log('Backend stats endpoint not available, using mock data');
      const mockStats = {
        totalUsers: 0,
        totalAttempts: 0,
        passedAttempts: 0,
        passRate: 0,
        totalQuizzes: 0,
        publishedQuizzes: 0
      };
      return NextResponse.json(mockStats);
    }

    const stats = await response.json();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return mock stats on error
    const mockStats = {
      totalUsers: 0,
      totalAttempts: 0,
      passedAttempts: 0,
      passRate: 0,
      totalQuizzes: 0,
      publishedQuizzes: 0
    };
    return NextResponse.json(mockStats);
  }
}
