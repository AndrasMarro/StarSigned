// Pure astrology math. No DOM, no locale: shared by build-time pages and browser scripts.

export const SIGNS = [
  { id: 'aries',       glyph: '♈', start: [3, 21],  end: [4, 19],  element: 'fire',  modality: 'cardinal', planet: 'mars',    house: 1,  stone: 'diamond',    day: 'tue', numbers: [1, 9],  match: ['leo', 'sagittarius', 'gemini'] },
  { id: 'taurus',      glyph: '♉', start: [4, 20],  end: [5, 20],  element: 'earth', modality: 'fixed',    planet: 'venus',   house: 2,  stone: 'emerald',    day: 'fri', numbers: [2, 6],  match: ['virgo', 'capricorn', 'cancer'] },
  { id: 'gemini',      glyph: '♊', start: [5, 21],  end: [6, 20],  element: 'air',   modality: 'mutable',  planet: 'mercury', house: 3,  stone: 'agate',      day: 'wed', numbers: [5, 7],  match: ['libra', 'aquarius', 'aries'] },
  { id: 'cancer',      glyph: '♋', start: [6, 21],  end: [7, 22],  element: 'water', modality: 'cardinal', planet: 'moon',    house: 4,  stone: 'pearl',      day: 'mon', numbers: [2, 7],  match: ['scorpio', 'pisces', 'taurus'] },
  { id: 'leo',         glyph: '♌', start: [7, 23],  end: [8, 22],  element: 'fire',  modality: 'fixed',    planet: 'sun',     house: 5,  stone: 'ruby',       day: 'sun', numbers: [1, 4],  match: ['aries', 'sagittarius', 'libra'] },
  { id: 'virgo',       glyph: '♍', start: [8, 23],  end: [9, 22],  element: 'earth', modality: 'mutable',  planet: 'mercury', house: 6,  stone: 'sapphire',   day: 'wed', numbers: [5, 14], match: ['taurus', 'capricorn', 'cancer'] },
  { id: 'libra',       glyph: '♎', start: [9, 23],  end: [10, 22], element: 'air',   modality: 'cardinal', planet: 'venus',   house: 7,  stone: 'opal',       day: 'fri', numbers: [6, 15], match: ['gemini', 'aquarius', 'leo'] },
  { id: 'scorpio',     glyph: '♏', start: [10, 23], end: [11, 21], element: 'water', modality: 'fixed',    planet: 'pluto',   house: 8,  stone: 'topaz',      day: 'tue', numbers: [8, 11], match: ['cancer', 'pisces', 'virgo'] },
  { id: 'sagittarius', glyph: '♐', start: [11, 22], end: [12, 21], element: 'fire',  modality: 'mutable',  planet: 'jupiter', house: 9,  stone: 'turquoise',  day: 'thu', numbers: [3, 9],  match: ['aries', 'leo', 'aquarius'] },
  { id: 'capricorn',   glyph: '♑', start: [12, 22], end: [1, 19],  element: 'earth', modality: 'cardinal', planet: 'saturn',  house: 10, stone: 'garnet',     day: 'sat', numbers: [4, 8],  match: ['taurus', 'virgo', 'scorpio'] },
  { id: 'aquarius',    glyph: '♒', start: [1, 20],  end: [2, 18],  element: 'air',   modality: 'fixed',    planet: 'uranus',  house: 11, stone: 'amethyst',   day: 'sat', numbers: [4, 7],  match: ['gemini', 'libra', 'sagittarius'] },
  { id: 'pisces',      glyph: '♓', start: [2, 19],  end: [3, 20],  element: 'water', modality: 'mutable',  planet: 'neptune', house: 12, stone: 'aquamarine', day: 'thu', numbers: [3, 7],  match: ['cancer', 'scorpio', 'capricorn'] },
];

// U+FE0E forces text (not emoji) rendering of the zodiac glyphs.
export const glyph = (s) => s.glyph + '︎';
export const byId = (id) => SIGNS.find((s) => s.id === id);
export const idx = (id) => SIGNS.findIndex((s) => s.id === id);
export const opposite = (id) => SIGNS[(idx(id) + 6) % 12];

