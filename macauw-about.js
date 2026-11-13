/* Macauw About panel — credits and contact only. No game logic changes. */
(() => {
  'use strict';
  function init() {
    const menu = document.querySelector('#intro .welcome-settings');
    if (!menu || document.getElementById('macauw-about-button')) return;
    const css = document.createElement('style');
    css.textContent = `
      #macauw-about-button{display:block;max-width:240px;width:100%;margin:12px auto 0;padding:9px 14px;border:1px solid #78a3bb;border-radius:9px;background:#17374b;color:#fff;font:800 13px/1.3 system-ui,sans-serif;cursor:pointer}
      #macauw-about-dialog{position:fixed;inset:0;z-index:2147483000;background:rgba(3,14,24,.89);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow:auto}
      #macauw-about-dialog *{box-sizing:border-box}
      #macauw-about-dialog .macauw-about-card{position:relative;width:min(440px,100%);max-height:92vh;overflow:auto;padding:24px 22px;border:1px solid #5b91ad;border-radius:17px;background:#11334a;color:#fff;text-align:center;box-shadow:0 18px 64px #000a;font-family:system-ui,sans-serif}
      #macauw-about-dialog .macauw-about-close{position:absolute;right:10px;top:10px;border:1px solid #7294a5;background:#23475d;border-radius:7px;color:#fff;font-size:13px;font-weight:800;padding:7px 10px;cursor:pointer}
      #macauw-about-dialog .macauw-about-logo{display:block;max-width:230px;width:70%;max-height:100px;object-fit:contain;margin:8px auto 12px}
      #macauw-about-dialog .macauw-about-brand{font-size:24px;font-weight:850;color:#ffbf61;margin:12px auto}
      #macauw-about-dialog h2{font-size:21px;margin:4px 0 14px}
      #macauw-about-dialog p{margin:7px 0;font-size:14px;line-height:1.5}
      #macauw-about-dialog a{color:#bce8ff;text-decoration:underline;overflow-wrap:anywhere}
      #macauw-about-dialog .macauw-about-sep{height:1px;background:#ffffff35;margin:17px 0}
    `;
    document.head.appendChild(css);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'macauw-about-button';
    btn.textContent = 'OOR HIERDIE APP / ABOUT';
    btn.addEventListener('click', () => {
      document.getElementById('macauw-about-dialog')?.remove();
      const english = window.MacauwLanguage?.get?.() === 'en';
      const dialog = document.createElement('div');
      dialog.id = 'macauw-about-dialog';
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      dialog.setAttribute('aria-label',english?'About this app':'Oor hierdie app');
      const card = document.createElement('div');
      card.className = 'macauw-about-card';
      const close = document.createElement('button');
      close.type='button'; close.className='macauw-about-close';
      close.textContent=english?'CLOSE':'SLUIT';
      close.setAttribute('aria-label',english?'Close About dialog':'Sluit Oor hierdie app');
      const dismiss=()=>{dialog.remove();btn.focus();};
      close.addEventListener('click',dismiss);
      const h=document.createElement('h2');h.textContent=english?'About this app':'Oor hierdie app';
      const logo = document.createElement('img');
      logo.className='macauw-about-logo';logo.alt='myAIpartner';
      logo.src='/assets/myaipartner-logo.png';
      const brand = document.createElement('div');brand.className='macauw-about-brand';brand.textContent='myAIpartner';brand.hidden=true;
      logo.addEventListener('error',()=>{logo.style.display='none';brand.hidden=false;});
      const owner=document.createElement('p');
      owner.innerHTML=english?'Developed by <strong>Chris de Vries</strong>':'Ontwikkel deur <strong>Chris de Vries</strong>';
      const company=document.createElement('p');company.textContent='myAIpartner — Architects of Intelligence';
      const sep=document.createElement('div');sep.className='macauw-about-sep';
      const contact=document.createElement('p');contact.textContent=english?'Contact':'Kontak';contact.style.fontWeight='800';
      const addLink=(text,href)=>{const p=document.createElement('p');const a=document.createElement('a');a.textContent=text;a.href=href;if(/^https?:/.test(href)){a.target='_blank';a.rel='noopener noreferrer';}p.appendChild(a);return p;};
      card.append(close,h,logo,brand,owner,company,sep,contact,
        addLink('chris@myaipartner.co.za','mailto:chris@myaipartner.co.za'),
        addLink('+27 64 858 8748','tel:+27648588748'),
        addLink('www.myaipartner.co.za','https://www.myaipartner.co.za'));
      dialog.appendChild(card);dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss();});
      document.body.appendChild(dialog);
      const onKey=e=>{if(e.key==='Escape'){document.removeEventListener('keydown',onKey);if(dialog.isConnected)dismiss();}};
      document.addEventListener('keydown',onKey);
      close.focus();
    });
    menu.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
