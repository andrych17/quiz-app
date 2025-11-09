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

// Quiz session schemas
export const startSessionSchema = z.object({
  quizId: z.number().positive("Quiz ID must be a positive number"),
  userEmail: z.string().email("Valid email is required"),
});

export const sessionTokenSchema = z.object({
  sessionToken: z.string().uuid("Session token must be a valid UUID"),
});

export const updateTimeSchema = z.object({
  sessionToken: z.string().uuid("Session token must be a valid UUID"),
  timeSpentSeconds: z.number().min(0, "Time spent cannot be negative"),
});

// Form validation for participant info with session
export const participantInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  nij: z.string().min(1, "NIJ is required").max(50, "NIJ is too long"),
  email: z.string().email("Valid email is required").optional(),
});

// Quiz duration validation
export const quizDurationSchema = z.object({
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours").nullable(),
});

// Admin authentication schemas
export const adminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
