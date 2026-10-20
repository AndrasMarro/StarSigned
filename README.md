# StarSigned

**Your zodiac sign, decoded from your birthday.** A fast, bilingual (English / Deutsch) astrology site with sign profiles, personal birthday insights and fresh readings every day.

**Live:** https://andrasmarro.github.io/StarSigned/

---

## Features

- **Birthday finder.** Enter a date and get your sun sign, decan (with co-ruling sign), cusp detection, numerology life path number and the weekday you were born.
- **Interactive zodiac wheel.** A round overview of all twelve signs that slowly rotates, spins when dragged (with momentum), pauses on hover and filters by element. On touch screens the first tap previews a sign, the second opens it. Each element has its own colour.
- **12 in-depth sign profiles.** Element, modality, ruling planet, house, gemstone, lucky day and numbers, body area, opposite sign, strengths, weaknesses, love, career and best matches. A "closer look" section explains what the element, quality, ruling planet, house, body area and polarity actually mean for the sign.
- **Nice to know.** Every sign page has its mythology, its constellation in the night sky and a fun fact. Birthday results also show the sidereal (Vedic) sign and the constellation the Sun was actually in, including Ophiuchus.
- **Learn page.** History of the zodiac from Babylon to newspaper horoscopes, how sun signs are calculated, why signs are not constellations (precession) and exactly how this site computes everything.
- **The sky today.** Live moon phase with illumination, the sign the Moon and Sun are in, plus the next full and new moon.
- **Daily horoscopes.** A new reading for every sign each day, with love / career / wellbeing ratings, mood, lucky number and colour. Every visitor sees the same reading for the same day.
- **Motion.** Staggered spring-eased scroll reveals, and native cross-page View Transitions: the sign glyph morphs from the grid into the sign page. All motion respects `prefers-reduced-motion`.
- **English and German.** Every page exists in both languages, with `hreflang` links and automatic language detection on the start page.
- **Accessible and calm.** Semantic HTML, keyboard friendly, 44px touch targets, works without JavaScript (except the finder) and respects `prefers-reduced-motion`.

## Why Astro

The site is built with [Astro](https://astro.build), the best fit for a content site on GitHub Pages:

| | |
|---|---|
| **Static HTML** | All 31 pages are pre-rendered at build time. No server, no framework runtime. |
| **Tiny JavaScript** | Only the date-dependent parts (finder, today's sky, daily readings) run in the browser, about 12 KB gzipped. React/Vue/Angular/Blazor would ship a whole runtime for the same result. |
| **Self-hosted fonts** | Instrument Serif and Geist are bundled via Fontsource. No third-party requests. |
| **Zero-cost hosting** | Plain files, deployed to GitHub Pages by a GitHub Action. |

Daily content is computed in the browser from the visitor's local date, so it stays current without nightly rebuilds. The pages also contain a build-time version as a no-JS fallback.

## Project structure

```
src/
  lib/
    zodiac.js     astrology math: sign lookup, decans, cusps, life path, moon phase, seeded PRNG
    content.js    English and German UI copy, sign profiles, explanations
    lore.js       mythology, astronomy facts, history and the learn page copy
    render.js     HTML for date-dependent blocks (used at build time and in the browser)
  layouts/Base.astro       document shell, nav, language switch, SEO tags
  pages/index.astro        redirects to /en/ or /de/ based on browser language
  pages/[lang]/index.astro home: hero, sky today, daily horoscopes, sign grid
  pages/[lang]/[sign].astro sign profile with personal, daily and closer-look panels
  pages/[lang]/wheel.astro  rotating, draggable zodiac wheel and element overview
  pages/[lang]/learn.astro  history, calculation and quick facts
  styles/global.css
test/zodiac.test.js        node:test checks for the calculations
```

## Development

Requires Node.js 22.22 or newer.

```bash
npm install
npm run dev       # http://localhost:4321/StarSigned/
npm test          # calculation tests
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

### Adding a language

1. Add the code to `LANGS` in `src/lib/content.js`.
2. Add a matching entry to `UI`, `TERMS`, `SIGN_TEXT`, `DAILY` and `INFO`, plus `SIGN_LORE` and `LEARN` in `src/lib/lore.js`.

Pages for the new language are generated automatically.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: tests, build, then publish `dist/` to the `gh-pages` branch.
In the repository settings, **Pages → Build and deployment → Source** must be set to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.

## Accuracy notes

- Sign dates use the common tropical ranges; the exact Sun ingress shifts by a day in some years, which is why the site flags cusp birthdays.
- The Moon's sign uses a low-precision formula (about 1 to 2 degrees), so it can be off within hours of a sign change.
- The sidereal sign uses a fixed 24-day shift (Lahiri ayanamsa), so it can differ near a boundary.
- Daily readings are generated from text fragments with a date-seeded random generator. They are for entertainment, not prediction.

## License

[MIT](LICENSE)
