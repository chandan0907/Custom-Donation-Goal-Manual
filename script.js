// script.js - robust animated fill using transform: scaleX

// Helpers
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

// DOM refs
const barInner = document.getElementById('barInner');
const currentLabel = document.getElementById('currentLabel');
const targetLabel = document.getElementById('targetLabel');
const percentLabel = document.getElementById('percentLabel');
const titleEl = document.getElementById('goalTitle');
const subtitleEl = document.getElementById('goalSubtitle');
const iconEl = document.getElementById('goalIcon');

const editor = document.getElementById('editor');
const inputTitle = document.getElementById('inputTitle');
const inputSubtitle = document.getElementById('inputSubtitle');
const inputTarget = document.getElementById('inputTarget');
const inputCurrent = document.getElementById('inputCurrent');
const inputCurrency = document.getElementById('inputCurrency');
const inputColor = document.getElementById('inputColor');
const inputIcon = document.getElementById('inputIcon');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');

if(new URLSearchParams(location.search).get('embed') === '1' && editor) editor.style.display = 'none';

// State
const STORAGE_KEY = 'donation_goal_transform_v1';
function loadState(){ try{ const r = localStorage.getItem(STORAGE_KEY); if(r) return JSON.parse(r);}catch(e){} return { title:'Donation Goal', subtitle:"Help reach this month's target", target:100000, current:0, currency:'₹', color:'#c81010', icon:'Currency_Icon.png', showPercent:true }; }
function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

// Static UI update
function updateStaticUI(s){
  if(titleEl) titleEl.textContent = s.title || '';
  if(subtitleEl) subtitleEl.textContent = s.subtitle || '';
  if(iconEl && s.icon) iconEl.src = s.icon;
  document.documentElement.style.setProperty('--accent', s.color || '#c81010');
  if(inputTitle) inputTitle.value = s.title || '';
  if(inputSubtitle) inputSubtitle.value = s.subtitle || '';
  if(inputTarget) inputTarget.value = s.target || '';
  if(inputCurrent) inputCurrent.value = s.current || '';
  if(inputCurrency) inputCurrency.value = s.currency || '₹';
  if(inputColor) inputColor.value = s.color || '#c81010';
}

// Animation using scaleX
let raf = null;
function animateProgress(newCurrent, newTarget, duration = 900){
  const storedCur = Number(state.current) || 0;
  const storedTgt = Number(state.target) || 1;
  const fromPct = clamp(Math.round((storedCur/(storedTgt||1))*100));
  const toPct = clamp(Math.round((Number(newCurrent)/(Number(newTarget)||1))*100));

  if(!barInner || !currentLabel || !targetLabel) return;

  // ensure shine element
  let shine = barInner.querySelector('.shine');
  if(!shine){
    shine = document.createElement('div'); shine.className = 'shine';
    Object.assign(shine.style,{position:'absolute',top:'-40%',left:'-40%',width:'40%',height:'180%',transform:'skewX(-20deg)',pointerEvents:'none',opacity:'0'});
    barInner.appendChild(shine);
  }

  const t0 = performance.now();
  const sCur = storedCur, eCur = Number(newCurrent);
  const sTgt = storedTgt, eTgt = Number(newTarget);

  cancelAnimationFrame(raf);
  shine.style.opacity = '1';

  function frame(now){
    const t = clamp((now - t0)/duration, 0, 1);
    const e = easeOutCubic(t);
    const pct = fromPct + (toPct - fromPct) * e;

    // apply transform
    barInner.style.transform = `scaleX(${pct/100})`;

    // labels
    const curVal = Math.round(sCur + (eCur - sCur)*e);
    const tgtVal = Math.round(sTgt + (eTgt - sTgt)*e);
    currentLabel.textContent = (state.currency||'₹') + formatINR(curVal);
    targetLabel.textContent = (state.currency||'₹') + formatINR(tgtVal);
    if(percentLabel) percentLabel.textContent = state.showPercent ? ` (${Math.round(pct)}%)` : '';

    // shimmer
    shine.style.left = (-40 + 140*e) + '%';

    if(t < 1) raf = requestAnimationFrame(frame);
    else {
      shine.style.opacity = '0';
      state.current = eCur; state.target = eTgt;
      saveState(state);
      updateStaticUI(state);
      cancelAnimationFrame(raf);
    }
  }

  raf = requestAnimationFrame(frame);
}
window.animateProgress = animateProgress;

