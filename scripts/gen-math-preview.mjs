// Reusable offline preview generator for the Khmer math courses.
// Usage (run from apsara-elearning-web so node_modules resolve):
//   node scripts/gen-math-preview.mjs basic
//   node scripts/gen-math-preview.mjs advanced
// Renders lesson bodies + quizzes through the SAME remark/KaTeX pipeline the app
// uses, and renders ```graph blocks to inline SVG. Output is a self-contained
// HTML file (fonts inlined) written to resources/Math Grade 12/. Dev tool only.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const which = (process.argv[2] || 'basic').toLowerCase();
const CONF = {
  basic: { file: 'math-grade-12-basic.mjs', exp: 'MATH_GRADE_12_BASIC', out: 'basic-math-preview.html', brand: ['#2563eb', '#eff4ff', '#6ea8ff', '#16243d'] },
  advanced: { file: 'math-grade-12-advanced.mjs', exp: 'MATH_GRADE_12_ADVANCED', out: 'advance-math-preview.html', brand: ['#7c3aed', '#f3eeff', '#a78bfa', '#241a3d'] },
}[which];
if (!CONF) { console.error('Usage: node scripts/gen-math-preview.mjs [basic|advanced]'); process.exit(1); }

const API = path.resolve(process.cwd(), '../apsara-elearning-api');
const OUT = path.resolve(process.cwd(), '../resources/Math Grade 12', CONF.out);
const mod = await import(path.join(API, 'scripts/content', CONF.file));
const course = mod[CONF.exp];

