import { describe, expect, it } from "vitest"

import { displayNameOf } from "@/utils/functions/user"
import type { IApiUser } from "@/utils/interfaces/user/api.interface"

/** Minimal user factory — only the fields displayNameOf reads matter. */
function user(overrides: Partial<IApiUser>): IApiUser {
  return {
    firstName: "",
    lastName: "",
    email: "someone@example.com",
    ...overrides,
  } as IApiUser
}

describe("displayNameOf", () => {
  it("joins first and last name", () => {
    expect(displayNameOf(user({ firstName: "Sok", lastName: "Dara" }))).toBe(
      "Sok Dara"
    )
  })

  it("uses whichever name part is present", () => {
    expect(displayNameOf(user({ firstName: "Sok" }))).toBe("Sok")
    expect(displayNameOf(user({ lastName: "Dara" }))).toBe("Dara")
  })

  it("falls back to the email prefix when no names are set", () => {
    expect(
      displayNameOf(user({ email: "bondeth@apsara-elearning.com" }))
    ).toBe("bondeth")
  })
})
