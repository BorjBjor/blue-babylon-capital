/* AlgoLodge 3.23 – verified monthly workbook values, six individual charts. */
(()=>{
const items=[{"name": "Hot Commodities", "slug": "hot-commodities", "start": "2020-03-31", "end": "2026-09-30", "since": 189.04, "year": -10.26, "month": -4.37, "points": 79}, {"name": "Satoshi", "slug": "satoshi", "start": "2022-05-31", "end": "2026-09-30", "since": 72.8, "year": -1.26, "month": 0.06, "points": 53}, {"name": "Vitalik", "slug": "vitalik", "start": "2022-05-31", "end": "2026-09-30", "since": 222.0, "year": -2.87, "month": 0.59, "points": 53}, {"name": "Gold Bug", "slug": "gold-bug", "start": "2018-11-30", "end": "2026-09-30", "since": 238.35, "year": 6.13, "month": -0.02, "points": 95}, {"name": "Soft Commodities", "slug": "soft-commodities", "start": "2020-03-31", "end": "2026-09-30", "since": 179.87, "year": 5.52, "month": -1.01, "points": 79}, {"name": "Krypto Knight", "slug": "krypto-knight", "start": "2018-12-31", "end": "2026-09-30", "since": 47.99, "year": -1.65, "month": 2.52, "points": 94}];
const $=id=>document.getElementById(id);
const root=$('strategy-carousel');if(!root)return;
const img=$('carousel-chart'),plot=img.closest('.carousel-plot'),dots=$('carousel-dots');
let index=0,locked=false;
let timer=null, hovered=false, focused=false, visible=true;
const INTERVAL=5600;
const stop=()=>{if(timer!==null){clearInterval(timer);timer=null}};
const shouldPlay=()=>!hovered&&!focused&&visible&&!document.hidden&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function start(){stop();if(shouldPlay())timer=setInterval(()=>{if(!locked)render(index+1)},INTERVAL)}
root.addEventListener('mouseenter',()=>{hovered=true;stop()});
root.addEventListener('mouseleave',()=>{hovered=false;start()});
root.addEventListener('focusin',()=>{focused=true;stop()});
root.addEventListener('focusout',()=>{focused=root.contains(document.activeElement);if(!focused)start()});
document.addEventListener('visibilitychange',start);
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop()},{threshold:.15});observer.observe(root);
const monthNames=['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
function niceDate(iso){const [y,m]=iso.split('-').map(Number);return monthNames[m-1]+' '+y}
function percent(n){return n===null?'—':(n>0?'+':'')+n.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})+' %'}
function render(i,animate=true){
 if(locked)return;
 const next=(i+items.length)%items.length,x=items[next],direction=next===((index+items.length-1)%items.length)?-1:1;
 const apply=()=>{
  index=next;
  $('carousel-title').textContent=x.name;
  $('carousel-subtitle').textContent=niceDate(x.start)+' – '+niceDate(x.end);
  $('carousel-counter').textContent=(index+1)+' / '+items.length;
  $('carousel-readmore').href='strategy.html?name='+encodeURIComponent(x.name);
  $('carousel-readmore').textContent='Läs mer om '+x.name+' ↗';
  img.src='assets/images/'+x.slug+'-gallery.png';
  img.alt='Månatlig kontovärdesutveckling för '+x.name+', indexerad till 100 från '+niceDate(x.start)+' till '+niceDate(x.end);
  const wm=$('carousel-watermark');if(wm)wm.hidden=true;
  for(const [id,n] of [['carousel-since',x.since],['carousel-year',x.year],['carousel-month',x.month]]){
   const el=$(id);el.textContent=percent(n);el.classList.toggle('negative',n<0);el.classList.toggle('positive',n>0);
  }
  [...dots.children].forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));
 };
 if(!animate||window.matchMedia('(prefers-reduced-motion: reduce)').matches){apply();return}
 locked=true;
 plot.classList.add(direction<0?'carousel-slide-out-right':'carousel-slide-out-left');
 window.setTimeout(()=>{
  plot.classList.remove('carousel-slide-out-left','carousel-slide-out-right');
  apply();
  plot.classList.add(direction<0?'carousel-slide-in-left':'carousel-slide-in-right');
  window.setTimeout(()=>{plot.classList.remove('carousel-slide-in-left','carousel-slide-in-right');locked=false},270);
 },190);
}
items.forEach((x,i)=>{
 const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Visa '+x.name);
 b.addEventListener('click',()=>{render(i);start()});dots.appendChild(b);
 const preload=new Image();preload.src='assets/images/'+x.slug+'-gallery.png';
});
$('carousel-prev').textContent='‹';$('carousel-next').textContent='›';
$('carousel-prev').addEventListener('click',()=>{render(index-1);start()});
$('carousel-next').addEventListener('click',()=>{render(index+1);start()});
root.addEventListener('keydown',e=>{
 if(e.key==='ArrowLeft'){e.preventDefault();render(index-1)}
 if(e.key==='ArrowRight'){e.preventDefault();render(index+1)}
});
render(0,false);start();
})();
