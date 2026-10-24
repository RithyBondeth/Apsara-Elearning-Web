import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { IAdminField, TFormValues } from "@/components/admin/form-field"

const toastError = vi.fn()
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: (m: string) => toastError(m) } }))

import { ResourceDialog } from "./index"

/* The question form as the lesson assessments page defines it. */
const FIELDS: IAdminField[] = [
  { name: "type", label: "Type", type: "select", options: [] },
  { name: "question", label: "Question", type: "markdown", preview: "inline", required: true },
  {
    name: "correctAnswer",
    label: "Correct answer",
    type: "answer",
    answerTypeField: "type",
    visible: (v) => v.type !== "multiple_choice",
  },
]

function renderDialog(initialValues: TFormValues, fields = FIELDS) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(
    <ResourceDialog
      open
      onOpenChange={() => {}}
      title="New question"
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  )
  return onSubmit
}

describe("ResourceDialog question form", () => {
  beforeEach(() => toastError.mockReset())

  it("sends a numeric answer as numbers, not JSON text", async () => {
    const user = userEvent.setup()
    const onSubmit = renderDialog({ type: "numeric", question: "2 + 2?" })

    await user.type(screen.getByPlaceholderText("42"), "4")
    await user.type(screen.getByLabelText("Tolerance"), "0.5")
    expect(screen.getByText("Anything from 3.5 to 4.5 is correct.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toEqual({
      type: "numeric",
      question: "2 + 2?",
      correctAnswer: { value: 4, tolerance: 0.5 },
    })
  })

  it("keeps the dialog open with a readable message when the answer is missing", async () => {
    const user = userEvent.setup()
    const onSubmit = renderDialog({ type: "true_false", question: "The sky is blue" })

    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(toastError).toHaveBeenCalledWith("Choose whether the answer is True or False")
    expect(onSubmit).not.toHaveBeenCalled()

    await user.click(screen.getByRole("radio", { name: "False" }))
    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].correctAnswer).toEqual({ value: false })
  })

  it("edits a stored accepted-answers list and adds to it", async () => {
    const user = userEvent.setup()
    const onSubmit = renderDialog({
      type: "fill_blank",
      question: "Keyword for a constant?",
      correctAnswer: { accepted: ["const"] },
    })

    expect(screen.getByLabelText("Accepted answer 1")).toHaveValue("const")
    await user.click(screen.getByRole("button", { name: /Add another accepted answer/ }))
    await user.type(screen.getByLabelText("Accepted answer 2"), "CONST")
    await user.click(screen.getByRole("switch", { name: "Case sensitive" }))

    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].correctAnswer).toEqual({
      accepted: ["const", "CONST"],
      caseSensitive: true,
    })
  })

  it("sends no answer spec for multiple choice", async () => {
    const user = userEvent.setup()
    const onSubmit = renderDialog({ type: "multiple_choice", question: "Pick one" })

    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("correctAnswer")
  })

  it("previews question math as it is typed", async () => {
    const user = userEvent.setup()
    renderDialog({ type: "multiple_choice" })

    expect(screen.queryByTestId("field-question-preview")).toBeNull()
    await user.type(screen.getByLabelText(/Question/), "Solve $x^2 = 4$")
    await waitFor(() =>
      expect(
        screen.getByTestId("field-question-preview").querySelector(".katex")
      ).toBeInTheDocument()
    )
  })

  it("shows a lesson body through the reader's renderer, side by side", async () => {
    renderDialog({ content: "## Notes\n\nArea is $\\pi r^2$." }, [
      { name: "content", label: "Content", type: "markdown", preview: "document" },
    ])

    const preview = screen.getByTestId("field-content-preview")
    expect(preview.querySelector(".lesson-prose")).toBeInTheDocument()
    expect(preview.querySelector(".katex")).toBeInTheDocument()
    expect(screen.getByRole("dialog").className).toContain("sm:max-w-5xl")
  })
})
