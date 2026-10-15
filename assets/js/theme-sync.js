/* AlgoLodge 4.20 — one theme controller shared by every page. */
(function(){
  "use strict";
  const key="algolodge-theme";
  const root=document.documentElement;
  const system=window.matchMedia("(prefers-color-scheme: dark)");
  function stored(){
    try { const value=localStorage.getItem(key); return value==="dark"||value==="light"?value:null; }
    catch(error){return null;}
  }
  function apply(mode){
    const dark=mode==="dark";
    root.dataset.theme=mode;
    root.style.colorScheme=mode;
    if(document.body)document.body.classList.toggle("dark",dark);
    document.querySelectorAll("#theme, #guide-theme").forEach(button=>{
      button.setAttribute("aria-label",dark?"Byt till ljust tema":"Byt till mörkt tema");
      button.setAttribute("title",dark?"Ljust tema":"Mörkt tema");
      button.setAttribute("aria-pressed",String(dark));
      if(!button.querySelector("#themeIcon"))button.textContent=dark?"☀":"☾";
    });
    document.querySelectorAll("#themeIcon").forEach(icon=>icon.textContent=dark?"☀":"☾");
  }
  function save(mode){try{localStorage.setItem(key,mode);}catch(error){}}
  function current(){return root.dataset.theme==="dark"?"dark":"light";}
  function init(){
    apply(stored()||(system.matches?"dark":"light"));
    document.querySelectorAll("#theme, #guide-theme").forEach(button=>{
      if(button.dataset.alThemeBound==="1")return;
      button.dataset.alThemeBound="1";
      button.addEventListener("click",()=>{
        const next=current()==="dark"?"light":"dark";
        save(next);apply(next);
      });
    });
  }
  // Head bootstrap sets the theme before page paints.
  apply(root.dataset.theme==="dark"?"dark":"light");
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("storage",event=>{
    if(event.key===key)apply(stored()||(system.matches?"dark":"light"));
  });
  if(system.addEventListener)system.addEventListener("change",()=>{
    if(!stored())apply(system.matches?"dark":"light");
  });
})();
