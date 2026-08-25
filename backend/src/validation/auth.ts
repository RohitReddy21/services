import { z } from "zod";

const ukPhone = z
  .string()
  .trim()
  .regex(/^(?:\+44\s?|0)(?:\d\s?){9,10}$/, "Enter a valid UK phone number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: ukPhone,
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().trim().toUpperCase().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
