const programs={
'Vitalik':['KRYPTOSTRATEGI','Systematisk handel med digitala tillgångar','Vitalik är en av AlgoLodges utvalda kryptostrategier. Marknader, regler för inträde och utträde samt aktuell listning på DupliTrade beskrivs efter verifiering.'],
'Satoshi':['KRYPTOSTRATEGI','Systematisk handel med digitala tillgångar','Satoshi är ett utvalt kryptoprogram. Positionsstorlek, marknadsexponering och handelsinstrument bekräftas mot det aktuella utbudet på DupliTrade.'],
'Krypto Knight':['KRYPTOSTRATEGI','Systematisk handel med digitala tillgångar','Krypto Knight ingår i AlgoLodges kryptostrategier. När uppgifterna verifierats publiceras mer detaljerade regler och tillgängliga CFD-instrument.'],
'Gold Bug':['RÅVARUSTRATEGI','Systematisk handel med ädelmetaller','Gold Bug fokuserar på ädelmetaller. Aktuella instrument, hävstång och genomförande behöver bekräftas.'],
'Hot Commodities':['RÅVARUSTRATEGI','Systematisk råvaruhandel','Hot Commodities är ett utvalt systematiskt råvaruprogram. Aktuella marknader och handelsparametrar publiceras efter verifiering.'],
'Soft Commodities':['RÅVARUSTRATEGI','Systematisk handel med mjuka råvaror','Soft Commodities fokuserar på mjuka råvaror. Tillgängliga CFD-instrument och exakta riskinställningar bekräftas före lansering.']};
const q=new URLSearchParams(location.search).get('name');const name=Object.hasOwn(programs,q)?q:'Satoshi';const [type,summary,description]=programs[name];document.title=name+' | AlgoLodge';document.getElementById('title').textContent=name;document.getElementById('type').textContent=type;document.getElementById('summary').textContent=summary;document.getElementById('description').textContent=description;document.getElementById('report').href='results.html?strategy='+encodeURIComponent(name);const b=document.body,t=document.getElementById('theme');function setTheme(d){b.classList.toggle('dark',d);t.textContent=d?'☀':'☾';localStorage.setItem('algolodge-theme',d?'dark':'light')}setTheme(localStorage.getItem('algolodge-theme')==='dark');t.onclick=()=>setTheme(!b.classList.contains('dark'));

const profile={
 'Vitalik':['Digital assets / crypto CFDs','Crypto systematic strategy'],
 'Satoshi':['Digital assets / crypto CFDs','Crypto systematic strategy'],
 'Krypto Knight':['Digital assets / crypto CFDs','Crypto systematic strategy'],
 'Gold Bug':['Precious metals / gold-related CFDs','Commodity systematic strategy'],
 'Hot Commodities':['Commodity markets / CFDs','Commodity systematic strategy'],
 'Soft Commodities':['Soft commodity markets / CFDs','Commodity systematic strategy']
};
const current=profile[name];
document.getElementById('market-focus').textContent=current[0];
document.getElementById('strategy-category').textContent=current[1];
