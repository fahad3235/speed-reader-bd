# Speed Reader BD

A free, fully offline bilingual (Bangla / English) RSVP speed-reading trainer. Words flash
one at a time in a fixed spot with the optimal-recognition letter highlighted, so your eyes
stay still while your reading pace climbs.

Live demo: https://fahad3235.github.io/speed-reader-bd/

## Problem

Most readers re-read lines and subvocalize, which caps pace around 200-250 words per minute.
RSVP (rapid serial visual presentation) removes eye movement from the equation, letting you
train pace deliberately while a built-in quiz keeps comprehension honest.

## Features

1. **RSVP player** - word-by-word flashing with ORP (optimal recognition point) pivot-letter
   highlight, 100-1000 WPM slider with presets (200/300/450/650), 1-3 words per chunk.
2. **Text input + sample library** - paste your own article/story/notes, or use 2 English and
   2 Bangla built-in samples; live word/character/sentence counts and estimated session time.
3. **Comprehension quiz** - auto-generated from your own text: "which word appeared?" items
   plus a word-count question, scored with per-question feedback.
4. **Session history** - finished readings logged in localStorage (words, WPM, duration,
   quiz score), up to 30 entries, clearable.
5. **Bilingual UI** - full English/Bangla toggle (persisted), Bengali digit rendering in
   Bangla mode, 390px mobile layout.
6. **Keyboard control** - Space = play/pause, R = restart, arrow keys = step word.

## Stack

- Vanilla HTML + CSS + JavaScript, no build step, no dependencies, no network requests.
- `logic.js` holds all pure logic (tokenizer, ORP, chunking, timing, quiz generator) and is
  unit-tested in Node; `app.js` wires the DOM.

## Prerequisites

- Any modern browser (Chrome, Edge, Firefox, Safari).
- Node.js 18+ only needed to run the tests.

## Install / run

```bash
# no install needed - open the file directly, or serve it:
npx serve .
# then open http://localhost:3000
```

## Dev commands

```bash
node tests/run-tests.mjs   # 48 unit assertions on logic.js
node tests/smoke.mjs       # 23 headless-Chrome checks over file:// (needs /opt/meta-chromium/chrome + global ws)
```

## Env

None. No keys, no config, no backend. All state lives in `localStorage` (`srb-lang`, `srb-history`);
your pasted text is never stored.

## Testing

- `tests/run-tests.mjs`: 48 assertions covering word splitting, ORP index boundaries,
  chunking, per-chunk timing, session duration, time formatting, Bengali digits, quiz
  generation (seeded RNG: 4 options, unique, answer from passage), and quiz scoring.
- `tests/smoke.mjs`: raw-CDP headless-Chrome run over `file://` - page load with zero
  console/page errors, empty-state (play disabled, notice visible), sample load, play/pause/
  restart, progress + elapsed ticking, quiz generation + scoring, Bangla toggle + reload
  persistence, 390px no-overflow, Space-key play toggle.

## Deployment

Static site. GitHub Pages serves `index.html` from the repo root (`main` branch).

## Limitations

- RSVP trains pace; comprehension varies by person and text - the quiz is a rough check,
  not a measurement.
- Distractor words in the quiz are English-only; Bangla passages still get valid
  "which word appeared?" items drawn from the passage itself.
- Timing uses `setTimeout`; on very busy devices the real pace may drift a few percent.
- Demo learning tool, not a certified reading program.

## Status

Published and verified: unit tests 48/48, smoke tests 23/23, zero console errors,
Pages live (HTTP 200).
