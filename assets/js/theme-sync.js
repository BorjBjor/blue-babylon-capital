/* AlgoLodge 3.7 — synchronize dark theme across all pages */
(()=> {
 const saved=localStorage.getItem('algolodge-theme')==='dark';
 function sync(){
   const dark=document.body.classList.contains('dark') || document.documentElement.dataset.theme==='dark';
   document.documentElement.dataset.theme=dark?'dark':'light';
   document.documentElement.style.colorScheme=dark?'dark':'light';
 }
 if(saved)document.documentElement.dataset.theme='dark';
 sync();
 const observer=new MutationObserver(sync);
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 const buttons=[document.getElementById('theme'),document.getElementById('guide-theme')].filter(Boolean);
 buttons.forEach(btn=>btn.addEventListener('click',()=>requestAnimationFrame(sync)));
 window.addEventListener('storage',e=>{if(e.key==='algolodge-theme')location.reload()});
})();
