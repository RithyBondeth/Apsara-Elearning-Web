"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ResourceDialog } from "@/components/admin/resource-dialog"
import type { IAdminField, TFormValues } from "@/components/admin/form-field"
import {
  createChallenge,
  createOption,
  createQuestion,
  createQuiz,
  createTestCase,
  deleteChallenge,
  deleteOption,
  deleteQuestion,
  deleteQuiz,
  deleteTestCase,
  listChallenges,
  listOptions,
  listQuestions,
  getLesson,
  listQuizzes,
  listTestCases,
  reorderQuestions,
  updateChallenge,
  updateOption,
  updateQuestion,
  updateQuiz,
  updateTestCase,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { pluralize } from "@/utils/functions/format"
import {
  QUESTION_TYPES,
  type IAdminChallenge,
  type IAdminOption,
  type IAdminQuestion,
  type IAdminQuiz,
  type IAdminTestCase,
} from "@/utils/interfaces/admin/api.interface"

/**
 * Quizzes and coding challenges for one lesson.
 *
 * Split out from the course page because the tree gets three levels deep here
 * (quiz → question → option) and interleaving it with modules and lessons made
 * neither readable.
 */

const QUIZ_FIELDS: IAdminField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  {
    name: "xpReward",
    label: "XP reward",
    type: "number",
    min: 0,
    help: "Granted the first time a learner passes.",
  },
]

/* The answer spec's shape depends on the question type, so the placeholder
   below is the fastest way to get it right without leaving the form. */
const ANSWER_HELP: Record<string, string> = {
  numeric: '{ "value": 42, "tolerance": 0.5 }',
  fill_blank: '{ "accepted": ["const"], "caseSensitive": false }',
  short_answer: '{ "accepted": ["photosynthesis"], "caseSensitive": false }',
  true_false: '{ "value": true }',
  matching: '{ "pairs": [{ "left": "2+2", "right": "4" }] }',
}

