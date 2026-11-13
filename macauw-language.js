/* Macauw bilingual UI. Presentation-only; does not modify game logic or Supabase data. */
(() => {
  'use strict';
  const KEY='macauw-language-v1';
  let lang='af';
  try { if(localStorage.getItem(KEY)==='en')lang='en'; }catch(_){ }
  const originals=new WeakMap();
  const attrOriginals=new WeakMap();
  const exact=new Map(Object.entries({
    'E-KLEIDUIF':'E-CLAY SHOOTING','UITDAGING':'CHALLENGE','E-KLEIDUIFUITDAGING':'E-CLAY CHALLENGE',
    'KIES JOU DISSIPLINE':'CHOOSE YOUR DISCIPLINE','OLIMPIESE SKEET':'OLYMPIC SKEET',
    'VOËLS & WATERVOËLS':'BIRDS & WATERFOWL','HASE':'HARES','KOEDOE':'KUDU',
    'TYD OOR':'TIME LEFT','TEIKENS OOR':'TARGETS LEFT','PUNTE':'POINTS','TREFFERS':'HITS',
    'AKKURAATHEID':'ACCURACY','SKOTE':'SHOTS','VLAK':'LEVEL','OPWARMING':'WARM-UP',
    'MEER SPOED':'FASTER TARGETS','DUBBELTEIKENS':'DOUBLE TARGETS','VINNIGE VLUGTE':'FAST FLIGHTS','EINDSPRINT':'FINAL SPRINT',
    'SKEET · DWARSVLUGTE':'SKEET · CROSSING TARGETS','TRAP · WEGVLUGTE':'TRAP · OUTGOING TARGETS',
    'OLIMPIESE SKEET · ISSF 2026':'OLYMPIC SKEET · ISSF 2026',
    'VOËLS & WATERVOËLS · ARCADE':'BIRDS & WATERFOWL · ARCADE',
    'HASE · OOP VELD':'HARES · OPEN FIELD','KOEDOE · KILSONE':'KUDU · VITAL ZONE',
    'OLIMPIESE SKEET · KWALIFIKASIERONDTE':'OLYMPIC SKEET · QUALIFICATION ROUND',
    'HOË HUIS · ENKEL':'HIGH HOUSE · SINGLE',
    'BEGIN 60-SEKONDE-RONDE':'START 60-SECOND ROUND','BEGIN 60-SEKONDE-RONDTE':'START 60-SECOND ROUND',
    'BEGIN OLIMPIESE 25-TEIKEN-RONDE':'START OLYMPIC 25-TARGET ROUND',
    'BEGIN OLIMPIESE 25-TEIKEN-RONDTE':'START OLYMPIC 25-TARGET ROUND',
    'HOE OM TE SPEEL':'HOW TO PLAY','Hoe om te speel':'How to play',
    '↓ INSTALLEER SPEL':'↓ INSTALL GAME','INSTALLEER SPEL':'INSTALL GAME','DEEL VIA WHATSAPP':'SHARE VIA WHATSAPP',
    'BEKYK RANGLYS':'VIEW LEADERBOARD','WYS LEIERBORD':'VIEW LEADERBOARD',
    'MACAUW LEIERBORD':'MACAUW LEADERBOARD', 'STUUR MY TELLING IN':'SUBMIT MY SCORE',
    'VOEG MY TELLING BY LEIERBORD':'ADD MY SCORE TO LEADERBOARD',
    'JOU SPELERSNAAM (2–24 KARAKTERS)':'YOUR PLAYER NAME (2–24 CHARACTERS)',
    'Jou naam':'Your name','TERUG':'BACK','WYS TOP 20':'SHOW TOP 20',
    'TELLING INGESTUUR':'SCORE SUBMITTED','SUKSES':'SUCCESS','PROBEER WEER':'TRY AGAIN',
    'SPELER':'PLAYER','TELLING':'SCORE','SKOTE GEMIS':'MISSED SHOTS',
    'GEEN TELLING OM IN TE STUUR':'NO SCORE TO SUBMIT',
    'Nog geen tellings vir hierdie spel nie.':'No scores for this discipline yet.',
    'Leierbord nie beskikbaar nie.':'Leaderboard unavailable.',
    'Laai leierbord ...':'Loading leaderboard ...',
    'STUUR IN ...':'SUBMITTING ...', 'Stuur na Supabase ...':'Sending to Supabase ...',
    'SUKSES! Jou telling is op die leierbord.':'SUCCESS! Your score is on the leaderboard.',
    'Kon nie die telling stoor nie.':'Could not save your score.',
    'Hierdie rondte is reeds ingestuur.':'This round has already been submitted.',
    'Voer asseblief ’n geldige naam van 2–24 karakters in.':'Please enter a valid name of 2–24 characters.',
    'MACAUW - RONDTE VOLTOOI':'MACAUW - ROUND COMPLETE','UITSTEKENDE POGING!':'GREAT EFFORT!',
    'SPEEL WEER':'PLAY AGAIN','HOOFSKERM':'MAIN MENU','RONDE KLAAR':'ROUND COMPLETE',
    'NUWE PERSOONLIKE REKORD!':'NEW PERSONAL BEST!',
    'STOP SPEL':'STOP GAME','GEWEER KLANK AAN':'GUN SOUND ON','GEWEER KLANK AF':'GUN SOUND OFF',
    'AGTERGROND KLANK AAN':'BACKGROUND SOUND ON','AGTERGROND KLANK AF':'BACKGROUND SOUND OFF',
    'GEREED · VUUR!':'READY · FIRE!','TREFFER!':'HIT!','MIS!':'MISS!','HERLAAI...':'RELOADING...',
    'NET KILSONE TEL!':'ONLY VITAL ZONE HITS COUNT!','BILTONG!!':'BILTONG!!',
    'TEIKEN GEROEP · GEREED':'TARGET CALLED · READY','VERLORE TEIKEN':'LOST TARGET',
    'VOLSKERM NIE BESKIKBAAR NIE':'FULL SCREEN UNAVAILABLE',
    'VIBRASIE AAN':'VIBRATION ON','VIBRASIE AF':'VIBRATION OFF','GEEN VIBRASIE':'NO VIBRATION',
    'VOLSKERM':'FULL SCREEN','ROEP TEIKEN':'CALL TARGET','VERSTAAN':'GOT IT',
    'INSTALLEER MACAUW':'INSTALL MACAUW','MACAUW KLEIDUIFSKIETKLUB':'MACAUW CLAY SHOOTING CLUB',
    'Draai jou foon dwars':'Turn your phone sideways','PROBEER VOLSKERM-LANDSKAP':'TRY FULL-SCREEN LANDSCAPE',
    'DUBBEL':'DOUBLE','ENKEL':'SINGLE','HOË':'HIGH','LAE':'LOW','HOOG':'HIGH','LAAG':'LOW',
    'STADIG':'SLOW','MATIG':'MODERATE','MEDIUM':'MEDIUM','VINNIG':'FAST','BAIE VINNIG':'VERY FAST',
    'NABY':'NEAR','NABY-MIDDEL':'NEAR-MIDDLE','MIDDEL':'MIDDLE','MIDDEL-VER':'MIDDLE-FAR','VER':'FAR',
    'SKEET':'SKEET','TRAP':'TRAP','KG BILTONG':'KG BILTONG',
    'ROEP DIE TEIKEN':'CALL THE TARGET','STASIETYD VERSTREKE':'STATION TIME EXPIRED',
    'VOLGENDE':'NEXT','GEREED':'READY','VLAK':'LEVEL','REEKS':'STREAK'
  }));
  const phrases=[
    ['60 sekondes. Vyf al hoe moeiliker vlakke van dwarsvlieënde kleiduiwe. Mik voor die kleiduif; hoe vinniger dit vlieg, hoe verder voor hom moet jy mik.', '60 seconds. Five increasingly difficult levels of crossing clay targets. Lead the target; the faster it flies, the farther ahead you must aim.'],
    ['60 sekondes. Wegvlieënde kleiduiwe word vinniger en kleiner. Mik verder voor die kleiduif namate sy spoed toeneem.', '60 seconds. Outgoing clays become faster and smaller. Increase your lead as their speed increases.'],
    ['25 teikens op 8 stasies volgens die ISSF 2026-kwalifikasievolgorde. Een skoot per teiken; roep die teikens self.', '25 targets at 8 stations in the ISSF 2026 qualification sequence. One shot per target; call each target yourself.'],
    ['60 sekondes. Bewegende eende, ganse en Afrika-rotsduiwe oor ’n dam. Vyf moeiliker vlakke.', '60 seconds. Flying ducks, geese and African rock pigeons over a dam. Five increasingly difficult levels.'],
    ['60 sekondes. Hardlopende hase in oop veld. Vinniger en verder hase tel meer punte. Vyf moeiliker vlakke.', '60 seconds. Running hares across open ground. Faster and more distant hares earn more points. Five increasingly difficult levels.'],
    ['60 sekondes. Jou oorspronklike 154-raam koedoevideo, met natuurlike galop. Net kilsone-skote tel. 100 kg of meer per koedoe; biltong verskyn vir 0,5 sekondes op die teiken se plek.', '60 seconds. Your original 154-frame kudu video with natural gallop. Only vital-zone hits count. Each kudu is worth at least 100 kg; biltong appears for 0.5 seconds at the hit location.'],
    ['Ses spelmodusse met Skeet, Trap, Olimpiese Skeet, Voëls & Watervoëls en ’n aparte Hase-dissipline in oop veld.', 'Six game disciplines: Skeet, Trap, Olympic Skeet, Birds & Waterfowl, Hares and Kudu.'],
    ['Tik op ’n teiken om te skiet · Outomatiese herlaai · Android-vibrasie','Tap a target to shoot · Automatic reload · Android vibration'],
    ['Onafhanklike speletjie-konsep. Logo’s is slegs ter demonstrasie; geen amptelike borgskap of goedkeuring word geïmpliseer nie.','Independent game concept. Logos are for demonstration only; no official sponsorship or endorsement is implied.'],
    ['Die speletjie werk die beste in landskapmodus. Skakel Outo-draai aan as die skerm nie draai nie.','The game works best in landscape mode. Enable Auto-rotate if the screen does not turn.'],
    ['Skakel Outo-draai in jou foon se instellings aan en draai die foon dwars.','Enable Auto-rotate in your phone settings and turn it sideways.'],
    ['Skiet soveel moontlik kleiduiwe in 60 sekondes. Die teikens raak elke 12 sekondes moeiliker. Mik voor die kleiduif. Hoe vinniger dit vlieg, hoe verder voor die teiken moet jy mik om dit te tref.','Shoot as many clay targets as possible in 60 seconds. The targets get harder every 12 seconds. Aim ahead of the clay; faster targets require more lead.'],
    ['’n Ronde bestaan uit 25 teikens op agt stasies. Roep die teiken met die knoppie; dit verskyn ná ’n wisselende vertraging van 0 tot 3 sekondes. Skiet een keer per teiken in die aangeduide volgorde, ook by dubbels. Stasie 4 word weer besoek voordat stasie 8 volg.','A round consists of 25 targets across eight stations. Call a target with the button; it appears after a variable delay of 0–3 seconds. Fire once per target in the indicated order, including doubles. Station 4 is revisited before station 8.'],
    ['’n Arcade-spel met bewegende eende, ganse en Afrika-rotsduiwe oor ’n dam. Alle voëls vlieg reguit en hou hul lywe gelyk; net hul vlerke klap. Dit is geen amptelike ISSF-dissipline nie.','An arcade game featuring ducks, geese and African rock pigeons over a dam. Birds fly level with natural wingbeats. This is not an official ISSF discipline.'],
    ['’n Aparte 60-sekonde-dissipline op kort groen gras met bome weerskante en ’n vaste agtergrond. Hase hardloop teen verskillende snelhede en op verskillende afstande. Vinniger en verder hase gee meer punte.','A separate 60-second discipline on green grass with trees on either side. Hares run at different speeds and distances. Faster and farther targets earn more points.'],
    ['Tik direk op ’n teiken om te skiet. Ná twee skote laai die speletjie vanself. Op ondersteunde Android-fone vibreer die foon kortliks wanneer jy skiet.','Tap a target to shoot. The game reloads automatically after two shots. Supported Android phones vibrate briefly when you fire.'],
    ['Beweeg die muis of lugmuis en klik om te skiet. Die spasiebalk skiet en P onderbreek. Herlaai gebeur outomaties.','Move the mouse or air mouse and click to shoot. Space fires and P pauses. Reloading is automatic.'],
    ['Die 60-sekonde-uitdagings het vyf toenemende vlakke. Olimpiese Skeet volg eerder die vaste ISSF-volgorde.','The 60-second challenges have five increasing levels. Olympic Skeet follows the fixed ISSF sequence.'],
    ['Maak Chrome se kieslys oop en kies Installeer app of Voeg by tuisskerm.','Open Chrome’s menu and choose Install app or Add to Home screen.'],
    ['Macauw is reeds op hierdie toestel geïnstalleer.','Macauw is already installed on this device.'],
    ['Maak die speletjie in Safari oop. Tik Deel en kies Voeg by tuisskerm.','Open the game in Safari. Tap Share and choose Add to Home Screen.'],
    ['Android Chrome: tik die drie kolletjies en kies Installeer app of Voeg by tuisskerm. Op rekenaar: gebruik die Installeer-ikoon in die adresbalk, indien beskikbaar.','Android Chrome: open the three-dot menu and choose Install app or Add to Home screen. On desktop, use the install icon in the address bar if available.'],
    ['Speel Macauw E-Kleiduifuitdaging saam met my! Skeet, Trap, Olimpiese Skeet, Hase, Voëls en Koedoe:','Play the Macauw E-Clay Challenge with me! Skeet, Trap, Olympic Skeet, Hares, Birds and Kudu:']
  ];
  const words=[
    [/\bOLIMPIESE SKEET\b/g,'OLYMPIC SKEET'],[/\bWATERVOELS\b/g,'WATERFOWL'],[/\bVOËLS\b/g,'BIRDS'],
    [/\bRONDTE\b/g,'ROUND'],[/\bRONDE\b/g,'ROUND'],[/\bTEIKENS\b/g,'TARGETS'],[/\bTEIKEN\b/g,'TARGET'],
    [/\bTREFFERS\b/g,'HITS'],[/\bTREFFER\b/g,'HIT'],[/\bPUNTE\b/g,'POINTS'],[/\bSKOTE\b/g,'SHOTS'],
    [/\bAKKURAATHEID\b/g,'ACCURACY'],[/\bSTASIE\b/g,'STATION'],[/\bROEPVENSTER\b/g,'CALL WINDOW'],
    [/\bHOË HUIS\b/g,'HIGH HOUSE'],[/\bLAE HUIS\b/g,'LOW HOUSE'],[/\bGEMIS\b/g,'MISSED'],
    [/\bPERSOONLIKE BESTE\b/g,'PERSONAL BEST'],[/\bBESTE\b/g,'BEST'],[/\bNUWE\b/g,'NEW'],
    [/\bVOËLS\b/g,'BIRDS'],[/\bHASE\b/g,'HARES'],[/\bKLEIDUIWE\b/g,'CLAYS'],
    [/\bVERLORE\b/g,'LOST'],[/\bREEKS\b/g,'STREAK'],[/\bGEREED\b/g,'READY'],
    [/\bVLAK\b/g,'LEVEL'],[/\bVIR\b/g,'FOR'],[/\bSKIET\b/g,'SHOOT'],
    [/\bsekondes\b/gi,'seconds'],[/\bgemis\b/gi,'missed'],[/\bskote geneem\b/gi,'shots taken'],
    [/\bakkuraatheid\b/gi,'accuracy'],[/\bvoëls\b/gi,'birds'],[/\bhase\b/gi,'hares'],
    [/\bkleiduiwe\b/gi,'clays'],[/\bkoedoes\b/gi,'kudus'],[/\bgetref\b/gi,'hit'],
    [/\bin die kilsone\b/gi,'in the vital zone'],[/\bkg biltong\b/gi,'kg biltong'],
    [/\bskote gemis\b/gi,'missed shots'],[/\bBeste:/g,'Best:'],[/\bTEIKEN GEROEP\b/g,'TARGET CALLED'],
    [/\bVLAK (\d+)\b/g,'LEVEL $1'],[/\bSTASIE (\d+)\b/g,'STATION $1']
  ];
  function translate(raw){
    if(!raw.trim())return raw;
    const front=raw.match(/^\s*/)[0],back=raw.match(/\s*$/)[0];
    const core=raw.slice(front.length,raw.length-back.length);
    if(exact.has(core))return front+exact.get(core)+back;
    let text=core;
    for(const [a,b] of phrases)text=text.split(a).join(b);
    // Handle labels followed by numbers, scores and live game messages without touching numbers.
    for(const [a,b] of words)text=text.replace(a,b);
    text=text.replace(/\b(BEGIN|START) 60-SECOND(?:E)?[- ](ROUND|RONDTE)\b/gi,'START 60-SECOND ROUND')
      .replace(/\b(VERSTAAN|TERUG)\b/g,s=>s==='TERUG'?'BACK':'GOT IT');
    return front+text+back;
  }
  function skip(node){
    const p=node.parentElement;
    return !p||!!p.closest('script,style,textarea,option[data-player-name],#macauw-lang-control')||
      !!p.closest('#macauwLbRows [style*="border-top"]'); // Preserve Supabase player names.
  }
  function applyText(node){
    if(skip(node))return;
    const current=node.nodeValue;
    let state=originals.get(node);
    if(!state||current!==state.last){state={original:current,last:current};originals.set(node,state);}
    const output=lang==='en'?translate(state.original):state.original;
    if(current!==output){state.last=output;node.nodeValue=output;}
  }
  function applyAttrs(el){
    if(!el||el.nodeType!==1||el.closest('#macauw-lang-control'))return;
    for(const name of ['aria-label','title','placeholder']){
      if(!el.hasAttribute(name))continue;
      let record=attrOriginals.get(el);
      if(!record){record={};attrOriginals.set(el,record);}
      let state=record[name];const current=el.getAttribute(name);
      if(!state||current!==state.last){state={original:current,last:current};record[name]=state;}
      const output=lang==='en'?translate(state.original):state.original;
      if(current!==output){state.last=output;el.setAttribute(name,output);}
    }
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){applyText(root);return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1){applyAttrs(root);if(root.matches('script,style,#macauw-lang-control'))return;}
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    let node;
    while((node=walker.nextNode())){
      if(node.nodeType===3)applyText(node);
      else if(node.nodeType===1)applyAttrs(node);
    }
  }
  function renderControl(){
    if(document.getElementById('macauw-lang-control'))return;
    const intro=document.querySelector('#intro .welcome-settings');if(!intro)return;
    const actions=[...document.querySelectorAll('button')].find(b=>b.id==='macauw-share-whatsapp'||b.textContent.includes('DEEL VIA WHATSAPP'))?.parentElement;
    const control=document.createElement('div');control.id='macauw-lang-control';
    control.style.cssText='display:flex;gap:7px;align-items:center;justify-content:center;margin:8px 0 5px;flex-wrap:wrap;';
    const label=document.createElement('span');label.textContent='LANGUAGE / TAAL';label.style.cssText='font:800 11px system-ui;color:#b4c9d6;letter-spacing:.7px;margin-right:5px;';
    control.append(label);
    for(const [code,name] of [['af','AFRIKAANS'],['en','ENGLISH']]){
      const b=document.createElement('button');b.type='button';b.textContent=name;b.dataset.lang=code;
      b.style.cssText='padding:8px 12px;border-radius:8px;border:1px solid #80a5bc;font:800 12px system-ui;cursor:pointer;';
      b.onclick=()=>setLanguage(code);control.append(b);
    }
    if(actions&&actions.parentNode)actions.parentNode.insertBefore(control,actions);
    else intro.append(control);
    updateButtons();
  }
  function updateButtons(){
    document.documentElement.lang=lang==='en'?'en':'af-ZA';
    document.querySelectorAll('#macauw-lang-control button').forEach(b=>{
      const active=b.dataset.lang===lang;
      b.style.background=active?'#e8a347':'#173c54';b.style.color=active?'#101f2d':'#fff';
      b.setAttribute('aria-pressed',String(active));
    });
  }
  function setLanguage(next){
    if(next!=='af'&&next!=='en')return;
    lang=next;try{localStorage.setItem(KEY,next);}catch(_){ }
    updateButtons();walk(document.body);
    window.dispatchEvent(new CustomEvent('macauwlanguagechange',{detail:{language:next}}));
  }
  window.MacauwLanguage={get:()=>lang,set:setLanguage};
  const observer=new MutationObserver(records=>{
    for(const m of records){
      if(m.type==='characterData')applyText(m.target);
      else if(m.type==='attributes')applyAttrs(m.target);
      else for(const n of m.addedNodes)walk(n);
    }
    if(!document.getElementById('macauw-lang-control'))renderControl();
  });
  function start(){
    renderControl();walk(document.body);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
