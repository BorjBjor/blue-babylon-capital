(()=>{
'use strict';
const supported=['en','sv','es','fr','de','tr','nb','da','fi'];
const dict=window.ALGO_TRANSLATIONS||{};
const select=document.getElementById('global-language')||document.getElementById('lang');
let lang=localStorage.getItem('algolodge-lang')||'en';if(!supported.includes(lang))lang='en';
const saved=new WeakMap();
function translateText(text){let v=text.trim();if(!v)return null;return dict[lang]?.[v]||null}
function apply(){
 document.documentElement.lang=lang;
 if(select)select.value=lang;
 document.querySelectorAll('main,header,footer').forEach(root=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;while(node=walker.nextNode()){
   if(!node.parentElement||node.parentElement.closest('script,style,svg,[data-i]'))continue;
   if(!saved.has(node))saved.set(node,node.nodeValue);
   const original=saved.get(node);const leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0];
   const translated=lang==='en'?null:translateText(original);
   node.nodeValue=translated?leading+translated+trailing:original;
  }
 });
}
if(!select)return;
select.addEventListener('change',e=>{lang=e.target.value;localStorage.setItem('algolodge-lang',lang);apply()});
apply();
// app.js generates strategy cards after load; translate stable text after its rendering.
if(document.getElementById('lang')){document.getElementById('lang').addEventListener('change',()=>queueMicrotask(apply));}
})();