/* AlgoLodge avancerad portfölj – statiska månadsserier, inga externa bibliotek. */
(function(){
'use strict';
const ds=window.ALGOCOMPARE_DATA;
const root=document.getElementById('adv-app');
if(!ds||!root)return;
const order=['hotCommodities','softCommodities','goldBug','kryptoKnight','satoshi','vitalik'];
const selected=new Set(order);
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
function getModelReturns(){let arr=[...selected].map(k=>new Map(ds.models[k].returns));const avail=new Set();for(let a of arr)for(const k of a.keys())avail.add(k);let result=new Map();for(let m of [...avail].sort()){if(arr.every(a=>a.has(m)))result.set(m,arr.reduce((s,a)=>s+a.get(m),0)/arr.length)}return result;}
// The complete model comparison only uses months available for *all* selected models.
// The visual AlgoLodge line can extend further back, using the models active at each month.
function getRollingModelReturns(){
 const arrays=[...selected].map(k=>new Map(ds.models[k].returns));
 const dates=new Set();arrays.forEach(a=>a.forEach((_,m)=>dates.add(m)));
 const result=new Map();
 for(const m of [...dates].sort()){
  const available=arrays.filter(a=>a.has(m));
  if(available.length)result.set(m,available.reduce((sum,a)=>sum+a.get(m),0)/available.length);
 }
 return result;
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
 for(const p of parts){svg+=`<path d="${p.d}" fill="none" stroke="${l.color}" stroke-width="${l.key==='total'?4:2.4}" ${p.style==='early'?'stroke-dasharray="5 5"':''} stroke-linejoin="round" stroke-linecap="round" opacity="${l.key==='total'?1:.90}"><title>${esc(l.name)}${p.style==='early'?' – innan alla valda modeller startat':''}</title></path>`}
}
return svg+'</svg>';
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
updateLegend(lines);chart.innerHTML=drawChart(dates,lines,baseDate);ret.textContent=pct(s.total);
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
function refreshWeights(){for(let k of ['stocks','bonds','algo']){$('adv-'+k+'-range').value=weights[k];$('adv-'+k+'-out').textContent=weights[k]+' %';$('adv-'+k+'-bar').style.width=weights[k]+'%'}$('adv-alloclabel').textContent='Totalt 100 % · '+weights.stocks+' % aktier · '+weights.bonds+' % obligationer · '+weights.algo+' % AlgoLodge';document.querySelectorAll('.adv-presets button').forEach(b=>b.classList.toggle('active',b.dataset.preset===`${weights.stocks},${weights.bonds},${weights.algo}`));render()}
function changeWeight(changed,value){value=Math.min(100,Math.max(0,Math.round(value)));let others=['stocks','bonds','algo'].filter(k=>k!==changed);let rem=100-value;let old=weights[others[0]]+weights[others[1]];let first=old?Math.round(rem*weights[others[0]]/old):Math.round(rem/2);weights={[changed]:value,[others[0]]:first,[others[1]]:rem-first};refreshWeights()}
function init(){
$('adv-legend').addEventListener('change',e=>{const cb=e.target;if(!cb.matches('input[data-line]'))return;cb.checked?visibleLines.add(cb.dataset.line):visibleLines.delete(cb.dataset.line);render()});
$('adv-only-portfolio').addEventListener('click',()=>{visibleLines.clear();visibleLines.add('total');render()});
$('adv-show-all').addEventListener('click',()=>{['total','stocks','bonds','algo','benchmark'].forEach(k=>visibleLines.add(k));render()});
const grid=$('adv-models');grid.innerHTML=order.map(k=>`<label class="adv-model"><input type="checkbox" data-model="${k}" checked/>${modelNames[k]}</label>`).join('');grid.querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{el.checked?selected.add(el.dataset.model):selected.delete(el.dataset.model);render()}));$('adv-select-all').addEventListener('click',()=>{if(selected.size===order.length)selected.clear();else order.forEach(k=>selected.add(k));grid.querySelectorAll('input').forEach(el=>el.checked=selected.has(el.dataset.model));render()});for(let k of ['stocks','bonds','algo'])$('adv-'+k+'-range').addEventListener('input',e=>changeWeight(k,e.target.value));document.querySelectorAll('.adv-presets button').forEach(b=>b.addEventListener('click',()=>{let [stocks,bonds,algo]=b.dataset.preset.split(',').map(Number);weights={stocks,bonds,algo};refreshWeights()}));['adv-period','adv-rebalance'].forEach(id=>$(id).addEventListener('change',render));refreshWeights();for(const k of ['stocks','bonds']){
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
