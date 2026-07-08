import { z } from "zod";

// ─── Auth Validators ─────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(100, "First name must be less than 100 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(100, "Last name must be less than 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Exam Validators ────────────────────────────────────────

export const createExamSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().optional(),
  subject: z.string().optional(),
  category: z.string().optional(),
  durationMinutes: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours"),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
  passingPercentage: z.coerce
    .number()
    .min(0)
    .max(100, "Passing percentage cannot exceed 100"),
  negativeMarkingPercentage: z.coerce.number().min(0).max(100).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  maxAttempts: z.coerce.number().min(1).default(1),
  instructions: z.string().optional(),
  proctoringEnabled: z.boolean().default(true),
  maxViolations: z.coerce.number().min(1).default(5),
  autoTerminateOnViolations: z.boolean().default(true),
  showResults: z.boolean().default(true),
  showAnswers: z.boolean().default(false),
});

// ─── Question Validators ────────────────────────────────────

export const createQuestionSchema = z.object({
  type: z.enum(["mcq", "multi_select", "true_false", "fill_blank", "descriptive"]),
  text: z.string().min(1, "Question text is required"),
  explanation: z.string().optional(),
  marks: z.coerce.number().min(0).default(1),
  negativeMarks: z.coerce.number().min(0).default(0),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  tags: z.array(z.string()).default([]),
  correctAnswer: z.string().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean().default(false),
      })
    )
    .optional(),
});

// ─── Profile Validators ─────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Type Exports ────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
