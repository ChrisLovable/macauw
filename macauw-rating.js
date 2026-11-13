/* Macauw menu rating extension. No game/leaderboard modifications. */
(() => {
  'use strict';
  const menu = document.querySelector('#intro .welcome-settings');
  if (!menu || document.getElementById('macauw-game-rating')) return;
  const cfg = window.MACAUW_SUPABASE || {};
  const ready = /^https:\/\/[^/]+\.supabase\.co\/?$/.test(cfg.url || '') &&
    typeof cfg.publishableKey === 'string' && cfg.publishableKey.length > 20 &&
    !cfg.publishableKey.includes('PASTE_');
  const api = (cfg.url || '').replace(/\/$/, '');
  const css = document.createElement('style');
  css.id='macauw-rating-style';
  css.textContent = `
    #macauw-game-rating{box-sizing:border-box;width:100%;margin-top:10px;padding:12px 14px;border:1px solid #b68b48;border-radius:12px;background:linear-gradient(135deg,#1c3547,#142734);color:#fff;font-family:system-ui,sans-serif;text-align:center}
    #macauw-game-rating .mr-title{font-weight:900;letter-spacing:.05em;font-size:clamp(12px,1.8vw,15px)}
    #macauw-game-rating .mr-stars{display:flex;align-items:center;justify-content:center;gap:6px;margin:5px 0}
    #macauw-game-rating .mr-star{border:0;box-shadow:none;background:transparent;color:#73818c;font-size:clamp(25px,4vw,35px);line-height:1.2;padding:2px;min-width:32px;cursor:pointer;touch-action:manipulation}
    #macauw-game-rating .mr-star.selected{color:#ffc94a;text-shadow:0 1px 8px #a8691b88}
    #macauw-game-rating .mr-star:focus-visible{outline:2px solid #fff;border-radius:5px}
    #macauw-game-rating .mr-submit{border:1px solid #e7b85b;border-radius:9px;background:#9a651e;color:#fff;font-size:13px;font-weight:850;min-height:35px;padding:6px 16px;cursor:pointer}
    #macauw-game-rating .mr-submit:disabled{opacity:.5;cursor:default}
    #macauw-game-rating .mr-summary,#macauw-game-rating .mr-status{font-size:12px;line-height:1.4;margin:5px 0;color:#c9d8df}
    #macauw-game-rating .mr-status{min-height:17px;color:#ffe5a4}
  `;
  document.head.appendChild(css);
  const card = document.createElement('section');
  card.id='macauw-game-rating';
  card.setAttribute('aria-label','Rate this game');
  card.innerHTML = `<div class="mr-title">GRADEER HIERDIE SPEL · RATE THIS GAME</div><div class="mr-stars" role="group" aria-label="Choose a rating from 1 to 5 stars"></div><button type="button" class="mr-submit" disabled>STUUR GRADERING / SUBMIT RATING</button><div class="mr-summary">Laai gemiddelde gradering...</div><div class="mr-status" role="status" aria-live="polite"></div>`;
  menu.appendChild(card);
  const stars=card.querySelector('.mr-stars');
  const submit=card.querySelector('.mr-submit');
  const summary=card.querySelector('.mr-summary');
  const status=card.querySelector('.mr-status');
  let rating=0;
  for(let i=1;i<=5;i++){
    const b=document.createElement('button');
    b.type='button';b.className='mr-star';b.textContent='★';b.dataset.value=String(i);
    b.setAttribute('aria-label',`${i} star${i===1?'':'s'}`);
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{
      rating=i;status.textContent='';submit.disabled=false;
      stars.querySelectorAll('button').forEach(x=>{
        const selected=Number(x.dataset.value)<=rating;
        x.classList.toggle('selected',selected);
        x.setAttribute('aria-pressed',String(Number(x.dataset.value)===rating));
      });
    });
    stars.appendChild(b);
  }
  function token(){
    const key='macauw-player-token-v1';
    try{
      let v=localStorage.getItem(key);
      if(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))return v;
      v=crypto.randomUUID();localStorage.setItem(key,v);return v;
    }catch(e){throw new Error('Browser storage is required to rate the game.');}
  }
  async function rpc(name,body){
    if(!ready)throw new Error('Supabase configuration is unavailable.');
    const h={'apikey':cfg.publishableKey};
    if(!cfg.publishableKey.startsWith('sb_publishable_'))h.Authorization='Bearer '+cfg.publishableKey;
    h['Content-Type']='application/json';
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const res=await fetch(`${api}/rest/v1/rpc/${name}`,{method:'POST',headers:h,body:body===undefined?'{}':JSON.stringify(body),signal:controller.signal});
      const data=await res.json().catch(()=>null);
      if(!res.ok)throw new Error(data?.message||data?.hint||`Database error ${res.status}`);
      return data;
    }finally{clearTimeout(timer);}
  }
  async function refresh(){
    try{
      const result=await rpc('get_macauw_game_rating');
      const r=Array.isArray(result)?result[0]:result;
      const count=Number(r?.total_ratings||0);
      const average=Number(r?.average_rating||0);
      status.textContent='';
      summary.textContent=count ? `★ ${average.toFixed(2)} / 5 · ${count} ${count===1?'gradering':'graderings'}` : 'Nog geen graderings nie · Be the first to rate';
    }catch(e){summary.textContent='Gemiddelde gradering nie beskikbaar nie.';status.textContent=e.message;}
  }
  submit.addEventListener('click',async()=>{
    if(!rating||submit.disabled)return;
    submit.disabled=true;status.textContent='Stoor gradering...';
    try{
      await rpc('submit_macauw_game_rating',{p_player_token:token(),p_rating:rating});
      status.textContent='Dankie! Jou gradering is gestoor. / Thank you!';
      await refresh();
    }catch(e){status.textContent='Kon nie stoor nie: '+e.message;}
    finally{submit.disabled=false;}
  });
  refresh();
})();
