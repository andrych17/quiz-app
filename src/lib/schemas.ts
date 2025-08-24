import { z } from "zod";

export const quizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  expiresAt: z.string().datetime().nullable().optional(), // ISO or null
});

export const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

export const publicSubmitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nij: z.string().min(1, "NIJ is required"),
  answers: z.array(z.object({ 
    questionId: z.string(), 
    answerText: z.string() 
  })),
});
