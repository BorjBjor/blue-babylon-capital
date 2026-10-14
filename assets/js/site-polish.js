// AlgoLodge 2.9 — accessible mobile navigation and anchor behavior
(()=>{
const menu=document.getElementById('menu');
const nav=document.getElementById('nav');
if(!menu||!nav)return;
function closeMenu(){
 nav.classList.remove('open');
 menu.setAttribute('aria-expanded','false');
 menu.setAttribute('aria-label','Open menu');
}
menu.addEventListener('click',()=>{
 const isOpen=nav.classList.contains('open');
 menu.setAttribute('aria-label',isOpen?'Close menu':'Open menu');
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
const mq=window.matchMedia('(min-width:761px)');
mq.addEventListener?.('change',e=>{if(e.matches)closeMenu()});
})();
