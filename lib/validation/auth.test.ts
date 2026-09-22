import { describe, expect, it } from "vitest"

import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth"

/** First validation issue message for a failed parse, or null on success. */
function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? null : (result.error!.issues[0]?.message ?? null)
}

const validRegister = {
  firstName: "Sok",
  lastName: "Dara",
  email: "sok@example.com",
  password: "correcthorse1",
  confirmPassword: "correcthorse1",
  gender: "Male" as const,
  dateOfBirth: "2000-01-01",
  phone: "+855 12 345678",
}

describe("loginSchema", () => {
  it("accepts a well-formed login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(
      true
    )
  })

  it("rejects an invalid email", () => {
    expect(firstError(loginSchema.safeParse({ email: "nope", password: "x" }))).toBe(
      "emailInvalid"
    )
  })

  it("requires a non-empty password without applying the strength rule", () => {
    // Login must accept short legacy passwords — strength is a registration concern.
    expect(loginSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(
      true
    )
    expect(firstError(loginSchema.safeParse({ email: "a@b.com", password: "" }))).toBe(
      "required"
    )
  })
})

describe("registerSchema", () => {
  it("accepts a complete, valid registration", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true)
  })

  it("enforces a 12-character minimum password", () => {
    const r = registerSchema.safeParse({ ...validRegister, password: "short1", confirmPassword: "short1" })
    expect(firstError(r)).toBe("passwordTooShort")
  })

  it("rejects a password over 72 bytes", () => {
    const long = "a".repeat(73)
    const r = registerSchema.safeParse({ ...validRegister, password: long, confirmPassword: long })
    expect(firstError(r)).toBe("passwordTooLong")
  })

  it("flags mismatched confirmation on the confirmPassword field", () => {
    const r = registerSchema.safeParse({ ...validRegister, confirmPassword: "different1234" })
    expect(r.success).toBe(false)
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path[0] === "confirmPassword")
      expect(issue?.message).toBe("passwordMismatch")
    }
  })

  it("rejects a birth date in the future", () => {
    const r = registerSchema.safeParse({ ...validRegister, dateOfBirth: "3000-01-01" })
    expect(firstError(r)).toBe("dateInFuture")
  })

  it("rejects a malformed date", () => {
    const r = registerSchema.safeParse({ ...validRegister, dateOfBirth: "01/01/2000" })
    expect(firstError(r)).toBe("dateInvalid")
  })

  it("rejects an invalid phone number", () => {
    const r = registerSchema.safeParse({ ...validRegister, phone: "abc" })
    expect(firstError(r)).toBe("phoneInvalid")
  })

  it("rejects an unknown gender", () => {
    const r = registerSchema.safeParse({ ...validRegister, gender: "Unknown" })
    expect(firstError(r)).toBe("genderRequired")
  })
})

describe("forgotPasswordSchema", () => {
  it("validates the email only", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true)
    expect(firstError(forgotPasswordSchema.safeParse({ email: "" }))).toBe("required")
  })
})

describe("resetPasswordSchema", () => {
  it("applies the strength rule and confirmation match", () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: "correcthorse1", confirmPassword: "correcthorse1" }).success
    ).toBe(true)
    expect(
      firstError(resetPasswordSchema.safeParse({ newPassword: "short", confirmPassword: "short" }))
    ).toBe("passwordTooShort")
  })
})

describe("changePasswordSchema", () => {
  it("requires the current password by presence and the new one by strength", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "anything",
        newPassword: "correcthorse1",
        confirmPassword: "correcthorse1",
      }).success
    ).toBe(true)
    expect(
      firstError(
        changePasswordSchema.safeParse({
          currentPassword: "",
          newPassword: "correcthorse1",
          confirmPassword: "correcthorse1",
        })
      )
    ).toBe("required")
  })
})
