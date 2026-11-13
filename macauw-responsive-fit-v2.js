/* Macauw responsive main menu fit v2. Never touches gameplay or database. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  const card = intro?.querySelector('.welcome-card');
  if (!intro || !card) return;
  let busy = false;
  let previousSignature = '';
  function fit() {
    if (busy) return;
    busy = true;
    requestAnimationFrame(() => {
      try {
        if (!intro.isConnected || getComputedStyle(intro).display === 'none') return;
        card.style.removeProperty('transform');
        card.style.removeProperty('zoom');
        const width = Math.max(1, intro.clientWidth - 8);
        const height = Math.max(1, intro.clientHeight - 10);
        // Scale the real rendered content only when the compact CSS is still too tall.
        const naturalWidth = Math.max(card.scrollWidth, card.getBoundingClientRect().width);
        const naturalHeight = Math.max(card.scrollHeight, card.getBoundingClientRect().height);
        const scale = Math.min(1, width / naturalWidth, height / naturalHeight);
        if (scale < 0.995) {
          card.style.setProperty('transform', `scale(${Math.max(0.50,scale).toFixed(4)})`, 'important');
        }
      } finally {busy = false;}
    });
  }
  const schedule = () => requestAnimationFrame(fit);
  addEventListener('resize', schedule, {passive:true});
  addEventListener('orientationchange', schedule, {passive:true});
  addEventListener('load', schedule);
  if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(()=>{});
  const mo = new MutationObserver(() => {
    const signature = [intro.className,card.childElementCount,card.scrollHeight,card.scrollWidth].join(':');
    if (signature !== previousSignature) { previousSignature=signature; schedule(); }
  });
  mo.observe(intro,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
  schedule();
  setTimeout(schedule,300);
  setTimeout(schedule,1000);
})();
