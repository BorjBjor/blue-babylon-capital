/* AlgoLodge 3.15 – cyclical strategy carousel. Only Hot Commodities has a supplied chart.
   All other panels intentionally show the same source image with a visible template warning. */
(()=>{
const items=[
 {name:'Hot Commodities',kind:'Uppladdad historisk graf · USD',actual:true},
 {name:'Satoshi',kind:'Grafmall · resultat tillkommer',actual:false},
 {name:'Vitalik',kind:'Grafmall · resultat tillkommer',actual:false},
 {name:'Gold Bug',kind:'Grafmall · resultat tillkommer',actual:false},
 {name:'Soft Commodities',kind:'Grafmall · resultat tillkommer',actual:false},
 {name:'Krypto Knight',kind:'Grafmall · resultat tillkommer',actual:false}
];
const $=id=>document.getElementById(id), root=$('strategy-carousel');if(!root)return;
let index=0;
const dots=$('carousel-dots');
items.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Visa '+item.name);b.addEventListener('click',()=>render(i));dots.append(b)});
function render(i){
 index=(i+items.length)%items.length;
 const x=items[index];
 $('carousel-title').textContent=x.name;
 $('carousel-subtitle').textContent=x.kind;
 $('carousel-counter').textContent=(index+1)+' / '+items.length;
 $('carousel-readmore').href='strategy.html?name='+encodeURIComponent(x.name);
 $('carousel-readmore').innerHTML='Läs mer om '+x.name+' <span aria-hidden="true">↗</span>';
 $('carousel-chart').alt=x.actual?'Uppladdad historisk graf för Hot Commodities, mars 2020 till september 2026.':'Samma uppladdade graf används endast som layoutmall för '+x.name+'. Den visar inte strategins avkastning.';
 $('carousel-watermark').hidden=x.actual;
 $('carousel-disclaimer').textContent=x.actual?'Historisk graf från uppladdat underlag. Kontrollera kontovärden och metod före publicering som verifierad avkastning.':'Endast grafmall från Hot Commodities – visar INTE historiska resultat för '+x.name+'. Verklig data läggs in senare.';
 [...dots.children].forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));
}
$('carousel-prev').addEventListener('click',()=>render(index-1));
$('carousel-next').addEventListener('click',()=>render(index+1));
root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();render(index-1)}if(e.key==='ArrowRight'){e.preventDefault();render(index+1)}});
render(0);
})();
