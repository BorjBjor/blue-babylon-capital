/* Shared AlgoLodge header navigation – reliable at laptop zoom and mobile widths. */
(()=>{
  function init(){
    const header=document.querySelector('.al-header');
    const nav=document.getElementById('al-navigation');
    const button=document.getElementById('menu');
    if(!header||!nav)return;

    const account=nav.querySelector('a[href="oppna-konto.html"]');
    if(account){account.textContent='Öppna konto';nav.append(account);}

    if(button){
      function setOpen(open){
        nav.classList.toggle('al-open',open);
        nav.classList.remove('is-open');
        nav.dataset.open=String(open);
        button.setAttribute('aria-expanded',String(open));
        button.setAttribute('aria-label',open?'Stäng menyn':'Öppna menyn');
        if(!open){
          nav.querySelectorAll('.al-nav-dropdown.is-open').forEach(dropdown=>{
            dropdown.classList.remove('is-open');
            const toggle=dropdown.querySelector('.al-dropdown-toggle');
            if(toggle)toggle.setAttribute('aria-expanded','false');
          });
        }
      }

      button.addEventListener('click',()=>{
        setOpen(button.getAttribute('aria-expanded')!=='true');
      });
      nav.addEventListener('click',event=>{
        if(event.target.closest('a'))setOpen(false);
      });
      document.addEventListener('click',event=>{
        if(!header.contains(event.target))setOpen(false);
      });
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape')setOpen(false);
      });
      const desktop=window.matchMedia('(min-width:1321px)');
      desktop.addEventListener?.('change',event=>{
        if(event.matches)setOpen(false);
      });
    }

    const path=location.pathname.split('/').pop()||'index.html';
    nav.querySelectorAll('a[aria-current]').forEach(a=>a.removeAttribute('aria-current'));
    for(const a of nav.querySelectorAll('a[href]')){
      if(a.getAttribute('href').split('#')[0]===path){
        a.setAttribute('aria-current','page');
        break;
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