// Init
let state = loadState();
updateStaticUI(state);

// Set initial visual fill instantly (no animation) to match stored values
(function setInitial(){
  const pct = clamp(Math.round((Number(state.current)||(0))/(Number(state.target)||(1))*100));
  if(barInner) barInner.style.transform = `scaleX(${pct/100})`;
  if(currentLabel) currentLabel.textContent = (state.currency||'₹') + formatINR(Number(state.current)||0);
  if(targetLabel) targetLabel.textContent = (state.currency||'₹') + formatINR(Number(state.target)||0);
  if(percentLabel) percentLabel.textContent = state.showPercent ? ` (${pct}%)` : '';
})();

// Editor bindings
if(btnSave) btnSave.addEventListener('click', ()=>{
  state.title = inputTitle.value;
  state.subtitle = inputSubtitle ? inputSubtitle.value : state.subtitle;
  state.target = Number(inputTarget.value) || 0;
  state.current = Number(inputCurrent.value) || 0;
  state.currency = inputCurrency.value || '₹';
  state.color = inputColor.value || '#c81010';
  saveState(state);
  updateStaticUI(state);
  animateProgress(state.current, state.target, 900);
});
if(btnReset) btnReset.addEventListener('click', ()=>{
  if(!confirm('Reset to defaults?')) return;
  state = { title:'Donation Goal', subtitle:"Help reach this month's target", target:100000, current:0, currency:'₹', color:'#c81010', icon:'Currency_Icon.png', showPercent:true };
  saveState(state); updateStaticUI(state); animateProgress(state.current, state.target, 600);
});
if(inputIcon) inputIcon.addEventListener('change', e=>{
  const f = e.target.files && e.target.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = ()=>{ state.icon = r.result; saveState(state); if(iconEl) iconEl.src = state.icon; }; r.readAsDataURL(f);
});
if(inputCurrent) inputCurrent.addEventListener('input', ()=> { const v = Number(inputCurrent.value)||0; currentLabel.textContent = (state.currency||'₹') + formatINR(v); });
if(inputTarget) inputTarget.addEventListener('input', ()=> { const v = Number(inputTarget.value)||1; targetLabel.textContent = (state.currency||'₹') + formatINR(v); });
if(inputCurrency) inputCurrency.addEventListener('input', ()=> { const s = inputCurrency.value||'₹'; currentLabel.textContent = s + formatINR(Number(inputCurrent?inputCurrent.value:state.current)||0); targetLabel.textContent = s + formatINR(Number(inputTarget?inputTarget.value:state.target)||0); });
if(inputColor) inputColor.addEventListener('input', ()=> document.documentElement.style.setProperty('--accent', inputColor.value||'#c81010'));
if(btnExport) btnExport.addEventListener('click', ()=>{ const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='donation-goal.json'; a.click(); URL.revokeObjectURL(url); });
if(btnImport) btnImport.addEventListener('click', ()=>{ const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json'; inp.onchange=(ev)=>{ const f=ev.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const imp=JSON.parse(r.result); state = Object.assign({}, state, imp); saveState(state); updateStaticUI(state); animateProgress(state.current, state.target, 800); }catch(e){ alert('Invalid JSON') } }; r.readAsText(f); }; inp.click(); });

// Persist and postMessage
window.addEventListener('beforeunload', ()=> saveState(state));
window.addEventListener('message', e=>{
  try{
    const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if(msg && msg.action === 'update' && msg.payload){ state = Object.assign({}, state, msg.payload); saveState(state); updateStaticUI(state); animateProgress(state.current, state.target, 700); }
  }catch(err){}
});
