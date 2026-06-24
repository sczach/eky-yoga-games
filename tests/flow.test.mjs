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

/* ---------- on-stage drag/hold instruction cues (device-aware affordance) ---------- */
let howto = await page.evaluate(() => ({
  bannerText: document.querySelector('#breath-game .game-howto') ? document.querySelector('#breath-game .game-howto').textContent : '',
  chevUpInvite: document.getElementById('breath-chev-up').classList.contains('invite'),
  chevDownInvite: document.getElementById('breath-chev-down').classList.contains('invite')
}));
ok(/inhale[\s\S]*exhale/i.test(howto.bannerText), 'Sun Salutation shows a how-to banner');
ok(howto.chevUpInvite && howto.chevDownInvite, 'Both stage cues invite interaction before Start is pressed');

/* Device-aware instruction copy: desktop leads with the arrow keys (and renders the cue as a
   real keycap), touch leads with press-&-drag (and renders a drag chevron) — so the on-circle
   cue never reads as "press the arrow keys" on a phone, nor dominates the desktop drag wording. */
let copy = await page.evaluate(() => {
  const desk = { howto: breathHowto('Start'), verbUp: breathVerb('up') };
  const wasTouch = IS_TOUCH;
  IS_TOUCH = true;
  const touch = { howto: breathHowto('Start'), verbUp: breathVerb('up') };
  IS_TOUCH = wasTouch;
  return { desk, touch, key: document.querySelector('#breath-chev-up .bs-key') ? document.querySelector('#breath-chev-up .bs-key').textContent : '' };
});
ok(/arrow keys/i.test(copy.desk.howto) && /hold/i.test(copy.desk.verbUp), 'Desktop copy leads with the ↑ / ↓ arrow keys');
ok(/drag/i.test(copy.touch.howto) && /drag/i.test(copy.touch.verbUp) && !/arrow keys/i.test(copy.touch.howto), 'Touch copy leads with press-&-drag and never mentions arrow keys');
ok(copy.key === '↑', 'On a non-touch device the up cue renders as a ↑ keycap (the real key), not an abstract arrow');

await page.evaluate(() => sunFlow.start());
await page.waitForTimeout(60);
let chevTarget = await page.evaluate(() => ({
  upTarget: document.getElementById('breath-chev-up').classList.contains('target'),
  downTarget: document.getElementById('breath-chev-down').classList.contains('target'),
  upInviteGone: !document.getElementById('breath-chev-up').classList.contains('invite')
}));
ok(chevTarget.upTarget !== chevTarget.downTarget, 'Exactly one chevron is marked as the needed direction once flowing');
ok(chevTarget.upInviteGone, 'Invite bounce stops once the flow has started');

let reqDir = await page.evaluate(() => { sunFlow.dir = sunFlow.reqDir(); return sunFlow.dir; });
await page.waitForTimeout(60);
let chevEngaged = await page.evaluate((rd) => {
  const hit = document.getElementById(rd === 'up' ? 'breath-chev-up' : 'breath-chev-down');
  const miss = document.getElementById(rd === 'up' ? 'breath-chev-down' : 'breath-chev-up');
  return { hit: hit.classList.contains('engaged'), miss: miss.classList.contains('engaged') };
}, reqDir);
ok(chevEngaged.hit === true, 'Dragging/holding the correct direction lights up its chevron');
ok(chevEngaged.miss === false, 'The opposite chevron stays unlit while only one direction is held');
await page.evaluate(() => { sunFlow.dir = null; sunFlow.reset(); });

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

/* ---------- WELLNESS: mixed asana + breath (manual order + split breath) ---------- */
await page.evaluate(() => {
  showGame('wellness-guide');
  mySequence = [
    { type:'asana', name:'Warrior II' },     // standing
    { type:'breath', name:'Box Breath' },    // pranayama
    { type:'asana', name:'Tree Pose' },      // balance
    { type:'asana', name:'Downward Dog' },   // warmup
    { type:'breath', name:'4-7-8 Breath' },  // pranayama
    { type:'asana', name:"Child's Pose" }    // restorative
  ];
  animateSequence();
});
await page.waitForTimeout(200);
let w = await page.evaluate(() => ({
  N: wellnessFlow.N, unique: wellnessFlow.uniqueCount, loop: wellnessFlow.loop,
  linear: wellnessFlow.linear,
  labels: document.querySelectorAll('#wf-labels .clock-label').length,
  pauses: wellnessFlow.poses.filter(p => p.pause).length,
  names: wellnessFlow.poses.map(p => p.en),
  overlay: getComputedStyle(document.getElementById('wellness-flow-overlay')).display
}));
console.log('Wellness mixed:', JSON.stringify(w));
ok(w.overlay === 'block', 'Wellness animate overlay opens');
ok(w.N === 4, 'Breath items split out — only the 4 asanas become pose stations');
ok(w.unique === 4 && !w.loop, 'Open sequence: unique stations = N (no shared top)');
ok(w.labels === 4, 'Wellness renders a label per asana station');
ok(w.pauses === 0, 'No pause stations — pranayama is no longer woven into the pose loop');
ok(w.linear === false, 'N>2 uses circular layout');
// manual order is authoritative: stations follow the My Sequence list order verbatim
ok(JSON.stringify(w.names) === JSON.stringify(['Warrior II','Tree Pose','Downward Dog',"Child's Pose"]),
   'Pose stations follow the user’s manual sequence order, not auto-sorted');

