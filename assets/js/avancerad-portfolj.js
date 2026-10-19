/* AlgoLodge avancerad portfölj – statiska månadsserier, inga externa bibliotek. */
(function(){
'use strict';
const ds=window.ALGOCOMPARE_DATA;
const root=document.getElementById('adv-app');
if(!ds||!root)return;
const order=['hotCommodities','softCommodities','goldBug','kryptoKnight','satoshi','vitalik'];
const selected=new Set(order);
// Vikter anges som tiondels procent av AlgoLodge-andelen (1000 = 100 %).
// Denna portfölj är hypotetisk; standardläget är lika vikt.
const modelWeights={};
let modelCustom=false;
const visibleLines=new Set(['total','stocks','bonds','algo','benchmark']);
const market={stocks:null,bonds:null};
let weights={stocks:40,bonds:30,algo:30};
const colors={stocks:'#1f5e9c',bonds:'#b28a51',algo:'#168d92',total:'#173752',benchmark:'#b3a1a0'};
const modelNames={hotCommodities:'Hot Commodities',softCommodities:'Soft Commodities',goldBug:'Gold Bug',kryptoKnight:'Krypto Knight',satoshi:'Satoshi',vitalik:'Vitalik'};
const $=id=>document.getElementById(id);
const pct=(v,d=1)=>(Number.isFinite(v)?(v*100).toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d})+' %':'—');
const num=v=>Number.isFinite(v)?v.toLocaleString('sv-SE',{maximumFractionDigits:1}):'—';
const monthKey=(date)=>{let s=String(date||'').trim();let m=s.match(/^(\d{4})[-\/.](\d{1,2})(?:[-\/.]\d{1,2})?/);if(m)return m[1]+'-'+m[2].padStart(2,'0');let d=new Date(s);if(Number.isNaN(d.getTime()))return null;return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')};
function nextMonth(x){let [y,m]=x.split('-').map(Number);return (m===12?y+1:y)+'-'+String(m===12?1:m+1).padStart(2,'0')}
function prevMonth(x){let [y,m]=x.split('-').map(Number);return (m===1?y-1:y)+'-'+String(m===1?12:m-1).padStart(2,'0')}
function monthRange(first,last){let out=[];for(let m=first;m<=last;m=nextMonth(m))out.push(m);return out;}
function csvRows(raw){let sep=(raw.split(/\r?\n/)[0]||'').includes(';')?';':',';let rows=[],row=[],word='',quoted=false;raw=raw.replace(/^\uFEFF/,'');for(let i=0;i<raw.length;i++){const ch=raw[i];if(ch==='"'){if(quoted&&raw[i+1]==='"'){word+='"';i++}else quoted=!quoted;}else if(!quoted&&ch===sep){row.push(word.trim());word=''}else if(!quoted&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&raw[i+1]==='\n')i++;row.push(word.trim());if(row.some(v=>v!==''))rows.push(row);row=[];word='';}else word+=ch}row.push(word.trim());if(row.some(v=>v!==''))rows.push(row);return rows;}
function parseNumber(raw){let t=String(raw??'').trim().replace(/[^\d.,+\-%]/g,'');if(!t)return NaN;let isPercent=t.includes('%');t=t.replace(/%/g,'');if(t.includes(',')&&t.includes('.')){if(t.lastIndexOf(',')>t.lastIndexOf('.'))t=t.replace(/\./g,'').replace(',','.');else t=t.replace(/,/g,'');}else if(t.includes(',')){const p=t.split(',');t=p.length===2&&p[1].length<=3?t.replace(',','.'):t.replace(/,/g,'');}let n=Number(t);return isPercent?n/100:n;}
function parseMarket(text,label){const rows=csvRows(text);if(rows.length<3)throw Error('Filen måste ha minst två datapunkter och en rubrikrad.');let h=rows[0].map(x=>x.trim().toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9%]/g,''));let dateCol=h.findIndex(x=>x==='date'||x==='datum'||x==='month'||x==='period'||x==='time');if(dateCol<0)dateCol=0;let returnCol=h.findIndex(x=>/monthlyreturnpct|returnpct|avkastning%|monthlyreturn%|return%|monthlyreturnpercent|monthlyretpct/.test(x));let levelCol=h.findIndex(x=>/^(adjclose|adjustedclose|totalreturnindex|indexvalue|value|level|index)$/.test(x));
const basis=returnCol>=0?'imported-return':levelCol>=0?'total-return':'price';
if(levelCol<0&&returnCol<0){levelCol=h.findIndex(x=>/^(price|close|kurs)$/.test(x));if(levelCol<0)throw Error('Kan inte hitta Price, Close, Adj Close eller Monthly Return (%).');}
const levels=new Map(), returns=new Map();
for(let i=1;i<rows.length;i++){let row=rows[i],m=monthKey(row[dateCol]);if(!m)continue;let dt=String(row[dateCol]||'').trim();let stamp=new Date(dt).getTime();if(Number.isNaN(stamp))stamp=Number(m.slice(0,4))*400+Number(m.slice(5,7))*32;
 if(returnCol>=0){let v=parseNumber(row[returnCol]);if(!String(row[returnCol]||'').includes('%')&&/pct|percent|%/.test(h[returnCol]))v/=100;if(Number.isFinite(v)&&v>-1&&v<10){if(!returns.has(m)||stamp>=returns.get(m).stamp)returns.set(m,{stamp,val:v});}}
 else {let v=parseNumber(row[levelCol]);if(Number.isFinite(v)&&v>0){if(!levels.has(m)||stamp>=levels.get(m).stamp)levels.set(m,{stamp,val:v});}}
}
if(returnCol>=0){if(returns.size<2)throw Error('Hittade för få månader med giltig avkastning.');return {label,basis,returns:new Map([...returns].map(([k,v])=>[k,v.val]))};}
const sorted=[...levels.entries()].sort((a,b)=>a[0].localeCompare(b[0]));const output=new Map();for(let i=1;i<sorted.length;i++){const [p,pv]=sorted[i-1], [m,v]=sorted[i];if(nextMonth(p)===m)output.set(m,v.val/pv.val-1)}
if(output.size<2)throw Error('Kräver minst tre sammanhängande månadsvärden. Ange hela historiken inklusive föregående månad.');return {label,basis,returns:output};}
const activeModels=()=>order.filter(k=>selected.has(k));
function distribute(units, keys, weightOf, minimum=0){
 if(!keys.length)return {};
 const result={};const spare=units-minimum*keys.length;
 if(spare<0)throw Error('För få viktpunkter för antalet modeller.');
 const weights=keys.map(k=>Math.max(0,Number(weightOf(k))||0));
 const total=weights.reduce((a,b)=>a+b,0);
 const shares=keys.map((k,i)=>spare*(total>0?weights[i]/total:1/keys.length));
 let left=spare-shares.reduce((a,v)=>a+Math.floor(v),0);
 keys.forEach((k,i)=>result[k]=minimum+Math.floor(shares[i]));
 const ranked=keys.map((k,i)=>({k,i,rem:shares[i]-Math.floor(shares[i])})).sort((a,b)=>b.rem-a.rem||a.i-b.i);
 for(let i=0;i<left;i++)result[ranked[i].k]++;
 return result;
}
function setEqualModelWeights(){
 const arr=activeModels();Object.keys(modelWeights).forEach(k=>delete modelWeights[k]);
 Object.assign(modelWeights,distribute(1000,arr,()=>1));modelCustom=false;
}
function reallocateModels(){
 const arr=activeModels();if(!modelCustom){setEqualModelWeights();return;}
 const previous={...modelWeights};
 const fallback=arr.length?1000/arr.length:0;
 const next=distribute(1000,arr,k=>previous[k]??fallback,10);
 Object.keys(modelWeights).forEach(k=>delete modelWeights[k]);Object.assign(modelWeights,next);
}
function setModelWeight(key,value){
 const arr=activeModels();if(!arr.includes(key))return;
 if(arr.length===1){modelWeights[key]=1000;modelCustom=false;return;}
 const units=Math.max(10,Math.min(1000-(arr.length-1)*10,Math.round(Number(value)*10)));
 const others=arr.filter(k=>k!==key);
 const rest=distribute(1000-units,others,k=>Math.max(1,(modelWeights[k]??0)-10),10);
 modelWeights[key]=units;Object.assign(modelWeights,rest);modelCustom=true;
}
function getModelReturns(){
 const arr=activeModels().map(k=>({weight:modelWeights[k]/1000,r:new Map(ds.models[k].returns)}));
 const avail=new Set();arr.forEach(x=>x.r.forEach((_,m)=>avail.add(m)));
 const result=new Map();for(const m of [...avail].sort()){
  if(arr.length&&arr.every(x=>x.r.has(m)))result.set(m,arr.reduce((sum,x)=>sum+x.weight*x.r.get(m),0));
 }return result;
}
// Older months may contain fewer models. Re-normalize only the active
// models with observations; this line is a visual illustration, not the full portfolio.
function getRollingModelReturns(){
 const arr=activeModels().map(k=>({weight:modelWeights[k]/1000,r:new Map(ds.models[k].returns)}));
 const dates=new Set();arr.forEach(x=>x.r.forEach((_,m)=>dates.add(m)));
 const result=new Map();for(const m of [...dates].sort()){
  const found=arr.filter(x=>x.r.has(m));const total=found.reduce((sum,x)=>sum+x.weight,0);
  if(total>0)result.set(m,found.reduce((sum,x)=>sum+x.weight/total*x.r.get(m),0));
 }return result;
}
function modelDateInfo(){
 const rolling=getRollingModelReturns(),shared=getModelReturns();
 const firstRolling=[...rolling.keys()].sort()[0];const firstCommon=[...shared.keys()].sort()[0];
 return {rolling,shared,firstRolling,firstCommon};
}
function commonSeries(){let needed=[];if(weights.stocks>0){if(!market.stocks)return {error:'Kunde inte läsa SPY-serien. Kontrollera att kursfilen finns på webbplatsen.'};needed.push({key:'stocks',r:market.stocks.returns})}if(weights.bonds>0){if(!market.bonds)return {error:'Kunde inte läsa AGG-serien. Kontrollera att kursfilen finns på webbplatsen.'};needed.push({key:'bonds',r:market.bonds.returns})}if(weights.algo>0){if(!selected.size)return{error:'Välj minst en AlgoLodge-modell när AlgoLodge har en kapitalandel.'};needed.push({key:'algo',r:getModelReturns()})}
if(!needed.length)return{error:'Ingen tillgångsklass vald.'};let keys=[...needed[0].r.keys()].filter(m=>needed.every(x=>x.r.has(m))&&m<='2026-09').sort();if(keys.length<2)return {error:'För få gemensamma månader i de inlästa månadsserierna (till och med september 2026).'};
if(weights.algo===0)keys=keys.filter(m=>m>='2019-01');
// Longest contiguous suffix: no missing months allowed in portfolio performance.
let start=keys.length-1;while(start>0&&nextMonth(keys[start-1])===keys[start])start--;keys=keys.slice(start);const horizon=$('adv-period').value;if(horizon!=='all')keys=keys.slice(-Number(horizon));if(keys.length<2)return{error:'Jämförelseperioden innehåller för få kompletta månader.'};
return{keys,by:Object.fromEntries(needed.map(x=>[x.key,x.r]))};}
function combine(keys,by,w,mode){let values=[100],series={stocks:[100],bonds:[100],algo:[100]};let holdings={stocks:w.stocks,bonds:w.bonds,algo:w.algo};let months=[];for(let m of keys){let old=holdings.stocks+holdings.bonds+holdings.algo;let r=0;if(mode==='monthly')r=['stocks','bonds','algo'].reduce((sum,k)=>sum+(w[k]/100)*(by[k]?.get(m)??0),0);else r=['stocks','bonds','algo'].reduce((sum,k)=>sum+(holdings[k]/old)*(by[k]?.get(m)??0),0);
let next=values.at(-1)*(1+r);values.push(next);months.push(r);
for(let k of ['stocks','bonds','algo']){holdings[k]*=1+(by[k]?.get(m)??0);series[k].push(series[k].at(-1)*(1+(by[k]?.get(m)??0)))}
if(mode==='monthly'){for(let k of ['stocks','bonds','algo'])holdings[k]=w[k]}
}
return{values,months,series};}
function stats(months){let v=1,peak=1,dd=0;for(let r of months){v*=1+r;peak=Math.max(peak,v);dd=Math.min(dd,v/peak-1)}let n=months.length;let mean=months.reduce((a,b)=>a+b,0)/n;let sd=n>1?Math.sqrt(months.reduce((s,r)=>s+(r-mean)**2,0)/(n-1)):0;return{total:v-1,cagr:v**(12/n)-1,dd,vol:sd*Math.sqrt(12),sharpe:sd?mean/sd*Math.sqrt(12):NaN,positive:months.filter(x=>x>0).length/n};}
function chartValues(returns,plotDates,baseDate){
// ETF series can be drawn backward before the selected portfolio's inception,
// while maintaining the same index-100 reference at the portfolio inception.
const result=new Map();const all=monthRange([baseDate,plotDates[0]].sort()[0],plotDates.at(-1));
let idx=all.indexOf(baseDate);if(idx<0)return result;
result.set(baseDate,100);
let value=100;
for(let i=idx+1;i<all.length;i++){
 const r=returns.get(all[i]);if(!Number.isFinite(r)||r<=-1)break;
 value*=1+r;result.set(all[i],value);
}
value=100;
for(let i=idx-1;i>=0;i--){
 const r=returns.get(all[i+1]);if(!Number.isFinite(r)||r<=-1)break;
 value/=1+r;result.set(all[i],value);
}
return result;
}
function drawChart(dates,lines,baseDate){
const displayed=lines.filter(l=>visibleLines.has(l.key));
if(!displayed.length)return '<div class="adv-chart-empty"><strong>Inga kurvor visas</strong><span>Markera minst en kurva under grafen.</span></div>';
const vbW=820,vbH=360,left=52,right=16,top=17,bottom=45;
const numbers=displayed.flatMap(l=>[...l.values.values()].filter(Number.isFinite));
if(!numbers.length)return '<div class="adv-chart-empty">Det finns inga datapunkter för de valda kurvorna.</div>';
let min=Math.min(...numbers,100),max=Math.max(...numbers,100);
let range=max-min||10,low=Math.max(0,min-range*.09),high=max+range*.09;
if(low===high){low=0;high=200}
const X=i=>left+i*(vbW-left-right)/Math.max(1,dates.length-1);
const Y=v=>top+(high-v)*(vbH-top-bottom)/(high-low);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
let svg=`<svg viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="Historisk totalavkastning inklusive återinvesterade ETF-utdelningar och hypotetisk portfölj. Alla kurvor startar vid index 100 på jämförelsens startdatum.">`;
for(let i=0;i<5;i++){
 const v=low+(high-low)*i/4,y=Y(v);
 svg+=`<line x1="${left}" x2="${vbW-right}" y1="${y}" y2="${y}" stroke="#e7edf2"/><text x="${left-10}" y="${y+4}" text-anchor="end" fill="#6d879a" font-size="12">${Math.round(v)}</text>`;
}
svg+=`<line x1="${left}" x2="${vbW-right}" y1="${Y(100)}" y2="${Y(100)}" stroke="#aebfca" stroke-dasharray="4 5"/>`;
const position=dates.indexOf(baseDate);
if(position>0&&position<dates.length){const x=X(position);svg+=`<line x1="${x}" x2="${x}" y1="${top}" y2="${vbH-bottom}" stroke="#a4b5c4" stroke-dasharray="3 6"/><text x="${Math.min(x+7,vbW-112)}" y="${top+10}" fill="#71879a" font-size="11">Portföljstart</text>`;}
const tickCount=Math.min(5,dates.length);
const used=new Set();for(let i=0;i<tickCount;i++){
 const pos=Math.round(i*(dates.length-1)/Math.max(1,tickCount-1));if(used.has(pos))continue;used.add(pos);
 const d=dates[pos];svg+=`<text x="${X(pos)}" y="${vbH-13}" text-anchor="${i===0?'start':i===tickCount-1?'end':'middle'}" fill="#718b9f" font-size="11">${esc(d)}</text>`;
}
for(const l of displayed){
 let parts=[],part='',partStyle='full',lastPoint='';
 const flush=()=>{if(part)parts.push({d:part,style:partStyle});part=''};
 for(let i=0;i<dates.length;i++){
  const v=l.values.get(dates[i]);
  if(!Number.isFinite(v)){flush();lastPoint='';continue}
  const point=X(i).toFixed(1)+' '+Y(v).toFixed(1);
  const style=l.dashedBefore&&dates[i]<l.dashedBefore?'early':'full';
  if(part&&partStyle!==style){flush();part='M'+(lastPoint||point)+' L'+point;partStyle=style;}
  else if(!part){part='M'+point;partStyle=style;}
  else part+=' L'+point;
  lastPoint=point;
 }
 flush();
 for(const p of parts){svg+=`<path d="${p.d}" fill="none" stroke="${l.color}" stroke-width="${l.key==='total'?4:2.4}" ${p.style==='early'?'stroke-dasharray="5 5"':''} stroke-linejoin="round" stroke-linecap="round" opacity="${l.key==='total'?1:.90}"/>`}
}
return svg+'</svg>';
}
// Interaktiv kurvinformation för både mus, tangentbord och tryck på mobil.
function attachChartTooltip(host, dates, lines){
 const svg=host.querySelector('svg');
 if(!svg||!dates.length)return;
 const active=lines.filter(l=>visibleLines.has(l.key));
 if(!active.length)return;
 const popup=document.createElement('div');
 popup.className='adv-hover-tooltip';popup.hidden=true;
 popup.setAttribute('role','status');popup.setAttribute('aria-live','off');
 host.appendChild(popup);
 const ns='http://www.w3.org/2000/svg';
 const cursor=document.createElementNS(ns,'line');
 cursor.setAttribute('class','adv-hover-cursor');
 cursor.setAttribute('y1','17');cursor.setAttribute('y2','315');
 cursor.setAttribute('visibility','hidden');
 svg.appendChild(cursor);
 const fmtValue=v=>v.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1});
 let focusedIndex=dates.length-1;
 const renderAt=(index,localY)=>{
  const month=dates[index];
  const items=active.filter(l=>Number.isFinite(l.values.get(month)));
  if(!items.length){popup.hidden=true;cursor.setAttribute('visibility','hidden');return;}
  focusedIndex=index;
  const x=52+index*(820-52-16)/Math.max(1,dates.length-1);
  cursor.setAttribute('x1',x);cursor.setAttribute('x2',x);
  cursor.setAttribute('visibility','visible');
  popup.replaceChildren();
  const heading=document.createElement('strong');
  heading.className='adv-hover-tooltip-title';
  const [y,m]=month.split('-').map(Number);
  heading.textContent=new Intl.DateTimeFormat('sv-SE',{month:'long',year:'numeric'}).format(new Date(Date.UTC(y,m-1,1)));
  popup.appendChild(heading);
  for(const line of items){
   const row=document.createElement('div');row.className='adv-hover-tooltip-row';
   const dot=document.createElement('i');dot.style.backgroundColor=line.color;dot.setAttribute('aria-hidden','true');
   const label=document.createElement('span');label.textContent=line.name;
   const value=document.createElement('b');value.textContent=fmtValue(line.values.get(month));
   row.append(dot,label,value);popup.appendChild(row);
  }
  popup.hidden=false;
  const rect=svg.getBoundingClientRect();
  const hostRect=host.getBoundingClientRect();
  const screenX=x/820*rect.width+(rect.left-hostRect.left);
  const proposedLeft=screenX+14;
  const maxLeft=Math.max(0,host.clientWidth-popup.offsetWidth-5);
  popup.style.left=Math.max(0,Math.min(maxLeft,proposedLeft))+'px';
  const maxTop=Math.max(0,host.clientHeight-popup.offsetHeight-4);
  popup.style.top=Math.max(4,Math.min(maxTop,localY-popup.offsetHeight-12))+'px';
 };
 const onPoint=e=>{
  const rect=svg.getBoundingClientRect();
  if(!rect.width)return;
  const x=(e.clientX-rect.left)/rect.width*820;
  if(x<52||x>804){if(e.pointerType!=='touch'){hide();}return;}
  const i=Math.max(0,Math.min(dates.length-1,Math.round((x-52)/(820-52-16)*(dates.length-1))));
  renderAt(i,e.clientY-host.getBoundingClientRect().top);
 };
 const hide=()=>{popup.hidden=true;cursor.setAttribute('visibility','hidden')};
 svg.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')onPoint(e)});
 svg.addEventListener('pointerdown',onPoint);
 svg.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide()});
 svg.setAttribute('tabindex','0');
 svg.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Escape'].includes(e.key))return;
  if(e.key==='Escape'){hide();return;}
  e.preventDefault();
  const i=e.key==='ArrowLeft'?Math.max(0,focusedIndex-1):Math.min(dates.length-1,focusedIndex+1);
  renderAt(i,svg.getBoundingClientRect().height/2);
 });
 svg.addEventListener('blur',hide);
}
function updateLegend(lines){
 const legend=$('adv-legend');
 legend.innerHTML=lines.map(l=>`<label class="adv-chart-line-toggle"><input type="checkbox" data-line="${l.key}" ${visibleLines.has(l.key)?'checked':''}><i aria-hidden="true" style="background:${l.color}"></i>${l.name}</label>`).join('');
}
function render(){
const chart=$('adv-chart'),summary=$('adv-info'),ret=$('adv-return'),legend=$('adv-legend'),metrics=$('adv-kpis'),table=$('adv-table'),result=commonSeries();
if(result.error){const note=$('adv-model-history-note');if(note)note.textContent='';chart.innerHTML='<div class="adv-chart-empty"><strong>För jämförelsen behövs månadsdata</strong><span>'+result.error+'</span></div>';ret.textContent='—';legend.innerHTML='';metrics.innerHTML='';summary.textContent=result.error;table.innerHTML='';return}
const {keys,by}=result;
const mode=$('adv-rebalance').value;
const data=combine(keys,by,{...weights},mode),s=stats(data.months);
const baseDate=prevMonth(keys[0]);
const startDate=baseDate;
const dates=monthRange(startDate,keys.at(-1));
const portfolioDates=[baseDate,...keys];
const portfolioMap=new Map(portfolioDates.map((d,i)=>[d,data.values[i]]));
const lines=[{key:'total',name:'Min portfölj',color:colors.total,values:portfolioMap}];
for(const [key,name] of [['stocks','Aktier – S&P 500'],['bonds','Obligationer – AGG']]){
 if(market[key])lines.push({key,name,color:colors[key],values:chartValues(market[key].returns,dates,baseDate)});
}
const modelDates=modelDateInfo();
if(selected.size && modelDates.firstRolling){
 lines.push({key:'algo',name:'Valda AlgoLodge-modeller',color:colors.algo,
  values:chartValues(modelDates.rolling,dates,baseDate)});
}
let benchmark=null;
if(market.stocks&&market.bonds&&keys.every(m=>market.stocks.returns.has(m)&&market.bonds.returns.has(m))){
 const bondR=market.bonds.returns,stockR=market.stocks.returns;
 const b={stocks:stockR,bonds:bondR};benchmark=combine(keys,b,{stocks:60,bonds:40,algo:0},'monthly');
 const bRate=new Map();for(const [m,r] of stockR){if(bondR.has(m))bRate.set(m,.6*r+.4*bondR.get(m));}
 lines.push({key:'benchmark',name:'60/40 (aktier/obligationer)',color:colors.benchmark,values:chartValues(bRate,dates,baseDate)});
}
$('adv-return-label').textContent='Totalavkastning';
updateLegend(lines);chart.innerHTML=drawChart(dates,lines,baseDate);attachChartTooltip(chart,dates,lines);ret.textContent=pct(s.total);
summary.textContent=keys.length+' portföljmånader · '+keys[0]+'–'+keys.at(-1)+' · USD · '+(mode==='monthly'?'Månadsvis omviktning':'Utan omviktning')+' · Alla kurvor startar vid 100 · ETF: inklusive återinvesterade utdelningar, före skatt';
const historyNote=$('adv-model-history-note');
if(historyNote){
 const begin=modelDates.firstRolling?prevMonth(modelDates.firstRolling):null;
 const common=modelDates.firstCommon;
 historyNote.textContent=common
  ?`Alla kurvor indexeras till 100 vid jämförelsens start (${baseDate}). Om du ändrar modellval flyttas startdatumet automatiskt till den tidigaste månad där alla valda innehav kan jämföras på lika villkor.`
  :'Markera minst en modell för att visa modellhistoriken.';
}
const items=[['Totalavkastning',pct(s.total)],['Årlig avkastning (CAGR)',pct(s.cagr)],['Största nedgång',pct(s.dd)],['Volatilitet per år',pct(s.vol)],['Sharpekvot (ränta 0 %)',Number.isFinite(s.sharpe)?num(s.sharpe):'—'],['Positiva månader',pct(s.positive,0)]];
metrics.innerHTML=items.map(([label,val])=>`<div class="adv-kpi"><span>${label}</span><strong class="${label==='Största nedgång'?'down':''}">${val}</strong></div>`).join('');
const bs=benchmark?stats(benchmark.months):null;
table.innerHTML='<thead><tr><th>Portfölj</th><th>'+'Totalavkastning'+'</th><th>CAGR</th><th>Max nedgång</th><th>Volatilitet</th></tr></thead><tbody>'+[['Vald fördelning',s],...(bs?[['Klassisk 60/40',bs]]:[])].map(([label,x])=>`<tr><th>${label}</th><td>${pct(x.total)}</td><td>${pct(x.cagr)}</td><td>${pct(x.dd)}</td><td>${pct(x.vol)}</td></tr>`).join('')+'</tbody>';
}
function renderModelWeightControls(){
 const arr=activeModels(),area=$('adv-model-weights');
 if(!arr.length){area.innerHTML='<p class="adv-muted">Markera minst en modell ovan.</p>';updateModelWeightDisplay();return;}
 area.innerHTML=arr.map(k=>`<div class="adv-model-weight"><div class="adv-model-weight-head"><label for="model-weight-${k}">${modelNames[k]}</label><output id="model-weight-label-${k}" for="model-weight-${k}"></output></div><input type="range" id="model-weight-${k}" data-model-weight="${k}" aria-label="${modelNames[k]} – andel av AlgoLodge-kapitalet" min="1" max="100" step="0.1"></div>`).join('');
 updateModelWeightDisplay();
}
function updateModelWeightDisplay(){
 const arr=activeModels(),sum=arr.reduce((s,k)=>s+(modelWeights[k]||0),0);
 for(const k of arr){const el=$('model-weight-'+k),out=$('model-weight-label-'+k);
  const v=(modelWeights[k]||0)/10;
  if(el){el.max=100-(arr.length-1);el.value=v;el.disabled=arr.length===1;}
  if(out)out.textContent=v.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
 }
 $('adv-model-weights-summary').textContent='Summa: '+(sum/10).toLocaleString('sv-SE',{maximumFractionDigits:1})+' %';
 $('adv-model-custom-status').textContent=modelCustom?'Egen fördelning':'Lika vikt';
 $('adv-model-default-note').textContent=modelCustom
  ?'AlgoLodge-andelen följer dina modellvikter med månadsvis omviktning. Öppna avancerad fördelning för att ändra.'
  :'AlgoLodge-andelen fördelas lika mellan de markerade modellerna med månadsvis omviktning.';
 const first=arr[0];const part=first?(weights.algo*(modelWeights[first]/1000)):0;
 $('adv-model-weight-example').textContent=first
  ?`Exempel: ${modelNames[first]} utgör ${(modelWeights[first]/10).toLocaleString('sv-SE',{maximumFractionDigits:1})} % av AlgoLodge-andelen, motsvarande ${part.toLocaleString('sv-SE',{maximumFractionDigits:2})} % av hela portföljen vid nuvarande fördelning.`
  :'Välj en modell för att justera fördelningen.';
}
function refreshWeights(){for(let k of ['stocks','bonds','algo']){$('adv-'+k+'-range').value=weights[k];$('adv-'+k+'-out').textContent=weights[k]+' %';$('adv-'+k+'-bar').style.width=weights[k]+'%'}$('adv-alloclabel').textContent='Totalt 100 % · '+weights.stocks+' % aktier · '+weights.bonds+' % obligationer · '+weights.algo+' % AlgoLodge';document.querySelectorAll('.adv-presets button').forEach(b=>b.classList.toggle('active',b.dataset.preset===`${weights.stocks},${weights.bonds},${weights.algo}`));updateModelWeightDisplay();render()}
function changeWeight(changed,value){value=Math.min(100,Math.max(0,Math.round(value)));let others=['stocks','bonds','algo'].filter(k=>k!==changed);let rem=100-value;let old=weights[others[0]]+weights[others[1]];let first=old?Math.round(rem*weights[others[0]]/old):Math.round(rem/2);weights={[changed]:value,[others[0]]:first,[others[1]]:rem-first};refreshWeights()}
function init(){
$('adv-legend').addEventListener('change',e=>{const cb=e.target;if(!cb.matches('input[data-line]'))return;cb.checked?visibleLines.add(cb.dataset.line):visibleLines.delete(cb.dataset.line);render()});
$('adv-only-portfolio').addEventListener('click',()=>{visibleLines.clear();visibleLines.add('total');render()});
$('adv-show-all').addEventListener('click',()=>{['total','stocks','bonds','algo','benchmark'].forEach(k=>visibleLines.add(k));render()});
setEqualModelWeights();renderModelWeightControls();
$('adv-model-weights').addEventListener('input',e=>{const slider=e.target;if(!slider.matches('input[data-model-weight]'))return;setModelWeight(slider.dataset.modelWeight,slider.value);updateModelWeightDisplay();render()});
$('adv-model-equal').addEventListener('click',()=>{setEqualModelWeights();updateModelWeightDisplay();render()});
const grid=$('adv-models');grid.innerHTML=order.map(k=>`<label class="adv-model"><input type="checkbox" data-model="${k}" checked/>${modelNames[k]}</label>`).join('');grid.querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{el.checked?selected.add(el.dataset.model):selected.delete(el.dataset.model);reallocateModels();renderModelWeightControls();render()}));$('adv-select-all').addEventListener('click',()=>{if(selected.size===order.length)selected.clear();else order.forEach(k=>selected.add(k));grid.querySelectorAll('input').forEach(el=>el.checked=selected.has(el.dataset.model));reallocateModels();renderModelWeightControls();render()});for(let k of ['stocks','bonds','algo'])$('adv-'+k+'-range').addEventListener('input',e=>changeWeight(k,e.target.value));document.querySelectorAll('.adv-presets button').forEach(b=>b.addEventListener('click',()=>{let [stocks,bonds,algo]=b.dataset.preset.split(',').map(Number);weights={stocks,bonds,algo};refreshWeights()}));['adv-period','adv-rebalance'].forEach(id=>$(id).addEventListener('change',render));refreshWeights();for(const k of ['stocks','bonds']){
 const url='assets/data/'+(k==='stocks'?'spy-monthly-total-return.csv':'agg-monthly-total-return.csv');
 fetch(url,{cache:'no-store'}).then(response=>{
  if(!response.ok)throw new Error('HTTP '+response.status);
  return response.text();
 }).then(raw=>{
  const parsed=parseMarket(raw,k);
  if(parsed.basis!=='total-return')throw new Error('Datafilen saknar totalavkastningsindex.');
  market[k]=parsed;
  render();
 }).catch(err=>{
  console.error('Kunde inte läsa '+url,err);
  render();
 });
}
}
init();
})();
