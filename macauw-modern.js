/* Macauw: start-menu-only visual enhancement. Does not affect game handlers. */
(() => {
  'use strict';
  function init(){
    const heading=document.querySelector('#intro .welcome-heading');
    const start=document.getElementById('start');
    if (!heading || !start) return;
    if (!heading.querySelector('.macauw-modern-badge')) {
      const img=document.createElement('img');
      img.className='macauw-modern-badge';
      img.src='/assets/macauw-club.png';
      img.alt='Macauw club badge';
      img.decoding='async';
      heading.prepend(img);
    }
    function beginLabel(){
      if(start.textContent.trim()!=='▶ BEGIN') start.textContent='▶ BEGIN';
    }
    beginLabel();
    new MutationObserver(beginLabel).observe(start,{subtree:true,childList:true,characterData:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