const mdInline = (t) => unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify).processSync(t ?? '').toString();
const PAL = { violet: '#8b5cf6', purple: '#8b5cf6', cyan: '#06b6d4', rose: '#f43f5e', red: '#f43f5e', amber: '#f59e0b', orange: '#f59e0b', emerald: '#10b981', green: '#10b981', blue: '#3b82f6', slate: '#64748b' };
const col = (n) => PAL[n] || PAL.violet;
const compile = (fn) => new Function('x', `with(Math){return (${fn.replace(/\^/g, '**')});}`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function plot(spec) {
  const W = 680, H = 440, P = { l: 46, r: 22, t: 16, b: 36 }; const [xmin, xmax] = spec.xRange, [ymin, ymax] = spec.yRange;
  const px = (x) => P.l + ((x - xmin) / (xmax - xmin)) * (W - P.l - P.r); const py = (y) => P.t + ((ymax - y) / (ymax - ymin)) * (H - P.t - P.b); const o = [];
  for (let x = Math.ceil(xmin); x <= xmax; x++) o.push(`<line x1="${px(x).toFixed(1)}" y1="${P.t}" x2="${px(x).toFixed(1)}" y2="${H - P.b}" stroke="var(--line)"/>`);
  for (let y = Math.ceil(ymin); y <= ymax; y++) o.push(`<line x1="${P.l}" y1="${py(y).toFixed(1)}" x2="${W - P.r}" y2="${py(y).toFixed(1)}" stroke="var(--line)"/>`);
  if (xmin <= 0 && xmax >= 0) o.push(`<line x1="${px(0).toFixed(1)}" y1="${P.t}" x2="${px(0).toFixed(1)}" y2="${H - P.b}" stroke="var(--muted)" stroke-width="1.5"/>`);
  if (ymin <= 0 && ymax >= 0) o.push(`<line x1="${P.l}" y1="${py(0).toFixed(1)}" x2="${W - P.r}" y2="${py(0).toFixed(1)}" stroke="var(--muted)" stroke-width="1.5"/>`);
  (spec.vAsymptotes ?? []).forEach((a) => o.push(`<line x1="${px(a.x).toFixed(1)}" y1="${P.t}" x2="${px(a.x).toFixed(1)}" y2="${H - P.b}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="6 4"/>`));
  (spec.hAsymptotes ?? []).forEach((a) => o.push(`<line x1="${P.l}" y1="${py(a.y).toFixed(1)}" x2="${W - P.r}" y2="${py(a.y).toFixed(1)}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="6 4"/>`));
  const bnd = ymax + (ymax - ymin), lb = ymin - (ymax - ymin);
  (spec.areas ?? []).forEach((ar) => { const g = compile(ar.fn); let d = `M${px(ar.from).toFixed(2)} ${py(0).toFixed(2)} `; for (let i = 0; i <= 200; i++) { const x = ar.from + (ar.to - ar.from) * i / 200; let y; try { y = g(x); } catch { y = 0; } if (!Number.isFinite(y)) y = 0; d += `L${px(x).toFixed(2)} ${py(y).toFixed(2)} `; } d += `L${px(ar.to).toFixed(2)} ${py(0).toFixed(2)} Z`; o.push(`<path d="${d}" fill="${col(ar.color)}" fill-opacity="0.25"/>`); });
  (spec.functions ?? []).forEach((f) => { const g = compile(f.fn); let d = '', pen = false; for (let i = 0; i <= 500; i++) { const x = xmin + (xmax - xmin) * i / 500; let y; try { y = g(x); } catch { y = NaN; } if (Number.isFinite(y) && y < bnd && y > lb) { d += `${pen ? 'L' : 'M'}${px(x).toFixed(2)} ${py(y).toFixed(2)} `; pen = true; } else pen = false; } o.push(`<path d="${d}" fill="none" stroke="${col(f.color)}" stroke-width="2.4" stroke-dasharray="${f.dashed ? '6 4' : ''}"/>`); });
  (spec.segments ?? []).forEach((s) => { o.push(`<line x1="${px(s.from[0]).toFixed(1)}" y1="${py(s.from[1]).toFixed(1)}" x2="${px(s.to[0]).toFixed(1)}" y2="${py(s.to[1]).toFixed(1)}" stroke="${col(s.color)}" stroke-width="2" stroke-dasharray="${s.dashed ? '6 4' : ''}"/>`); if (s.label) o.push(`<text x="${(px((s.from[0] + s.to[0]) / 2) + 6).toFixed(1)}" y="${(py((s.from[1] + s.to[1]) / 2) - 4).toFixed(1)}" fill="${col(s.color)}" font-size="12">${esc(s.label)}</text>`); });
  (spec.points ?? []).forEach((p) => { const cx = px(p.x), cy = py(p.y); o.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.2" fill="${p.open ? 'var(--panel)' : col(p.color)}" stroke="${col(p.color)}" stroke-width="2"/>`); if (p.label) o.push(`<text x="${(cx + 7).toFixed(1)}" y="${(cy - 7).toFixed(1)}" fill="var(--ink)" font-size="12">${esc(p.label)}</text>`); });
  if (spec.xLabel) o.push(`<text x="${W - P.r}" y="${H - P.b + 24}" fill="var(--muted)" font-size="12" text-anchor="end">${esc(spec.xLabel)}</text>`);
  if (spec.yLabel) o.push(`<text x="${P.l - 8}" y="${P.t + 4}" fill="var(--muted)" font-size="12" text-anchor="end">${esc(spec.yLabel)}</text>`);
  const lg = (spec.functions ?? []).filter((f) => f.label).map((f) => `<span class="lg"><span class="sw" style="background:${col(f.color)}"></span>${esc(f.label)}</span>`).join('');
  return `<figure class="graph"><svg viewBox="0 0 ${W} ${H}">${o.join('')}</svg>${lg ? `<div class="legend">${lg}</div>` : ''}${spec.caption ? `<figcaption>${esc(spec.caption)}</figcaption>` : ''}</figure>`;
}
function render(text) { const re = /```graph\s*([\s\S]*?)```/g; let out = '', last = 0, m; while ((m = re.exec(text))) { out += mdInline(text.slice(last, m.index)); try { out += plot(JSON.parse(m[1].trim())); } catch (e) { out += `<pre>graph err: ${esc(e.message)}</pre>`; } last = m.index + m[0].length; } out += mdInline(text.slice(last)); return out; }
const webRequire = createRequire(path.join(process.cwd(), 'package.json'));
const kp = webRequire.resolve('katex/dist/katex.min.css'); const fd = path.join(path.dirname(kp), 'fonts');
let css = readFileSync(kp, 'utf8').replace(/,url\(fonts\/[^)]+\.woff\) format\("woff"\)/g, '').replace(/,url\(fonts\/[^)]+\.ttf\) format\("truetype"\)/g, '').replace(/url\(fonts\/([^)]+\.woff2)\)/g, (_m, f) => `url(data:font/woff2;base64,${readFileSync(path.join(fd, f)).toString('base64')})`);
let toc = '', body = '', no = 0;
course.modules.forEach((m0) => {
  toc += `<li class="toc-mod">${esc(m0.title)}<ul>`; body += `<section class="chapter"><h2 class="chapter-title">${esc(m0.title)}</h2><p class="chapter-desc">${mdInline(m0.description)}</p>`;
  m0.lessons.forEach((l) => { no++; toc += `<li><a href="#${l.slug}">${esc(l.title)}</a></li>`; body += `<article class="lesson" id="${l.slug}"><h3 class="lesson-title"><span class="lesson-no">${no}</span>${esc(l.title)} <span class="mins">${l.minutes} នាទី</span></h3><div class="lesson-body">${render(l.content)}</div>`;
    if (l.quiz) { body += `<div class="quiz"><h4>📝 ${esc(l.quiz.title)}</h4>`; if (l.quiz.description) body += `<p class="quiz-desc">${esc(l.quiz.description)}</p>`; l.quiz.questions.forEach((q, qi) => { body += `<div class="q"><div class="q-prompt"><b>សំណួរ ${qi + 1}.</b> ${mdInline(q.question)}</div>`; if (q.type === 'multiple_choice' && q.options) { body += '<ul class="opts">'; q.options.forEach(([a, c]) => { body += `<li class="${c ? 'correct' : ''}">${mdInline(a)}${c ? ' <span class="tag">✓ ត្រូវ</span>' : ''}</li>`; }); body += '</ul>'; } else if (q.type === 'true_false') body += `<div class="ans">ចម្លើយ៖ <b>${q.correctAnswer.value ? 'ពិត' : 'មិនពិត'}</b></div>`; else if (q.type === 'numeric') body += `<div class="ans">ចម្លើយ៖ <b>${q.correctAnswer.value}</b></div>`; if (q.explanation) body += `<div class="expl"><b>ពន្យល់៖</b> ${mdInline(q.explanation)}</div>`; body += '</div>'; }); body += '</div>'; }
    body += '</article>'; });
  toc += '</ul></li>'; body += '</section>';
});
const total = course.modules.reduce((a, m) => a + m.lessons.length, 0), totalQ = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + (l.quiz?.questions.length ?? 0), 0), 0), totalG = course.modules.reduce((a, m) => a + m.lessons.filter((l) => l.content.includes('```graph')).length, 0);
const [b1, b2, b3, b4] = CONF.brand;
const html = `<!doctype html><html lang="km"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(course.title)} — មើលជាមុន</title><style>${css}
:root{--bg:#f7f8fa;--panel:#fff;--ink:#1a1d24;--muted:#5b6472;--line:#e5e8ee;--brand:${b1};--brand-soft:${b2};--good:#0a7d3c;--good-soft:#eafaf0;--code:#f2f4f8}
@media(prefers-color-scheme:dark){:root{--bg:#0f1216;--panel:#161a20;--ink:#e8ebf0;--muted:#9aa4b2;--line:#262c35;--brand:${b3};--brand-soft:${b4};--good:#5cd08a;--good-soft:#12261a;--code:#1c222b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Noto Sans Khmer","Khmer OS Siemreap","Hanuman",-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.85;font-size:16px}
.katex{font-size:1.05em}.wrap{display:grid;grid-template-columns:288px 1fr;max-width:1200px;margin:0 auto}
aside{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;padding:24px 18px;border-right:1px solid var(--line);background:var(--panel)}
aside h1{font-size:17px;margin:0 0 4px}aside .sub{color:var(--muted);font-size:13px;margin-bottom:18px}aside ul{list-style:none;margin:0;padding:0}
.toc-mod{font-weight:700;margin:14px 0 4px;font-size:13.5px;color:var(--brand)}.toc-mod ul{font-weight:400;margin:4px 0 0}.toc-mod a{display:block;color:var(--muted);text-decoration:none;font-size:13px;padding:3px 0 3px 12px;border-left:2px solid transparent}.toc-mod a:hover{color:var(--ink);border-left-color:var(--brand)}
main{padding:32px 40px;min-width:0}.hero{background:linear-gradient(135deg,var(--brand-soft),transparent);border:1px solid var(--line);border-radius:16px;padding:24px 28px;margin-bottom:28px}.hero h1{margin:0 0 8px;font-size:26px}.hero p{margin:0;color:var(--muted)}
.pills{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}.pill{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:12.5px;color:var(--muted)}
.chapter{margin:40px 0}.chapter-title{font-size:21px;border-bottom:2px solid var(--brand);padding-bottom:8px;color:var(--brand)}.chapter-desc{color:var(--muted);font-size:14.5px}
.lesson{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px 26px;margin:18px 0;scroll-margin-top:16px}.lesson-title{display:flex;align-items:center;gap:10px;font-size:18px;margin:0 0 14px}.lesson-no{background:var(--brand);color:#fff;width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:0 0 auto}.mins{margin-left:auto;font-size:12px;color:var(--muted);font-weight:400}
.lesson-body h2{font-size:19px;margin:18px 0 8px}.lesson-body h3{font-size:16px;margin:16px 0 6px;color:var(--brand)}.lesson-body ul{padding-left:22px}.lesson-body table{border-collapse:collapse;margin:12px 0;font-size:14px;display:block;overflow-x:auto}.lesson-body th,.lesson-body td{border:1px solid var(--line);padding:6px 12px;text-align:center}.lesson-body th{background:var(--brand-soft)}
.katex-display{overflow-x:auto;overflow-y:hidden;padding:6px 0;margin:.8em 0;background:var(--code);border-radius:8px}
figure.graph{margin:16px 0;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px}figure.graph svg{width:100%;height:auto;display:block}figure.graph .legend{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:6px;font-size:12.5px;color:var(--muted)}figure.graph .lg{display:inline-flex;align-items:center;gap:6px}figure.graph .sw{width:16px;height:3px;border-radius:2px;display:inline-block}figure.graph figcaption{margin-top:8px;text-align:center;font-size:12.5px;color:var(--muted)}
.quiz{margin-top:20px;border-top:1px dashed var(--line);padding-top:16px}.quiz h4{margin:0 0 4px;font-size:15px}.quiz-desc{color:var(--muted);font-size:13px;margin:0 0 12px}.q{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:10px 0}.opts{list-style:none;padding:0;margin:8px 0 0}.opts li{padding:6px 12px;border:1px solid var(--line);border-radius:8px;margin:5px 0;background:var(--panel)}.opts li.correct{border-color:var(--good);background:var(--good-soft)}.tag{color:var(--good);font-size:12px;font-weight:700;float:right}.ans{margin-top:8px;color:var(--good);font-size:14px}.expl{margin-top:8px;font-size:13.5px;color:var(--muted);background:var(--panel);border-radius:8px;padding:8px 12px}
@media(max-width:860px){.wrap{grid-template-columns:1fr}aside{display:none}main{padding:20px}}</style></head><body><div class="wrap">
<aside><h1>មាតិកា</h1><div class="sub">${course.modules.length} ជំពូក · ${total} មេរៀន</div><ul>${toc}</ul></aside>
<main><div class="hero"><h1>${esc(course.title)}</h1><p>${esc(course.description)}</p><div class="pills"><span class="pill">slug: ${course.slug}</span><span class="pill">${course.modules.length} ជំពូក</span><span class="pill">${total} មេរៀន</span><span class="pill">${totalQ} សំណួរ</span><span class="pill">${totalG} ក្រាប</span></div></div>${body}</main></div></body></html>`;
writeFileSync(OUT, html);
console.log('Wrote', OUT, `(${(html.length / 1024).toFixed(0)} KB, ${course.modules.length} chapters, ${total} lessons, ${totalQ} Q, ${totalG} graphs)`);
