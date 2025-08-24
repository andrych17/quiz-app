export type Question = {
  id: string;
  order: number;
  questionText: string;
  correctAnswer: string; // short text
};

export type AttemptAnswer = {
  questionId: string;
  answerText: string;
};

export type Attempt = {
  id: string;
  quizId: string;
  participantName: string;
  nij: string;
  answers: AttemptAnswer[];
  score: number;
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
};
