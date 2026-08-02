// Offline preview generator for Grade 12 Chemistry.
// Usage (from apsara-elearning-web): npm run preview:chemistry
//
// Renders the complete Khmer curriculum, KaTeX equations, worked examples,
// exercises, solutions, and quiz answer keys into one self-contained HTML file.
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import rehypeKatex from "rehype-katex"
import rehypeStringify from "rehype-stringify"

const API = path.resolve(process.cwd(), "../apsara-elearning-api")
const OUT = path.resolve(
  process.cwd(),
  "../resources/Chemistry Grade 12/chemistry-preview.html"
)
const mod = await import(
  path.join(API, "scripts/content/chemistry-grade-12.mjs")
)
const course = mod.CHEMISTRY_GRADE_12

const md = (text) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(text ?? "")
    .toString()

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const webRequire = createRequire(path.join(process.cwd(), "package.json"))
const katexCssPath = webRequire.resolve("katex/dist/katex.min.css")
const katexFonts = path.join(path.dirname(katexCssPath), "fonts")
const katexCss = readFileSync(katexCssPath, "utf8")
  .replace(/,url\(fonts\/[^)]+\.woff\) format\("woff"\)/g, "")
  .replace(/,url\(fonts\/[^)]+\.ttf\) format\("truetype"\)/g, "")
  .replace(
    /url\(fonts\/([^)]+\.woff2)\)/g,
    (_match, file) =>
      `url(data:font/woff2;base64,${readFileSync(path.join(katexFonts, file)).toString("base64")})`
  )

const answerFor = (question) => {
  if (question.type === "true_false") {
    return question.correctAnswer.value ? "ពិត" : "មិនពិត"
  }
  if (question.type === "fill_blank") {
    return (question.correctAnswer.accepted ?? []).join(" / ")
  }
  if (question.type === "numeric") {
    const tolerance = question.correctAnswer.tolerance
    return `${question.correctAnswer.value}${tolerance ? ` (±${tolerance})` : ""}`
  }
  return ""
}

let lessonNumber = 0
let toc = ""
let body = ""

for (const chapter of course.modules) {
  toc += `<li class="toc-chapter">${esc(chapter.title)}<ul>`
  body += `<section class="chapter">
    <header class="chapter-header">
      <span class="chapter-kicker">ជំពូក</span>
      <h2>${esc(chapter.title)}</h2>
      <div class="chapter-description">${md(chapter.description)}</div>
    </header>`

  for (const lesson of chapter.lessons) {
    lessonNumber++
    toc += `<li><a href="#${esc(lesson.slug)}">${esc(lesson.title)}</a></li>`
    body += `<article class="lesson" id="${esc(lesson.slug)}">
      <header class="lesson-header">
        <span class="lesson-number">${lessonNumber}</span>
        <div><h3>${esc(lesson.title)}</h3><span>${lesson.minutes} នាទី</span></div>
      </header>
      <div class="lesson-content">${md(lesson.content)}</div>`

    if (lesson.quiz) {
      body += `<section class="quiz">
        <header><span>តេស្តមេរៀន</span><h4>${esc(lesson.quiz.title)}</h4>
        <p>${esc(lesson.quiz.description ?? "")}</p></header>`

      lesson.quiz.questions.forEach((question, index) => {
        body += `<div class="question">
          <div class="question-title"><span>${index + 1}</span>${md(question.question)}</div>`

        if (question.type === "multiple_choice") {
          body += '<ol class="options" type="A">'
          for (const [answer, correct] of question.options ?? []) {
            body += `<li class="${correct ? "correct" : ""}">${md(answer)}${correct ? "<strong>✓ ត្រូវ</strong>" : ""}</li>`
          }
          body += "</ol>"
        } else {
          body += `<div class="answer"><span>ចម្លើយ</span>${esc(answerFor(question))}</div>`
        }

        if (question.explanation) {
          body += `<div class="explanation"><strong>ពន្យល់៖</strong> ${md(question.explanation)}</div>`
        }
        body += "</div>"
      })
      body += "</section>"
    }
    body += "</article>"
  }
  toc += "</ul></li>"
  body += "</section>"
}

