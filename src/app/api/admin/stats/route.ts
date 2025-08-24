import { NextResponse } from 'next/server';
import { db } from '@/lib/mockdb';
import type { Quiz, Attempt } from '@/types';

export async function GET() {
  try {
    const quizzes = db.listQuizzes();
    
    // Hitung total user unique yang pernah mengerjakan quiz
    const uniqueUsers = new Set();
    let totalAttempts = 0;
    let passedAttempts = 0;
    
    quizzes.forEach((quiz: Quiz) => {
      quiz.attempts.forEach((attempt: Attempt) => {
        uniqueUsers.add(attempt.nij); // menggunakan NIJ untuk unique identifier
        totalAttempts++;
        if (attempt.passed) {
          passedAttempts++;
        }
      });
    });

    const stats = {
      totalUsers: uniqueUsers.size,
      totalAttempts,
      passedAttempts,
      passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
      totalQuizzes: quizzes.length,
      publishedQuizzes: quizzes.filter((q: Quiz) => q.isPublished).length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
