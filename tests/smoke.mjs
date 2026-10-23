// Headless-Chrome smoke tests via raw CDP over file://
// Run:  NODE_PATH=$(npm root -g) node tests/smoke.mjs
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const WebSocket = require(execSync('npm root -g').toString().trim() + '/ws');

const DIR = new URL('..', import.meta.url);
const PAGE_URL = 'file://' + DIR.pathname.replace(/\/$/, '') + '/index.html';
const PORT = 19223;
const CHROME = '/opt/meta-chromium/chrome';

let failures = 0;
const check = (cond, msg) => {
  if (cond) console.log('  PASS', msg);
  else { failures++; console.log('  FAIL', msg); }
};

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
    'about:blank',
  ], { stdio: 'ignore' });
  // poll until the DevTools endpoint is up (cold start can take a while)
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/version`);
      break;
    } catch (e) { await sleep(500); }
    if (i === 59) throw new Error('chrome DevTools endpoint never came up');
  }

  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json());
  const page = list.find(t => t.type === 'page');
  assert.ok(page, 'page target found');

  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
  await new Promise(res => ws.on('open', res));
  let id = 0;
  const pending = new Map();
  ws.on('message', raw => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') {
      console.log('  PAGE EXCEPTION:', JSON.stringify(m.params.exceptionDetails).slice(0, 300));
      failures++;
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      console.log('  CONSOLE ERROR:', JSON.stringify(m.params.args).slice(0, 300));
      failures++;
    }
  });
  const send = (method, params = {}) => new Promise(resolve => {
    const cur = ++id;
    pending.set(cur, resolve);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });
  const evalJs = async (expr, awaitPromise = false) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
    if (r.result?.exceptionDetails) { failures++; console.log('  EVAL EXCEPTION:', expr.slice(0, 80), JSON.stringify(r.result.exceptionDetails).slice(0, 200)); }
    return r.result?.result?.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: PAGE_URL });
  await sleep(2000);

  console.log('== load ==');
  check((await evalJs('document.title')).includes('Speed Reader BD'), 'title present');
  check(await evalJs(`document.querySelector('#appTitle').textContent === 'Speed Reader BD'`), 'h1 text');
  check(await evalJs(`document.querySelector('#btnPlay').disabled === true`), 'play disabled with empty text');
  check(await evalJs(`!document.querySelector('#emptyNotice').classList.contains('hidden')`), 'empty notice visible');

  console.log('== sample + play ==');
  await evalJs(`document.querySelector('#sampleEn1').click()`);
  await sleep(300);
  const wcount = await evalJs(`document.querySelector('#statWords').textContent`);
  check(parseInt(wcount, 10) > 40, `sample loaded, words=${wcount}`);
  check(await evalJs(`document.querySelector('#btnPlay').disabled === false`), 'play enabled after sample');
  const flashBefore = await evalJs(`document.querySelector('#flash').textContent`);
  await evalJs(`document.querySelector('#btnPlay').click()`);
  await sleep(1200);
  const flashAfter = await evalJs(`document.querySelector('#flash').textContent`);
  check(flashBefore !== flashAfter, 'flash advanced while playing');
  check(await evalJs(`window.SpeedReaderApp.getState().playing === true`), 'state.playing true');
  check((await evalJs(`document.querySelector('#progressFill').style.width`)) !== '0%', 'progress bar moved');
  check(await evalJs(`document.querySelector('#elapsed').textContent !== '00:00'`), 'elapsed ticking');
  await evalJs(`document.querySelector('#btnPause').click()`);
  await sleep(200);
  check(await evalJs(`window.SpeedReaderApp.getState().playing === false`), 'pause works');
  await evalJs(`document.querySelector('#btnRestart').click()`);
  await sleep(200);
  check(await evalJs(`document.querySelector('#chunkPos').textContent`).then(v => v.startsWith('0/')), 'restart resets chunk');

  console.log('== quiz ==');
  await evalJs(`document.querySelector('.tab[data-tab="quiz"]').click()`);
  await evalJs(`document.querySelector('#btnStartQuiz').click()`);
  await sleep(300);
  const qcount = await evalJs(`document.querySelectorAll('.q-block').length`);
  check(qcount >= 4, `quiz generated ${qcount} questions`);
  await evalJs(`document.querySelectorAll('.q-block input[type=radio]')[0].click()`);
  await evalJs(`document.querySelector('#btnCheckQuiz').click()`);
  await sleep(300);
  check(await evalJs(`!document.querySelector('#quizScore').classList.contains('hidden')`), 'score shown after check');

  console.log('== bangla toggle ==');
  await evalJs(`document.querySelector('#langToggle').click()`);
  await sleep(400);
  check(await evalJs(`document.querySelector('#appTitle').textContent`).then(t => /[\u0980-\u09FF]/.test(t)), 'title switches to Bangla');
  check(await evalJs(`localStorage.getItem('srb-lang') === 'bn'`), 'lang persisted');
  await evalJs(`location.reload()`);
  await sleep(1500);
  check(await evalJs(`document.querySelector('#appTitle').textContent`).then(t => /[\u0980-\u09FF]/.test(t)), 'lang persists after reload');
  await evalJs(`document.querySelector('#langToggle').click()`); // back to EN
  await sleep(300);

  console.log('== mobile 390px ==');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  const sw = await evalJs(`document.documentElement.scrollWidth`);
  check(sw <= 391, `no horizontal overflow at 390px (scrollWidth=${sw})`);

  console.log('== keyboard ==');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await evalJs(`document.querySelector('.tab[data-tab="reader"]').click()`);
  await evalJs(`document.querySelector('#sampleEn1').click()`); // reload text lost by earlier location.reload()
  await sleep(300);
  await evalJs(`document.querySelector('#btnRestart').click()`);
  await evalJs(`document.body.focus()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'Space', key: ' ', text: ' ', windowsVirtualKeyCode: 32 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'Space', key: ' ', windowsVirtualKeyCode: 32 });
  await sleep(600);
  check(await evalJs(`window.SpeedReaderApp.getState().playing === true`), 'space toggles play');

  ws.close();
  chrome.kill('SIGKILL');
  console.log(failures === 0 ? 'SMOKE TESTS PASSED' : `SMOKE TESTS FAILED: ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('SMOKE HARNESS ERROR:', e); process.exit(2); });