let wfHowto = await page.evaluate(() => ({
  bannerText: document.querySelector('#wellness-flow-overlay .game-howto') ? document.querySelector('#wellness-flow-overlay .game-howto').textContent : '',
  bannerHasArrowKeys: /arrow keys/i.test(document.querySelector('#wellness-flow-overlay .game-howto').textContent),
  chevUpInvite: document.getElementById('wf-chev-up').classList.contains('invite'),
  chevDownInvite: document.getElementById('wf-chev-down').classList.contains('invite'),
  hasKeycap: !!document.querySelector('#wf-chev-up .bs-key')
}));
ok(/Breathe/i.test(wfHowto.bannerText) && wfHowto.bannerHasArrowKeys, 'Animate-Sequence overlay shows the device-aware how-to banner (desktop: arrow keys)');
ok(wfHowto.hasKeycap, 'Wellness stage cue also renders as a keycap on desktop');
ok(wfHowto.chevUpInvite && wfHowto.chevDownInvite, 'Wellness stage cues also invite interaction before Start');

/* breath-wave panel: separate, passive pranayama display */
let bw = await page.evaluate(() => ({
  panel: getComputedStyle(document.getElementById('wf-breath-panel')).display,
  items: wellnessBreath.items.slice(),
  track: document.getElementById('wf-breath-track').getAttribute('d') || '',
  hasDot: !!document.getElementById('wf-breath-dot'),
  chips: document.getElementById('wf-breath-chips').children.length,
  title: document.getElementById('wf-breath-title').textContent
}));
console.log('Breath wave:', JSON.stringify({ ...bw, track: bw.track.slice(0,24)+'…' }));
ok(bw.panel === 'block', 'Pranayama breath-wave panel shows beside the pose circle');
ok(bw.items.length === 2, 'Both distinct breath practices captured into the breath display');
ok(bw.track.length > 10 && /^M /.test(bw.track), 'Breath-wave line path is drawn for the active pattern');
ok(bw.hasDot, 'A traveling dot element exists on the breath wave');
ok(bw.chips === 2, 'A selector chip is shown per breath pattern');

// line shape differs per pattern ratio (Box 4:4:4:4 vs 4-7-8 4:7:8:0)
let shapes = await page.evaluate(() => {
  const a = (wellnessBreath.select(0), document.getElementById('wf-breath-track').getAttribute('d'));
  const b = (wellnessBreath.select(1), document.getElementById('wf-breath-track').getAttribute('d'));
  wellnessBreath.select(0);
  return { a, b };
});
ok(shapes.a !== shapes.b, 'Line shape varies with the breath pattern ratio');

// passive: the dot animates on its own rAF, NOT from arrow keys / activeFlow
let passive = await page.evaluate(async () => {
  wellnessBreath.start();
  const running = wellnessBreath.running;
  const dot0 = document.getElementById('wf-breath-dot').getAttribute('cx');
  // arrow keys drive the pose flow, not the breath wave
  const beforeFlowProg = activeFlow ? activeFlow.prog : null;
  document.dispatchEvent(new KeyboardEvent('keydown', { key:'ArrowUp' }));
  await new Promise(r => setTimeout(r, 120));
  document.dispatchEvent(new KeyboardEvent('keyup', { key:'ArrowUp' }));
  const dot1 = document.getElementById('wf-breath-dot').getAttribute('cx');
  wellnessBreath.pause();
  const pausedRunning = wellnessBreath.running;
  return { running, moved: dot0 !== dot1, pausedRunning };
});
ok(passive.running === true, 'Breathe button starts an auto-looping animation');
ok(passive.moved === true, 'Dot travels along the path on its own (passive loop)');
ok(passive.pausedRunning === false, 'Breath wave can be paused independently of the pose flow');

