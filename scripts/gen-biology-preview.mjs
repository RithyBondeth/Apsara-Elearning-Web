// Offline preview generator for Grade 12 Biology.
// Usage (from apsara-elearning-web): node scripts/gen-biology-preview.mjs
// Renders lesson bodies + quizzes through remark (markdown + tables), and
// inlines ```diagram SVG blocks directly. Self-contained HTML, leaf-green theme.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const API = path.resolve(process.cwd(), '../apsara-elearning-api');
const OUT = path.resolve(process.cwd(), '../resources/Biology Grade 12/biology-preview.html');
const mod = await import(path.join(API, 'scripts/content/biology-grade-12.mjs'));
const course = mod.BIOLOGY_GRADE_12;

const md = (t) => unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).processSync(t ?? '').toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Render markdown that may contain ```diagram (raw SVG) blocks.
function render(text) {
  const re = /```diagram\s*([\s\S]*?)```/g;
  let out = '', last = 0, m;
  while ((m = re.exec(text))) {
    out += md(text.slice(last, m.index));
    out += `<figure class="diagram">${m[1].trim()}</figure>`;
    last = m.index + m[0].length;
  }
  out += md(text.slice(last));
  return out;
}

let toc = '', body = '', no = 0;
course.modules.forEach((m0) => {
  toc += `<li class="toc-mod">${esc(m0.title)}<ul>`;
  body += `<section class="chapter"><h2 class="chapter-title">${esc(m0.title)}</h2><p class="chapter-desc">${md(m0.description)}</p>`;
  m0.lessons.forEach((l) => {
    no++;
    toc += `<li><a href="#${l.slug}">${esc(l.title)}</a></li>`;
    body += `<article class="lesson" id="${l.slug}"><h3 class="lesson-title"><span class="lesson-no">${no}</span>${esc(l.title)} <span class="mins">${l.minutes} នាទី</span></h3><div class="lesson-body">${render(l.content)}</div>`;
    if (l.quiz) {
      body += `<div class="quiz"><h4>📝 ${esc(l.quiz.title)}</h4>`;
      if (l.quiz.description) body += `<p class="quiz-desc">${esc(l.quiz.description)}</p>`;
      l.quiz.questions.forEach((q, qi) => {
        body += `<div class="q"><div class="q-prompt"><b>សំណួរ ${qi + 1}.</b> ${md(q.question)}</div>`;
        if (q.type === 'multiple_choice' && q.options) {
          body += '<ul class="opts">';
          q.options.forEach(([a, c]) => { body += `<li class="${c ? 'correct' : ''}">${md(a)}${c ? ' <span class="tag">✓ ត្រូវ</span>' : ''}</li>`; });
          body += '</ul>';
        } else if (q.type === 'true_false') body += `<div class="ans">ចម្លើយ៖ <b>${q.correctAnswer.value ? 'ពិត' : 'មិនពិត'}</b></div>`;
        else if (q.type === 'fill_blank') body += `<div class="ans">ចម្លើយ៖ <b>${esc((q.correctAnswer.accepted || [])[0] || '')}</b></div>`;
        if (q.explanation) body += `<div class="expl"><b>ពន្យល់៖</b> ${md(q.explanation)}</div>`;
        body += '</div>';
      });
      body += '</div>';
    }
    body += '</article>';
  });
  toc += '</ul></li>';
  body += '</section>';
});
const total = course.modules.reduce((a, m) => a + m.lessons.length, 0);
const totalQ = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + (l.quiz?.questions.length ?? 0), 0), 0);
const totalD = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + (l.content.match(/```diagram/g)?.length ?? 0), 0), 0);

