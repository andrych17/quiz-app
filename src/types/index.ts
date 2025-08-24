export type Question = {
  id: string;
  order: number;
  questionText: string;
  questionType: 'multiple-choice' | 'text'; // Support both types
  options?: string[]; // For multiple choice questions
  correctAnswer: string; // For multiple choice, this will be the option text or index
};

export type AttemptAnswer = {
  questionId: string;
  answerText: string;
  selectedOption?: number; // For multiple choice answers
};

export type Attempt = {
  id: string;
  quizId: string;
  participantName: string;
  nij: string;
  answers: AttemptAnswer[];
  score: number;
  passed: boolean; // whether the participant passed based on passing score
  submittedAt: string; // ISO
};

export type Quiz = {
  id: string;
  title: string;
  slug?: string;
  linkToken: string;
  isPublished: boolean;
  expiresAt?: string | null; // ISO; null = never expires
  questions: Question[];
  attempts: Attempt[];
  createdBy: string; // dummy admin id/email
  createdAt: string;
  updatedAt: string;
  passingScore: number; // minimum score to pass (out of total questions)
  questionsPerPage: number; // pagination setting
};