const md = ([m, d]) => m * 100 + d;

/** Sun sign for a month (1-12) and day. */
export function signFor(month, day) {
  const v = month * 100 + day;
  // Latest sign start on or before the date; Capricorn wraps the year, so it is the fallback (Jan 1-19).
  return SIGNS.filter((s) => md(s.start) <= v).sort((a, b) => md(b.start) - md(a.start))[0] ?? byId('capricorn');
}

const DAY = 86400000;
const utc = (y, m, d) => Date.UTC(y, m - 1, d);

/** Personal details derived from an ISO birth date (YYYY-MM-DD). Returns null for invalid input. */
export function birthInfo(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return null;
  const [y, mo, d] = m.slice(1).map(Number);
  const t = utc(y, mo, d);
  const date = new Date(t);
  if (date.getUTCMonth() + 1 !== mo || date.getUTCDate() !== d) return null;

  const sign = signFor(mo, d);
  // Sign start in the same "zodiac year" (Capricorn born in January started the previous December).
  const startYear = sign.start[0] > mo ? y - 1 : y;
  const offset = Math.round((t - utc(startYear, ...sign.start)) / DAY);
  const decan = Math.min(3, Math.floor(offset / 10) + 1);
  // Triplicity decans: 2nd decan co-ruled by the next sign of the same element, 3rd by the one after.
  const coRuler = SIGNS[(idx(sign.id) + (decan - 1) * 4) % 12];

  const endYear = sign.end[0] < sign.start[0] ? startYear + 1 : startYear;
  const toEnd = Math.round((utc(endYear, ...sign.end) - t) / DAY);
  // Cusp as [earlier sign, later sign] when born within a day of a boundary.
  const cusp = offset <= 1 ? [SIGNS[(idx(sign.id) + 11) % 12], sign] : toEnd <= 1 ? [sign, SIGNS[(idx(sign.id) + 1) % 12]] : null;

  return { sign, decan, coRuler, cusp, lifePath: lifePath(iso), weekday: date.getUTCDay(), days: Math.floor((Date.now() - t) / DAY) };
}

/** Numerology life path number; master numbers 11, 22, 33 are kept. */
export function lifePath(iso) {
  let n = [...iso.replace(/\D/g, '')].reduce((a, c) => a + +c, 0);
  while (n > 9 && ![11, 22, 33].includes(n)) n = [...String(n)].reduce((a, c) => a + +c, 0);
  return n;
}

const SYNODIC = 29.530588853;
const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14); // known new moon
const rad = Math.PI / 180;

/** Moon phase (0..1, 0 = new), illumination, approximate tropical moon sign, next new/full moon. */
export function sky(when = new Date()) {
  const t = when.getTime();
  const age = ((((t - NEW_MOON_REF) / DAY) % SYNODIC) + SYNODIC) % SYNODIC;
  const phase = age / SYNODIC;
  const d = (t - Date.UTC(2000, 0, 1, 12)) / DAY; // days since J2000
  // ponytail: low-precision lunar longitude (~1-2 deg); wrong sign only within hours of an ingress.
  const L = 218.316 + 13.176396 * d;
  const M = (134.963 + 13.064993 * d) * rad;
  const lon = (((L + 6.289 * Math.sin(M)) % 360) + 360) % 360;
  const moonSign = SIGNS[Math.floor(lon / 30)];
  return {
    phase,
    phaseIndex: Math.round(phase * 8) % 8, // 0 new, 2 first quarter, 4 full, 6 last quarter
    illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2,
    moonSign,
    sunSign: signFor(when.getMonth() + 1, when.getDate()),
    nextNew: new Date(t + (SYNODIC - age) * DAY),
    nextFull: new Date(t + ((SYNODIC / 2 - age + SYNODIC) % SYNODIC) * DAY),
  };
}

/** Deterministic PRNG so every visitor sees the same reading for a given day and sign. */
export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), (h = (h << 13) | (h >>> 19));
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Local calendar date as YYYY-MM-DD. */
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