const html = `<!doctype html><html lang="km"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(course.title)} — មើលជាមុន</title><style>
:root{--bg:#f6f9f4;--panel:#fff;--ink:#1a241c;--muted:#586b58;--line:#e0ebe0;--brand:#2f8f4e;--brand-soft:#e8f6ea;--good:#0a7d3c;--good-soft:#eafaf0}
@media(prefers-color-scheme:dark){:root{--bg:#0f1512;--panel:#161d18;--ink:#e6efe7;--muted:#9ab0a0;--line:#26332a;--brand:#5cc47e;--brand-soft:#16281c;--good:#5cd08a;--good-soft:#12261a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Noto Sans Khmer","Khmer OS Siemreap","Hanuman",-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.9;font-size:16px}
.wrap{display:grid;grid-template-columns:288px 1fr;max-width:1200px;margin:0 auto}
aside{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;padding:24px 18px;border-right:1px solid var(--line);background:var(--panel)}
aside h1{font-size:17px;margin:0 0 4px}aside .sub{color:var(--muted);font-size:13px;margin-bottom:18px}aside ul{list-style:none;margin:0;padding:0}
.toc-mod{font-weight:700;margin:14px 0 4px;font-size:13.5px;color:var(--brand)}.toc-mod ul{font-weight:400;margin:4px 0 0}.toc-mod a{display:block;color:var(--muted);text-decoration:none;font-size:13px;padding:3px 0 3px 12px;border-left:2px solid transparent}.toc-mod a:hover{color:var(--ink);border-left-color:var(--brand)}
main{padding:32px 40px;min-width:0}.hero{background:linear-gradient(135deg,var(--brand-soft),transparent);border:1px solid var(--line);border-radius:16px;padding:24px 28px;margin-bottom:28px}.hero h1{margin:0 0 8px;font-size:26px}.hero p{margin:0;color:var(--muted)}
.pills{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}.pill{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:12.5px;color:var(--muted)}
.chapter{margin:40px 0}.chapter-title{font-size:21px;border-bottom:2px solid var(--brand);padding-bottom:8px;color:var(--brand)}.chapter-desc{color:var(--muted);font-size:14.5px}
.lesson{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px 26px;margin:18px 0;scroll-margin-top:16px}.lesson-title{display:flex;align-items:center;gap:10px;font-size:18px;margin:0 0 14px}.lesson-no{background:var(--brand);color:#fff;width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:0 0 auto}.mins{margin-left:auto;font-size:12px;color:var(--muted);font-weight:400}
.lesson-body h2{font-size:19px;margin:18px 0 8px}.lesson-body h3{font-size:16px;margin:16px 0 6px;color:var(--brand)}.lesson-body ul{padding-left:22px}.lesson-body table{border-collapse:collapse;margin:12px 0;font-size:14px;display:block;overflow-x:auto}.lesson-body th,.lesson-body td{border:1px solid var(--line);padding:6px 12px;text-align:left}.lesson-body th{background:var(--brand-soft)}
figure.diagram{margin:16px 0;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center}figure.diagram svg{max-width:100%;height:auto}
.quiz{margin-top:20px;border-top:1px dashed var(--line);padding-top:16px}.quiz h4{margin:0 0 4px;font-size:15px}.quiz-desc{color:var(--muted);font-size:13px;margin:0 0 12px}.q{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:10px 0}.opts{list-style:none;padding:0;margin:8px 0 0}.opts li{padding:6px 12px;border:1px solid var(--line);border-radius:8px;margin:5px 0;background:var(--panel)}.opts li.correct{border-color:var(--good);background:var(--good-soft)}.tag{color:var(--good);font-size:12px;font-weight:700;float:right}.ans{margin-top:8px;color:var(--good);font-size:14px}.expl{margin-top:8px;font-size:13.5px;color:var(--muted);background:var(--panel);border-radius:8px;padding:8px 12px}
@media(max-width:860px){.wrap{grid-template-columns:1fr}aside{display:none}main{padding:20px}}</style></head><body><div class="wrap">
<aside><h1>មាតិកា</h1><div class="sub">${course.modules.length} ជំពូក · ${total} មេរៀន</div><ul>${toc}</ul></aside>
<main><div class="hero"><h1>🌿 ${esc(course.title)}</h1><p>${esc(course.description)}</p><div class="pills"><span class="pill">slug: ${course.slug}</span><span class="pill">${course.modules.length} ជំពូក</span><span class="pill">${total} មេរៀន</span><span class="pill">${totalQ} សំណួរ</span><span class="pill">${totalD} រូបភាព</span></div></div>${body}</main></div></body></html>`;
writeFileSync(OUT, html);
console.log('Wrote', OUT, `(${(html.length / 1024).toFixed(0)} KB, ${course.modules.length} ch, ${total} lessons, ${totalQ} Q, ${totalD} diagrams)`);
