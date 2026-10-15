(()=>{
 const target=document.getElementById('onlinemoten');if(!target)return;
 const go=()=>{const header=document.querySelector('header.al-header');const offset=(header?header.getBoundingClientRect().height:0)+22;const top=window.scrollY+target.getBoundingClientRect().top-offset;window.scrollTo({top:Math.max(0,top),behavior:'instant'});};
 const match=()=>decodeURIComponent(location.hash)==='#onlinemoten';
 // Handle both menu navigation and the in-page "Se onlinemöten" link.
 document.querySelectorAll('a[href]').forEach(a=>{if(a.getAttribute('href').endsWith('#onlinemoten'))a.addEventListener('click',()=>{requestAnimationFrame(()=>requestAnimationFrame(go))});});
 window.addEventListener('hashchange',()=>{if(match())requestAnimationFrame(go)});
 window.addEventListener('load',()=>{if(match()){go();setTimeout(go,250);setTimeout(go,900)}});
 if(document.readyState==='complete'&&match())requestAnimationFrame(go);
})();