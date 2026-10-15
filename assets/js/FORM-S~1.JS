/* AlgoLodge 3.83: after revealing the contact form, scroll to its start below the sticky header. */
(()=>{
const pairs=[['al-open-contact-toggle','al-open-contact-panel'],['avatrade-contact-toggle','avatrade-contact-panel']];
for(const [toggleId,panelId] of pairs){
 const toggle=document.getElementById(toggleId),panel=document.getElementById(panelId);
 if(!toggle||!panel)continue;
 let opening=false;
 function scrollToForm(){
   if(panel.hidden)return;
   const header=document.querySelector('header.al-header');
   const offset=(header?header.getBoundingClientRect().height:0)+20;
   const top=window.scrollY+panel.getBoundingClientRect().top-offset;
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   window.scrollTo({top:Math.max(0,top),behavior:reduced?'auto':'smooth'});
 }
 const observer=new MutationObserver(()=>{
   if(opening&&!panel.hidden){
     opening=false;
     requestAnimationFrame(()=>requestAnimationFrame(scrollToForm));
   }
 });
 observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 toggle.addEventListener('click',()=>{
   if(panel.hidden){
     opening=true;
     // Existing page script reveals the panel on the same click.
     requestAnimationFrame(()=>{
       if(!panel.hidden&&opening){opening=false;requestAnimationFrame(scrollToForm)}
     });
   }else opening=false;
 });
}
})();