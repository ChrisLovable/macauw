/* Macauw Olympic Skeet learning scorecard. No scoring changes. */
(()=>{'use strict';
const S=[[1,'H'],[1,'H','L'],[2,'H'],[2,'H','L'],[3,'H'],[3,'H','L'],[4,'H'],[4,'L'],[5,'L'],[5,'L','H'],[6,'L'],[6,'L','H'],[7,'L','H'],[4,'H','L'],[4,'L','H'],[8,'H'],[8,'L']];
const slots=S.flatMap((w,wi)=>w.slice(1).map((house,hi)=>({station:w[0],house,wi,hi,status:'pending'})));
let results=slots.map(x=>({...x})), lastMode='',lastDone=0,seenActive=false, lastWave=-1,collapsed=false,lastRefresh='';
const $=(id)=>document.getElementById(id);
function build(){if($('macauwOlympicEdu'))return;
const p=document.createElement('aside');p.id='macauwOlympicEdu';p.className='macauw-olympic-edu';p.setAttribute('aria-label','Olympic skeet stations and scorecard');
p.innerHTML=`<header class="moe-head"><div><div class="moe-kicker">ISSF · OLYMPIC SKEET</div><strong>STATION SCORECARD</strong></div><button id="moeToggle" type="button" title="Collapse / expand" aria-label="Collapse scorecard">−</button></header><div class="moe-content"><div class="moe-map-title"><b>8 STATIONS</b><span>HIGH / LOW HOUSES</span></div>
<svg class="moe-field" viewBox="0 0 282 177" role="img" aria-label="Skeet range: stations 1 through 7 on the arc, station 8 centered on the base chord, high house left and low house right">
<defs><linearGradient id="moeArc" x1="0" x2="1"><stop stop-color="#e4a24d"/><stop offset="1" stop-color="#ffdba0"/></linearGradient></defs>
<path d="M30 137 Q141 -88 252 137" fill="none" stroke="url(#moeArc)" stroke-width="2.5" stroke-dasharray="5 4"/>
<path d="M30 137 L252 137" stroke="#8296a6" stroke-width="1.5" stroke-dasharray="5 5"/>
<path d="M30 137 L252 137" stroke="#9dc6e2" stroke-width="2" opacity=".2"/>
<path d="M30 137 Q85 95 141 111 Q196 95 252 137" stroke="#8ad8ff" stroke-width="1" stroke-dasharray="4 5" fill="none" opacity=".65"/>
<g id="moeNodes"></g><rect x="3" y="130" width="26" height="23" rx="5" fill="#1e5480" stroke="#80bbf1"/><text x="16" y="146" font-size="9" font-weight="800" fill="white" text-anchor="middle">H</text>
<rect x="253" y="130" width="26" height="23" rx="5" fill="#6b4630" stroke="#efb06b"/><text x="266" y="146" font-size="9" font-weight="800" fill="white" text-anchor="middle">L</text>
<text x="35" y="168" font-size="9" fill="#9fc9e6">HIGH / HOOG</text><text x="250" y="168" text-anchor="end" font-size="9" fill="#ffd3a0">LOW / LAAG</text>
</svg>
<div class="moe-status"><span id="moeStation">STATION 1</span><strong id="moeScore">0 / 25</strong></div><div class="moe-key"><span><i class="moe-good"></i> HIT / RAAK</span><span><i class="moe-bad"></i> MISS / MIS</span><span><i class="moe-wait"></i> NEXT</span></div>
<div class="moe-rows" id="moeRows"></div><p class="moe-note">H = High house · L = Low house. Targets shown in shooting order. A missed or timed-out target counts as a miss.</p></div>`;
document.body.appendChild(p);
const nodes=$('moeNodes'); // Semicircle: 1 at left house, 4 at top, 7 at right house, 8 on chord midpoint.
const positions=[[30,137],[43,89],[83,46],[141,27],[199,46],[239,89],[252,137],[141,137]];
nodes.innerHTML=positions.map(([x,y],i)=>`<g data-station="${i+1}" class="moe-node"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y+3.5}" text-anchor="middle">${i+1}</text></g>`).join('');
$('moeToggle').addEventListener('click',()=>{collapsed=!collapsed;p.classList.toggle('moe-collapsed',collapsed);$('moeToggle').textContent=collapsed?'+':'−';$('moeToggle').setAttribute('aria-label',collapsed?'Expand scorecard':'Collapse scorecard');});
}
function reset(){results=slots.map(x=>({...x}));lastDone=0;lastWave=-1;render(true)}
function record(wi,hi,hit){const i=slots.findIndex(s=>s.wi===wi&&s.hi===hi);if(i<0||results[i].status!=='pending')return;results[i].status=hit?'hit':'miss';render(true)}
function render(force=false){const s=window.__ECLAY_TEST__?.getState?.();if(!s)return;const p=$('macauwOlympicEdu');if(!p)return;
const visible=s.mode==='olympic'&&(s.active||s.paused||s.ended);p.classList.toggle('moe-visible',!!visible);if(!visible)return;
const station=s.currentWave?.station||8;const completed=results.filter(r=>r.status!=='pending').length;const got=results.filter(r=>r.status==='hit').length;
const sig=[station,completed,got,s.olympicDone,s.ended,s.paused].join(':');if(!force&&sig===lastRefresh)return;lastRefresh=sig;
$('moeStation').textContent=(s.ended?'ROUND COMPLETE / RONDE KLAAR':'STATION / STASIE '+station);$('moeScore').textContent=got+' / 25';
document.querySelectorAll('.moe-node').forEach(n=>n.classList.toggle('selected',+n.dataset.station===station&&!s.ended));
const rows=Array.from({length:8},(_,i)=>{const r=results.filter(x=>x.station===i+1),hit=r.filter(x=>x.status==='hit').length,done=r.filter(x=>x.status!=='pending').length;
return `<div class="moe-row ${station===i+1&&!s.ended?'now':''}"><div class="moe-row-head"><b>ST ${i+1}</b><small>${hit}/${r.length}</small></div><div class="moe-chips">${r.map(x=>`<span class="moe-chip ${x.status}" title="${x.house==='H'?'High':'Low'} house · ${x.status}">${x.house}<em>${x.status==='hit'?'✓':x.status==='miss'?'×':'·'}</em></span>`).join('')}</div></div>`}).join('');$('moeRows').innerHTML=rows;
}
window.addEventListener('macauw:olympic-target',e=>{const d=e.detail||{};record(+d.waveIndex,+d.targetIndex,!!d.hit)});
window.addEventListener('macauw:olympic-skip',e=>{const d=e.detail||{};const w=S[+d.waveIndex];if(!w)return;w.slice(1).forEach((_,i)=>record(+d.waveIndex,i,false))});
function tick(){const s=window.__ECLAY_TEST__?.getState?.();if(s){if(s.mode==='olympic'){
// Starting a new round always resets the 25-target teaching card.
if(s.active&&!seenActive&&s.olympicDone===0)reset();
// Safely show skipped targets as misses even if an event was missed at startup.
if(s.olympicDone>lastDone){for(let i=lastDone;i<Math.min(s.olympicDone,25);i++)if(results[i].status==='pending')results[i].status='miss';lastDone=s.olympicDone;}
seenActive=!!s.active;lastMode='olympic';
}else{seenActive=false;if(lastMode==='olympic')lastMode=s.mode;}
render();}requestAnimationFrame(tick)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{build();tick()},{once:true});else{build();tick()}
})();
