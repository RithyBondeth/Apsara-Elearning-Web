/** Mirrors the public columns GET /user/me returns in apsara-elearning-api. */
export interface IApiUser {
  id: string
  firstName: string | null
  lastName: string | null
  gender: string | null
  dateOfBirth: string | null
  avatar: string | null
  streak: number
  xp: number
  isAdmin: boolean
  email: string
  isEmailVerified: boolean
  phone: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}
