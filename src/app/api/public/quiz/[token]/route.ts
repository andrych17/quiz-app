import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mockdb';
import { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    console.log('🔍 Public quiz API - Looking for token:', token);
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Quiz token is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get quiz by token from mock database
    const quiz = mockDB.getQuizByToken(token);
    
    if (!quiz) {
      console.log('❌ Quiz not found for token:', token);
      const response: ApiResponse = {
        success: false,
        message: 'Quiz not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: `/public/quiz/${token}`
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if quiz is published and active
    if (!quiz.isPublished) {
      console.log('❌ Quiz not published for token:', token);
      const response: ApiResponse = {
        success: false,
        message: 'Quiz is not published',
        statusCode: 403,
        timestamp: new Date().toISOString(),
        path: `/public/quiz/${token}`
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if quiz has expired
    if (quiz.expiresAt && new Date() > new Date(quiz.expiresAt)) {
      console.log('❌ Quiz expired for token:', token);
      const response: ApiResponse = {
        success: false,
        message: 'Quiz has expired',
        statusCode: 410,
        timestamp: new Date().toISOString(),
        path: `/public/quiz/${token}`
      };
      return NextResponse.json(response, { status: 410 });
    }

    console.log('✅ Quiz found and accessible:', {
      id: quiz.id,
      title: quiz.title,
      questionsCount: quiz.questions?.length || 0,
      token: quiz.linkToken
    });

    // Return quiz data in the expected format
    const response: ApiResponse = {
      success: true,
      message: 'Quiz retrieved successfully',
      data: {
        id: quiz.id,
        title: quiz.title,
        token: quiz.linkToken,
        slug: quiz.slug,
        durationMinutes: quiz.durationMinutes || 60, // Default 60 minutes
        timeLimit: quiz.durationMinutes || 60, // For backward compatibility
        passingScore: quiz.passingScore,
        questionsPerPage: quiz.questionsPerPage || 1,
        isPublished: quiz.isPublished,
        questions: quiz.questions || [],
        expiresAt: quiz.expiresAt,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/public/quiz/${token}`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in public quiz API:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: `/public/quiz/unknown`
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}