/* Speed Reader BD - app wiring. Pure-ASCII sources only (Bengali as \uXXXX). */
(function () {
  'use strict';
  var L = window.SpeedReaderLogic;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------- i18n ---------------- */
  var STR = {
    en: {
      appTitle: 'Speed Reader BD', tabReader: 'Reader', tabQuiz: 'Quiz', tabLibrary: 'Library', tabGuide: 'Guide',
      pasteLabel: 'Paste your text here', pastePh: 'Paste an article, story, or study notes\u2026',
      samplesLabel: 'Samples:', clearBtn: 'Clear',
      wordsLab: 'Words', charsLab: 'Characters', sentLab: 'Sentences', etaLab: 'Est. time',
      emptyNotice: 'Add some text or pick a sample to start reading.',
      flashIdle: 'Press Play to start',
      elapsedLab: 'Elapsed', remainLab: 'Remaining', chunkLab: 'Chunk',
      playBtn: 'Play', pauseBtn: 'Pause', restartBtn: 'Restart',
      wpmLab: 'Words / minute', atOnceLab: 'At once:',
      keyHint: 'Keys: Space = play/pause, R = restart, arrows = step word',
      quizIntro: 'Read a passage first, then test what you remember. Questions are generated from your own text.',
      startQuizBtn: 'Start quiz', checkBtn: 'Check answers',
      quizEmpty: 'No passage loaded yet \u2014 paste text or pick a sample in the Reader tab.',
      qAppeared: 'Which word appeared in the passage?', qCount: 'How many words were in the passage?',
      scoreT: function (c, t) { return 'Score: ' + c + ' / ' + t; },
      libHead: 'Sample library', libIntro: 'Short built-in passages to practice with. Your own pasted text is never saved.',
      histHead: 'Session history', clearHistBtn: 'Clear history',
      histEmpty: 'No sessions yet. Finished readings appear here.',
      guideHead: 'How to train',
      g1: 'Paste any text or pick a sample from the Library.',
      g2: 'Start at 200\u2013300 words per minute and keep the red letter in focus.',
      g3: 'Raise the speed in small steps once reading feels comfortable.',
      g4: 'Take the quiz to check comprehension \u2014 speed without understanding is skimming.',
      g5: 'Everything runs offline in your browser. No account, no uploads.',
      disclaimer: 'Demo learning tool. RSVP trains reading pace; comprehension varies by person and text.',
      footer: 'Speed Reader BD \u00b7 100% offline \u00b7 your text never leaves this device',
      finished: 'Done! Take the quiz in the Quiz tab.',
      sessLine: function (w, wpm, dur, score) {
        var s = w + ' words @ ' + wpm + ' wpm \u00b7 ' + dur;
        if (score) s += ' \u00b7 quiz ' + score;
        return s;
      }
    },
    bn: {
      appTitle: '\u0997\u09A4\u09BF \u09AA\u09BE\u09A0\u0995 \u09AC\u09BF\u09A1\u09BF',
      tabReader: '\u09AA\u09BE\u09A0\u0995', tabQuiz: '\u0995\u09C1\u0987\u099C',
      tabLibrary: '\u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0', tabGuide: '\u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE',
      pasteLabel: '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B2\u09C7\u0996\u09BE \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09BF\u09A8',
      pastePh: '\u098F\u0995\u099F\u09BF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7, \u0997\u09B2\u09CD\u09AA \u09AC\u09BE \u09AA\u09BE\u09A0\u09C7\u09B0 \u09A8\u09CB\u099F \u09A6\u09BF\u09A8\u2026',
      samplesLabel: '\u09A8\u09AE\u09C1\u09A8\u09BE:', clearBtn: '\u09AE\u09C1\u099B\u09C1\u09A8',
      wordsLab: '\u09B6\u09AC\u09CD\u09A6', charsLab: '\u0985\u0995\u09CD\u09B7\u09B0',
      sentLab: '\u09AC\u09BE\u0995\u09CD\u09AF', etaLab: '\u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 \u09B8\u09AE\u09DF',
      emptyNotice: '\u09AA\u09A1\u09BC\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u0995\u09BF\u099B\u09C1 \u09B2\u09C7\u0996\u09BE \u09A6\u09BF\u09A8 \u09AC\u09BE \u09A8\u09AE\u09C1\u09A8\u09BE \u09A8\u09BF\u09A8\u0964',
      flashIdle: '\u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09B2\u09C1 \u099A\u09BE\u09AA\u09C1\u09A8',
      elapsedLab: '\u0997\u09A4', remainLab: '\u09AC\u09BE\u0995\u09BF', chunkLab: '\u09A7\u09BE\u09AA',
      playBtn: '\u099A\u09BE\u09B2\u09C1', pauseBtn: '\u09A5\u09BE\u09AE\u09C1\u09A8', restartBtn: '\u09AA\u09C1\u09A8\u09B0\u09BE\u09DF',
      wpmLab: '\u09AA\u09CD\u09B0\u09A4\u09BF \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09B6\u09AC\u09CD\u09A6',
      atOnceLab: '\u098F\u0995\u09B8\u09BE\u09A5\u09C7:',
      keyHint: '\u0995\u09BF: \u09B8\u09CD\u09AA\u09C7\u09B8 = \u099A\u09BE\u09B2\u09C1/\u09A5\u09BE\u09AE\u09BE, R = \u09AA\u09C1\u09A8\u09B0\u09BE\u09DF, \u09A4\u09C0\u09B0 = \u09B6\u09AC\u09CD\u09A6 \u09AC\u09A6\u09B2\u09BE\u09A8',
      quizIntro: '\u09AA\u09CD\u09B0\u09A5\u09AE\u09C7 \u098F\u0995\u099F\u09BF \u0985\u09A8\u09C1\u099A\u09CD\u09B8\u09C7\u09A6 \u09AA\u09A1\u09BC\u09C1\u09A8, \u09A4\u09BE\u09B0\u09AA\u09B0 \u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09BE \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C1\u09A8\u0964 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BF\u099C\u09C7\u09B0 \u09B2\u09C7\u0996\u09BE \u09A5\u09C7\u0995\u09C7 \u09A4\u09C8\u09B0\u09BF\u0964',
      startQuizBtn: '\u0995\u09C1\u0987\u099C \u09B6\u09C1\u09B0\u09C1', checkBtn: '\u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u0996\u09C1\u09A8',
      quizEmpty: '\u098F\u0996\u09A8\u0993 \u0995\u09CB\u09A8 \u0985\u09A8\u09C1\u099A\u09CD\u09B8\u09C7\u09A6 \u09A8\u09C7\u0987 \u2014 \u09AA\u09BE\u09A0\u0995 \u099F\u09CD\u09AF\u09BE\u09AC\u09C7 \u09B2\u09C7\u0996\u09BE \u09A6\u09BF\u09A8 \u09AC\u09BE \u09A8\u09AE\u09C1\u09A8\u09BE \u09A8\u09BF\u09A8\u0964',
      qAppeared: '\u0985\u09A8\u09C1\u099A\u09CD\u09B8\u09C7\u09A6\u09C7 \u0995\u09CB\u09A8 \u09B6\u09AC\u09CD\u09A6\u099F\u09BF \u099B\u09BF\u09B2?',
      qCount: '\u0985\u09A8\u09C1\u099A\u09CD\u09B8\u09C7\u09A6\u09C7 \u0995\u09DF\u099F\u09BF \u09B6\u09AC\u09CD\u09A6 \u099B\u09BF\u09B2?',
      scoreT: function (c, t) { return '\u09B8\u09CD\u0995\u09CB\u09B0: ' + L.toBanglaDigits(c) + ' / ' + L.toBanglaDigits(t); },
      libHead: '\u09A8\u09AE\u09C1\u09A8\u09BE \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0',
      libIntro: '\u0985\u09AD\u09CD\u09AF\u09BE\u09B8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u099B\u09CB\u099F \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4 \u0985\u09A8\u09C1\u099A\u09CD\u09B8\u09C7\u09A6\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BF\u099C\u09C7\u09B0 \u09B2\u09C7\u0996\u09BE \u0995\u09CB\u09A5\u09BE\u0993 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u09B9\u09DF \u09A8\u09BE\u0964',
      histHead: '\u09B8\u09C7\u09B6\u09A8 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8', clearHistBtn: '\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u09AE\u09C1\u099B\u09C1\u09A8',
      histEmpty: '\u098F\u0996\u09A8\u0993 \u0995\u09CB\u09A8 \u09B8\u09C7\u09B6\u09A8 \u09A8\u09C7\u0987\u0964 \u09B6\u09C7\u09B7 \u09B9\u0993\u09DF\u09BE \u09AA\u09BE\u09A0 \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09C7\u0996\u09BE\u09AC\u09C7\u0964',
      guideHead: '\u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u0985\u09AD\u09CD\u09AF\u09BE\u09B8 \u0995\u09B0\u09AC\u09C7\u09A8',
      g1: '\u09AF\u09C7 \u0995\u09CB\u09A8 \u09B2\u09C7\u0996\u09BE \u09A6\u09BF\u09A8 \u09AC\u09BE \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u09A5\u09C7\u0995\u09C7 \u09A8\u09AE\u09C1\u09A8\u09BE \u09A8\u09BF\u09A8\u0964',
      g2: '\u09AA\u09CD\u09B0\u09A4\u09BF \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09E8\u09E6\u09E6\u2013\u09E9\u09E6\u09E6 \u09B6\u09AC\u09CD\u09A6 \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09B2\u09BE\u09B2 \u0985\u0995\u09CD\u09B7\u09B0\u09C7 \u09A6\u09C3\u09B7\u09CD\u09A0\u09BF \u09B0\u09BE\u0996\u09C1\u09A8\u0964',
      g3: '\u09B8\u09B9\u099C \u09AE\u09A8\u09C7 \u09B9\u09B2\u09C7 \u099B\u09CB\u099F \u09A7\u09BE\u09AA\u09C7 \u0997\u09A4\u09BF \u09AC\u09BE\u09DC\u09BE\u09A8\u0964',
      g4: '\u09AC\u09CB\u099D\u09BE \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09A4\u09C7 \u0995\u09C1\u0987\u099C \u09A6\u09BF\u09A8 \u2014 \u09A8\u09BE \u09AC\u09C1\u099D\u09C7 \u0997\u09A4\u09BF \u09B9\u09B2\u09CB \u09B8\u09CD\u0995\u09BF\u09AE\u09BF\u0982\u0964',
      g5: '\u09B8\u09AC \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09B0\u09BE\u0989\u099C\u09BE\u09B0\u09C7 \u0985\u09AB\u09B2\u09BE\u0987\u09A8\u09C7 \u099A\u09B2\u09C7\u0964 \u0995\u09CB\u09A8 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AC\u09BE \u0986\u09AA\u09B2\u09CB\u09A1 \u09A8\u09C7\u0987\u0964',
      disclaimer: '\u09A1\u09C7\u09AE\u09CB \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u099F\u09C1\u09B2\u0964 \u0986\u09B0\u098F\u09B8\u09AD\u09BF\u09AA\u09BF \u09AA\u09BE\u09A0\u09C7\u09B0 \u0997\u09A4\u09BF \u09AC\u09BE\u09DC\u09BE\u09DF; \u09AC\u09CB\u099D\u09BE \u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u0993 \u09B2\u09C7\u0996\u09BE\u09AD\u09C7\u09A6\u09C7 \u09AD\u09BF\u09A8\u09CD\u09A8\u0964',
      footer: '\u0997\u09A4\u09BF \u09AA\u09BE\u09A0\u0995 \u09AC\u09BF\u09A1\u09BF \u00b7 \u09E7\u09E6\u09E6% \u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u00b7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B2\u09C7\u0996\u09BE \u09A1\u09BF\u09AD\u09BE\u0987\u09B8 \u099B\u09BE\u09DC\u09C7 \u09AF\u09BE\u09DF \u09A8\u09BE',
      finished: '\u09B6\u09C7\u09B7! \u0995\u09C1\u0987\u099C \u099F\u09CD\u09AF\u09BE\u09AC\u09C7 \u0995\u09C1\u0987\u099C \u09A6\u09BF\u09A8\u0964',
      sessLine: function (w, wpm, dur, score) {
        var s = L.toBanglaDigits(w) + ' \u09B6\u09AC\u09CD\u09A6 @ ' + L.toBanglaDigits(wpm) + ' wpm \u00b7 ' + dur;
        if (score) s += ' \u00b7 \u0995\u09C1\u0987\u099C ' + L.toBanglaDigits(score);
        return s;
      }
    }
  };
  var lang = 'en';
  try { lang = localStorage.getItem('srb-lang') || 'en'; } catch (e) {}
  if (lang !== 'bn') lang = 'en';
  function t(key) { return STR[lang][key]; }
  function num(n) { return lang === 'bn' ? L.toBanglaDigits(String(n)) : String(n); }

  /* ---------------- samples ---------------- */
  var SAMPLES = {
    en1: 'The Padma is one of the great rivers of Bangladesh. It carries meltwater from the Himalayas across the delta to the Bay of Bengal. The Padma Bridge, opened in 2022, connects the southwest region directly to Dhaka and has transformed trade, travel, and daily life for millions of people.',
    en2: 'RSVP stands for rapid serial visual presentation. Instead of moving your eyes across a page, words flash one at a time in the same spot. A red letter marks the optimal recognition point, so your eyes stay still. Most people start near two hundred words per minute and improve with short daily sessions. Comprehension matters more than raw speed.',
    bn1: '\u09A2\u09BE\u0995\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09B0\u09BE\u099C\u09A7\u09BE\u09A8\u09C0\u0964 \u098F\u099F\u09BF \u09AC\u09C1\u09DC\u09BF\u0997\u0999\u09CD\u0997\u09BE \u09A8\u09A6\u09C0\u09B0 \u09A4\u09C0\u09B0\u09C7 \u0985\u09AC\u09B8\u09CD\u09A5\u09BF\u09A4\u0964 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09B2\u09BE\u0996\u09CB \u09AE\u09BE\u09A8\u09C1\u09B7 \u098F\u0996\u09BE\u09A8\u09C7 \u0995\u09BE\u099C \u0995\u09B0\u09C7\u0964',
    bn2: '\u09AC\u0987 \u09AA\u09DC\u09BE \u098F\u0995\u099F\u09BF \u09AD\u09BE\u09B2\u09CB \u0985\u09AD\u09CD\u09AF\u09BE\u09B8\u0964 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09AC\u09BF\u09B6 \u09AE\u09BF\u09A8\u09BF\u099F \u09AA\u09DC\u09B2\u09C7 \u099C\u09CD\u099E\u09BE\u09A8 \u09AC\u09BE\u09DC\u09C7\u0964'
  };

  /* ---------------- state ---------------- */
  var words = [], chunks = [], idx = 0, playing = false, timerId = null;
  var wpm = 300, chunkSize = 1;
  var elapsedMs = 0;
  var quiz = [], quizAnswered = false;

  function renderFlash() {
    var f = $('flash');
    if (!chunks.length || idx >= chunks.length) {
      f.innerHTML = '<span class="flash-idle">' + esc(t('flashIdle')) + '</span>';
      return;
    }
    var html = chunks[idx].map(function (w) {
      var p = L.orpParts(w);
      return '<span>' + esc(p.left) + '<span class="pivot">' + esc(p.pivot) + '</span>' + esc(p.right) + '</span>';
    }).join(' ');
    f.innerHTML = html;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function updateStats() {
    var text = $('textInput').value;
    words = L.splitWords(text);
    $('statWords').textContent = num(words.length);
    $('statChars').textContent = num(text.replace(/\s/g, '').length);
    $('statSentences').textContent = num((text.match(/[.!?\u0964]+/g) || []).length);
    $('statEta').textContent = L.formatTime(L.sessionMs(words.length, wpm, chunkSize));
    $('emptyNotice').classList.toggle('hidden', words.length > 0);
    $('btnPlay').disabled = words.length === 0;
    rebuildChunks();
  }

  function rebuildChunks() {
    chunks = L.chunkWords(words, chunkSize);
    if (idx >= chunks.length) idx = 0;
    renderFlash(); updateProgress();
  }

  function updateProgress() {
    var total = chunks.length;
    var pct = total ? Math.round(idx / total * 100) : 0;
    $('progressFill').style.width = pct + '%';
    $('chunkPos').textContent = num(idx) + '/' + num(total);
    $('elapsed').textContent = L.formatTime(elapsedMs);
    $('remaining').textContent = L.formatTime(L.sessionMs(words.length, wpm, chunkSize) - elapsedMs);
  }

  function step() {
    if (idx >= chunks.length) { finish(); return; }
    elapsedMs += L.msPerChunk(wpm, chunkSize);
    renderFlash();
    idx++;
    updateProgress();
    if (idx >= chunks.length) { finish(); return; }
    schedule();
  }

  function schedule() {
    clearTimeout(timerId);
    timerId = setTimeout(step, L.msPerChunk(wpm, chunkSize));
  }

  function play() {
    if (!words.length) return;
    if (idx >= chunks.length) { idx = 0; elapsedMs = 0; }
    playing = true;
    $('btnPlay').disabled = true; $('btnPause').disabled = false;
    schedule();
  }
  function pause() {
    playing = false;
    clearTimeout(timerId);
    $('btnPlay').disabled = false; $('btnPause').disabled = true;
    updateProgress();
  }
  function restart() {
    pause(); idx = 0; elapsedMs = 0;
    renderFlash(); updateProgress();
    $('btnPlay').disabled = words.length === 0;
  }
  function finish() {
    pause(); idx = chunks.length; renderFlash(); updateProgress();
    recordSession();
    var f = $('flash');
    f.innerHTML = '<span class="flash-idle">' + esc(t('finished')) + '</span>';
  }

  /* ---------------- history ---------------- */
  function getHistory() {
    try { return JSON.parse(localStorage.getItem('srb-history') || '[]'); } catch (e) { return []; }
  }
  function recordSession() {
    if (!words.length) return;
    var h = getHistory();
    h.unshift({
      at: new Date().toISOString(),
      words: words.length, wpm: wpm,
      dur: L.formatTime(elapsedMs || L.sessionMs(words.length, wpm, chunkSize)),
      score: null
    });
    if (h.length > 30) h.length = 30;
    try { localStorage.setItem('srb-history', JSON.stringify(h)); } catch (e) {}
    renderHistory();
  }
  function renderHistory() {
    var h = getHistory();
    $('historyEmpty').classList.toggle('hidden', h.length > 0);
    var ul = $('historyList');
    ul.innerHTML = '';
    h.forEach(function (s) {
      var li = document.createElement('li');
      var d = new Date(s.at);
      var when = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var line = t('sessLine')(s.words, s.wpm, s.dur, s.score);
      li.innerHTML = '<span>' + esc(line) + '</span><span class="muted">' + esc(when) + '</span>';
      ul.appendChild(li);
    });
  }

  /* ---------------- quiz ---------------- */
  function startQuiz() {
    quizAnswered = false;
    $('quizScore').classList.add('hidden');
    $('btnCheckQuiz').classList.add('hidden');
    var area = $('quizArea');
    area.innerHTML = '';
    if (!words.length) { $('quizEmpty').classList.remove('hidden'); return; }
    $('quizEmpty').classList.add('hidden');
    quiz = L.makeQuiz(words);
    quiz.forEach(function (q, qi) {
      var qtext = q.kind === 'count' ? t('qCount') : t('qAppeared');
      var div = document.createElement('div');
      div.className = 'q-block';
      div.id = 'q' + qi;
      var html = '<div class="q-title">' + num(qi + 1) + '. ' + esc(qtext) + '</div>';
      q.options.forEach(function (opt, oi) {
        var disp = q.kind === 'count' && lang === 'bn' ? L.toBanglaDigits(opt) : opt;
        html += '<label class="q-opt"><input type="radio" name="q' + qi + '" value="' + oi + '"> ' + esc(disp) + '</label>';
      });
      div.innerHTML = html;
      area.appendChild(div);
    });
    $('btnCheckQuiz').classList.remove('hidden');
  }
  function checkQuiz() {
    if (quizAnswered || !quiz.length) return;
    quizAnswered = true;
    var answers = quiz.map(function (q, qi) {
      var sel = document.querySelector('input[name="q' + qi + '"]:checked');
      return sel ? +sel.value : -1;
    });
    var res = L.scoreQuiz(quiz, answers);
    quiz.forEach(function (q, qi) {
      var div = $('q' + qi);
      div.classList.add(answers[qi] === q.answerIndex ? 'correct' : 'wrong');
    });
    var sc = $('quizScore');
    sc.textContent = t('scoreT')(res.correct, res.total);
    sc.classList.remove('hidden');
    // attach score to latest session
    var h = getHistory();
    if (h.length && !h[0].score) {
      h[0].score = res.correct + '/' + res.total;
      try { localStorage.setItem('srb-history', JSON.stringify(h)); } catch (e) {}
      renderHistory();
    }
    $('btnCheckQuiz').classList.add('hidden');
  }

  /* ---------------- language ---------------- */
  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (STR[lang][k] && typeof STR[lang][k] === 'string') el.textContent = STR[lang][k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph');
      if (STR[lang][k]) el.placeholder = STR[lang][k];
    });
    $('langToggle').textContent = lang === 'en' ? '\u09AC\u09BE\u0982\u09B2\u09BE' : 'EN';
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    $('wpmVal').textContent = num(wpm);
    updateStats(); renderHistory();
    if (quiz.length && !quizAnswered) startQuiz(); // re-render with new language
  }

  /* ---------------- events ---------------- */
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      $('tab-' + btn.getAttribute('data-tab')).classList.add('active');
    });
  });

  $('langToggle').addEventListener('click', function () {
    lang = lang === 'en' ? 'bn' : 'en';
    try { localStorage.setItem('srb-lang', lang); } catch (e) {}
    applyLang();
  });

  $('textInput').addEventListener('input', function () { pause(); idx = 0; elapsedMs = 0; updateStats(); });

  function loadSample(key) {
    pause();
    $('textInput').value = SAMPLES[key];
    idx = 0; elapsedMs = 0;
    updateStats();
    document.querySelector('.tab[data-tab="reader"]').click();
    $('flash').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  ['sampleEn1', 'sampleEn2', 'sampleBn1', 'sampleBn2'].forEach(function (id, i) {
    $(id).addEventListener('click', function () { loadSample(['en1', 'en2', 'bn1', 'bn2'][i]); });
  });
  document.querySelectorAll('.lib-item').forEach(function (el) {
    el.addEventListener('click', function () { loadSample(el.getAttribute('data-sample')); });
  });
  $('clearText').addEventListener('click', function () {
    pause(); $('textInput').value = ''; idx = 0; elapsedMs = 0; updateStats();
  });

  $('wpm').addEventListener('input', function () {
    wpm = +$('wpm').value; $('wpmVal').textContent = num(wpm); updateStats();
  });
  document.querySelectorAll('[data-wpm]').forEach(function (el) {
    el.addEventListener('click', function () {
      wpm = +el.getAttribute('data-wpm');
      $('wpm').value = wpm; $('wpmVal').textContent = num(wpm); updateStats();
    });
  });
  document.querySelectorAll('.chunk-btn').forEach(function (el) {
    el.addEventListener('click', function () {
      document.querySelectorAll('.chunk-btn').forEach(function (b) { b.classList.remove('active'); });
      el.classList.add('active');
      chunkSize = +el.getAttribute('data-chunk');
      pause(); idx = 0; elapsedMs = 0; rebuildChunks(); updateProgress();
    });
  });

  $('btnPlay').addEventListener('click', play);
  $('btnPause').addEventListener('click', pause);
  $('btnRestart').addEventListener('click', restart);
  $('btnStartQuiz').addEventListener('click', startQuiz);
  $('btnCheckQuiz').addEventListener('click', checkQuiz);
  $('btnClearHistory').addEventListener('click', function () {
    try { localStorage.removeItem('srb-history'); } catch (e) {}
    renderHistory();
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === 'r' || e.key === 'R') restart();
    else if (e.key === 'ArrowRight' && !playing) { if (idx < chunks.length) { idx++; renderFlash(); updateProgress(); } }
    else if (e.key === 'ArrowLeft' && !playing) { if (idx > 0) { idx--; renderFlash(); updateProgress(); } }
  });

  /* ---------------- init ---------------- */
  $('btnPause').disabled = true;
  applyLang();
  window.SpeedReaderApp = { loadSample: loadSample, startQuiz: startQuiz, getState: function () {
    return { words: words.length, chunks: chunks.length, idx: idx, playing: playing, lang: lang, quiz: quiz.length };
  } };
})();