const QUESTION_FIELDS: IAdminField[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: QUESTION_TYPES.map((t) => ({
      value: t,
      label: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
  },
  { name: "question", label: "Question", type: "textarea", required: true, rows: 3 },
  {
    name: "correctAnswer",
    label: "Answer spec",
    type: "json",
    rows: 4,
    help: "JSON. Not used for multiple choice — correctness lives on the options instead.",
    visible: (v) => v.type !== "multiple_choice",
  },
  { name: "explanation", label: "Explanation", type: "textarea", rows: 3 },
  { name: "points", label: "Points", type: "number", min: 1 },
]

const OPTION_FIELDS: IAdminField[] = [
  { name: "answer", label: "Answer", type: "text", required: true },
  { name: "isCorrect", label: "Correct", type: "switch" },
]

const CHALLENGE_FIELDS: IAdminField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", rows: 4 },
  {
    name: "starterCode",
    label: "Starter code",
    type: "textarea",
    rows: 8,
    mono: true,
  },
  {
    name: "solutionCode",
    label: "Solution code",
    type: "textarea",
    rows: 8,
    mono: true,
    help: "Never sent to learners.",
  },
  { name: "xpReward", label: "XP reward", type: "number", min: 0 },
]

const TEST_CASE_FIELDS: IAdminField[] = [
  { name: "input", label: "Input", type: "textarea", rows: 3, mono: true },
  {
    name: "expectedOutput",
    label: "Expected output",
    type: "textarea",
    required: true,
    rows: 3,
    mono: true,
  },
  {
    name: "isHidden",
    label: "Hidden",
    type: "switch",
    help: "Hidden cases still run, but learners cannot see them.",
  },
]

export default function LessonAssessmentsPage() {
  const params = useParams<{ id: string; lessonId: string }>()
  const { id: courseId, lessonId } = params
  /* Set when arriving from the course page; absent on a direct link, in which
     case the heading just falls back to the generic title. */
  const moduleId = useSearchParams().get("moduleId")

  const [lessonTitle, setLessonTitle] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<IAdminQuiz[] | null>(null)
  const [challenges, setChallenges] = useState<IAdminChallenge[]>([])
  const [questions, setQuestions] = useState<Record<string, IAdminQuestion[]>>({})
  const [options, setOptions] = useState<Record<string, IAdminOption[]>>({})
  const [testCases, setTestCases] = useState<Record<string, IAdminTestCase[]>>({})
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [failed, setFailed] = useState(false)

  const [quizDialog, setQuizDialog] = useState<IAdminQuiz | null | false>(false)
  const [questionDialog, setQuestionDialog] = useState<{
    quizId: string
    question: IAdminQuestion | null
  } | null>(null)
  const [optionDialog, setOptionDialog] = useState<{
    questionId: string
    option: IAdminOption | null
  } | null>(null)
  const [challengeDialog, setChallengeDialog] = useState<
    IAdminChallenge | null | false
  >(false)
  const [testCaseDialog, setTestCaseDialog] = useState<{
    challengeId: string
    testCase: IAdminTestCase | null
  } | null>(null)

  /* Same 1 + N walk as the course page, for the same reason: the admin gateway
     exposes each level separately and an author needs all of it at once. */
  const [nonce, setNonce] = useState(0)
  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!moduleId) return
    let cancelled = false
    getLesson(moduleId, lessonId)
      .then((l) => {
        if (!cancelled) setLessonTitle(l.title)
      })
      .catch(() => {
        /* Heading is a nicety — a failure here must not blank the page. */
      })
    return () => {
      cancelled = true
    }
  }, [moduleId, lessonId])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      try {
        const [quizData, challengeData] = await Promise.all([
          listQuizzes(lessonId),
          listChallenges(lessonId).catch(() => [] as IAdminChallenge[]),
        ])
        if (cancelled) return
        setQuizzes(quizData)
        setChallenges(challengeData)
        setFailed(false)

        const questionLists = await Promise.all(
          quizData.map((q) =>
            listQuestions(q.id).then(
              (list) => [q.id, list] as const,
              () => [q.id, [] as IAdminQuestion[]] as const
            )
          )
        )
        if (cancelled) return
        setQuestions(Object.fromEntries(questionLists))

        const allQuestions = questionLists.flatMap(([, list]) => list)
        const optionLists = await Promise.all(
          allQuestions
            .filter((q) => (q.type ?? "multiple_choice") === "multiple_choice")
            .map((q) =>
              listOptions(q.id).then(
                (list) => [q.id, list] as const,
                () => [q.id, [] as IAdminOption[]] as const
              )
            )
        )
        if (cancelled) return
        setOptions(Object.fromEntries(optionLists))

        const testCaseLists = await Promise.all(
          challengeData.map((c) =>
            listTestCases(c.id).then(
              (list) => [c.id, list] as const,
              () => [c.id, [] as IAdminTestCase[]] as const
            )
          )
        )
        if (cancelled) return
        setTestCases(Object.fromEntries(testCaseLists))
      } catch {
        if (cancelled) return
        setFailed(true)
        setQuizzes([])
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [lessonId, nonce])

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action()
      toast.success(success)
      refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong")
    }
  }

  async function moveQuestion(quizId: string, index: number, delta: number) {
    const list = questions[quizId]
    if (!list) return
    const target = index + delta
    if (target < 0 || target >= list.length) return

    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    setQuestions((prev) => ({ ...prev, [quizId]: next }))

    try {
      await reorderQuestions(next.map((q) => q.id))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reorder failed")
      refresh()
    }
  }

  if (quizzes === null) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading assessments…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {lessonTitle ? `Assessments — ${lessonTitle}` : "Assessments"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quizzes and coding challenges attached to this lesson.
        </p>
      </div>

      {failed && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load assessments.
          <button onClick={refresh} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      )}

      <Tabs defaultValue="quizzes">
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
          <TabsTrigger value="challenges">
            Challenges ({challenges.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Quizzes ─────────────────────────────────────────────── */}
        <TabsContent value="quizzes" className="space-y-3 pt-5">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setQuizDialog(null)}>
              <Plus className="size-4" />
              New quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No quizzes on this lesson yet.
            </div>
          ) : (
            quizzes.map((quiz) => {
              const quizQuestions = questions[quiz.id] ?? []
              const isOpen = open.has(quiz.id)

              return (
                <div
                  key={quiz.id}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-2.5">
                    <button
                      onClick={() => toggle(quiz.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm font-medium">
                        {quiz.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {pluralize(quizQuestions.length, "question")} ·{" "}
                        {quiz.xpReward ?? 0} XP
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setQuizDialog(quiz)}
                        aria-label={`Edit ${quiz.title}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${quiz.title}?`}
                        description="Its questions and options go with it. Learner attempts on this quiz are affected."
                        confirmLabel="Delete"
                        variant="danger"
                        icon={<Trash2 className="size-4.5" />}
                        onConfirm={() =>
                          run(() => deleteQuiz(quiz.id), "Quiz deleted")
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${quiz.title}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="divide-y divide-border border-t border-border">
                      {quizQuestions.map((question, index) => {
                        const type = question.type ?? "multiple_choice"
                        const questionOptions = options[question.id] ?? []

                        return (
                          <div key={question.id} className="px-3 py-2.5 pl-9">
                            <div className="flex items-start gap-2">
                              <span className="min-w-0 flex-1 text-sm">
                                {question.question}
                                <Badge
                                  variant="ghost"
                                  className="ml-2 text-[10px]"
                                >
                                  {type.replace(/_/g, " ")}
                                </Badge>
                              </span>
                              <div className="flex shrink-0 items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() =>
                                    moveQuestion(quiz.id, index, -1)
                                  }
                                  disabled={index === 0}
                                  aria-label="Move question up"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => moveQuestion(quiz.id, index, 1)}
                                  disabled={index === quizQuestions.length - 1}
                                  aria-label="Move question down"
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    setQuestionDialog({
                                      quizId: quiz.id,
                                      question,
                                    })
                                  }
                                  aria-label="Edit question"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <ConfirmDialog
                                  title="Delete this question?"
                                  description="This cannot be undone."
                                  confirmLabel="Delete"
                                  variant="danger"
                                  icon={<Trash2 className="size-4.5" />}
                                  onConfirm={() =>
                                    run(
                                      () => deleteQuestion(question.id),
                                      "Question deleted"
                                    )
                                  }
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Delete question"
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </ConfirmDialog>
                              </div>
                            </div>

                            {/* Options only carry meaning for multiple choice —
                                every other type answers from correctAnswer. */}
                            {type === "multiple_choice" && (
                              <div className="mt-2 space-y-1 pl-3">
                                {questionOptions.map((option) => (
                                  <div
                                    key={option.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    {option.isCorrect ? (
                                      <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                      <X className="size-3.5 shrink-0 text-muted-foreground/50" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                      {option.answer}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() =>
                                        setOptionDialog({
                                          questionId: question.id,
                                          option,
                                        })
                                      }
                                      aria-label="Edit option"
                                    >
                                      <Pencil className="size-3" />
                                    </Button>
                                    <ConfirmDialog
                                      title="Delete this option?"
                                      description="This cannot be undone."
                                      confirmLabel="Delete"
                                      variant="danger"
                                      icon={<Trash2 className="size-4.5" />}
                                      onConfirm={() =>
                                        run(
                                          () => deleteOption(option.id),
                                          "Option deleted"
                                        )
                                      }
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label="Delete option"
                                        className="text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="size-3" />
                                      </Button>
                                    </ConfirmDialog>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-muted-foreground"
                                  onClick={() =>
                                    setOptionDialog({
                                      questionId: question.id,
                                      option: null,
                                    })
                                  }
                                >
                                  <Plus className="size-3" />
                                  Add option
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      <div className="px-3 py-2 pl-9">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() =>
                            setQuestionDialog({
                              quizId: quiz.id,
                              question: null,
                            })
                          }
                        >
                          <Plus className="size-4" />
                          Add question
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </TabsContent>

        {/* ── Challenges ──────────────────────────────────────────── */}
        <TabsContent value="challenges" className="space-y-3 pt-5">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setChallengeDialog(null)}>
              <Plus className="size-4" />
              New challenge
            </Button>
          </div>

          {challenges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No coding challenges on this lesson yet.
            </div>
          ) : (
            challenges.map((challenge) => {
              const cases = testCases[challenge.id] ?? []
              const isOpen = open.has(challenge.id)

              return (
                <div
                  key={challenge.id}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-2.5">
                    <button
                      onClick={() => toggle(challenge.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm font-medium">
                        {challenge.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {cases.length} test cases
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setChallengeDialog(challenge)}
                        aria-label={`Edit ${challenge.title}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${challenge.title}?`}
                        description="Its test cases go with it. This cannot be undone."
                        confirmLabel="Delete"
                        variant="danger"
                        icon={<Trash2 className="size-4.5" />}
                        onConfirm={() =>
                          run(
                            () => deleteChallenge(challenge.id),
                            "Challenge deleted"
                          )
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${challenge.title}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="divide-y divide-border border-t border-border">
                      {cases.map((testCase) => (
                        <div
                          key={testCase.id}
                          className="flex items-start gap-2 px-3 py-2 pl-9"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5 font-mono text-xs">
                            <div className="truncate text-muted-foreground">
                              in: {testCase.input || "—"}
                            </div>
                            <div className="truncate text-foreground">
                              out: {testCase.expectedOutput}
                            </div>
                          </div>
                          {testCase.isHidden && (
                            <Badge variant="ghost" className="text-[10px]">
                              hidden
                            </Badge>
                          )}
                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setTestCaseDialog({
                                  challengeId: challenge.id,
                                  testCase,
                                })
                              }
                              aria-label="Edit test case"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <ConfirmDialog
                              title="Delete this test case?"
                              description="This cannot be undone."
                              confirmLabel="Delete"
                              variant="danger"
                              icon={<Trash2 className="size-4.5" />}
                              onConfirm={() =>
                                run(
                                  () => deleteTestCase(testCase.id),
                                  "Test case deleted"
                                )
                              }
                            >
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete test case"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </ConfirmDialog>
                          </div>
                        </div>
                      ))}

                      <div className="px-3 py-2 pl-9">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() =>
                            setTestCaseDialog({
                              challengeId: challenge.id,
                              testCase: null,
                            })
                          }
                        >
                          <Plus className="size-4" />
                          Add test case
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ───────────────────────────────────────────────── */}

      <ResourceDialog
        open={quizDialog !== false}
        onOpenChange={(o) => !o && setQuizDialog(false)}
        title={quizDialog ? `Edit ${quizDialog.title}` : "New quiz"}
        fields={QUIZ_FIELDS}
        initialValues={quizDialog ? ({ ...quizDialog } as TFormValues) : {}}
        submitLabel={quizDialog ? "Save changes" : "Create"}
        onSubmit={async (payload) => {
          if (quizDialog) await updateQuiz(quizDialog.id, payload)
          else await createQuiz(lessonId, payload)
          toast.success(quizDialog ? "Quiz updated" : "Quiz created")
          refresh()
        }}
      />

      <ResourceDialog
        open={questionDialog !== null}
        onOpenChange={(o) => !o && setQuestionDialog(null)}
        title={questionDialog?.question ? "Edit question" : "New question"}
        description={
          ANSWER_HELP[String(questionDialog?.question?.type ?? "")] &&
          `Answer spec example: ${ANSWER_HELP[String(questionDialog?.question?.type)]}`
        }
        fields={QUESTION_FIELDS}
        initialValues={
          questionDialog?.question
            ? {
                ...questionDialog.question,
                /* The editor is text; the API takes an object. */
                correctAnswer: questionDialog.question.correctAnswer
                  ? JSON.stringify(questionDialog.question.correctAnswer, null, 2)
                  : "",
              }
            : { type: "multiple_choice", points: 1 }
        }
        submitLabel={questionDialog?.question ? "Save changes" : "Create"}
        onSubmit={async (payload) => {
          if (!questionDialog) return
          if (questionDialog.question)
            await updateQuestion(questionDialog.question.id, payload)
          else await createQuestion(questionDialog.quizId, payload)
          toast.success(
            questionDialog.question ? "Question updated" : "Question created"
          )
          refresh()
        }}
      />

      <ResourceDialog
        open={optionDialog !== null}
        onOpenChange={(o) => !o && setOptionDialog(null)}
        title={optionDialog?.option ? "Edit option" : "New option"}
        fields={OPTION_FIELDS}
        initialValues={
          optionDialog?.option
            ? ({ ...optionDialog.option } as TFormValues)
            : { isCorrect: false }
        }
        submitLabel={optionDialog?.option ? "Save changes" : "Create"}
        onSubmit={async (payload) => {
          if (!optionDialog) return
          if (optionDialog.option)
            await updateOption(optionDialog.option.id, payload)
          else await createOption(optionDialog.questionId, payload)
          toast.success(optionDialog.option ? "Option updated" : "Option created")
          refresh()
        }}
      />

      <ResourceDialog
        open={challengeDialog !== false}
        onOpenChange={(o) => !o && setChallengeDialog(false)}
        title={challengeDialog ? `Edit ${challengeDialog.title}` : "New challenge"}
        fields={CHALLENGE_FIELDS}
        initialValues={
          challengeDialog ? ({ ...challengeDialog } as TFormValues) : {}
        }
        submitLabel={challengeDialog ? "Save changes" : "Create"}
        onSubmit={async (payload) => {
          if (challengeDialog)
            await updateChallenge(challengeDialog.id, payload)
          else await createChallenge(lessonId, payload)
          toast.success(challengeDialog ? "Challenge updated" : "Challenge created")
          refresh()
        }}
      />

      <ResourceDialog
        open={testCaseDialog !== null}
        onOpenChange={(o) => !o && setTestCaseDialog(null)}
        title={testCaseDialog?.testCase ? "Edit test case" : "New test case"}
        fields={TEST_CASE_FIELDS}
        initialValues={
          testCaseDialog?.testCase
            ? ({ ...testCaseDialog.testCase } as TFormValues)
            : { isHidden: false }
        }
        submitLabel={testCaseDialog?.testCase ? "Save changes" : "Create"}
        onSubmit={async (payload) => {
          if (!testCaseDialog) return
          if (testCaseDialog.testCase)
            await updateTestCase(testCaseDialog.testCase.id, payload)
          else await createTestCase(testCaseDialog.challengeId, payload)
          toast.success(
            testCaseDialog.testCase ? "Test case updated" : "Test case created"
          )
          refresh()
        }}
      />
    </div>
  )
}
