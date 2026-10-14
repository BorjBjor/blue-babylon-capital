(()=>{
'use strict';
const dict=window.ALGO_SV||{};
const select=document.getElementById('lang');
const menu=document.getElementById('menu');
const nav=document.getElementById('al-navigation');
const theme=document.getElementById('theme')||document.getElementById('guide-theme');
const params=new URLSearchParams(location.search);
const requested=params.get('lang');
let lang=(requested==='sv'||requested==='en')?requested:(localStorage.getItem('algolodge-language')==='sv'?'sv':'en');
localStorage.setItem('algolodge-language',lang);
const originals=new WeakMap();
const attributes=new WeakMap();
const navText={sv:['Strategier','Resultat','Så fungerar det','Arkad','Om oss'],en:['Strategies','Performance','How It Works','Arkad','About']};
function updateNav(){nav.querySelectorAll('a').forEach((a,i)=>a.textContent=navText[lang][i]);}
function translate(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  if(!node.parentElement||node.parentElement.closest('script,style,svg,option,.al-navigation'))continue;
  if(!originals.has(node))originals.set(node,node.nodeValue);
  const raw=originals.get(node),key=raw.trim();
  if(!key)continue;
  const val=lang==='sv'&&Object.prototype.hasOwnProperty.call(dict,key)?dict[key]:key;
  const result=raw.match(/^\s*/)[0]+val+raw.match(/\s*$/)[0];
  if(node.nodeValue!==result)node.nodeValue=result;
 }
 root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
  if(el.closest('.al-header'))return;
  if(!attributes.has(el)){
   const orig={};for(const attr of ['aria-label','title','placeholder'])if(el.hasAttribute(attr))orig[attr]=el.getAttribute(attr);
   attributes.set(el,orig);
  }
  for(const [attr,val] of Object.entries(attributes.get(el)))el.setAttribute(attr,lang==='sv'&&dict[val]?dict[val]:val);
 });
}
function rewriteLinks(){
 document.querySelectorAll('a[href]').forEach(a=>{
  const raw=a.getAttribute('href');
  if(!raw||raw.startsWith('#')||/^(mailto:|tel:|https?:|javascript:)/i.test(raw))return;
  const url=new URL(raw,location.href);
  if(url.origin!==location.origin||!url.pathname.endsWith('.html'))return;
  url.searchParams.set('lang',lang);
  a.setAttribute('href',url.pathname.split('/').pop()+url.search+url.hash);
 });
}
function apply(){document.documentElement.lang=lang;if(select)select.value=lang;updateNav();translate(document.body);rewriteLinks();}
let scheduled=false;
const observer=new MutationObserver(records=>{
 if(scheduled||!records.some(r=>r.type==='childList'&&r.addedNodes.length))return;
 scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()});
});
observer.observe(document.body,{childList:true,subtree:true});
if(select)select.addEventListener('change',()=>{
 if(!['en','sv'].includes(select.value))return;
 lang=select.value;localStorage.setItem('algolodge-language',lang);
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 apply();
});
function closeMenu(){nav.classList.remove('al-open');menu.setAttribute('aria-expanded','false')}
if(menu){menu.addEventListener('click',()=>{const opened=nav.classList.toggle('al-open');menu.setAttribute('aria-expanded',String(opened))});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.addEventListener('click',e=>{if(!e.target.closest('.al-header'))closeMenu()});}
function syncTheme(){const dark=localStorage.getItem('algolodge-theme')==='dark';document.body.classList.toggle('dark',dark);document.documentElement.dataset.theme=dark?'dark':'light';if(theme)theme.textContent=dark?'☀':'☾';}
// The guide previously had an inline theme handler; other pages may already bind their own handler.
// Capture phase keeps a consistent state and prevents duplicate toggling.
if(theme){theme.addEventListener('click',e=>{e.stopImmediatePropagation();localStorage.setItem('algolodge-theme',document.body.classList.contains('dark')?'light':'dark');syncTheme()},true)}
syncTheme();apply();
})();