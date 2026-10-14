// AlgoLodge English-first build. Language selector reserved for future translations.
const items=[['Vitalik','Ξ','crypto','Systematisk strategi för kryptohandel.'],['Satoshi','₿','crypto','Regelbaserad handel på kryptomarknader.'],['Krypto Knight','♞','crypto','Systematisk strategi för digitala tillgångar.'],['Gold Bug','◆','commodity','Systematisk handel på guldmarknaden.'],['Hot Commodities','↗','commodity','Systematisk handel på råvarumarknader.'],['Soft Commodities','◈','commodity','Systematisk handel med mjuka råvaror.']];
const steps=[['Utforska strategier','Granska metod, risker och verifierade resultat när de publiceras.'],['Kontrollera behörighet','Kontrollera att CFD-handel och DupliTrade erbjuds i ditt land.'],['Öppna mäklarkonto','Ansök hos AvaTrade där det är möjligt och genomför deras kontroller.'],['Anslut DupliTrade','Koppla ett godkänt konto och välj en tillgänglig strategi.'],['Ställ in risk och följ upp','Förstå kapitalfördelning, kostnader och risk innan du aktiverar kopiering.']];

function renderCards(){
 for(const group of ['crypto','commodity']){
  const container=document.getElementById(group+'Cards');
  if(!container)continue;
  container.innerHTML=items.filter(x=>x[2]===group).map(([name,symbol,type,desc])=>
  `<article class="strategy-card"><div class="card-top"><span class="strategy-symbol">${symbol}</span><span class="card-tag">${type==='crypto'?'KRYPTO-CFD':'RÅVARU-CFD'}</span></div><h3>${name}</h3><p>${desc}</p><a class="card-bottom" href="strategy.html?name=${encodeURIComponent(name)}">Visa historik ↗</a></article>`).join('');
 }
 const stepsEl=document.getElementById('steps');
 if(stepsEl)stepsEl.innerHTML=steps.map(([title,desc],i)=>`<div class="step"><div class="step-num">0${i+1} / 05</div><h3>${title}</h3><p>${desc}</p></div>`).join('');
}
renderCards();
document.documentElement.lang='en';
const theme=document.getElementById('theme');
function applyTheme(d){
 document.body.classList.toggle('dark',d);
 const icon=document.getElementById('themeIcon');if(icon)icon.textContent=d?'☀':'☾';
 if(theme)theme.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme');
 localStorage.setItem('algolodge-theme',d?'dark':'light');
}
applyTheme(localStorage.getItem('algolodge-theme')==='dark');
if(theme)theme.addEventListener('click',()=>applyTheme(!document.body.classList.contains('dark')));
const menu=document.getElementById('menu');
if(menu)menu.addEventListener('click',()=>{
 const nav=document.getElementById('nav');nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(nav.classList.contains('open')));
});
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
