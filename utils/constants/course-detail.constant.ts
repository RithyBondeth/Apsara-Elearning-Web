import type { TColorKey } from "@/utils/constants/landing.constant"
import type { ICourseDetail, ISyllabusModule } from "@/utils/interfaces/course-detail"
import { PYTHON_MODULES } from "@/utils/constants/learn.constant"

/* ── Python syllabus — derived from the real learn modules ───────────── */

const PYTHON_SYLLABUS: ISyllabusModule[] = PYTHON_MODULES.map((m) => ({
  section: m.section,
  sectionKh: m.sectionKh,
  lessons: m.lessons.map(
    ({ id, title, titleKh, type, duration, xpReward, done, current, locked }) => ({
      id, title, titleKh, type, duration, xpReward, done, current, locked,
    })
  ),
}))

/* ── React syllabus (first modules — rest unlock with progress) ──────── */

const REACT_SYLLABUS: ISyllabusModule[] = [
  {
    section: "Module 1: React Foundations",
    sectionKh: "ម៉ូឌុល ១: មូលដ្ឋាន React",
    lessons: [
      { id: 1, title: "What is React?",             titleKh: "React គឺជាអ្វី?",            type: "theory",    duration: "10 min", xpReward: 50,  done: true },
      { id: 2, title: "JSX & Rendering",            titleKh: "JSX & ការបង្ហាញ",            type: "theory",    duration: "12 min", xpReward: 50,  done: true },
      { id: 3, title: "Your First Component",       titleKh: "Component ដំបូងរបស់អ្នក",     type: "practice",  duration: "15 min", xpReward: 100, done: true },
      { id: 4, title: "Props & Composition",        titleKh: "Props & ការផ្សំ",             type: "theory",    duration: "14 min", xpReward: 50,  done: true },
    ],
  },
  {
    section: "Module 2: State & Events",
    sectionKh: "ម៉ូឌុល ២: State & ព្រឹត្តិការណ៍",
    lessons: [
      { id: 5, title: "Handling Events",            titleKh: "ការគ្រប់គ្រងព្រឹត្តិការណ៍",     type: "theory",    duration: "12 min", xpReward: 50,  done: true },
      { id: 6, title: "useState Hook",              titleKh: "useState Hook",              type: "theory",    duration: "16 min", xpReward: 50,  done: false, current: true },
      { id: 7, title: "Counter App Practice",       titleKh: "អនុវត្ត — កម្មវិធីរាប់",       type: "practice",  duration: "18 min", xpReward: 100, done: false },
      { id: 8, title: "Todo List Challenge",        titleKh: "ការប្រឡង — បញ្ជីការងារ",      type: "challenge", duration: "25 min", xpReward: 200, done: false },
    ],
  },
  {
    section: "Module 3: Effects & Data",
    sectionKh: "ម៉ូឌុល ៣: Effects & ទិន្នន័យ",
    lessons: [
      { id: 9,  title: "useEffect Hook",            titleKh: "useEffect Hook",             type: "theory",    duration: "16 min", xpReward: 50,  locked: true },
      { id: 10, title: "Fetching Data",             titleKh: "ការទាញយកទិន្នន័យ",           type: "theory",    duration: "14 min", xpReward: 50,  locked: true },
      { id: 11, title: "Weather App Practice",      titleKh: "អនុវត្ត — កម្មវិធីអាកាសធាតុ",  type: "practice",  duration: "20 min", xpReward: 100, locked: true },
      { id: 12, title: "Movie Search Challenge",    titleKh: "ការប្រឡង — ស្វែងរកភាពយន្ត",   type: "challenge", duration: "30 min", xpReward: 200, locked: true },
    ],
  },
]

/* ── Algorithms syllabus (first modules — rest unlock with progress) ─── */

