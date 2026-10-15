(()=>{
const menu=document.getElementById('menu'),nav=document.getElementById('al-navigation');
document.documentElement.lang='sv';
localStorage.removeItem('algolodge-language');
if(nav && !nav.querySelector('.al-nav-dropdown'))nav.querySelectorAll('a').forEach((a,i)=>a.textContent=['Aktuellt','Investeringsmodeller','Så fungerar det','Om oss','Kontakt','Öppna konto'][i]||a.textContent);
if(menu&&nav){
 const close=()=>{nav.classList.remove('al-open');menu.setAttribute('aria-expanded','false')};
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('al-open');menu.setAttribute('aria-expanded',String(open))});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('click',e=>{if(!e.target.closest('.al-header'))close()});
}
})();
