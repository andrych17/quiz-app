import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

// Mock data for quiz attempts/results
const mockAttempts = [
  {
    id: 1,
    participantName: 'John Doe',
    email: 'john.doe@example.com',
    nij: '12345',
    quizId: 1,
    quizTitle: 'Test Masuk Service Management Batch 1',
    serviceKey: 'service-management',
    serviceName: 'Service Management',
    locationKey: 'jakarta',
    locationName: 'Jakarta',
    score: 85,
    grade: 'A',
    passed: true,
    startedAt: '2025-12-03T10:00:00Z',
    completedAt: '2025-12-03T10:45:00Z',
    submittedAt: '2025-12-03T10:45:00Z',
    totalAnswers: 10,
    correctAnswers: 8,
    createdAt: '2025-12-03T10:00:00Z',
    updatedAt: '2025-12-03T10:45:00Z',
  },
  {
    id: 2,
    participantName: 'Jane Smith',
    email: 'jane.smith@example.com',
    nij: '67890',
    quizId: 1,
    quizTitle: 'Test Masuk Service Management Batch 1',
    serviceKey: 'service-management',
    serviceName: 'Service Management',
    locationKey: 'surabaya',
    locationName: 'Surabaya',
    score: 65,
    grade: 'C',
    passed: false,
    startedAt: '2025-12-03T11:00:00Z',
    completedAt: '2025-12-03T11:30:00Z',
    submittedAt: '2025-12-03T11:30:00Z',
    totalAnswers: 10,
    correctAnswers: 6,
    createdAt: '2025-12-03T11:00:00Z',
    updatedAt: '2025-12-03T11:30:00Z',
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const quizId = searchParams.get('quizId') ? parseInt(searchParams.get('quizId')!) : null;
    
    console.log('📊 Getting attempts with params:', { page, limit, search, quizId });
    
    // Filter attempts
    let filteredAttempts = [...mockAttempts];
    
    if (search) {
      filteredAttempts = filteredAttempts.filter(attempt => 
        attempt.participantName.toLowerCase().includes(search.toLowerCase()) ||
        attempt.email.toLowerCase().includes(search.toLowerCase()) ||
        attempt.nij.includes(search) ||
        attempt.quizTitle.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (quizId) {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.quizId === quizId);
    }
    
    // Pagination
    const total = filteredAttempts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAttempts = filteredAttempts.slice(startIndex, endIndex);
    
    const response: ApiResponse = {
      success: true,
      message: 'Attempts retrieved successfully',
      data: {
        items: paginatedAttempts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          pageSize: limit,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        }
      },
      statusCode: 200,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in attempts API:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}