const ALGORITHMS_SYLLABUS: ISyllabusModule[] = [
  {
    section: "Module 1: Complexity & Arrays",
    sectionKh: "ម៉ូឌុល ១: ភាពស្មុគស្មាញ & Arrays",
    lessons: [
      { id: 1, title: "Big-O Notation",             titleKh: "សញ្ញាណ Big-O",               type: "theory",    duration: "15 min", xpReward: 50 },
      { id: 2, title: "Arrays & Memory",            titleKh: "Arrays & អង្គចងចាំ",          type: "theory",    duration: "12 min", xpReward: 50 },
      { id: 3, title: "Two-Pointer Technique",      titleKh: "បច្ចេកទេស Two-Pointer",       type: "theory",    duration: "14 min", xpReward: 50 },
      { id: 4, title: "Array Drills",               titleKh: "អនុវត្ត — Arrays",            type: "practice",  duration: "20 min", xpReward: 100 },
    ],
  },
  {
    section: "Module 2: Searching & Sorting",
    sectionKh: "ម៉ូឌុល ២: ការស្វែងរក & តម្រៀប",
    lessons: [
      { id: 5, title: "Binary Search",              titleKh: "ការស្វែងរកគោលពីរ",           type: "theory",    duration: "16 min", xpReward: 50,  locked: true },
      { id: 6, title: "Bubble & Selection Sort",    titleKh: "តម្រៀប Bubble & Selection",   type: "theory",    duration: "14 min", xpReward: 50,  locked: true },
      { id: 7, title: "Merge Sort",                 titleKh: "តម្រៀប Merge",                type: "theory",    duration: "18 min", xpReward: 50,  locked: true },
      { id: 8, title: "Sorting Race Challenge",     titleKh: "ការប្រឡង — ការប្រណាំងតម្រៀប",  type: "challenge", duration: "30 min", xpReward: 200, locked: true },
    ],
  },
  {
    section: "Module 3: Stacks, Queues & Trees",
    sectionKh: "ម៉ូឌុល ៣: Stacks, Queues & Trees",
    lessons: [
      { id: 9,  title: "Stacks & Queues",           titleKh: "Stacks & Queues",            type: "theory",    duration: "15 min", xpReward: 50,  locked: true },
      { id: 10, title: "Binary Trees",              titleKh: "មែកធាងគោលពីរ",               type: "theory",    duration: "18 min", xpReward: 50,  locked: true },
      { id: 11, title: "Tree Traversal Practice",   titleKh: "អនុវត្ត — ការដើរមែកធាង",      type: "practice",  duration: "22 min", xpReward: 100, locked: true },
      { id: 12, title: "Balanced Brackets Challenge", titleKh: "ការប្រឡង — វង់ក្រចកតុល្យភាព", type: "challenge", duration: "28 min", xpReward: 200, locked: true },
    ],
  },
]

/* ── Grade 11 Physics syllabus (first modules) ───────────────────────── */

const PHYSICS_SYLLABUS: ISyllabusModule[] = [
  {
    section: "Module 1: Forces & Motion",
    sectionKh: "ម៉ូឌុល ១: កម្លាំង & ចលនា",
    lessons: [
      { id: 1, title: "Newton's Laws",               titleKh: "ច្បាប់ញូតុន",               type: "theory",    duration: "15 min", xpReward: 50 },
      { id: 2, title: "Motion in One Dimension",     titleKh: "ចលនាតាមបន្ទាត់ត្រង់",        type: "theory",    duration: "14 min", xpReward: 50 },
      { id: 3, title: "Forces Practice",             titleKh: "អនុវត្ត — កម្លាំង",          type: "practice",  duration: "20 min", xpReward: 100 },
      { id: 4, title: "Motion Challenge",            titleKh: "ការប្រឡង — ចលនា",           type: "challenge", duration: "25 min", xpReward: 200 },
    ],
  },
  {
    section: "Module 2: Work & Energy",
    sectionKh: "ម៉ូឌុល ២: ការងារ & ថាមពល",
    lessons: [
      { id: 5, title: "Work & Power",                titleKh: "ការងារ & អានុភាព",          type: "theory",    duration: "14 min", xpReward: 50,  locked: true },
      { id: 6, title: "Kinetic & Potential Energy",  titleKh: "ថាមពលស៊ីនេទិច & ប៉ូតង់ស្យែល", type: "theory",    duration: "16 min", xpReward: 50,  locked: true },
      { id: 7, title: "Energy Practice",             titleKh: "អនុវត្ត — ថាមពល",           type: "practice",  duration: "20 min", xpReward: 100, locked: true },
      { id: 8, title: "Energy Challenge",            titleKh: "ការប្រឡង — ថាមពល",          type: "challenge", duration: "28 min", xpReward: 200, locked: true },
    ],
  },
]

