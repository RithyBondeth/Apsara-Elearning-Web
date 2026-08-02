import { z } from "zod"

/**
 * Messages are i18n keys under `auth.validation.*`, not display strings — forms
 * render them with `t(error.message)` so validation copy stays translatable.
 *
 * Shapes mirror the gateway DTOs (`RegisterRequestDTO`, `LoginRequestDTO`).
 * Keep the two in sync: a mismatch here surfaces as a 400 from class-validator
 * rather than an inline field error.
 */

const email = z.string().min(1, "required").email("emailInvalid")

/* Bcrypt consumes at most 72 bytes; the API applies the same bounded policy. */
const password = z
  .string()
  .min(12, "passwordTooShort")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "passwordTooLong"
  )

const existingPassword = z
  .string()
  .min(1, "required")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "passwordTooLong"
  )

export const loginSchema = z.object({
  email,
  /* Login only checks presence; the strength rule belongs to registration. */
  password: existingPassword,
})

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "required"),
    lastName: z.string().min(1, "required"),
    email,
    password,
    confirmPassword: z.string().min(1, "required"),
    gender: z.enum(["Male", "Female", "Other"], { message: "genderRequired" }),
    /* The API takes an ISO date string (`@IsDateString`), which is what
       <input type="date"> already produces. */
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid")
      .refine((v) => new Date(v) < new Date(), "dateInFuture"),
    phone: z
      .string()
      .min(1, "required")
      .regex(/^[0-9+\s-]{8,15}$/, "phoneInvalid"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({ email })

/* Password policy is shared with ResetPasswordRequestDTO. */
export const resetPasswordSchema = z
  .object({
    newPassword: password,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })

/* Password policy is shared with ChangePasswordRequestDTO. */
export const changePasswordSchema = z
  .object({
    currentPassword: existingPassword,
    newPassword: password,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })

export type TLoginInput = z.infer<typeof loginSchema>
export type TRegisterInput = z.infer<typeof registerSchema>
export type TForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type TResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type TChangePasswordInput = z.infer<typeof changePasswordSchema>

/** What the gateway actually accepts — `confirmPassword` is client-side only. */
export type TRegisterPayload = Omit<TRegisterInput, "confirmPassword">
