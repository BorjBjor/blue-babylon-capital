// AlgoLodge English-first build. Language selector reserved for future translations.
const items=[['Vitalik','Ξ','crypto','Systematic crypto trading strategy.'],['Satoshi','₿','crypto','Rule-based approach to crypto markets.'],['Krypto Knight','♞','crypto','Systematic strategy for digital assets.'],['Gold Bug','◆','commodity','Systematic approach to gold markets.'],['Hot Commodities','↗','commodity','Systematic approach to commodity markets.'],['Soft Commodities','◈','commodity','Systematic approach to soft commodities.']];
const steps=[['Explore strategies','Review the approach, risks and verified results when published.'],['Check eligibility','Confirm CFD and DupliTrade availability in your country.'],['Open a broker account','Apply with AvaTrade where eligible and complete its checks.'],['Connect DupliTrade','Link an eligible account and select an available strategy.'],['Set risk & monitor','Understand allocation, costs and risk before activating copying.']];

function renderCards(){
 for(const group of ['crypto','commodity']){
  const container=document.getElementById(group+'Cards');
  if(!container)continue;
  container.innerHTML=items.filter(x=>x[2]===group).map(([name,symbol,type,desc])=>
  `<article class="strategy-card"><div class="card-top"><span class="strategy-symbol">${symbol}</span><span class="card-tag">${type==='crypto'?'CRYPTO CFD':'COMMODITY CFD'}</span></div><h3>${name}</h3><p>${desc}</p><a class="card-bottom" href="strategy.html?name=${encodeURIComponent(name)}">View historical data ↗</a></article>`).join('');
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
