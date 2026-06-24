import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';

const FILE = 'file://' + path.resolve('index.html');
const SHOT = path.resolve('test-screenshots');
mkdirSync(SHOT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  // ignore blocked CDN resources (fonts / font-awesome) — no direct net in sandbox
  if (/Failed to load resource|net::ERR_/.test(t)) return;
  errors.push(t);
});
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto(FILE);
await page.waitForTimeout(300);

function ok(cond, msg) { console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg); if (!cond) process.exitCode = 1; }

// Drive a flow to completion deterministically via commitTrans()
async function runToDone(flowVar) {
  return await page.evaluate((fv) => {
    const f = window[fv];
    f.start();
    let guard = 0;
    while (!f.done && guard++ < 200) f.commitTrans();
    return { idx: f.idx, done: f.done, N: f.N, unique: f.uniqueCount, guard };
  }, flowVar);
}

/* ---------- SUN SALUTATION ---------- */
await page.evaluate(() => showGame('breath-game'));
await page.waitForTimeout(200);

let s = await page.evaluate(() => ({
  unique: sunFlow.uniqueCount, N: sunFlow.N, loop: sunFlow.loop,
  labels: document.querySelectorAll('#clock-labels .clock-label').length,
  step: +sunFlow.STEP_DEG.toFixed(3)
}));
console.log('Sun base:', JSON.stringify(s));
ok(s.N === 12 && s.unique === 11, 'Sun salutation: 12 steps, 11 unique stations');
ok(s.labels === 11, 'Sun salutation renders 11 clock labels');
ok(Math.abs(s.step - 360/11) < 0.01, 'STEP_DEG derived from live length (360/11)');

let d = await runToDone('sunFlow');
console.log('Sun run:', JSON.stringify(d));
ok(d.done === true, 'Sun salutation reaches bDone via commitTrans()');
let panel = await page.evaluate(() => getComputedStyle(document.getElementById('build-on-panel')).display);
ok(panel !== 'none', 'Build-on panel shows on completion');

// pick two variations and re-flow
await page.evaluate(() => { toggleVariation('warrior1'); toggleVariation('warrior2'); applyVariations(); });
await page.waitForTimeout(150);
let e = await page.evaluate(() => ({
  N: sunFlow.N, unique: sunFlow.uniqueCount,
  labels: document.querySelectorAll('#clock-labels .clock-label').length,
  step: +sunFlow.STEP_DEG.toFixed(4),
  names: sunFlow.poses.map(p => p.en)
}));
console.log('Sun extended:', JSON.stringify(e));
// base 12 + (2 variations + 1 lunge-return) inserted after idx3 and idx8 = 12 + 6 = 18
ok(e.N === 18, 'Extended salutation has 18 stations (2 vars + return, both sides)');
ok(e.unique === e.N - 1, 'Extended unique stations = N-1 (shared top), not hardcoded');
ok(e.labels === e.N - 1, 'Extended flow rebuilt clock labels to N-1');
ok(e.names.includes('Warrior I') && e.names.includes('Warrior II'), 'Variation keyframes inserted');
ok(e.names.filter(n => n === 'Warrior I').length === 2, 'Variation inserted on both right & left passes');
await page.screenshot({ path: SHOT + '/shot-sun-variation-picker.png' });

let d2 = await runToDone('sunFlow');
ok(d2.done === true, 'Extended salutation also reaches done');
await page.evaluate(() => restartCleanFlow());
let clean = await page.evaluate(() => sunFlow.N);
ok(clean === 12, 'Restart clean returns to base 12-pose salutation');

/* ---------- WELLNESS: mixed asana + breath ---------- */
await page.evaluate(() => {
  showGame('wellness-guide');
  mySequence = [
    { type:'asana', name:'Warrior II' },
    { type:'breath', name:'Box Breath' },
    { type:'asana', name:'Tree Pose' },
    { type:'asana', name:'Downward Dog' },
    { type:'breath', name:'4-7-8 Breath' },
    { type:'asana', name:"Child's Pose" }
  ];
  animateSequence();
});
await page.waitForTimeout(200);
let w = await page.evaluate(() => ({
  N: wellnessFlow.N, unique: wellnessFlow.uniqueCount, loop: wellnessFlow.loop,
  linear: wellnessFlow.linear,
  labels: document.querySelectorAll('#wf-labels .clock-label').length,
  pauses: wellnessFlow.poses.filter(p => p.pause).length,
  overlay: getComputedStyle(document.getElementById('wellness-flow-overlay')).display
}));
console.log('Wellness mixed:', JSON.stringify(w));
ok(w.overlay === 'block', 'Wellness animate overlay opens');
ok(w.N === 6, 'Wellness flow has one station per sequence item (6)');
ok(w.unique === 6 && !w.loop, 'Open sequence: unique stations = N (no shared top)');
ok(w.labels === 6, 'Wellness renders a label per station');
ok(w.pauses === 2, 'Breath items rendered as pause stations (2), not fed to lerpP');
ok(w.linear === false, 'N>2 uses circular layout');

