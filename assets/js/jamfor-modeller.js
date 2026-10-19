/* AlgoLodge jämförelse – noll externa bibliotek. Avkastning från Excelkolumnen Month. */
(function () {
  'use strict';
  const dataset = window.ALGOCOMPARE_DATA;
  const root = document.querySelector('#comparison-app');
  if (!root || !dataset) return;
  const palette = {
    hotCommodities: '#117e94', softCommodities: '#ca8751', goldBug: '#b59a40',
    kryptoKnight: '#805eb1', satoshi: '#3b7bc7', vitalik: '#648d53', portfolio: '#153754'
  };
  const order = ['hotCommodities', 'softCommodities', 'goldBug', 'kryptoKnight', 'satoshi', 'vitalik'];
  const selected = new Set(order);
  const checkboxes = root.querySelector('#compare-models');
  const period = root.querySelector('#compare-period');
  const rebalance = root.querySelector('#compare-rebalance');
  const notice = root.querySelector('#compare-notice');
  const timeInfo = root.querySelector('#compare-time');
  const kpis = root.querySelector('#compare-kpis');
  const modelPlot = root.querySelector('#compare-model-chart');
  const modelHistory = root.querySelector('#compare-model-history');
  const modelExplanation = root.querySelector('#compare-model-explanation');
  const combinedPlot = root.querySelector('#compare-combined-chart');
  const weightSummary = root.querySelector('#compare-weight-summary');
  const mainReturn = root.querySelector('#compare-main-return');
  const modelLegend = root.querySelector('#compare-model-legend');
  const combinedLegend = root.querySelector('#compare-combined-legend');
  const statTable = root.querySelector('#compare-stat-table');
  const corrTable = root.querySelector('#compare-corr-table');
  const corrSection = root.querySelector('#compare-correlations');
  const fmtPct = (x, d=1) => new Intl.NumberFormat('sv-SE',{style:'percent',minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
  const fmtNumber = (x,d=0) => new Intl.NumberFormat('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
  const fmtMonth = (key) => new Intl.DateTimeFormat('sv-SE', {month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(key+'-01T12:00:00Z'));
  const esc = (str) => String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const retMap = Object.fromEntries(order.map(key=>[key,new Map(dataset.models[key].returns)]));
  const monthAfter = (key) => { const [y,m]=key.split('-').map(Number); return `${y+Math.floor(m/12)}-${String(m%12+1).padStart(2,'0')}`; };

  function renderChoices() {
    checkboxes.innerHTML = order.map(key => `<label class="cmp-choice ${selected.has(key)?'is-selected':''}">
      <input type="checkbox" value="${key}" ${selected.has(key)?'checked':''} aria-label="Visa ${esc(dataset.models[key].label)}">
      <span class="cmp-color" style="--model-color:${palette[key]}"></span>
      <span class="cmp-choice-text">${esc(dataset.models[key].label)}</span>
      <span class="cmp-choice-check" aria-hidden="true">${selected.has(key)?'✓':'+'}</span>
    </label>`).join('');
    checkboxes.querySelectorAll('input').forEach(el=>el.addEventListener('change',function() {
      if (!this.checked && selected.size===1) {
        this.checked=true;
        notice.textContent = 'Minst en modell måste vara vald.';
        return;
      }
      notice.textContent = '';
      this.checked?selected.add(this.value):selected.delete(this.value);
      renderChoices(); render();
    }));
  }

  function makeStats(returns) {
    let equity=100, peak=100, maxDD=0, wins=0;
    const values=[100];
    for (const r of returns) {
      equity*=1+r;
      if (!Number.isFinite(equity)) return null;
      values.push(equity);
      peak=Math.max(peak,equity);
      maxDD=Math.min(maxDD,equity/peak-1);
      if(r>0)wins++;
    }
    const n=returns.length;
    const mean=returns.reduce((a,b)=>a+b,0)/n;
    const variance=n>1 ? returns.reduce((a,b)=>a+(b-mean)**2,0)/(n-1):0;
    const sd=Math.sqrt(variance);
    const cagr=(equity/100)**(12/n)-1;
    return {values, total:equity/100-1,cagr,maxDD,vol:sd*Math.sqrt(12),sharpe:sd>0 ? mean/sd*Math.sqrt(12):null,wins:wins/n,months:n};
  }

  function getWindow() {
    const keys=order.filter(x=>selected.has(x));
    const firstDate=keys.reduce((a,k)=>a>dataset.models[k].start?a:dataset.models[k].start,'0000-00');
    const lastDate=keys.reduce((a,k)=>a<dataset.models[k].end?a:dataset.models[k].end,'9999-99');
    const dates=[];
    for(let d=monthAfter(firstDate);d<=lastDate;d=monthAfter(d)) {
      if(keys.some(k=>!retMap[k].has(d))) {
        notice.textContent='En eller flera avkastningsmånader saknas i källdata. Kontrollera underlaget.';
        return null;
      }
      dates.push(d);
    }
    if(!dates.length) return null;
    let count=parseInt(period.value,10);
    if(Number.isFinite(count) && count>dates.length) {
      period.value='all';
      notice.textContent=`Endast ${dates.length} gemensamma resultatmånader finns för dessa modeller. Hela perioden visas.`;
      count=NaN;
    }
    const actual=Number.isFinite(count)?dates.slice(-count):dates;
    const before=Number.isFinite(count) ? dates[dates.length-count-1] || firstDate : firstDate;
    return {keys, dates:actual, from:before, to:lastDate};
  }

  function makePortfolio(keys,dates,method) {
    if(method==='monthly' || keys.length===1) return dates.map(d=>keys.reduce((sum,k)=>sum+retMap[k].get(d),0)/keys.length);
    let components=keys.map(()=>1/keys.length);
    return dates.map(d=>{
      const start=components.reduce((a,b)=>a+b,0);
      components=components.map((weight,i)=>weight*(1+retMap[keys[i]].get(d)));
      return components.reduce((a,b)=>a+b,0)/start-1;
    });
  }

  function svgChart(host,series,dates,axisLabel) {
    const W=940,H=330, left=66,right=32,top=22,bottom=45;
    const w=W-left-right,h=H-top-bottom;
    const all=series.flatMap(s=>s.values.filter(v=>Number.isFinite(v))), rawMin=Math.min(100,...all),rawMax=Math.max(100,...all);
    const span=Math.max(10,rawMax-rawMin), pad=span*.095;
    const min=Math.max(0,rawMin-pad),max=rawMax+pad;
    const xp=i=>left+i*(w/Math.max(1,dates.length-1));
    const yp=v=>top+h-(v-min)/(max-min)*h;
    const vertical=[];
    for(let i=0;i<=4;i++) {
      const v=min+(max-min)*(i/4);
      const y=yp(v);
      vertical.push(`<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" class="cmp-gridline"/><text x="${left-12}" y="${y+4}" class="cmp-axis" text-anchor="end">${fmtNumber(v,0)}</text>`);
    }
    const ticks=[];
    const tickInterval=Math.max(1,Math.ceil(dates.length/6));
    for(let i=0;i<dates.length;i+=tickInterval) {
      const month=dates[i];
      ticks.push(`<text x="${xp(i)}" y="${H-16}" class="cmp-axis" text-anchor="middle">${esc(fmtMonth(month))}</text>`);
    }
    if((dates.length-1)%tickInterval!==0) ticks.push(`<text x="${xp(dates.length-1)}" y="${H-16}" class="cmp-axis" text-anchor="end">${esc(fmtMonth(dates.at(-1)))}</text>`);
    const lines=series.map(s=>{
      let drawing=false;
      const d=s.values.map((v,i)=>{
        if(!Number.isFinite(v)){drawing=false;return '';}
        const command=drawing?'L':'M';drawing=true;
        return `${command}${xp(i).toFixed(2)},${yp(v).toFixed(2)}`;
      }).filter(Boolean).join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.key==='portfolio'?3.5:2.4}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    const baseY=yp(100);
    host.innerHTML=`<div class="cmp-chart-canvas"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(axisLabel)}" preserveAspectRatio="xMidYMid meet">
      ${vertical.join('')}<line x1="${left}" y1="${baseY}" x2="${W-right}" y2="${baseY}" class="cmp-baseline"/>
      ${ticks.join('')}${lines}
      <line class="cmp-cursor" x1="${left}" x2="${left}" y1="${top}" y2="${top+h}" style="display:none"/>
      </svg><div class="cmp-chart-tooltip" role="status" aria-live="off" hidden></div></div>`;
    const canvas=host.querySelector('.cmp-chart-canvas');
    const svg=host.querySelector('svg');
    const tooltip=host.querySelector('.cmp-chart-tooltip');
    const cursor=host.querySelector('.cmp-cursor');
    function move(event) {
      const rect=svg.getBoundingClientRect();
      const actualX=(event.clientX-rect.left)/rect.width*W;
      if(actualX<left || actualX>W-right){ tooltip.hidden=true;cursor.style.display='none';return; }
      const idx=Math.max(0,Math.min(dates.length-1,Math.round((actualX-left)/w*(dates.length-1))));
      cursor.setAttribute('x1',xp(idx));cursor.setAttribute('x2',xp(idx));cursor.style.display='';
      const year=idx===0?fmtMonth(dates[0])+' (start)':fmtMonth(dates[idx]);
      tooltip.innerHTML=`<strong>${esc(year)}</strong>`+series.filter(s=>Number.isFinite(s.values[idx])).map(s=>`<span><i style="background:${s.color}"></i>${esc(s.label)} <b>${fmtNumber(s.values[idx],1)}</b></span>`).join('');
      tooltip.hidden=false;
      const parentRect=canvas.getBoundingClientRect();
      const leftPx=(xp(idx)/W)*rect.width+(rect.left-parentRect.left);
      tooltip.style.left=Math.max(0, Math.min(parentRect.width-tooltip.offsetWidth,leftPx+11))+'px';
      tooltip.style.top=Math.max(0,(top/H)*rect.height-6)+'px';
    }
    svg.addEventListener('pointermove',move);
    svg.addEventListener('pointerleave',()=>{tooltip.hidden=true;cursor.style.display='none';});
  }

  function fullModelHistory(keys) {
    const first=keys.reduce((acc,k)=>acc<dataset.models[k].start?acc:dataset.models[k].start,'9999-99');
    const last=keys.reduce((acc,k)=>acc>dataset.models[k].end?acc:dataset.models[k].end,'0000-00');
    const months=[];
    for(let d=first;d<=last;d=monthAfter(d))months.push(d);
    const series=keys.map(k=>{
      const model=dataset.models[k];
      let value=100;
      const values=months.map(date=>{
        if(date<model.start||date>model.end)return null;
        if(date===model.start)return 100;
        const monthly=retMap[k].get(date);
        if(!Number.isFinite(monthly))return null;
        value*=1+monthly;
        return value;
      });
      return {key:k,label:model.label,color:palette[k],values};
    });
    return {months,series};
  }

  const legend=(series)=>series.map(s=>`<span class="cmp-legend-item"><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('');
  const valueColor=(number, kind='default')=>number<0?'cmp-negative':number>0 && kind==='return'?'cmp-positive':'';
  function correlation(a,b){
    const n=a.length;
    if(n<3)return null;
    const av=a.reduce((s,x)=>s+x,0)/n,bv=b.reduce((s,x)=>s+x,0)/n;
    let num=0,aa=0,bb=0;
    for(let i=0;i<n;i++){const x=a[i]-av,y=b[i]-bv;num+=x*y;aa+=x*x;bb+=y*y;}
    return aa&&bb?num/Math.sqrt(aa*bb):null;
  }
  function render() {
    const win=getWindow();if(!win)return;
    const {keys,dates,from,to}=win;
    const returns=Object.fromEntries(keys.map(k=>[k,dates.map(d=>retMap[k].get(d))]));
    const stats=Object.fromEntries(keys.map(k=>[k,makeStats(returns[k])]));
    const combinedReturns=makePortfolio(keys,dates,rebalance.value);
    const combinedStats=makeStats(combinedReturns);
    weightSummary.textContent=`${keys.length} ${keys.length===1?'modell':'modeller'} · ${fmtPct(1/keys.length,keys.length===3||keys.length===6?1:0)} per modell vid start`;
    mainReturn.textContent=fmtPct(combinedStats.total);
    const combinedSeries={key:'portfolio',label:keys.length>1?'Kombinerad portfölj':dataset.models[keys[0]].label,values:combinedStats.values,color:palette.portfolio};
    const modelSeries=keys.map(k=>({key:k,label:dataset.models[k].label,values:stats[k].values,color:palette[k]}));
    timeInfo.textContent=`${keys.length} ${keys.length===1?'modell':'modeller'} · ${dates.length} avkastningsmånader · ${fmtMonth(from)} – ${fmtMonth(to)}`;
    const cards=[
      ['Totalavkastning',fmtPct(combinedStats.total),combinedStats.total,'return'],
      ['Årlig avkastning (CAGR)',fmtPct(combinedStats.cagr),combinedStats.cagr,'return'],
      ['Största nedgång',fmtPct(combinedStats.maxDD),combinedStats.maxDD,'default'],
      ['Volatilitet per år',fmtPct(combinedStats.vol),combinedStats.vol,'default'],
      ['Sharpekvot',combinedStats.sharpe===null?'–':fmtNumber(combinedStats.sharpe,2),0,'default'],
      ['Positiva månader',fmtPct(combinedStats.wins,0),0,'default']
    ];
    kpis.innerHTML=cards.map(([label,v,num,kind])=>`<div class="cmp-kpi"><div>${esc(label)}</div><strong class="${valueColor(num,kind)}">${esc(v)}</strong></div>`).join('');
    modelLegend.innerHTML=legend(modelSeries);
    combinedLegend.innerHTML=legend([combinedSeries]);
    if(modelHistory.value==='full') {
      const history=fullModelHistory(keys);
      modelExplanation.textContent='Hela historiken för varje vald modell. Varje kurva börjar vid index 100 på modellens egen resultatstart.';
      svgChart(modelPlot,history.series,history.months,'Individuell utveckling från varje modells resultatstart. Varje kurva börjar på index 100.');
    } else {
      modelExplanation.textContent='Gemensam period för de valda modellerna. Samtliga kurvor börjar vid index 100.';
      svgChart(modelPlot,modelSeries,[from,...dates],'Individuell utveckling under gemensam period med index 100 vid periodens början.');
    }
    svgChart(combinedPlot,[combinedSeries],[from,...dates],'Kombinerad portfölj, index 100 vid periodens början.');
    const tableRows=keys.length>1?[{label:'Kombinerad portfölj',s:combinedStats,portfolio:true}]:[];
    tableRows.push(...keys.map(k=>({label:dataset.models[k].label,s:stats[k],color:palette[k]})));
    statTable.innerHTML=`<thead><tr><th scope="col">Modell</th><th scope="col">Totalt</th><th scope="col">CAGR</th><th scope="col">Max nedgång</th><th scope="col">Volatilitet</th><th scope="col">Sharpe</th><th scope="col">Pos. mån.</th></tr></thead>`+
      `<tbody>${tableRows.map(({label,s,portfolio,color})=>`<tr class="${portfolio?'cmp-portfolio-row':''}"><th scope="row">${color?`<i class="cmp-table-dot" style="background:${color}"></i>`:''}${esc(label)}</th><td class="${valueColor(s.total,'return')}">${fmtPct(s.total)}</td><td class="${valueColor(s.cagr,'return')}">${fmtPct(s.cagr)}</td><td>${fmtPct(s.maxDD)}</td><td>${fmtPct(s.vol)}</td><td>${s.sharpe===null?'–':fmtNumber(s.sharpe,2)}</td><td>${fmtPct(s.wins,0)}</td></tr>`).join('')}</tbody>`;
    corrSection.hidden=keys.length<2;
    if(keys.length>1) {
      corrTable.innerHTML=`<thead><tr><th scope="col">Modell</th>${keys.map(k=>`<th scope="col">${esc(dataset.models[k].label)}</th>`).join('')}</tr></thead><tbody>`+
        keys.map(k=>`<tr><th scope="row">${esc(dataset.models[k].label)}</th>${keys.map(other=>{
          const c=correlation(returns[k],returns[other]);
          return `<td class="${k===other?'cmp-corr-self':''}">${c===null?'–':fmtNumber(c,2)}</td>`;
        }).join('')}</tr>`).join('')+'</tbody>';
    }
  }
  root.querySelector('#compare-select-all').addEventListener('click',()=>{order.forEach(k=>selected.add(k));notice.textContent='';renderChoices();render();});
  period.addEventListener('change',()=>{notice.textContent='';render();});
  rebalance.addEventListener('change',()=>{notice.textContent='';render();});
  modelHistory.addEventListener('change',()=>{notice.textContent='';render();});
  renderChoices();render();
})();
