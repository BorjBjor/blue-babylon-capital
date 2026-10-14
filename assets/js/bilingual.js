(()=>{
const dict=window.ALGO_SV||{};
const select=document.getElementById('lang')||document.getElementById('global-language');
let lang=localStorage.getItem('algolodge-language')==='sv'?'sv':'en';
const originalText=new WeakMap(),originalAttrs=new WeakMap();
function translate(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  const parent=node.parentElement;
  if(!parent||parent.closest('script,style,svg,option'))continue;
  if(!originalText.has(node))originalText.set(node,node.nodeValue);
  const raw=originalText.get(node),key=raw.trim();
  const translated=lang==='sv'&&Object.prototype.hasOwnProperty.call(dict,key)?dict[key]:key;
  const lead=raw.match(/^\s*/)[0],trail=raw.match(/\s*$/)[0];
  const newValue=key?lead+translated+trail:raw;
  if(node.nodeValue!==newValue)node.nodeValue=newValue;
 }
 root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el=>{
  let old=originalAttrs.get(el);
  if(!old){old={};for(const attr of ['aria-label','placeholder','title'])if(el.hasAttribute(attr))old[attr]=el.getAttribute(attr);originalAttrs.set(el,old)}
  for(const [attr,raw] of Object.entries(old))el.setAttribute(attr,lang==='sv'&&(raw in dict)?dict[raw]:raw);
 });
}
function apply(){
 document.documentElement.lang=lang;
 if(select)select.value=lang;
 translate(document.body);
}
let scheduled=false;
const observer=new MutationObserver(records=>{
 if(scheduled||!records.some(r=>r.type==='childList'&&r.addedNodes.length))return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;apply()});
});
observer.observe(document.body,{childList:true,subtree:true});
if(select)select.addEventListener('change',()=>{
 if(!['en','sv'].includes(select.value))return;
 lang=select.value;
 localStorage.setItem('algolodge-language',lang);
 apply();
});
apply();
})();