// verify arriving at a breathing pause produces NO figure movement
// (pause rig == previous asana rig, so the asana->pause transition is static)
let hold = await page.evaluate(() => {
  function fig(i, pr){ wellnessFlow.idx=i; wellnessFlow.prog=pr; wellnessFlow.render(); return document.getElementById('wf-figure').innerHTML; }
  const atAsana = fig(0, 0);   // holding Warrior II
  const atPause = fig(0, 1);   // breathed onto the pause station (idx 0 -> 1)
  const mid     = fig(0, 0.5); // mid-transition into the pause
  wellnessFlow.idx=0; wellnessFlow.prog=0;
  return atAsana === atPause && atAsana === mid;
});
ok(hold === true, 'Figure holds still arriving at a breathing pause (not interpolated)');

let dw = await runToDone('wellnessFlow');
console.log('Wellness run:', JSON.stringify(dw));
ok(dw.done === true, 'Wellness sequence reaches done end-to-end');
await page.screenshot({ path: SHOT + '/shot-wellness-animated.png' });

/* ---------- WELLNESS: short (linear) ---------- */
await page.evaluate(() => { closeWellnessFlow(); });
await page.evaluate(() => {
  mySequence = [ { type:'asana', name:'Tree Pose' }, { type:'asana', name:"Child's Pose" } ];
  animateSequence();
});
await page.waitForTimeout(150);
let sl = await page.evaluate(() => ({
  unique: wellnessFlow.uniqueCount, linear: wellnessFlow.linear,
  linbar: getComputedStyle(document.getElementById('wf-linbar')).display,
  rings: getComputedStyle(document.getElementById('wf-rings')).display,
  labels: document.querySelectorAll('#wf-labels .clock-label').length
}));
console.log('Wellness short:', JSON.stringify(sl));
ok(sl.linear === true && sl.unique === 2, 'N=2 sequence uses linear layout');
ok(sl.linbar === 'block' && sl.rings === 'none', 'Linear: horizontal bar shown, rings hidden');
await page.screenshot({ path: SHOT + '/shot-wellness-linear.png' });

let dsl = await runToDone('wellnessFlow');
ok(dsl.done === true, 'Short linear sequence completes');

/* ---------- single-item ---------- */
await page.evaluate(() => { closeWellnessFlow(); });
let single = await page.evaluate(() => {
  mySequence = [ { type:'asana', name:'Mountain Pose' } ];
  animateSequence();
  return { N: wellnessFlow.N, unique: wellnessFlow.uniqueCount, linear: wellnessFlow.linear,
    labels: document.querySelectorAll('#wf-labels .clock-label').length };
});
console.log('Wellness single:', JSON.stringify(single));
ok(single.N === 1 && single.labels === 1, 'Single-pose sequence lays out 1 station without error');
await page.evaluate(() => closeWellnessFlow());

/* ---------- navigation: breath input routes to the right flow ---------- */
let nav = await page.evaluate(() => {
  hideGame();                  const onSplash = activeFlow;        // null
  showGame('breath-game');     const onSun = activeFlow === sunFlow;
  hideGame();                  const cleared = activeFlow;         // null
  return { onSplash, onSun, cleared };
});
ok(nav.onSplash === null && nav.cleared === null, 'activeFlow cleared on splash (no stray breath input)');
ok(nav.onSun === true, 'Re-entering breath game re-points input to the sun flow');

console.log('\nConsole errors:', errors.length);
errors.forEach(e => console.log('  ' + e));
ok(errors.length === 0, 'No console/page errors');

await browser.close();
console.log('\nDONE (exit ' + (process.exitCode||0) + ')');