/* ── General English syllabus (first modules) ────────────────────────── */

const ENGLISH_SYLLABUS: ISyllabusModule[] = [
  {
    section: "Module 1: Everyday Conversations",
    sectionKh: "ម៉ូឌុល ១: ការសន្ទនាប្រចាំថ្ងៃ",
    lessons: [
      { id: 1, title: "Greetings & Introductions",   titleKh: "ការស្វាគមន៍ & ការណែនាំខ្លួន",  type: "theory",    duration: "12 min", xpReward: 50 },
      { id: 2, title: "Talking About Your Day",      titleKh: "និយាយអំពីថ្ងៃរបស់អ្នក",       type: "theory",    duration: "12 min", xpReward: 50 },
      { id: 3, title: "Conversation Practice",       titleKh: "អនុវត្ត — ការសន្ទនា",         type: "practice",  duration: "18 min", xpReward: 100 },
      { id: 4, title: "Role-play Challenge",         titleKh: "ការប្រឡង — សម្តែងតួ",        type: "challenge", duration: "25 min", xpReward: 200 },
    ],
  },
  {
    section: "Module 2: Grammar Foundations",
    sectionKh: "ម៉ូឌុល ២: មូលដ្ឋានវេយ្យាករណ៍",
    lessons: [
      { id: 5, title: "Present & Past Tenses",       titleKh: "កាលបច្ចុប្បន្ន & អតីតកាល",    type: "theory",    duration: "14 min", xpReward: 50,  locked: true },
      { id: 6, title: "Questions & Negatives",       titleKh: "សំណួរ & បដិសេធ",            type: "theory",    duration: "12 min", xpReward: 50,  locked: true },
      { id: 7, title: "Grammar Practice",            titleKh: "អនុវត្ត — វេយ្យាករណ៍",        type: "practice",  duration: "18 min", xpReward: 100, locked: true },
      { id: 8, title: "Grammar Quiz",                titleKh: "ការប្រឡង — វេយ្យាករណ៍",      type: "challenge", duration: "25 min", xpReward: 200, locked: true },
    ],
  },
]

/* ── Course details, keyed by catalog slug ─────────────────────────────
 * "math" (Grade 12 Mathematics) is deliberately absent — it's seeded as a
 * real course on the API under the same slug, so courses/[slug]/page.tsx
 * fetches it live instead of falling back to this mock table.
 */

export const COURSE_DETAILS: Record<string, ICourseDetail> = {
  physics: {
    key: "physics",
    track: "k12",
    grade: 11,
    color: "cyan" as TColorKey,
    icon: "Atom",
    totalLessons: 36,
    totalXp: 3600,
    hours: 30,
    students: 3480,
    outcomes: 4,
    syllabus: PHYSICS_SYLLABUS,
  },
  english: {
    key: "english",
    track: "k12",
    grade: "all",
    color: "amber" as TColorKey,
    icon: "Languages",
    totalLessons: 40,
    totalXp: 4000,
    hours: 32,
    students: 6240,
    outcomes: 4,
    syllabus: ENGLISH_SYLLABUS,
  },
  python: {
    key: "python",
    track: "programming",
    level: "beginner",
    color: "violet" as TColorKey,
    icon: "Terminal",
    totalLessons: 24,
    totalXp: 2400,
    hours: 18,
    students: 4230,
    outcomes: 4,
    syllabus: PYTHON_SYLLABUS,
  },
  react: {
    key: "react",
    track: "programming",
    level: "intermediate",
    color: "cyan" as TColorKey,
    icon: "Code2",
    totalLessons: 32,
    totalXp: 3200,
    hours: 26,
    students: 2810,
    outcomes: 4,
    syllabus: REACT_SYLLABUS,
  },
  algorithms: {
    key: "algorithms",
    track: "programming",
    level: "advanced",
    color: "amber" as TColorKey,
    icon: "Brain",
    totalLessons: 40,
    totalXp: 4000,
    hours: 34,
    students: 1920,
    outcomes: 4,
    syllabus: ALGORITHMS_SYLLABUS,
  },
}
