import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mockdb';
import { ApiResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    
    console.log('🔍 Public quiz submit API - Token:', token);
    console.log('📝 Submit payload:', body);
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Quiz token is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate required fields
    if (!body.participantName || !body.email || !body.nij) {
      const response: ApiResponse = {
        success: false,
        message: 'Participant name, email, and NIJ are required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get quiz by token
    const quiz = mockDB.getQuizByToken(token);
    
    if (!quiz) {
      console.log('❌ Quiz not found for token:', token);
      const response: ApiResponse = {
        success: false,
        message: 'Quiz not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: `/public/quiz/${token}/submit`
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
        path: `/public/quiz/${token}/submit`
      };
      return NextResponse.json(response, { status: 403 });
    }

    // If no answers provided, just start the quiz (return attemptId for tracking)
    if (!body.answers || body.answers.length === 0) {
      console.log('✅ Starting quiz session for:', body.participantName);
      
      const attemptId = Math.floor(Math.random() * 10000); // Generate mock attempt ID
      
      const response: ApiResponse = {
        success: true,
        message: 'Quiz session started successfully',
        data: {
          attemptId: attemptId,
          quizId: quiz.id,
          participantName: body.participantName,
          email: body.email,
          nij: body.nij,
          startedAt: new Date().toISOString()
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
        path: `/public/quiz/${token}/submit`
      };
      
      return NextResponse.json(response, { status: 200 });
    }

    // Process quiz submission with answers
    console.log('✅ Processing quiz submission with answers');
    
    // Calculate score
    const totalQuestions = quiz.questions?.length || 0;
    let correctAnswers = 0;
    
    if (body.answers && Array.isArray(body.answers)) {
      body.answers.forEach((answer: any) => {
        const question = quiz.questions?.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.answer) {
          correctAnswers++;
        }
      });
    }
    
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= (quiz.passingScore || 70);
    
    console.log('📊 Quiz Results:', {
      totalQuestions,
      correctAnswers,
      score,
      passed
    });

    const response: ApiResponse = {
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attemptId: Math.floor(Math.random() * 10000), // Mock attempt ID
        quizId: quiz.id,
        participantName: body.participantName,
        email: body.email,
        nij: body.nij,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passed: passed,
        submittedAt: new Date().toISOString(),
        answers: body.answers
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/public/quiz/${token}/submit`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in public quiz submit API:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: `/public/quiz/unknown/submit`
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}