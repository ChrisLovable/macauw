(() => {
  'use strict';

  const W=1600,H=900,roundDuration=60;
  const canvas=document.getElementById('field');
  const ctx=canvas.getContext('2d',{alpha:false});
  const $=id=>document.getElementById(id);
  const bg=new Image();
  bg.src='/assets/range.jpg';
  const wetlandBg=new Image();wetlandBg.src='/assets/wetland.jpg';
  const veldBg=new Image();veldBg.src='/assets/hare-green-field.png';
  const koedoeBg=new Image();koedoeBg.src='/assets/kudu-open-veld.png';
  const biltongImage=new Image();biltongImage.src='/assets/biltong-flash.webp';
  // V16: separate static acacia-veld background for KOEDOE mode.

  // V8: animated birds only. Old static field-bird and pigeon artwork removed.
  // Missing animation frames are not replaced with stationary photographs.
  // V19: ORIGINAL unmodified MP4. Do NOT create an animated WebP or frame atlas.
  // The HTMLVideoElement decodes the real 30 fps, 154-frame clip. An offscreen
  // canvas removes only its white backdrop to composite it over the veld.
  // Frame timing is owned by the browser video decoder, NEVER by a manual frame counter.
  const KUDU_VIDEO_W=768, KUDU_VIDEO_H=512;
  const kuduVideo=document.createElement('video');
  kuduVideo.src='/assets/kudu-original-source.mp4';
  kuduVideo.preload='auto';kuduVideo.muted=true;kuduVideo.defaultMuted=true;
  kuduVideo.playsInline=true;kuduVideo.loop=true;kuduVideo.playbackRate=2;
  kuduVideo.setAttribute('playsinline','');
  kuduVideo.setAttribute('webkit-playsinline','');
  // Display is hidden only; the browser still decodes the unmodified source.
  kuduVideo.style.cssText='position:fixed;left:-2000px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(kuduVideo);
  const kuduKeyCanvas=document.createElement('canvas');
  kuduKeyCanvas.width=KUDU_VIDEO_W;kuduKeyCanvas.height=KUDU_VIDEO_H;
  const kuduKeyCtx=kuduKeyCanvas.getContext('2d',{willReadFrequently:true});
  let kuduVideoFrames=0,kuduLastPresented=-1,kuduVideoError='';
  function updateKuduVideoFrame(){
    if(kuduVideo.readyState<2 || kuduVideo.videoWidth===0)return;
    try{
      kuduKeyCtx.drawImage(kuduVideo,0,0,KUDU_VIDEO_W,KUDU_VIDEO_H);
      const pixels=kuduKeyCtx.getImageData(0,0,KUDU_VIDEO_W,KUDU_VIDEO_H);
      const d=pixels.data;
      for(let i=0;i<d.length;i+=4){
        // Original MP4 uses an almost pure white background. Remove WHITE only.
        // Do not change animal position, stride, frame order, or playback speed.
        const light=Math.min(d[i],d[i+1],d[i+2]);
        if(light>=250){d[i+3]=0;}
        else if(light>237){d[i+3]=Math.round((250-light)*255/13);}
      }
      kuduKeyCtx.putImageData(pixels,0,0);
      kuduVideoFrames++;
      kuduLastPresented=kuduVideo.currentTime;
    }catch(err){kuduVideoError=String(err);}
  }
  if(typeof kuduVideo.requestVideoFrameCallback==='function'){
    const nextVideoFrame=()=>kuduVideo.requestVideoFrameCallback(()=>{
      updateKuduVideoFrame();nextVideoFrame();
    });
    nextVideoFrame();
  }
  function ensureKuduVideo(){
    if(mode!=='koedoe'||!active||paused)return;
    if(kuduVideo.paused){
      const task=kuduVideo.play();
      if(task&&task.catch)task.catch(err=>{kuduVideoError='Playback: '+String(err);});
    }
  }
  kuduVideo.addEventListener('error',()=>{kuduVideoError='Video: '+(kuduVideo.error?.message||'unknown error');});
  kuduVideo.addEventListener('loadeddata',()=>{updateKuduVideoFrame();draw();});
  const HARE_FRAME=400;
  const hareAtlas=new Image();
  hareAtlas.src='/assets/hare-running-8frame.webp';
  let hareAlpha=null;
  hareAtlas.onload=()=>{
    try{
      const maskCanvas=document.createElement('canvas');
      maskCanvas.width=hareAtlas.naturalWidth;
      maskCanvas.height=hareAtlas.naturalHeight;
      const mctx=maskCanvas.getContext('2d',{willReadFrequently:true});
      mctx.drawImage(hareAtlas,0,0);
      hareAlpha=mctx.getImageData(0,0,maskCanvas.width,maskCanvas.height).data;
    }catch(_){hareAlpha=null;}
    draw();
  };
  // Ducks and geese retain existing 8-frame wingbeat atlases.
  // Rotsduif uses ALL original 20 GIF frames at native 60ms/frame, with transparent background.
  const WING_FRAME=360;
  const wingAtlases={
    EEND:{image:new Image(),frames:8,columns:4,fps:5.1},
    GANS:{image:new Image(),frames:8,columns:4,fps:3.25},
    // All 20 UNALTERED frames from the user's transparent GIF. 60 ms each.
    ROTSDUIF:{image:new Image(),frames:20,columns:5,frameSize:281,frameDurationMs:30,fps:1000/30}
  };
  wingAtlases.EEND.image.src='/assets/bird-mallard-wingbeat.webp';
  wingAtlases.GANS.image.src='/assets/bird-goose-wingbeat.webp';
  wingAtlases.ROTSDUIF.image.src='/assets/bird-rotsduif-exact-20frames.png';
  for(const atlas of Object.values(wingAtlases)) atlas.image.onload=()=>draw();



  let mode='skeet',active=false,paused=false,ended=false;
  let score=0,hits=0,shots=0,escaped=0,streak=0,ammo=2,reloading=false;
  let level=1,time=60,elapsed=0, nextLaunch=.6, reloadTimer=0, gameId=0;
  let last=0, raf=0, clays=[],shards=[],flashes=[],queued=[], bubbles=[];
  let biltongBursts=[];
  let hare=null, hareNext=1.4, harePasses=0;
  let fallenHares=[];
  let audioEnabled=true,audioCtx=null;
  let vibrationEnabled=true;
  let best=0, lastPopup=0, popupEnd=0, pointer={x:800,y:425};
  // ISSF 2026 Skeet qualification: 25 targets, one shot per clay.
  // A separate, untimed, station-based round; not the arcade's 60-second game.
  const olympicWaves=[
    [1,'H'],[1,'H','L'],[2,'H'],[2,'H','L'],[3,'H'],[3,'H','L'],
    [4,'H'],[4,'L'],[5,'L'],[5,'L','H'],[6,'L'],[6,'L','H'],
    [7,'L','H'],[4,'H','L'],[4,'L','H'],[8,'H'],[8,'L']
  ].map(w=>({station:w[0],houses:w.slice(1)}));
  let waveIndex=0,olympicState='ready',olympicDone=0,olympicCurrentTarget=0;
  let releaseDelay=0,stationClock=30;
  const arcadeLabels={skeet:'SKEET · DWARSVLUGTE',trap:'TRAP · WEGVLUGTE',olympic:'OLIMPIESE SKEET · ISSF 2026',waterfowl:'VOËLS & WATERVOËLS · ARCADE',hares:'HASE · OOP VELD',koedoe:'KOEDOE · KILSONE'};
  const modeDescriptions={
    skeet:'60 sekondes. Vyf al hoe moeiliker vlakke van dwarsvlieënde kleiduiwe.',
    trap:'60 sekondes. Wegvlieënde kleiduiwe word vinniger en kleiner.',
    olympic:'25 teikens op 8 stasies volgens die ISSF 2026-kwalifikasievolgorde. Een skoot per teiken; roep die teikens self.',
    waterfowl:'60 sekondes. Bewegende eende, ganse en Afrika-rotsduiwe oor ’n dam. Vyf moeiliker vlakke.',
    hares:'60 sekondes. Hardlopende hase in oop veld. Vinniger en verder hase tel meer punte. Vyf moeiliker vlakke.',
    koedoe:'60 sekondes. Jou oorspronklike 154-raam koedoevideo, met natuurlike galop. Net kilsone-skote tel. 100 kg of meer per koedoe; biltong verskyn vir 0,5 sekondes op die teiken se plek.'
  };
  const rand=(a,b)=>a+(b-a)*Math.random();
  const limit=(n,a,b)=>Math.min(b,Math.max(a,n));
  const stageLabels=['OPWARMING','MEER SPOED','DUBBELTEIKENS','VINNIGE VLUGTE','EINDSPRINT'];
  const seen=new Set();
  function loadBest(){try{return Number(localStorage.getItem('macauw-eclay-best-'+mode)||((mode==='skeet')?localStorage.getItem('macauw-eclay-best'):0)||0)||0}catch(_){return 0}}
  best=loadBest();

  const ui={
    timer:$('timer'),score:$('score'),scoreLabel:$('scoreLabel'),hits:$('hits'),accuracy:$('accuracy'),shots:$('shots'),
    level:$('level'),levelText:$('levelText'),bar:$('difficultyFill'),
    intro:$('intro'),title:$('heading'),desc:$('description'),
    btnStart:$('start'),pause:$('pause'),
    toast:$('toast'),badge:$('modeBadge')
  };

  const initAudio=()=>{
    if(!audioEnabled)return;
    try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    }catch(_){}
  };
  function sound(frequency=420,duration=.10,shape='sine',volume=.045,delay=0){
    if(!audioEnabled)return;
    try{initAudio(); if(!audioCtx)return;
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      const t=audioCtx.currentTime+delay;
      o.type=shape;o.frequency.setValueAtTime(frequency,t);
      o.frequency.exponentialRampToValueAtTime(Math.max(45,frequency*.48),t+duration);
      g.gain.setValueAtTime(Math.max(.0001,volume),t);
      g.gain.exponentialRampToValueAtTime(.0001,t+duration);
      o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.01);
    }catch(_){}
  }
  // Layered, non-tonal shotgun report. Use a sample rather than the earlier oscillator beep.
  const shotPlayers = Array.from({length:4},()=> {
    const a=new Audio('/assets/shotgun-report.wav');
    a.preload='auto';a.volume=.85;
    return a;
  });
  let shotIndex=0;
  function sfxShoot(){
    if(!audioEnabled)return;
    const audio=shotPlayers[shotIndex++%shotPlayers.length];
    try{audio.pause();audio.currentTime=0;audio.play().catch(()=>{});}catch(_){}
  }
  function announce(s,duration=.6){ui.toast.textContent=s;ui.toast.classList.add('show');popupEnd=performance.now()+duration*1000;}

  function formatScore(value=score,currentMode=mode){
    if(currentMode==='koedoe')return Number(value||0).toLocaleString('af-ZA',{minimumFractionDigits:1,maximumFractionDigits:1});
    return Math.round(Number(value||0)).toLocaleString('af-ZA');
  }

  function currentWave(){return olympicWaves[waveIndex]||null}
  function refreshOlympicPanel(){
    const wave=currentWave();
    const station=wave?.station||8;
    $('stationLabel').textContent='STASIE '+station;
    $('waveLabel').textContent=!wave?'RONDE KLAAR':(wave.houses.length===2?'DUBBEL':'ENKEL')+' · '+wave.houses.map(h=>h==='H'?'HOË':'LAE').join(' → ');
    $('stationClock').textContent=stationClock.toFixed(0)+' s · ROEPVENSTER';
    $('targetCount').textContent=olympicDone+' / 25';
    $('stationDots').innerHTML=Array.from({length:8},(_,i)=>'<span class="'+(station===i+1?'here':'')+'">'+(i+1)+'</span>').join('');
    const canCall=active&&!paused&&olympicState==='ready'&&!!wave;
    $('callTarget').classList.toggle('hidden',!canCall);
    $('callTarget').disabled=!canCall;
  }
  function setUi(){
    const olympic=mode==='olympic';
    ui.timer.textContent=olympic?String(Math.max(0,25-olympicDone)):time.toLocaleString('af-ZA',{minimumFractionDigits:1,maximumFractionDigits:1});
    $('timerLabel').textContent=olympic?'TEIKENS OOR':'TYD OOR';
    ui.score.textContent=formatScore(score);
    ui.scoreLabel.textContent=mode==='koedoe'?'KG BILTONG':'PUNTE';
    ui.hits.textContent=String(hits);
    ui.accuracy.textContent=shots?Math.round(hits/shots*100)+'%':'—';
    ui.shots.textContent=String(shots);
    ui.level.textContent=String(olympic?(currentWave()?.station||8):level);
    $('levelMax').textContent=olympic?'':'/5';
    $('difficultyPrefix').setAttribute('aria-label',olympic?'Huidige stasie':'Moeilikheidsvlak');
    ui.levelText.textContent=olympic?'ISSF · 25 TEIKENS':stageLabels[level-1];
    ui.bar.style.width=(olympic?(olympicDone/25*100):(elapsed/60*100)).toFixed(1)+'%';
    ui.badge.textContent=arcadeLabels[mode];
    $('olympicPanel').classList.toggle('hidden',!olympic||(!active&&!paused));
    $('callTarget').classList.toggle('hidden',!olympic||!active||paused||olympicState!=='ready');
    if(olympic)refreshOlympicPanel();
    ui.pause.textContent=paused?'▶':'Ⅱ';ui.pause.setAttribute('aria-label',paused?'Hervat die ronde':'Onderbreek die ronde');
  }

  function selectMode(newMode){
    if(active)return;
    mode=newMode;
    if(mode!=='koedoe')kuduVideo.pause();
    best=loadBest();
    document.querySelectorAll('[data-mode]').forEach(el=>{
      el.classList.toggle('active',el.dataset.mode===mode);
      el.setAttribute('aria-pressed',String(el.dataset.mode===mode));
    });
    $('arena').classList.toggle('wetlands',mode==='waterfowl');
    ui.badge.textContent=arcadeLabels[mode];
    ui.desc.textContent=modeDescriptions[mode];
    ui.btnStart.textContent=mode==='olympic'?'▶ BEGIN OLIMPIESE 25-TEIKEN-RONDE':'▶ BEGIN 60-SEKONDE-RONDE';
    setUi();draw();
  }
  document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{selectMode(el.dataset.mode);sound(480,.07)}));

  async function requestImmersive(){
    if(!matchMedia('(pointer:coarse)').matches)return;
    try{if(!document.fullscreenElement && $('arena').requestFullscreen) await $('arena').requestFullscreen({navigationUI:'hide'});}catch(_){}
    try{await screen.orientation?.lock?.('landscape');}catch(_){}
  }

  function startGame(){
    initAudio();
    // Start exact MP4 from the trusted tap so Android permits decoding.
    if(mode==='koedoe')kuduVideo.play().catch(err=>{kuduVideoError=String(err)});
    requestImmersive(); // start button is a trusted user gesture
    cancelAnimationFrame(raf);
    gameId++;
    active=true;ended=false;paused=false;elapsed=0;time=60;
    score=hits=shots=escaped=streak=0;
    ammo=2;reloading=false;reloadTimer=0;level=1;nextLaunch=.38;
    waveIndex=0;olympicState='ready';olympicDone=0;olympicCurrentTarget=0;releaseDelay=0;stationClock=30;
    clays=[];shards=[];flashes=[];queued=[];bubbles=[];fallenHares=[];biltongBursts=[];
    hare=null;hareNext=1.4;harePasses=0;
    pointer={x:800,y:405};
    ui.intro.classList.add('hidden');ui.pause.disabled=false;
    if(mode==='hares'){for(let lane=0;lane<HARE_DEPTHS.length;lane++)spawnHareTarget(lane,true);}
    announce(mode==='olympic'?'STASIE 1 · ROEP DIE TEIKEN':'GEREED · VUUR!',1);
    last=performance.now();
    setUi();raf=requestAnimationFrame(loop);
  }

  function endGame(){
    if(ended)return;
    active=false;ended=true;ui.pause.disabled=true;
    if(mode==='koedoe')kuduVideo.pause();
    if(score>best){best=score;try{localStorage.setItem('macauw-eclay-best-'+mode,String(best));}catch(_){}}
    sound(630,.14,'triangle',.07);sound(900,.2,'triangle',.06,.14);
    const olympic=mode==='olympic', bird=mode==='waterfowl', hareMode=mode==='hares', kuduMode=mode==='koedoe';
    ui.title.innerHTML=olympic?'OLIMPIESE <em>RONDE KLAAR</em>':'RONDE <em>KLAAR</em>';
    const result=olympic?
      '<b style="color:#ffcd75;font-size:1.6em">'+hits+' / 25 TREFFERS</b><br>'+escaped+' gemis · '+shots+' skote geneem · '+(shots?Math.round(hits/shots*100):0)+'% akkuraatheid':
      (kuduMode
        ? '<b style="color:#ffcd75;font-size:1.6em">'+formatScore(score,'koedoe')+' KG BILTONG</b><br>'+hits+' koedoes in die kilsone getref · '+(shots?Math.round(hits/shots*100):0)+'% akkuraatheid · '+escaped+' gemis'
        : '<b style="color:#ffcd75;font-size:1.6em">'+score.toLocaleString('af-ZA')+' PUNTE</b><br>'+hits+(bird?' voëls':hareMode?' hase':' kleiduiwe')+' getref · '+(shots?Math.round(hits/shots*100):0)+'% akkuraatheid · '+escaped+' gemis');
    ui.desc.innerHTML=result+'<br>'+((score===best && score>0)?'<b style="color:#8ce78a">NUWE PERSOONLIKE REKORD!</b>':(kuduMode?'Beste: '+formatScore(best,'koedoe')+' kg':'Beste: '+best.toLocaleString('af-ZA')));
    ui.btnStart.textContent=olympic?'↻ SPEEL WEER — 25 TEIKENS':'↻ SPEEL WEER — 60 SEKONDES';
    ui.intro.classList.add("hidden"); const oldPanel=document.getElementById("macauwResults");if(oldPanel)oldPanel.remove();const panel=document.createElement("div");panel.id="macauwResults";panel.style.cssText="position:absolute;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#061522ed;padding:15px;box-sizing:border-box;overflow:auto";const acc=shots?Math.round(hits/shots*100):0;const main=mode==="koedoe"?formatScore(score,mode)+" KG BILTONG":mode==="olympic"?hits+" / 25":formatScore(score)+" PUNTE";const names={skeet:"SKEET",trap:"TRAP",olympic:"OLIMPIESE SKEET",hares:"HASE",waterfowl:"WATERVOELS",koedoe:"KOEDOE"};panel.innerHTML=`<section style="font-family:system-ui;color:white;text-align:center;width:min(760px,96vw);max-height:95vh;overflow:auto;box-sizing:border-box;background:linear-gradient(145deg,#173b55,#071624);border:2px solid #42647c;border-radius:22px;padding:clamp(14px,3vw,30px);box-shadow:0 20px 70px #000b"><div style="letter-spacing:3px;color:#a9cbdc;font-size:12px">MACAUW - RONDTE VOLTOOI</div><h2 style="font-size:clamp(23px,4vw,40px);margin:12px 0">UITSTEKENDE POGING!</h2><div style="color:#ffcb76;font-weight:bold">${names[mode]}</div><div style="font-size:clamp(42px,8vw,82px);font-weight:900;color:#ffbe59;margin:12px 0">${main}</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${[["TREFFERS",hits],["SKOTE",shots],["AKKURAATHEID",acc+"%"]].map(x=>`<div style="background:#21465f;border-radius:12px;padding:12px 4px"><strong style="display:block;font-size:clamp(24px,4vw,38px)">${x[1]}</strong><small>${x[0]}</small></div>`).join("")}</div><p style="color:#c3d6e3">SKOTE GEMIS: ${Math.max(0,shots-hits)} &nbsp; | &nbsp; PERSOONLIKE BESTE: ${formatScore(best)}</p><div style="display:flex;gap:10px;margin-top:20px"><button id="resultsReplay" style="flex:1;padding:15px;background:#168a3c;border:0;border-radius:10px;color:white;font-size:17px;font-weight:900">SPEEL WEER</button><button id="resultsMenu" style="flex:1;padding:15px;background:#31516b;border:0;border-radius:10px;color:white;font-size:17px;font-weight:900">HOOFSKERM</button></div></section>`;$("arena").appendChild(panel);panel.querySelector("#resultsReplay").onclick=()=>{panel.remove();startGame();};panel.querySelector("#resultsMenu").onclick=()=>{panel.remove();ui.title.innerHTML="E-KLEIDUIF<br><em>UITDAGING</em>";ui.intro.classList.remove("hidden");selectMode(mode);};
    $('callTarget').classList.add('hidden');
    setUi();
  }

  function pauseGame(){
    if(!active)return;
    paused=!paused;last=performance.now();
    if(paused){if(mode==='koedoe')kuduVideo.pause();ui.toast.classList.remove('show');cancelAnimationFrame(raf);}
    else{if(mode==='koedoe')ensureKuduVideo();ui.toast.classList.remove('show');raf=requestAnimationFrame(loop);}
    setUi();
  }

  function scheduleReload(){
    if(reloading || !active || ammo===2)return;
    reloading=true;reloadTimer=.57;setUi();
  }
  function spawnClay(){
    if(mode==='waterfowl'){spawnBird();return;}
    if(mode==='hares'){spawnHareTarget();return;}
    if(mode==='koedoe'){spawnKuduTarget();return;}
    const n=level-1, k=Math.random(), r=rand(.84,1.13)*Math.max(30,49-n*4);
    let x,y,vx,vy,g,maxAge,scale;
    if(mode==='skeet'){
      const left=k<.5;
      x=left?-58:W+58;
      y=rand(415,580);
      vx=(left?1:-1)*rand(420+n*95,530+n*120);
      vy=rand(-250-n*48,-120-n*25);
      g=rand(210,290);
      maxAge=4.1;
      scale=1;
    }else{
      x=rand(580,1020);y=rand(790,850);
      vx=rand(-220-n*64,220+n*64);
      vy=rand(-620-n*68,-740-n*75);
      g=rand(440,510);
      maxAge=3.75;
      scale=.86;
    }
    clays.push({x,y,vx,vy,g,maxAge,age:0,r:r*scale,rot:rand(-.22,.22),vr:rand(-2.4,2.4),seed:rand(0,6),tilt:rand(-.4,.4)});
  }


  function spawnBird(){
    const n=level-1,left=Math.random()<.5;
    const species=['EEND','GANS','ROTSDUIF'][Math.floor(rand(0,3))];
    const r=(species==='GANS'?51:species==='EEND'?40:30)*rand(.85,1.17)*Math.max(.72,1-n*.045);
    const speed=rand(250+n*60,355+n*87)*(species==='ROTSDUIF'?1.25:1);
    // Approach or retreat gradually: apparent size changes in ONE direction, not in pulses.
    const depthStart=rand(.73,1.03);
    const depthEnd=limit(depthStart+rand(-.20,.34),.62,1.36);
    clays.push({kind:'bird',species,x:left?-120:W+120,y:rand(235,535),vx:(left?1:-1)*speed,
      vy:rand(-11,11),g:0,maxAge:6.3,age:0,r,rot:0,vr:0,seed:rand(0,7),tilt:0,
      wingHz:species==='GANS'?rand(2.7,3.5):species==='EEND'?rand(4.5,5.7):1000/60,
      depthStart,depthEnd,depth:depthStart});
  }

  // V11: ground position and physical size correspond to perspective.
  // The feet are at groundY, while sprite artwork lies ABOVE that baseline.
  // Each distance is tied to a visible lawn plane, not a random screen height.
  // Apparent horizontal motion slows strongly with depth: distant animals NEVER
  // sprint across the screen faster than foreground animals of the same speed.
  const HARE_DEPTHS=[
    {name:'NABY',scale:.49,groundY:855,move:1.00,points:1.0},
    {name:'NABY-MIDDEL',scale:.39,groundY:742,move:.78,points:1.15},
    {name:'MIDDEL',scale:.29,groundY:629,move:.63,points:1.3},
    {name:'MIDDEL-VER',scale:.22,groundY:516,move:.48,points:1.5},
    {name:'VER',scale:.155,groundY:403,move:.36,points:1.7}
  ];
  const HARE_SPEEDS=[
    {name:'STADIG',move:1.00,points:1.0,runFps:8.0},
    {name:'MEDIUM',move:1.17,points:1.25,runFps:9.0},
    {name:'VINNIG',move:1.38,points:1.5,runFps:10.5},
    {name:'BAIE VINNIG',move:1.60,points:2.0,runFps:12.0}
  ];
  // Bottom-most opaque fur/foot pixel in each source animation frame (400px high).
  // Align that pixel to the ground line so a jumping pose never floats above it.
  const HARE_FRAME_BOTTOM=[350,362,358,327,327,349,351,346];
  function hareFrameBottom(f){return HARE_FRAME_BOTTOM[f%8];}
  function hareSpriteTop(c,frame){return -(hareFrameBottom(frame)/HARE_FRAME)*(290*c.scale);}
  function weightedPick(weights){
    const total=weights.reduce((a,b)=>a+b,0);
    let draw=Math.random()*total;
    for(let i=0;i<weights.length;i++)if((draw-=weights[i])<0)return i;
    return weights.length-1;
  }
  function hareFrame(c){return Math.floor((c.age*(c.runHz||8.2)+c.seed)%8);}
  function spawnHareTarget(forcedLane=null,initial=false){
    const n=level-1;
    // Never stack two live hares on the same one of five field lanes.
    const occupied=new Set(clays.filter(c=>c.kind==='hareTarget').map(c=>c.laneIndex));
    const distanceIndex=forcedLane===null?HARE_DEPTHS.findIndex((_,i)=>!occupied.has(i)):forcedLane;
    if(distanceIndex<0||distanceIndex>=HARE_DEPTHS.length||occupied.has(distanceIndex))return;
    const direction=initial?(distanceIndex%2===0?1:-1):(Math.random()<.5?1:-1);
    const speedIndex=[3,3,2,1,0][distanceIndex]; // Fixed speed per row: fastest near, slowest far.
    const sp=HARE_SPEEDS[speedIndex],dist=HARE_DEPTHS[distanceIndex];
    // 2x horizontal speed AND 2x stride rate; 2x sprite dimensions and hit area.
    const runSpeed=2*(205+18*n)*sp.move*dist.move;
    const points=[500,400,300,200,100][distanceIndex]; // Higher speed = higher score.
    const scale=2*dist.scale*rand(.96,1.04);
    const padding=185*scale;
    // Place one hare in each lane immediately when a Hare round begins.
    const entryX=initial?W*(.16+.17*distanceIndex):(direction>0?W*.12:W*.88);
    clays.push({kind:'hareTarget',species:'HARE',laneIndex:distanceIndex,
      x:entryX,y:dist.groundY,
      vx:direction*runSpeed,vy:0,g:0,maxAge:26,age:0,r:65*scale,
      rot:0,vr:0,seed:rand(0,7),tilt:0,scale,direction,
      runHz:2*sp.runFps,speedLabel:sp.name,distanceLabel:dist.name,pointValue:points});
  }
  // Translate a shot into the actual visible 400x400 animation frame and
  // sample its alpha. This aligns hits with the drawn silhouette at every depth.
  function hitHare(c,shotX,shotY,touch){
    const w=290*c.scale,h=w,dir=c.vx>=0?1:-1;
    const localX=(shotX-c.x)*dir;
    const frame=hareFrame(c);
    const srcX=(localX+w/2)/w*HARE_FRAME;
    const srcY=(shotY-c.y-hareSpriteTop(c,frame))/h*HARE_FRAME;
    // Slight mobile tolerance around the visible outline, scaled with distance.
    const pxRadius=Math.min(44,Math.max(9,(touch?14:7)*HARE_FRAME/w));
    if(srcX< -pxRadius||srcX>=HARE_FRAME+pxRadius||srcY< -pxRadius||srcY>=HARE_FRAME+pxRadius)return false;
    if(hareAlpha){
      const offsets=[[0,0],[-1,0],[1,0],[0,-1],[0,1],[-.7,-.7],[.7,.7],[-.7,.7],[.7,-.7]];
      const atlasWidth=hareAtlas.naturalWidth;
      const frameX=(frame%4)*HARE_FRAME,frameY=Math.floor(frame/4)*HARE_FRAME;
      for(const [xx,yy] of offsets){
        const x=Math.floor(srcX+xx*pxRadius),y=Math.floor(srcY+yy*pxRadius);
        if(x<0||x>=HARE_FRAME||y<0||y>=HARE_FRAME)continue;
        const alpha=hareAlpha[((frameY+y)*atlasWidth+(frameX+x))*4+3];
        if(alpha>90)return true;
      }
      return false;
    }
    // Compatibility fallback on browsers restricting canvas pixel reads.
    return srcX>=30-pxRadius&&srcX<380+pxRadius&&srcY>=72-pxRadius&&srcY<355+pxRadius;
  }
  function registerHareHit(c){
    // Stop this particular hare immediately; a dead target never scores twice.
    fallenHares.push({...c,deathAge:0,frame:hareFrame(c)});
    flashHareHit(c);
  }

  const KUDU_IMAGE_W=KUDU_VIDEO_W, KUDU_IMAGE_H=KUDU_VIDEO_H;
  const KUDU_DRAW_W=360, KUDU_FOOT_FRAC=0.956;
  const KUDU_FRAMES=154; // original MP4, decoded at native 30fps
  const KUDU_DEPTHS=[
    // These are intentionally much smaller and farther into the field.
    {name:'NABY',scale:1.26,groundY:690,move:1.00,points:1.00},
    {name:'MIDDEL',scale:0.9,groundY:610,move:.80,points:1.30},
    {name:'VER',scale:0.63,groundY:530,move:.62,points:1.65}
  ];
  const KUDU_SPEEDS=[
    {name:'MATIG',move:1.00,points:1.00,runFps:5.8,lead:.105},
    {name:'VINNIG',move:1.16,points:1.28,runFps:6.5,lead:.125},
    {name:'BAIE VINNIG',move:1.34,points:1.58,runFps:7.2,lead:.145}
  ];
  // Fixed body anchor: preserve the source video's natural vertical movement.
  // Individual frames are NEVER repositioned to pin the legs.
  function kuduDrawW(c){return KUDU_DRAW_W*c.scale;}
  function kuduDrawH(c){return kuduDrawW(c)*KUDU_IMAGE_H/KUDU_IMAGE_W;}
  function kuduSpriteTop(c){return -KUDU_FOOT_FRAC*kuduDrawH(c);}
  function spawnKuduTarget(){
    const n=level-1;
    const direction=Math.random()<.5?1:-1;
    const distanceIndex=weightedPick([.28,.43,.29]);
    const speedIndex=weightedPick([Math.max(.22,.46-n*.05),.33,.21+n*.05]);
    const sp=KUDU_SPEEDS[speedIndex],dist=KUDU_DEPTHS[distanceIndex];
    const runSpeed=(214+16*n)*sp.move*dist.move;
    const kg=Math.round((100*sp.points*dist.points)*10)/10;
    const scale=dist.scale*rand(.97,1.03);
    const padding=260*scale;
    clays.push({kind:'kuduTarget',species:'KUDU',x:direction>0?-padding:W+padding,y:dist.groundY,
      vx:direction*runSpeed,vy:0,g:0,maxAge:18,age:0,r:92*scale,rot:0,vr:0,seed:0,tilt:0,scale,direction,
      leadSeconds:sp.lead,speedLabel:sp.name,distanceLabel:dist.name,kgValue:kg});
  }
  function mapKuduShot(c,shotX,shotY){
    const w=kuduDrawW(c),h=kuduDrawH(c),dir=c.vx>=0?1:-1;
    // Faster kudu require slightly more forward lead, but not an extreme amount.
    const leadScreen=c.vx*(c.leadSeconds||.115);
    const localX=(shotX-(c.x+leadScreen))*dir;
    const srcX=(localX+w/2)/w*KUDU_IMAGE_W;
    const srcY=(shotY-c.y-kuduSpriteTop(c))/h*KUDU_IMAGE_H;
    return {w,h,dir,srcX,srcY};
  }
  function hitKuduBody(c,shotX,shotY,touch){
    const {srcX,srcY}=mapKuduShot(c,shotX,shotY);
    // Broad silhouette of the torso for feedback. Body shots outside the kill
    // zone never score and do not remove the animal.
    return ((srcX-402)/255)**2+((srcY-287)/112)**2 <= (touch?1.28:1.10);
  }
  function hitKuduKillZone(c,shotX,shotY,touch){
    const {srcX,srcY}=mapKuduShot(c,shotX,shotY);
    // Heart/lung region just behind the front shoulder, on the original footage.
    const rx=touch?66:58, ry=touch?75:66;
    return ((srcX-472)/rx)**2+((srcY-276)/ry)**2<=1;
  }
  function showBiltongBurst(c){
    // The target is removed immediately. For 0.5s ONLY, transparent biltong
    // and text occupy that animal's exact on-screen position. No card or banner.
    biltongBursts.push({x:c.x,y:c.y,scale:c.scale||1,age:0,life:.5,kg:c.kgValue});
  }

  // V8: one running hare at a time, independently of the shooting targets.
  // It stays on foreground grass, makes continuous forward progress and does not
  // affect the hit count, shot count, or Olympic target sequence.
  function startHareRun(){
    const direction=(harePasses%2===0)?1:-1;
    harePasses++;
    hare={x:direction>0?-185:W+185,y:854,direction,
      speed:rand(280,345),age:0,phase:Math.floor(rand(0,8))};
  }
  function stepHare(dt){
    return;
  }

  function feathers(c){
    const colors=c.species==='ROTSDUIF'?['#aa6460','#855454','#a3a1a1','#f1e8d7']:c.species==='GANS'?['#e2d7b8','#b0a18a','#6b5844']:['#6e4a34','#ba9b75','#e9e2cf','#23704f'];
    for(let j=0;j<20;j++){
      const a=rand(0,6.283),v=rand(45,280);
      shards.push({x:c.x,y:c.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:250,age:0,
        life:rand(.36,.9),size:rand(4,12),spin:rand(-6,6),rot:rand(-3,3),color:colors[Math.floor(rand(0,colors.length))]});
    }
    flashes.push({x:c.x,y:c.y,r:c.r,age:0,life:.23});
  }

  // One complete 25-target ISSF qualification sequence; each wave must be called.
  function callOlympic(){
    if(!active||paused||mode!=='olympic'||olympicState!=='ready'||!currentWave())return;
    olympicState='delay';
    releaseDelay=rand(0,3);  // ISSF variable release after call.
    ammo=currentWave().houses.length;
    reloading=false;olympicCurrentTarget=0;
    announce('TEIKEN GEROEP · GEREED',.9);
    setUi();
  }
  function releaseOlympicWave(){
    const wave=currentWave();if(!wave)return;
    olympicState='flight';
    const station=wave.station,stationAngle=(station-4)*.085;
    wave.houses.forEach((house,order)=>{
      const fromHigh=house==='H';
      // Fixed house-to-house crossing: high enters left, low enters right.
      const speed=fromHigh?730:-730;
      clays.push({olympic:true,olympicOrder:order,house,kind:'clay',
        x:fromHigh?-66:W+66,y:fromHigh?404+stationAngle*230:462-stationAngle*190,
        vx:speed,vy:fromHigh?(-85+stationAngle*150):(-50-stationAngle*140),g:67,
        maxAge:2.55,age:0,r:48,rot:rand(-.2,.2),vr:fromHigh?2.1:-2.1,
        seed:rand(0,6),tilt:fromHigh?.13:-.13});
    });
    announce(wave.houses.length===2?'DUBBEL · '+wave.houses.map(h=>h==='H'?'HOOG':'LAAG').join(' → '):
      (wave.houses[0]==='H'?'HOË HUIS':'LAE HUIS'),1);
    setUi();
  }
  function finishOlympicWave(){
    clays=clays.filter(c=>c.olympicFlyaway);
    waveIndex++;
    if(waveIndex>=olympicWaves.length){score=hits;time=0;endGame();return;}
    const newStation=currentWave().station;
    const prevStation=olympicWaves[waveIndex-1].station;
    if(newStation!==prevStation){stationClock=30;announce('VOLGENDE: STASIE '+newStation,1.2);}
    olympicState='ready';olympicCurrentTarget=0;
    ammo=currentWave().houses.length;
    setUi();
  }
  function resolveOlympicTarget(hit){
    const wave=currentWave();if(!wave)return;
    const i=olympicCurrentTarget;
    const idx=clays.findIndex(c=>c.olympicOrder===i);
    if(idx>=0){
      const c=hit?clays.splice(idx,1)[0]:clays[idx];if(!hit){c.olympicFlyaway=true;c.olympicOrder=-1;}
      if(hit){hits++;score=hits;explode(c);sound(860,.09,'triangle',.04,.01);}
      else{escaped++;}
    } else if(!hit){escaped++;}
    olympicDone++;olympicCurrentTarget++;
    announce(hit?'TREFFER!':'VERLORE TEIKEN',.5);
    if(olympicCurrentTarget>=wave.houses.length)finishOlympicWave();
    else setUi();
  }
  function fireOlympic(){
    if(olympicState!=='flight'||!active||paused||ammo<=0)return;
    const expected=clays.find(c=>c.olympicOrder===olympicCurrentTarget);
    if(!expected)return;
    shots++;ammo--;sfxShoot();triggerVibration();
    flashes.push({x:pointer.x,y:pointer.y,r:20,age:0,life:.18,shot:true});
    const touch=matchMedia('(pointer:coarse)').matches;
    const rx=expected.r+(touch?31:18),ry=expected.r*.55+(touch?29:18);
    const hit=((pointer.x-expected.x)/rx)**2+((pointer.y-expected.y)/ry)**2<=1.2;
    resolveOlympicTarget(hit);
  }
  function stepOlympic(dt){
    elapsed+=dt;
    // ISSF's 30s per-station limit for making the required target calls.
    const wave=currentWave();
    if(!wave)return;
    if(stationClock>0)stationClock=Math.max(0,stationClock-dt);
    if(olympicState==='ready'&&stationClock===0){
      let skips=0;
      const station=wave.station;
      while(currentWave()&&currentWave().station===station){
        const w=currentWave();olympicDone+=w.houses.length;escaped+=w.houses.length;waveIndex++;skips++;
      }
      if(!currentWave()){score=hits;endGame();return;}
      stationClock=30;olympicState='ready';ammo=currentWave().houses.length;
      announce('STASIETYD VERSTREKE · '+skips+' REEKS(E) GEMIS',1.5);
    }
    if(olympicState==='delay'){
      releaseDelay-=dt;
      if(releaseDelay<=0)releaseOlympicWave();
    }
    for(const c of clays.filter(c=>c.olympicFlyaway)){const f=dt*1.4;c.age+=f;c.x+=c.vx*f;c.y+=c.vy*f;c.vy+=c.g*f;c.rot+=c.vr*f;}clays=clays.filter(c=>!c.olympicFlyaway||(c.age<c.maxAge&&c.x>-130&&c.x<W+130&&c.y<H+130));if(olympicState==='flight'){
      for(const c of clays.filter(c=>!c.olympicFlyaway)){const flightDt=dt*1.4;c.age+=flightDt;c.x+=c.vx*flightDt;c.y+=c.vy*flightDt;c.vy+=c.g*flightDt;c.rot+=c.vr*flightDt;}
      // Targets time out in their prescribed firing order.
      let guard=0;
      while(olympicState==='flight'&&guard++<2){
        const expected=clays.find(c=>c.olympicOrder===olympicCurrentTarget);
        if(!expected){resolveOlympicTarget(false);continue;}
        if(expected.age>expected.maxAge||expected.x< -130||expected.x>W+130||expected.y>H+130){resolveOlympicTarget(false);continue;}
        break;
      }
    }
    stepHare(dt);
    fallenHares=fallenHares.filter(c=>(c.deathAge+=dt)<.43);
    biltongBursts=biltongBursts.filter(b=>(b.age+=dt)<b.life);
    shards=shards.filter(p=>{p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.rot+=p.spin*dt;return p.age<p.life;});
    flashes=flashes.filter(p=>(p.age+=dt)<p.life);
    setUi();
  }
  function triggerVibration(){
    if(vibrationEnabled && typeof navigator.vibrate==='function')try{navigator.vibrate(75)}catch(_){}
  }

  function flashHareHit(hare){
    flashes.push({x:hare.x,y:hare.y-10,r:hare.r*1.2,age:0,life:.28});
    for(let j=0;j<10;j++){
      const a=rand(0,6.29),v=rand(20,150);
      shards.push({x:hare.x,y:hare.y-20,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,g:170,age:0,life:rand(.18,.45),size:rand(2,6),spin:rand(-4,4),rot:rand(-2,2),color:['#b68a64','#8b6042','#f3e0c8'][Math.floor(rand(0,3))]});
    }
  }

  function explode(clay){
    for(let j=0;j<22;j++){
      let a=rand(0,2*Math.PI),v=rand(75,420);
      shards.push({x:clay.x,y:clay.y,vx:Math.cos(a)*v+clay.vx*.09,vy:Math.sin(a)*v-100,
        g:480,age:0,life:rand(.26,.72),size:rand(2.5,11),spin:rand(-9,9),rot:rand(-3,3),
        color:['#ee5312','#ff8425','#ffbe58','#c4350b','#7b3012'][Math.floor(rand(0,5))]});
    }
    for(let j=0;j<13;j++){
      const a=rand(0,6.29),v=rand(30,235);
      shards.push({x:clay.x,y:clay.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,
        g:30,age:0,life:rand(.19,.45),size:rand(2,6),spin:0,rot:rand(0,7),color:'#f9e5bb'});
    }
    flashes.push({x:clay.x,y:clay.y,r:clay.r,age:0,life:.26});
  }

  function fire(){
    if(mode==='olympic'){fireOlympic();return;}
    if(!active||paused||time<=0)return;
    if(reloading){announce('HERLAAI...',.3);return;}
    if(ammo===0){scheduleReload();return;}
    shots++;ammo--;sfxShoot();
    // Trigger feedback is synchronous with the trusted touch/click gesture.
    // Supported by Chrome on many Android phones; unsupported devices ignore it.
    triggerVibration();
    flashes.push({x:pointer.x,y:pointer.y,r:22,age:0,life:.18,shot:true});
    let closest=-1,minD=Infinity,bodyOnly=false;
    const touch=matchMedia('(pointer:coarse)').matches;
    for(let i=0;i<clays.length;i++){
      const c=clays[i],cx=c.x,cy=c.y;
      if(c.kind==='hareTarget'){
        if(hitHare(c,pointer.x,pointer.y,touch)){
          const z=1/(c.scale||1);
          if(z<minD){minD=z;closest=i;}
        }
        continue;
      }
      if(c.kind==='kuduTarget'){
        if(hitKuduKillZone(c,pointer.x,pointer.y,touch)){
          const z=1/(c.scale||1);
          if(z<minD){minD=z;closest=i;}
        }else if(hitKuduBody(c,pointer.x,pointer.y,touch)){
          bodyOnly=true;
        }
        continue;
      }
      const birdSize=(c.kind==='bird'?(c.depth||1):1);
      const rx=(c.kind==='bird'?c.r*1.90*birdSize:c.r)+(touch?37:19);
      const ry=(c.kind==='bird'?c.r*1.20*birdSize:c.r*.55)+(touch?35:20);
      const normalized=((pointer.x-cx)/rx)**2+((pointer.y-cy)/ry)**2;
      if(normalized<=1.15&&normalized<minD){minD=normalized;closest=i;}
    }
    if(closest!==-1){
      const c=clays.splice(closest,1)[0];
      hits++;streak++;
      let points;
      if(c.kind==='hareTarget'){
        points=c.pointValue;
        score+=points;
      }else if(c.kind==='kuduTarget'){
        points=c.kgValue;
        score=Math.round((score+points)*10)/10;
      }else{
        points=Math.round((100+(level-1)*30)*(1+Math.floor((streak-1)/5)*.25));
        score+=points;
      }
      if(c.kind==='bird')feathers(c);
      else if(c.kind==='hareTarget'){registerHareHit(c);}
      else if(c.kind==='kuduTarget'){showBiltongBurst(c);}
      else explode(c);
      const msg=(c.kind==='hareTarget')
        ? ('TREFFER! '+c.distanceLabel+' · '+c.speedLabel+' · +'+points)
        : (c.kind==='kuduTarget'
            ? ('BILTONG!! '+c.distanceLabel+' · '+c.speedLabel+' · +'+formatScore(points,'koedoe')+' KG')
            : (streak%5===0?'🔥 REEKS ×'+(Math.floor((streak-1)/5)+1)+' · +'+points:'+'+points));
      if(c.kind!=='kuduTarget')announce(msg,.75);
      sound(870,.12,'triangle',.04,.035);
    }else{streak=0;announce(bodyOnly&&mode==='koedoe'?'NET KILSONE TEL!':'MIS!',bodyOnly&&mode==='koedoe'?.55:.23);}
    if(!ammo)scheduleReload();
    setUi();
  }

  function step(dt){
    if(mode==='olympic'){stepOlympic(dt);return;}
    elapsed+=dt;
    time=Math.max(0,roundDuration-elapsed);
    const newLevel=limit(Math.floor(elapsed/12)+1,1,5);
    if(level!==newLevel){
      level=newLevel;announce('VLAK '+level+' · '+stageLabels[level-1],1.05);
      sound(570,.13,'triangle',.06);
    }
    if(reloading){reloadTimer-=dt;if(reloadTimer<=0){reloading=false;ammo=2;sound(485,.05,'square',.026);}}
    nextLaunch-=dt;
    if(nextLaunch<=0){
      if(mode==='hares'){
        // All five hare lanes are replenished immediately after movement.
        const base=2.25-(level-1)*.15;
        nextLaunch=rand(base*.83,base*1.15);
      }else if(mode==='koedoe'){
        if(clays.filter(c=>c.kind==='kuduTarget').length<4)spawnClay();
        const base=2.75-(level-1)*.18;
        nextLaunch=rand(base*.86,base*1.16);
      }else{
        spawnClay();
        const base=1.53-(level-1)*.24;
        nextLaunch=rand(base*.82,base*1.18);
        if(level>=3&&Math.random()<.2+(level-3)*.2)queued.push(rand(.20,.44));
      }
    }
    for(let i=queued.length-1;i>=0;i--){
      queued[i]-=dt;if(queued[i]<=0){spawnClay();queued.splice(i,1);}
    }
    for(let i=clays.length-1;i>=0;i--){
      const c=clays[i];
      c.age+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=c.g*dt;c.rot+=c.vr*dt;
      if(c.kind==='bird'){
        c.depth=c.depthStart+(c.depthEnd-c.depthStart)*Math.min(c.age/c.maxAge,1);
      }
      const edge=c.kind==='kuduTarget'?(300*c.scale+90):175;
      // Hares leave their lane only after reaching the visible canvas edge; the
      // replacement is created inside the screen during this same frame.
      const hareEdge=c.kind==='hareTarget' ? 145*c.scale : 0;
      const exited=c.kind==='hareTarget' ? (c.x<hareEdge||c.x>W-hareEdge) : (c.x< -edge||c.x>W+edge);
      if(c.age>c.maxAge||exited||c.y>H+175){clays.splice(i,1);escaped++;}
    }
    if(mode==='hares'){
      for(let lane=0;lane<HARE_DEPTHS.length;lane++){
        if(!clays.some(c=>c.kind==='hareTarget'&&c.laneIndex===lane))spawnHareTarget(lane,false);
      }
    }
    stepHare(dt);
    fallenHares=fallenHares.filter(c=>(c.deathAge+=dt)<.43);
    biltongBursts=biltongBursts.filter(b=>(b.age+=dt)<b.life);
    shards=shards.filter(p=>{p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.rot+=p.spin*dt;return p.age<p.life;});
    flashes=flashes.filter(p=>(p.age+=dt)<p.life);
    setUi();
  }

  function drawBackground(){
    const image=mode==='waterfowl'?wetlandBg:mode==='hares'?veldBg:mode==='koedoe'?koedoeBg:bg;
    if(image.complete&&image.naturalWidth){ctx.drawImage(image,0,0,W,H);}
    else{const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#3f78ab');grad.addColorStop(.62,'#c9d8c8');grad.addColorStop(.7,'#7f955c');grad.addColorStop(1,'#566b40');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);}
  }

  function drawClay(c){
    ctx.save();ctx.translate(c.x,c.y);
    ctx.rotate(c.tilt+c.rot*.12);
    const a=Math.sin(c.rot)*.10;
    ctx.scale(1,limit(.98+a,.7,1.1));
    ctx.shadowColor='#10192080';ctx.shadowBlur=13;ctx.shadowOffsetY=6;
    ctx.fillStyle='#442016';
    ctx.beginPath();ctx.ellipse(0,c.r*.16,c.r*1.04,c.r*.44,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    const g=ctx.createLinearGradient(0,-c.r*.5,0,c.r*.54);
    g.addColorStop(0,'#ffdc85');g.addColorStop(.1,'#ffad49');g.addColorStop(.41,'#f66e1c');
    g.addColorStop(.73,'#be3910');g.addColorStop(1,'#62200e');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-c.r*.13,c.r,c.r*.43,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ffde91';ctx.lineWidth=Math.max(1.6,c.r*.064);
    ctx.beginPath();ctx.ellipse(0,-c.r*.17,c.r*.79,c.r*.28,0,Math.PI*1.11,Math.PI*1.94);ctx.stroke();
    ctx.strokeStyle='#952a0e';ctx.lineWidth=Math.max(1.3,c.r*.055);
    ctx.beginPath();ctx.ellipse(0,-c.r*.18,c.r*.48,c.r*.17,0,0,2*Math.PI);ctx.stroke();
    ctx.fillStyle='#ffbd5d72';ctx.beginPath();ctx.ellipse(-c.r*.17,-c.r*.26,c.r*.25,c.r*.08,-.12,0,2*Math.PI);ctx.fill();
    ctx.restore();
  }


  // Three animated species only: mallard, Egyptian goose, African rock pigeon.
  // No added rotation or artificial bobbing: preserve original wing movement.
  function drawBird(c){
    const atlas=wingAtlases[c.species];
    if(!atlas || !atlas.image.complete || !atlas.image.naturalWidth)return;
    const depth=c.depth||1;
    const width=c.r*(c.species==='GANS'?4.45:c.species==='EEND'?4.75:4.1)*depth;
    // ROTSDUIF plays every source frame once in order, at its native 60 ms/frame.
    // The other species retain their previous wingbeat animation unchanged.
    const frame=c.species==='ROTSDUIF'
      ? Math.floor((c.age*1000/atlas.frameDurationMs+Math.floor(c.seed))%atlas.frames)
      : Math.floor(((c.age*(c.wingHz||atlas.fps)+c.seed/7)%1)*atlas.frames);
    const frameSize=atlas.frameSize||WING_FRAME;
    const sx=(frame%atlas.columns)*frameSize;
    const sy=Math.floor(frame/atlas.columns)*frameSize;
    ctx.save();
    ctx.translate(c.x,c.y);
    ctx.scale(c.vx>=0?1:-1,1);
    ctx.drawImage(atlas.image,sx,sy,frameSize,frameSize,-width*.5,-width*.5,width,width);
    ctx.restore();
  }

  function drawHareTarget(c,fallen=false){
    if(!hareAtlas.complete||!hareAtlas.naturalWidth)return;
    const frame=fallen?0:hareFrame(c);
    const sx=(frame%4)*HARE_FRAME,sy=Math.floor(frame/4)*HARE_FRAME;
    const width=290*c.scale,height=width;
    const top=hareSpriteTop(c,frame);
    const t=fallen?Math.min(c.deathAge/.43,1):0;
    ctx.save();
    ctx.translate(c.x,c.y);
    ctx.scale(c.vx>=0?1:-1,1);
    if(fallen){
      ctx.globalAlpha=Math.pow(1-t,1.15);
      // A short slump into the grass, then complete disappearance.
      ctx.translate(0,t*11*c.scale);
      ctx.scale(1,1-t*.64);
    }
    ctx.drawImage(hareAtlas,sx,sy,HARE_FRAME,HARE_FRAME,-width*.5,top,width,height);
    ctx.restore();
  }

  function drawHare(){
    if(mode!=='waterfowl'||!hare||!hareAtlas.complete||!hareAtlas.naturalWidth)return;
    const width=272, height=272;
    const frame=Math.floor((hare.age*9.3+hare.phase)%8);
    const sx=(frame%4)*HARE_FRAME,sy=Math.floor(frame/4)*HARE_FRAME;
    ctx.save();
    ctx.translate(hare.x,hare.y);
    ctx.scale(hare.direction,1);
    // Consistent shadow anchors the legs to the foreground grass.
    ctx.fillStyle='rgba(29,27,16,.17)';
    ctx.beginPath();ctx.ellipse(0,-12,94,10,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(hareAtlas,sx,sy,HARE_FRAME,HARE_FRAME,-width*.5,-height*.88,width,height);
    ctx.restore();
  }

  function drawKuduTarget(c){
    if(kuduVideo.readyState<2)return;
    // In browsers without requestVideoFrameCallback, refresh based on MP4 time.
    // Guaranteed fallback even if an offscreen video never receives frame callbacks.
    // Compare actual decoder time; never substitute an animated still image.
    if(Math.abs(kuduVideo.currentTime-kuduLastPresented)>1/35)updateKuduVideoFrame();
    const width=kuduDrawW(c),height=kuduDrawH(c),top=kuduSpriteTop(c);
    ctx.save();
    ctx.translate(c.x,c.y);
    ctx.scale(c.vx>=0?1:-1,1);

    ctx.drawImage(kuduKeyCanvas,0,0,KUDU_VIDEO_W,KUDU_VIDEO_H,-width*.5,top,width,height);
    ctx.restore();
  }

  function drawBiltongBursts(){
    if(!biltongImage.complete||!biltongImage.naturalWidth)return;
    for(const b of biltongBursts){
      const t=b.age/b.life;
      const fade=(t<.78)?1:Math.max(0,(1-t)/.22);
      const width=460*b.scale, height=230*b.scale;
      ctx.save();
      ctx.globalAlpha=fade;
      ctx.translate(b.x,b.y);
      // Biltong replaces the bull at its actual location, not in a card.
      ctx.drawImage(biltongImage,-width*.5,-height-65*b.scale,width,height);
      ctx.textAlign='center';
      ctx.shadowColor='rgba(20,8,0,.92)';ctx.shadowBlur=8*b.scale;
      ctx.lineWidth=Math.max(2,5*b.scale);
      ctx.font=`900 ${Math.max(18,54*b.scale)}px system-ui,sans-serif`;
      ctx.strokeStyle='rgba(45,20,3,.9)';ctx.fillStyle='#ffcb62';
      const titleY=-height-86*b.scale;
      ctx.strokeText('BILTONG!!',0,titleY);ctx.fillText('BILTONG!!',0,titleY);
      ctx.font=`900 ${Math.max(15,37*b.scale)}px system-ui,sans-serif`;
      const kgText='+'+formatScore(b.kg,'koedoe')+' KG';
      ctx.strokeText(kgText,0,-55*b.scale);ctx.fillText(kgText,0,-55*b.scale);
      ctx.restore();
    }
  }

  function drawParticles(){
    for(const p of shards){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.globalAlpha=limit((p.life-p.age)*3,0,1);ctx.fillStyle=p.color;
      ctx.beginPath();ctx.moveTo(-p.size*.6,-p.size*.4);ctx.lineTo(p.size,-p.size*.05);ctx.lineTo(p.size*.06,p.size*.8);ctx.closePath();ctx.fill();ctx.restore();
    }
    for(const p of flashes){
      const f=p.age/p.life;
      ctx.save();ctx.globalAlpha=1-f;ctx.strokeStyle=p.shot?'#fff2ca':'#ffae42';ctx.lineWidth=p.shot?3.5:5;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*.4+f*(p.shot?90:110),0,6.283);ctx.stroke();ctx.restore();
    }
  }

  function drawCrosshair(){
    if(!active)return;
    const x=pointer.x,y=pointer.y;
    ctx.save();ctx.strokeStyle='#071625bf';ctx.lineWidth=7;
    ctx.beginPath();ctx.arc(x,y,26,0,2*Math.PI);ctx.stroke();
    ctx.strokeStyle='#faf8ee';ctx.lineWidth=2.8;
    ctx.beginPath();ctx.arc(x,y,26,.25,Math.PI*1.8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-42,y);ctx.lineTo(x-20,y);ctx.moveTo(x+20,y);ctx.lineTo(x+42,y);
    ctx.moveTo(x,y-42);ctx.lineTo(x,y-20);ctx.moveTo(x,y+20);ctx.lineTo(x,y+42);ctx.stroke();
    ctx.fillStyle='#ffac35';ctx.beginPath();ctx.arc(x,y,3,0,6.283);ctx.fill();ctx.restore();
  }

  function draw(){
    ctx.clearRect(0,0,W,H);drawBackground();
    clays.forEach(c=>c.kind==='bird'?drawBird(c):c.kind==='hareTarget'?drawHareTarget(c):c.kind==='kuduTarget'?drawKuduTarget(c):drawClay(c));
    fallenHares.forEach(c=>drawHareTarget(c,true));drawHare();drawParticles();drawBiltongBursts();drawCrosshair();
  }

  function loop(now){
    if(!active||paused)return;
    const dt=limit((now-last)/1000,0,.045);last=now;
    step(dt);
    if(now>popupEnd)ui.toast.classList.remove('show');
    draw();
    if(mode!=='olympic' && time<=0){time=0;endGame();return;}
    raf=requestAnimationFrame(loop);
  }

  function canvasCoords(e){
    const rect=canvas.getBoundingClientRect();
    const scale=Math.max(rect.width/W,rect.height/H);
    const left=(rect.width-W*scale)/2,top=(rect.height-H*scale)/2;
    pointer.x=limit((e.clientX-rect.left-left)/scale,0,W);
    pointer.y=limit((e.clientY-rect.top-top)/scale,0,H);
  }
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;canvasCoords(e);if(!active)draw()});
  canvas.addEventListener('pointerdown',e=>{
    if(!active||paused)return;
    e.preventDefault();canvasCoords(e);fire();
  });
  canvas.addEventListener('contextmenu',e=>e.preventDefault());

  $('callTarget').addEventListener('click',callOlympic);
  ui.btnStart.addEventListener('click',startGame);
  ui.pause.addEventListener('click',pauseGame);
  // macauw-stop-game-v1: Return to the existing main menu.
  const stopBtn=document.createElement('button');
  stopBtn.id='stopGame';
  // macauw-stop-header-fix-v2
  ui.pause.insertAdjacentElement('beforebegin',stopBtn);
  stopBtn.style.position='static';
  stopBtn.style.left='auto';
  stopBtn.style.bottom='auto';
  stopBtn.style.right='auto';
  stopBtn.style.top='auto';
  stopBtn.style.margin='0 8px 0 0';
  stopBtn.style.flex='0 0 auto';

  stopBtn.type='button';
  stopBtn.textContent='STOP SPEL';
  stopBtn.setAttribute('aria-label','Stop die spel en gaan terug na die hoofskerm');
  stopBtn.style.cssText='position:absolute;left:12px;bottom:75px;z-index:20;background:#a92e28;color:white;border:2px solid #fff;border-radius:9px;padding:11px 17px;font-weight:800;cursor:pointer;display:none';
  arena.appendChild(stopBtn);
  const syncStopButton=()=>{stopBtn.style.display=ui.intro.classList.contains('hidden')?'block':'none';};
  new MutationObserver(syncStopButton).observe(ui.intro,{attributes:true,attributeFilter:['class']});
    // macauw-stop-final-placement-v3
  ui.pause.insertAdjacentElement('beforebegin',stopBtn);
  stopBtn.style.cssText='position:static;display:none;flex:0 0 auto;align-self:center;margin:0 8px 0 0;background:#a92e28;color:white;border:2px solid white;border-radius:8px;padding:8px 12px;font-weight:800;cursor:pointer';
  stopBtn.addEventListener('click',()=>{
    cancelAnimationFrame(raf);
    active=false;paused=false;ended=false;
    if(mode==='koedoe')kuduVideo.pause();
    ui.pause.disabled=true;
    clays=[];shards=[];flashes=[];queued=[];bubbles=[];fallenHares=[];biltongBursts=[];
    ui.title.innerHTML='E-KLEIDUIF<br><em>UITDAGING</em>';
    ui.intro.classList.remove('hidden');
    selectMode(mode);
    setUi();
  });


  const vibeButton=$('vibrate');
  if(vibeButton){
    const supported=typeof navigator.vibrate==='function';
    vibeButton.textContent=supported?'▤ VIBRASIE AAN':'▤ GEEN VIBRASIE';
    vibeButton.disabled=!supported;
    vibeButton.addEventListener('click',()=>{
      vibrationEnabled=!vibrationEnabled;
      vibeButton.textContent=vibrationEnabled?'▤ VIBRASIE AAN':'▤ VIBRASIE AF';
      if(vibrationEnabled)try{navigator.vibrate(40);}catch(_){}
    });
  }
  $('sound').addEventListener('click',()=>{
    audioEnabled=!audioEnabled;
    $('sound').textContent=audioEnabled?'♪ AAN':'♪ AF';
    if(audioEnabled)sound(440,.09);
  });
  $('full').addEventListener('click',async()=>{
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await $('arena').requestFullscreen({navigationUI:'hide'});
      if(document.fullscreenElement)try{await screen.orientation?.lock?.('landscape');}catch(_){}
    }catch(_){announce('VOLSKERM NIE BESKIKBAAR NIE',1.2)}
  });
  $('tryLandscape').addEventListener('click',async()=>{
    try{await $('arena').requestFullscreen();await screen.orientation?.lock?.('landscape')}catch(_){
      $('portraitGate').querySelector('p').textContent='Skakel Outo-draai in jou foon se instellings aan en draai die foon dwars.';
    }
  });
  $('howto').addEventListener('click',()=>$('howtoDialog').classList.remove('hidden'));
  $('closeHowto').addEventListener('click',()=>$('howtoDialog').classList.add('hidden'));

  document.addEventListener('keydown',e=>{
    if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
    if(e.code==='Space'){if(mode==='olympic'&&olympicState==='ready')callOlympic();else fire();}
    if(e.code==='KeyP'||e.code==='Escape')pauseGame();
    const delta=e.shiftKey?65:35;
    if(e.code==='ArrowLeft')pointer.x=limit(pointer.x-delta,0,W);
    if(e.code==='ArrowRight')pointer.x=limit(pointer.x+delta,0,W);
    if(e.code==='ArrowUp')pointer.y=limit(pointer.y-delta,0,H);
    if(e.code==='ArrowDown')pointer.y=limit(pointer.y+delta,0,H);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused)pauseGame()});
  window.addEventListener('blur',()=>{if(active&&!paused)pauseGame()});
  window.addEventListener('resize',draw);
  bg.onload=draw;wetlandBg.onload=draw;veldBg.onload=draw;koedoeBg.onload=draw;
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  selectMode('skeet');setUi();draw();
  // Development test helpers, harmless in production.
  window.__ECLAY_TEST__={getState:()=>({active,paused,ended,mode,score,hits,shots,ammo,level,time,clayCount:clays.length,
    olympicDone,waveIndex,olympicState,stationClock,releaseDelay,currentWave:currentWave(),
    targets:clays.map(c=>({x:c.x,y:c.y,r:c.r,kind:c.kind,species:c.species,wingHz:c.wingHz,depth:c.depth,age:c.age,house:c.house,olympicOrder:c.olympicOrder,scale:c.scale,vx:c.vx,speedLabel:c.speedLabel,distanceLabel:c.distanceLabel,pointValue:c.pointValue}))}),
    fire,spawn:spawnClay,callOlympic,releaseOlympicWave,waves:olympicWaves,finishOlympicWave,
    getHare:()=>hare&&{x:hare.x,y:hare.y,age:hare.age,direction:hare.direction},
    getFallenHares:()=>fallenHares.map(h=>({x:h.x,y:h.y,age:h.deathAge})),
    getHareFrameBounds:(index=0)=>({index,frameSize:HARE_FRAME}),
    hitHare,
    HARE_DEPTHS,HARE_SPEEDS,
    getKuduVideo:()=>({loaded:kuduVideo.readyState>=2,width:kuduVideo.videoWidth,height:kuduVideo.videoHeight,sourceFrames:154,fps:30,currentTime:kuduVideo.currentTime,paused:kuduVideo.paused,processedFrames:kuduVideoFrames,error:kuduVideoError}),
    getBiltongBursts:()=>biltongBursts.map(b=>({x:b.x,y:b.y,kg:b.kg,age:b.age,life:b.life})),
    getKuduDepths:()=>KUDU_DEPTHS.map(d=>({...d})),
    getVeldImage:()=>({loaded:veldBg.complete&&veldBg.naturalWidth>0,width:veldBg.naturalWidth,height:veldBg.naturalHeight}),
    getAtlasStatus:()=>Object.fromEntries(Object.entries(wingAtlases).map(([name,a])=>[name,{loaded:a.image.complete&&a.image.naturalWidth>0,frames:a.frames,width:a.image.naturalWidth,height:a.image.naturalHeight}]))};
})();