let dw = await runToDone('wellnessFlow');
console.log('Wellness run:', JSON.stringify(dw));
ok(dw.done === true, 'Wellness sequence reaches done end-to-end');
await page.screenshot({ path: SHOT + '/shot-wellness-animated.png' });

/* ---------- manual drag-to-reorder controls the sequence ---------- */
await page.evaluate(() => { closeWellnessFlow(); showGame('wellness-guide'); });
let reorder = await page.evaluate(() => {
  mySequence = [
    { type:'asana', name:'Warrior II' },
    { type:'asana', name:'Tree Pose' },
    { type:'asana', name:'Downward Dog' }
  ];
  renderSequence();
  const before = mySequence.map(i => i.name);
  // drag the 3rd pose (idx 2) to the front
  moveSequenceItem(2, 0);
  const after = mySequence.map(i => i.name);
  // the My Sequence rows reflect the new order and remain draggable
  const rows = [].map.call(document.querySelectorAll('#my-sequence .seq-row'),
    r => r.querySelector('span:nth-child(3)').textContent);
  const draggable = [].every.call(document.querySelectorAll('#my-sequence .seq-row'), r => r.draggable === true);
  // persisted to localStorage
  const stored = JSON.parse(localStorage.getItem('eky_sequence')).map(i => i.name);
  // and the animation honors it
  animateSequence();
  const stations = wellnessFlow.poses.map(p => p.en);
  return { before, after, rows, draggable, stored, stations };
});
console.log('Drag reorder:', JSON.stringify(reorder));
ok(JSON.stringify(reorder.before) === JSON.stringify(['Warrior II','Tree Pose','Downward Dog']), 'Sequence starts in added order');
ok(JSON.stringify(reorder.after) === JSON.stringify(['Downward Dog','Warrior II','Tree Pose']), 'moveSequenceItem reorders the sequence');
ok(JSON.stringify(reorder.rows) === JSON.stringify(reorder.after), 'My Sequence rows re-render in the new order');
ok(reorder.draggable === true, 'Sequence rows are draggable for reordering');
ok(JSON.stringify(reorder.stored) === JSON.stringify(reorder.after), 'Reordered sequence is persisted to localStorage');
ok(JSON.stringify(reorder.stations) === JSON.stringify(reorder.after), 'Animation plays the user’s manual order verbatim');
await page.evaluate(() => closeWellnessFlow());

/* ---------- Auto-arrange opt-in: snap poses into vinyasa best-practice order ---------- */
let auto = await page.evaluate(() => {
  showGame('wellness-guide');
  // scrambled: twist-counter before backbend, rest before standing, with a breath mixed in
  mySequence = [
    { type:'asana', name:'Supine Twist' },   // twist (5)
    { type:'asana', name:"Child's Pose" },   // restorative (9)
    { type:'breath', name:'Box Breath' },    // pranayama
    { type:'asana', name:'Cobra' },          // backbend (4)
    { type:'asana', name:'Warrior II' }      // standing (1)
  ];
  renderSequence();
  autoArrangeSequence();
  return mySequence.map(i => i.type === 'breath' ? '('+i.name+')' : i.name);
});
console.log('Auto-arrange:', JSON.stringify(auto));
ok(JSON.stringify(auto) === JSON.stringify(['Warrior II','Cobra','Supine Twist',"Child's Pose",'(Box Breath)']),
   'Auto-arrange sorts poses to vinyasa order (backbend before its twist counter), breath moved to end');
await page.evaluate(() => closeWellnessFlow());

/* ---------- breath-only sequence: pose stage hidden, breath panel alone ---------- */
let bonly = await page.evaluate(() => {
  mySequence = [ { type:'breath', name:'Kapalabhati (gentle)' } ];
  animateSequence();
  return {
    overlay: getComputedStyle(document.getElementById('wellness-flow-overlay')).display,
    stage: getComputedStyle(document.getElementById('wf-stage-wrap')).display,
    panel: getComputedStyle(document.getElementById('wf-breath-panel')).display,
    active: activeFlow,
    items: wellnessBreath.items.slice()
  };
});
console.log('Breath-only:', JSON.stringify(bonly));
ok(bonly.overlay === 'block' && bonly.panel === 'block', 'Breath-only sequence still opens with the breath panel');
ok(bonly.stage === 'none' && bonly.active === null, 'No asanas → pose stage hidden and no active key-driven flow');
await page.screenshot({ path: SHOT + '/shot-breath-only.png' });
await page.evaluate(() => closeWellnessFlow());

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
