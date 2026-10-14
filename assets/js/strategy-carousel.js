/* AlgoLodge 3.18 – strategy gallery. Never assign results of one strategy to another. */
(()=>{
const items=[
 {name:'Hot Commodities',period:'Mars 2020 – september 2026',actual:true},
 {name:'Satoshi',period:'Resultatperiod tillkommer',actual:false},
 {name:'Vitalik',period:'Resultatperiod tillkommer',actual:false},
 {name:'Gold Bug',period:'Resultatperiod tillkommer',actual:false},
 {name:'Soft Commodities',period:'Resultatperiod tillkommer',actual:false},
 {name:'Krypto Knight',period:'Resultatperiod tillkommer',actual:false}
];
const $=id=>document.getElementById(id),root=$('strategy-carousel');if(!root)return;
let index=0;const dots=$('carousel-dots');
items.forEach((x,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Visa '+x.name);b.addEventListener('click',()=>render(i));dots.append(b)});
function render(i){
 index=(i+items.length)%items.length;const x=items[index];
 $('carousel-title').textContent=x.name;
 $('carousel-subtitle').textContent=x.period;
 $('carousel-counter').textContent=(index+1)+' / '+items.length;
 const a=$('carousel-readmore');a.href='strategy.html?name='+encodeURIComponent(x.name);a.textContent='Läs mer om '+x.name+' ↗';
 const img=$('carousel-chart');img.alt=x.actual?'Historisk kontovärdesgraf för Hot Commodities, mars 2020–september 2026':'Illustrativ grafmall från Hot Commodities, inte resultat för '+x.name;
 $('carousel-watermark').hidden=x.actual;
 $('carousel-watermark').textContent='EXEMPELGRAF · INTE '+x.name.toUpperCase()+'S RESULTAT';
 // Do not invent performance metrics: figures appear once actual monthly values are supplied.
 for(const key of ['carousel-since','carousel-year','carousel-month'])$(key).textContent='—';
 [...dots.children].forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));
}
$('carousel-prev').addEventListener('click',()=>render(index-1));$('carousel-next').addEventListener('click',()=>render(index+1));
root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();render(index-1)}if(e.key==='ArrowRight'){e.preventDefault();render(index+1)}});
render(0);
})();