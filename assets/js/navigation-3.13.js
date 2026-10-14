(()=>{
const menu=document.getElementById('menu'),nav=document.getElementById('al-navigation');
document.documentElement.lang='sv';
localStorage.removeItem('algolodge-language');
if(nav)nav.querySelectorAll('a').forEach((a,i)=>a.textContent=['Strategier','Resultat','Så fungerar det','Arkad','Om oss'][i]||a.textContent);
if(menu&&nav){
 const close=()=>{nav.classList.remove('al-open');menu.setAttribute('aria-expanded','false')};
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('al-open');menu.setAttribute('aria-expanded',String(open))});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('click',e=>{if(!e.target.closest('.al-header'))close()});
}
const theme=document.getElementById('theme')||document.getElementById('guide-theme');
function syncTheme(){
 const dark=localStorage.getItem('algolodge-theme')==='dark';
 document.body.classList.toggle('dark',dark);
 document.documentElement.dataset.theme=dark?'dark':'light';
 if(theme)theme.textContent=dark?'☀':'☾';
}
if(theme)theme.addEventListener('click',e=>{
 e.stopImmediatePropagation();
 localStorage.setItem('algolodge-theme',document.body.classList.contains('dark')?'light':'dark');
 syncTheme();
},true);
syncTheme();
})();
