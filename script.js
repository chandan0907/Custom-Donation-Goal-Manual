function formatINR(num){
  if(!isFinite(num)) return String(num);
  const n = Math.round(num);
  const s = String(n);
  if(s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0,-3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
function clamp(v,a=0,b=100){ return Math.max(a, Math.min(b, v)); }

const barInner = document.getElementById('barInner');
const currentLabel = document.getElementById('currentLabel');
const targetLabel = document.getElementById('targetLabel');
const percentLabel = document.getElementById('percentLabel');
const titleEl = document.getElementById('goalTitle');
const iconEl = document.getElementById('goalIcon');

const editor = document.getElementById('editor');
const inputTitle = document.getElementById('inputTitle');
const inputTarget = document.getElementById('inputTarget');
const inputCurrent = document.getElementById('inputCurrent');
const inputCurrency = document.getElementById('inputCurrency');
const inputColor = document.getElementById('inputColor');
const inputIcon = document.getElementById('inputIcon');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');

if(new URLSearchParams(location.search).get('embed') === '1' && editor) editor.style.display = 'none';

let state = { title:'Donation Goal', target:100000, current:60000, currency:'₹', color:'#c81010', icon:'Currency_Icon.png', showPercent:true };

function updateStaticUI(s){
  if(titleEl) titleEl.textContent = s.title || '';
  if(iconEl && s.icon) iconEl.src = s.icon;
  document.documentElement.style.setProperty('--accent', s.color || '#c81010');
  if(inputTitle) inputTitle.value = s.title;
  if(inputTarget) inputTarget.value = s.target;
  if(inputCurrent) inputCurrent.value = s.current;
  if(inputCurrency) inputCurrency.value = s.currency;
  if(inputColor) inputColor.value = s.color;
}

function animateProgress(newCurrent, newTarget, duration = 900){
  const fromPct = clamp(Math.round((Number(state.current)/Number(state.target))*100));
  const toPct = clamp(Math.round((newCurrent/newTarget)*100));
  const t0 = performance.now();
  function frame(now){
    const t = clamp((now - t0)/duration, 0, 1);
    const e = easeOutCubic(t);
    const pct = fromPct + (toPct - fromPct) * e;
    barInner.style.transform = `scaleX(${pct/100})`;
    const curVal = Math.round(state.current + (newCurrent - state.current)*e);
    const tgtVal = Math.round(state.target + (newTarget - state.target)*e);
    currentLabel.textContent = (state.currency||'₹') + formatINR(curVal);
    targetLabel.textContent = (state.currency||'₹') + formatINR(tgtVal);
    if(percentLabel) percentLabel.textContent = state.showPercent ? ` (${Math.round(pct)}%)` : '';
    if(t<1) requestAnimationFrame(frame); else { state.current=newCurrent; state.target=newTarget; }
  }
  requestAnimationFrame(frame);
}

// Firebase sync
db.ref("donationGoal").on("value", snap=>{
  if(snap.exists()){
    state = snap.val();
    updateStaticUI(state);
    animateProgress(state.current, state.target, 900);
  }
});

if(btnSave) btnSave.addEventListener('click', ()=>{
  state.title = inputTitle.value;
  state.target = Number(inputTarget.value)||0;
  state.current = Number(inputCurrent.value)||0;
  state.currency = inputCurrency.value||'₹';
  state.color = inputColor.value||'#c81010';
  db.ref("donationGoal").set(state);
  updateStaticUI(state);
  animateProgress(state.current, state.target, 900);
});
if(btnReset) btnReset.addEventListener('click', ()=>{
  state = { title:'Donation Goal', target:100000, current:0, currency:'₹', color:'#c81010', icon:'Currency_Icon.png', showPercent:true };
  db.ref("donationGoal").set(state);
  updateStaticUI(state);
  animateProgress(state.current, state.target, 900);
});
