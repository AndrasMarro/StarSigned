// HTML snippets for date-dependent content. Rendered at build time (no-JS fallback)
// and re-rendered in the browser with the visitor's local date.
import { SIGNS, byId, glyph, rng, sky, birthInfo } from './zodiac.js';
import { UI, TERMS, SIGN_TEXT, DAILY } from './content.js';

const pick = (r, list) => list[Math.floor(r() * list.length)];
const stars = (n) => '<span class="stars" aria-hidden="true">' + '●'.repeat(n) + '<i>' + '●'.repeat(5 - n) + '</i></span>';

/** Generated reading for one sign on one date (YYYY-MM-DD). */
export function reading(lang, signId, iso) {
  const r = rng(`${iso}:${signId}`);
  const d = DAILY[lang];
  const fill = (s) => s.replace('{p}', TERMS[lang][byId(signId).planet]).replace('{m}', SIGN_TEXT[lang][sky(new Date(iso + 'T12:00:00')).moonSign.id].name);
  return {
    text: [fill(pick(r, d.open)), pick(r, d.middle), pick(r, d.advice)].join(' '),
    love: 1 + Math.floor(r() * 5),
    career: 1 + Math.floor(r() * 5),
    wellbeing: 1 + Math.floor(r() * 5),
    number: 1 + Math.floor(r() * 99),
    color: pick(r, d.colors),
    mood: pick(r, d.moods),
  };
}

const fmtDate = (lang, date, opts = { day: 'numeric', month: 'long' }) => date.toLocaleDateString(UI[lang].locale, opts);

export function readingHTML(lang, signId, iso) {
  const t = UI[lang];
  const x = reading(lang, signId, iso);
  const date = fmtDate(lang, new Date(iso + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `<p class="eyebrow">${t.today} · ${date}</p>
<p class="reading-text">${x.text}</p>
<dl class="ratings">
  <div><dt>${t.love}</dt><dd>${stars(x.love)}</dd></div>
  <div><dt>${t.career}</dt><dd>${stars(x.career)}</dd></div>
  <div><dt>${t.wellbeing}</dt><dd>${stars(x.wellbeing)}</dd></div>
  <div><dt>${t.mood}</dt><dd>${x.mood}</dd></div>
  <div><dt>${t.luckyNumber}</dt><dd>${x.number}</dd></div>
  <div><dt>${t.luckyColor}</dt><dd>${x.color}</dd></div>
</dl>`;
}

/** Compact one-line readings for all twelve signs. */
export function dailyListHTML(lang, iso, base) {
  return SIGNS.map((s) => {
    const x = reading(lang, s.id, iso);
    return `<a class="daily-item" href="${base}${lang}/${s.id}/">
  <span class="glyph" aria-hidden="true">${glyph(s)}</span>
  <span><strong>${SIGN_TEXT[lang][s.id].name}</strong><span class="muted"> · ${x.mood}</span><br><span class="daily-text">${x.text}</span></span>
</a>`;
  }).join('');
}

export function skyHTML(lang, when) {
  const t = UI[lang];
  const s = sky(when);
  const name = (sign) => SIGN_TEXT[lang][sign.id].name;
  // Moon disc: a lit circle with a shadow ellipse offset by phase.
  const k = Math.cos(2 * Math.PI * s.phase); // 1 new, -1 full
  const waxing = s.phase < 0.5;
  const moon = `<svg class="moon" viewBox="-50 -50 100 100" aria-hidden="true">
  <circle r="48" class="moon-dark"/>
  <path class="moon-lit" d="M0,-48 A48,48 0 0 ${waxing ? 1 : 0} 0,48 A${Math.abs(48 * k)},48 0 0 ${(k > 0) === waxing ? 0 : 1} 0,-48Z"/>
</svg>`;
  return `${moon}
<dl class="sky-facts">
  <div><dt>${t.moonPhase}</dt><dd>${t.phases[s.phaseIndex]} <span class="muted">· ${Math.round(s.illumination * 100)}% ${t.illuminated}</span></dd></div>
  <div><dt>${t.moonIn}</dt><dd>${glyph(s.moonSign)} ${name(s.moonSign)}</dd></div>
  <div><dt>${t.sunIn}</dt><dd>${glyph(s.sunSign)} ${name(s.sunSign)}</dd></div>
  <div><dt>${t.nextFull}</dt><dd>${fmtDate(lang, s.nextFull)}</dd></div>
  <div><dt>${t.nextNew}</dt><dd>${fmtDate(lang, s.nextNew)}</dd></div>
</dl>`;
}

/** Personal panel for a birth date; empty string if the date is invalid. */
export function birthHTML(lang, iso) {
  const b = birthInfo(iso);
  if (!b) return '';
  const t = UI[lang];
  const name = (s) => SIGN_TEXT[lang][s.id].name;
  const date = fmtDate(lang, new Date(iso + 'T12:00:00'), { day: 'numeric', month: 'long', year: 'numeric' });
  return `<p class="eyebrow">${t.yourChart} · ${date}</p>
<dl class="ratings">
  <div><dt>${t.decan(b.decan)}</dt><dd>${t.coRuled(name(b.coRuler))}</dd></div>
  <div><dt>${t.lifePath}</dt><dd>${b.lifePath}</dd></div>
  <div><dt>${t.bornOn}</dt><dd>${TERMS[lang].days[b.weekday]}</dd></div>
  ${b.days > 0 ? `<div><dt>&nbsp;</dt><dd>${t.daysOld(b.days)}</dd></div>` : ''}
</dl>
${b.cusp ? `<p class="cusp">${t.cusp(...b.cusp.map(name))}</p>` : ''}`;
}
