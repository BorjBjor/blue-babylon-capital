(()=>{
'use strict';
const supported=['en','sv','es','fr','de','tr','nb','da','fi'];
const dict=window.ALGO_TRANSLATIONS||{};
const select=document.getElementById('global-language')||document.getElementById('lang');
let lang=localStorage.getItem('algolodge-lang')||'en';
if(!supported.includes(lang))lang='en';
const originals=new WeakMap();
const skip='script,style,svg,option';
function translateText(original){
 const key=original.trim();
 return (lang!=='en'&&key&&Object.prototype.hasOwnProperty.call(dict[lang]||{},key))?dict[lang][key]:null;
}
function apply(){
 document.documentElement.lang=lang;
 if(select)select.value=lang;
 document.querySelectorAll('main,header,footer,.site-language').forEach(root=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(!node.parentElement||node.parentElement.closest(skip))continue;
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const orig=originals.get(node);
   const result=translateText(orig);
   node.nodeValue=result===null?orig:orig.match(/^\s*/)[0]+result+orig.match(/\s*$/)[0];
  }
  root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
   for(const attr of ['aria-label','title','placeholder']){
    if(!el.hasAttribute(attr))continue;
    const key='algo-original-'+attr;
    if(!el.hasAttribute(key))el.setAttribute(key,el.getAttribute(attr));
    const original=el.getAttribute(key);
    el.setAttribute(attr,translateText(original)||original);
   }
  });
 });
}
if(!select)return;
select.addEventListener('change',e=>{
 lang=supported.includes(e.target.value)?e.target.value:'en';
 localStorage.setItem('algolodge-lang',lang);
 requestAnimationFrame(apply);
});
apply();
const observer=new MutationObserver(()=>{if(!observer.pending){observer.pending=true;requestAnimationFrame(()=>{observer.pending=false;apply()})}});
observer.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
})();