const lessons = course.modules.flatMap((chapter) => chapter.lessons)
const questionCount = lessons.reduce(
  (total, lesson) => total + (lesson.quiz?.questions.length ?? 0),
  0
)
const minutes = lessons.reduce((total, lesson) => total + lesson.minutes, 0)

const html = `<!doctype html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${esc(course.title)} — មើលជាមុន</title>
  <style>
  ${katexCss}
  :root{
    --bg:#f7f4ed;--panel:#fffdf8;--ink:#1f241f;--muted:#667067;
    --line:#e8dfcc;--brand:#b86f0b;--brand-dark:#754304;--soft:#fff1cf;
    --good:#147a43;--good-soft:#eaf8ef;--formula:#f6f1e7;--shadow:0 10px 35px rgba(69,49,15,.07)
  }
  @media(prefers-color-scheme:dark){:root{
    --bg:#12130f;--panel:#1b1d17;--ink:#edf0e7;--muted:#a8b0a4;
    --line:#34362c;--brand:#f2b653;--brand-dark:#ffd289;--soft:#302715;
    --good:#65d592;--good-soft:#15291d;--formula:#23251e;--shadow:none
  }}
  *{box-sizing:border-box}html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.85 "Noto Sans Khmer","Khmer OS Siemreap","Hanuman",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .layout{display:grid;grid-template-columns:310px minmax(0,1fr);max-width:1380px;margin:auto}
  aside{height:100vh;position:sticky;top:0;overflow:auto;padding:26px 22px;background:var(--panel);border-right:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:11px;margin-bottom:4px}.flask{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--brand);color:white;font-size:21px}
  aside h1{font-size:17px;line-height:1.5;margin:0}.aside-meta{font-size:12px;color:var(--muted);margin:4px 0 18px}
  aside ul{list-style:none;padding:0;margin:0}.toc-chapter{color:var(--brand);font-weight:700;font-size:13px;margin-top:16px}
  .toc-chapter ul{margin-top:5px}.toc-chapter a{display:block;padding:4px 0 4px 12px;border-left:2px solid transparent;color:var(--muted);font-weight:400;text-decoration:none}
  .toc-chapter a:hover{border-color:var(--brand);color:var(--ink)}
  main{min-width:0;padding:42px 50px 90px}.hero{padding:34px;border:1px solid var(--line);border-radius:24px;background:radial-gradient(circle at 90% 15%,var(--soft),transparent 40%),var(--panel);box-shadow:var(--shadow)}
  .eyebrow{color:var(--brand);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{font-size:32px;line-height:1.5;margin:4px 0 8px}.hero>p{color:var(--muted);max-width:900px}
  .stats{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.stat{padding:7px 13px;border-radius:999px;background:var(--soft);border:1px solid var(--line);font-size:12px;color:var(--brand-dark)}
  .chapter{margin-top:58px}.chapter-header{margin-bottom:20px}.chapter-kicker{font-size:11px;color:var(--brand);font-weight:800;letter-spacing:.16em}
  .chapter-header h2{font-size:24px;line-height:1.55;margin:2px 0 4px;padding-bottom:9px;border-bottom:2px solid var(--brand)}
  .chapter-description{color:var(--muted);font-size:14px}.chapter-description p{margin:0}
  .lesson{scroll-margin-top:18px;background:var(--panel);border:1px solid var(--line);border-radius:19px;padding:28px 32px;margin:20px 0;box-shadow:var(--shadow)}
  .lesson-header{display:flex;align-items:center;gap:13px;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:20px}.lesson-number{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--brand);color:#fff;font-weight:800}
  .lesson-header h3{font-size:20px;line-height:1.5;margin:0}.lesson-header div span{font-size:12px;color:var(--muted)}
  .lesson-content h2{font-size:19px;margin:27px 0 8px;color:var(--brand-dark)}.lesson-content h3{font-size:16px;margin:22px 0 6px}.lesson-content p{margin:8px 0}
  .lesson-content ul,.lesson-content ol{padding-left:25px}.lesson-content blockquote{margin:16px 0;padding:10px 16px;border-left:4px solid var(--brand);background:var(--soft);border-radius:0 10px 10px 0}
  table{width:100%;border-collapse:collapse;display:block;overflow:auto;margin:15px 0;font-size:14px}th,td{border:1px solid var(--line);padding:8px 12px;text-align:left;white-space:normal}th{background:var(--soft)}
  details{border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:15px 0;background:var(--formula)}summary{cursor:pointer;color:var(--brand-dark)}
  .katex{font-size:1.04em}.katex-display{overflow-x:auto;overflow-y:hidden;background:var(--formula);border:1px solid var(--line);border-radius:11px;padding:10px;margin:14px 0}
  .quiz{margin-top:32px;padding-top:22px;border-top:2px dashed var(--line)}.quiz>header span{font-size:11px;font-weight:800;color:var(--brand);letter-spacing:.12em}.quiz h4{font-size:18px;margin:0}.quiz>header p{color:var(--muted);font-size:13px;margin:2px 0 14px}
  .question{padding:15px 17px;border-radius:13px;border:1px solid var(--line);background:var(--bg);margin:11px 0}.question-title{display:flex;gap:9px;align-items:flex-start}.question-title>span{display:grid;place-items:center;min-width:25px;height:25px;border-radius:8px;background:var(--brand);color:#fff;font-size:12px;font-weight:800}.question-title p{margin:0}
  .options{padding-left:34px;margin:10px 0}.options li{position:relative;padding:7px 10px;margin:5px 0;border:1px solid var(--line);border-radius:9px;background:var(--panel)}.options li p{display:inline;margin:0}.options li.correct{border-color:var(--good);background:var(--good-soft)}.options strong{float:right;color:var(--good);font-size:12px}
  .answer{display:flex;gap:8px;align-items:center;margin-top:10px;color:var(--good);font-weight:700}.answer span{font-size:11px;padding:3px 7px;border:1px solid var(--good);border-radius:6px}
  .explanation{font-size:13px;color:var(--muted);margin-top:9px;padding:9px 12px;background:var(--panel);border-radius:9px}.explanation p{display:inline;margin:0}
  @media(max-width:900px){.layout{grid-template-columns:1fr}aside{display:none}main{padding:22px 16px 60px}.hero{padding:23px}.hero h1{font-size:25px}.lesson{padding:22px 18px}.chapter-header h2{font-size:20px}}
  @media print{aside{display:none}.layout{display:block}main{padding:0}.hero,.lesson{box-shadow:none;break-inside:avoid}.question{break-inside:avoid}}
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <div class="brand"><span class="flask">⚗</span><h1>${esc(course.title)}</h1></div>
      <div class="aside-meta">${course.modules.length} ជំពូក · ${lessons.length} មេរៀន</div>
      <nav><ul>${toc}</ul></nav>
    </aside>
    <main>
      <section class="hero">
        <span class="eyebrow">មើលមាតិកាជាមុន · HTML</span>
        <h1>⚗ ${esc(course.title)}</h1>
        <p>${esc(course.description)}</p>
        <div class="stats">
          <span class="stat">${course.modules.length} ជំពូក</span>
          <span class="stat">${lessons.length} មេរៀន</span>
          <span class="stat">${questionCount} សំណួរ</span>
          <span class="stat">${minutes} នាទីមេរៀន</span>
          <span class="stat">KaTeX equations</span>
        </div>
      </section>
      ${body}
    </main>
  </div>
</body>
</html>`

writeFileSync(OUT, html)
console.log(
  "Wrote",
  OUT,
  `(${(html.length / 1024).toFixed(0)} KB, ${course.modules.length} chapters, ${lessons.length} lessons, ${questionCount} questions)`
)
