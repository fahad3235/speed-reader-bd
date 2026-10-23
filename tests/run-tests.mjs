// Unit tests for logic.js — run with: node tests/run-tests.mjs
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../logic.js');

let n = 0;
const ok = (cond, msg) => { n++; assert.ok(cond, msg); };

// splitWords
assert.deepStrictEqual(L.splitWords('  hello   world\n\nfoo '), ['hello', 'world', 'foo']); n++;
assert.deepStrictEqual(L.splitWords(''), []); n++;
assert.deepStrictEqual(L.splitWords(null), []); n++;

// orpIndex boundaries
ok(L.orpIndex('a') === 0, 'orp 1-char');
ok(L.orpIndex('ab') === 1, 'orp 2-char');
ok(L.orpIndex('abcde') === 1, 'orp 5-char');
ok(L.orpIndex('abcdef') === 2, 'orp 6-char');
ok(L.orpIndex('abcdefghi') === 2, 'orp 9-char');
ok(L.orpIndex('abcdefghij') === 3, 'orp 10-char');
ok(L.orpIndex('abcdefghijklm') === 3, 'orp 13-char');
ok(L.orpIndex('a'.repeat(14)) === 4, 'orp 14-char');

// orpParts
assert.deepStrictEqual(L.orpParts('hello'), { left: 'h', pivot: 'e', right: 'llo' }); n++;
assert.deepStrictEqual(L.orpParts('a'), { left: '', pivot: 'a', right: '' }); n++;

// chunkWords
assert.deepStrictEqual(L.chunkWords([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]); n++;
assert.deepStrictEqual(L.chunkWords([1, 2], 5), [[1, 2]]); n++;
assert.deepStrictEqual(L.chunkWords([], 2), []); n++;

// msPerChunk / sessionMs
ok(L.msPerChunk(300, 1) === 200, '300wpm 1-word = 200ms');
ok(L.msPerChunk(600, 2) === 200, '600wpm 2-word = 200ms');
ok(L.sessionMs(600, 300, 1) === 120000, '600 words @300wpm = 2min');
ok(L.sessionMs(0, 300, 1) === 0, '0 words = 0ms');

// formatTime
ok(L.formatTime(0) === '00:00', 'fmt 0');
ok(L.formatTime(65000) === '01:05', 'fmt 65s');
ok(L.formatTime(600000) === '10:00', 'fmt 10min');

// toBanglaDigits
ok(L.toBanglaDigits('2026') === '\u09E8\u09E6\u09E8\u09EC', 'bn digits');
ok(L.toBanglaDigits('abc123') === 'abc\u09E7\u09E8\u09E9', 'bn digits mixed');

// makeQuiz — seeded rng for determinism
const words = L.splitWords('The quick brown fox jumps over the lazy dog near the river bank while birds sing songs');
let seed = 42;
const rng = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const q = L.makeQuiz(words, rng);
ok(q.length >= 4, 'quiz has >=4 questions, got ' + q.length);
q.forEach((qq, i) => {
  ok(qq.options.length === 4, `q${i} has 4 options`);
  ok(new Set(qq.options.map(o => o.toLowerCase())).size === 4, `q${i} options unique`);
  ok(qq.answerIndex >= 0 && qq.answerIndex < 4, `q${i} answer index valid`);
  if (qq.kind === 'appeared') {
    ok(words.map(w => w.toLowerCase()).includes(qq.options[qq.answerIndex].toLowerCase()), `q${i} answer from passage`);
  }
});
const q2 = L.makeQuiz(['a', 'b'], rng);
ok(q2.length === 0, 'tiny text yields no questions');

// scoreQuiz
assert.deepStrictEqual(L.scoreQuiz([{ answerIndex: 1 }, { answerIndex: 0 }], [1, 2]), { correct: 1, total: 2 }); n++;
assert.deepStrictEqual(L.scoreQuiz([{ answerIndex: 0 }], [-1]), { correct: 0, total: 1 }); n++;

console.log(`UNIT TESTS PASSED: ${n} assertions`);
