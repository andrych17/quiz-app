import { v4 as randomUUID } from "uuid";
import { Quiz, Question, Attempt, AttemptAnswer } from "@/types";
import { isExpired } from "./date";
import { normalizeAndScore } from "./scoring";
import { slugify } from "./slug";
import { makeToken } from "./token";

let quizzes: Quiz[] = [
  {
    id: randomUUID(),
    title: "Sample Quiz",
    slug: "sample-quiz",
    linkToken: "abcd1234",
    isPublished: true,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    questions: [
      { 
        id: randomUUID(), 
        order: 1, 
        questionText: "2 + 2 = ?", 
        questionType: "multiple-choice",
        options: ["2", "3", "4", "5"],
        correctAnswer: "4" 
      },
      { 
        id: randomUUID(), 
        order: 2, 
        questionText: "Capital of France?", 
        questionType: "multiple-choice",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris" 
      },
    ],
    attempts: [],
    createdBy: "admin@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passingScore: 1,
    questionsPerPage: 5,
  },
];

export const db = {
  // ADMIN
  listQuizzes(by?: string) {
    return quizzes.filter(q => !by || q.createdBy === by);
  },
  getQuizById(id: string) {
    return quizzes.find(q => q.id === id) ?? null;
  },
  getQuizByToken(token: string) {
    return quizzes.find(q => q.linkToken === token) ?? null;
  },
  createQuiz(input: { title: string; expiresAt?: string | null; createdBy: string }) {
    const now = new Date().toISOString();
    const quiz: Quiz = {
      id: randomUUID(),
      title: input.title,
      slug: slugify(input.title),
      linkToken: makeToken(),
      isPublished: false,
      expiresAt: input.expiresAt ?? null,
      questions: [],
      attempts: [],
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      passingScore: 1,
      questionsPerPage: 5,
    };
    quizzes.unshift(quiz);
    return quiz;
  },
  updateQuiz(id: string, patch: Partial<Quiz>) {
    const q = this.getQuizById(id);
    if (!q) return null;
    Object.assign(q, patch, { updatedAt: new Date().toISOString() });
    return q;
  },
  addQuestion(quizId: string, input: { questionText: string; correctAnswer: string }) {
    const q = this.getQuizById(quizId);
    if (!q) return null;
    const order = (q.questions.at(-1)?.order ?? 0) + 1;
    const question: Question = {
      id: randomUUID(),
      order,
      questionText: input.questionText,
      questionType: "multiple-choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: input.correctAnswer,
    };
    q.questions.push(question);
    q.updatedAt = new Date().toISOString();
    return question;
  },
  removeQuestion(quizId: string, questionId: string) {
    const q = this.getQuizById(quizId);
    if (!q) return false;
    q.questions = q.questions.filter(qq => qq.id !== questionId).map((qq, i) => ({ ...qq, order: i + 1 }));
    q.updatedAt = new Date().toISOString();
    return true;
  },

  // PUBLIC
  submitAttempt(quizToken: string, payload: { name: string; nij: string; answers: AttemptAnswer[] }) {
    const q = this.getQuizByToken(quizToken);
    if (!q) throw new Error("Quiz not found");
    if (!q.isPublished) throw new Error("Quiz not published");
    if (isExpired(q.expiresAt)) throw new Error("Quiz expired");

    // enforce once per (quiz, nij)
    const exists = q.attempts.some(a => a.nij.trim().toLowerCase() === payload.nij.trim().toLowerCase());
    if (exists) throw new Error("NIJ already submitted for this quiz");

    const score = normalizeAndScore(q.questions, payload.answers);
    const passed = score >= q.passingScore;
    const attempt: Attempt = {
      id: randomUUID(),
      quizId: q.id,
      participantName: payload.name.trim(),
      nij: payload.nij.trim(),
      answers: payload.answers,
      score,
      passed,
      submittedAt: new Date().toISOString(),
    };
    q.attempts.push(attempt);
    q.updatedAt = new Date().toISOString();
    return attempt;
  },
};
