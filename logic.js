/* Speed Reader BD - pure logic module (no DOM). Pure-ASCII sources only. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.SpeedReaderLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Split text into word tokens (whitespace-separated, non-empty).
  function splitWords(text) {
    if (typeof text !== 'string') return [];
    return text.split(/\s+/).map(function (w) { return w.trim(); })
      .filter(function (w) { return w.length > 0; });
  }

  // Optimal Recognition Point index for a word (0-based).
  // Standard RSVP rule: 1 char -> 0; 2-5 -> 1; 6-9 -> 2; 10-13 -> 3; 14+ -> 4.
  function orpIndex(word) {
    var len = String(word).length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }

  // Render one word as [left, pivot, right] for ORP highlighting.
  function orpParts(word) {
    var w = String(word);
    var i = Math.min(orpIndex(w), w.length - 1);
    return { left: w.slice(0, i), pivot: w.charAt(i), right: w.slice(i + 1) };
  }

  // Group words into chunks of n.
  function chunkWords(words, n) {
    var size = Math.max(1, Math.floor(n) || 1);
    var out = [];
    for (var i = 0; i < words.length; i += size) out.push(words.slice(i, i + size));
    return out;
  }

  // Milliseconds per chunk at given WPM.
  function msPerChunk(wpm, n) {
    var w = Math.max(50, Math.min(2000, Number(wpm) || 300));
    var size = Math.max(1, Math.floor(n) || 1);
    return 60000 * size / w;
  }

  // Estimated total session duration in ms.
  function sessionMs(wordCount, wpm, chunkSize) {
    return chunkWords(new Array(Math.max(0, wordCount)), Math.max(1, chunkSize)).length *
      msPerChunk(wpm, chunkSize);
  }

  function formatTime(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : '' + m) + ':' + (r < 10 ? '0' + r : '' + r);
  }

  // Convert ASCII digits 0-9 to Bengali digits.
  var BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA',
    '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
  function toBanglaDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  // Pool of generic distractor words (English, common).
  var DISTRACTORS = ('time people year way day man thing woman life child world school ' +
    'state family student group country problem hand part place case week company system ' +
    'program question work government number night point home water room mother area ' +
    'money story fact month lot right study book eye job word business issue side kind ' +
    'head house service friend father power hour game line end member law car community ' +
    'name team minute idea kid body information back parent face others level office ' +
    'door health person art war history party result change morning reason research ' +
    'girl guy moment air teacher force education').split(' ');

  function shuffleInPlace(arr, rand) {
    var r = rand || Math.random;
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // Build a comprehension quiz from the read words.
  // Returns [{question, options:[4], answerIndex, kind}]. `rand` is injectable for tests.
  function makeQuiz(words, rand) {
    var clean = words.map(function (w) { return w.replace(/^[^A-Za-z\u0980-\u09FF]+|[^A-Za-z\u0980-\u09FF]+$/g, ''); })
      .filter(function (w) { return w.length >= 4; });
    var seen = {}, vocab = [];
    clean.forEach(function (w) { var k = w.toLowerCase(); if (!seen[k]) { seen[k] = 1; vocab.push(w); } });
    var questions = [];
    if (vocab.length >= 4) {
      var r = rand || Math.random;
      var pool = vocab.slice();
      shuffleInPlace(pool, r);
      var n = Math.min(4, pool.length);
      for (var q = 0; q < n; q++) {
        var answer = pool[q];
        var opts = [answer];
        var used = {};
        used[answer.toLowerCase()] = 1;
        var di = 0;
        while (opts.length < 4 && di < DISTRACTORS.length * 3) {
          var cand = DISTRACTORS[Math.floor(r() * DISTRACTORS.length)];
          if (!used[cand] && !seen[cand]) { opts.push(cand); used[cand] = 1; }
          di++;
        }
        // fill any remaining slots from vocab (guaranteed unique)
        var vi = 0;
        while (opts.length < 4 && vi < vocab.length) {
          var v = vocab[vi++];
          if (!used[v.toLowerCase()]) { opts.push(v); used[v.toLowerCase()] = 1; }
        }
        shuffleInPlace(opts, r);
        questions.push({
          kind: 'appeared',
          question: 'Which word appeared in the passage?',
          options: opts.slice(),
          answerIndex: opts.indexOf(answer)
        });
      }
    }
    if (words.length >= 4) {
      var total = words.length;
      var nums = {};
      nums[total] = 1;
      var optsN = [String(total)];
      var deltas = [1, 2, 3, 5, 10];
      var d2 = 0;
      while (optsN.length < 4 && d2 < deltas.length * 2) {
        var c = total + (d2 % 2 === 0 ? deltas[Math.floor(d2 / 2)] : -deltas[Math.floor(d2 / 2)]);
        if (c > 0 && !nums[c]) { nums[c] = 1; optsN.push(String(c)); }
        d2++;
      }
      shuffleInPlace(optsN, rand || Math.random);
      questions.push({
        kind: 'count',
        question: 'How many words were in the passage?',
        options: optsN.slice(),
        answerIndex: optsN.indexOf(String(total))
      });
    }
    return questions;
  }

  function scoreQuiz(questions, answers) {
    var correct = 0;
    questions.forEach(function (q, i) {
      if (answers[i] === q.answerIndex) correct++;
    });
    return { correct: correct, total: questions.length };
  }

  return {
    splitWords: splitWords,
    orpIndex: orpIndex,
    orpParts: orpParts,
    chunkWords: chunkWords,
    msPerChunk: msPerChunk,
    sessionMs: sessionMs,
    formatTime: formatTime,
    toBanglaDigits: toBanglaDigits,
    makeQuiz: makeQuiz,
    scoreQuiz: scoreQuiz
  };
});
