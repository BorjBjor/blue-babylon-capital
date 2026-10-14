(()=>{
const codes={en:['gb','EN','English'],sv:['se','SE','Svenska'],es:['es','ES','Español'],fr:['fr','FR','Français'],de:['de','DE','Deutsch'],tr:['tr','TR','Türkçe'],nb:['no','NO','Norsk'],da:['da','DA','Dansk'],fi:['fi','FI','Suomi']};
const select=document.getElementById('global-language')||document.getElementById('lang');
if(!select)return;
const wrapper=document.createElement('div');wrapper.className='flag-select';
const button=document.createElement('button');button.type='button';button.className='flag-current';button.setAttribute('aria-label','Choose language');button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');
const menu=document.createElement('div');menu.className='flag-menu';menu.hidden=true;menu.setAttribute('role','menu');
function img(code){return '<img src="assets/flags/'+code+'.svg" alt="" width="23" height="16">'}
function update(){let v=codes[select.value]?select.value:'en';const [f,label]=codes[v];button.innerHTML=img(f)+'<span>'+label+'</span><span class="flag-chevron" aria-hidden="true">⌄</span>';menu.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-checked',String(b.dataset.lang===v));});}
Object.entries(codes).forEach(([key,[flag,label,name]])=>{let b=document.createElement('button');b.type='button';b.dataset.lang=key;b.setAttribute('role','menuitemradio');b.innerHTML=img(flag)+'<span>'+label+'</span><span class="flag-language-name">'+name+'</span>';b.addEventListener('click',()=>{select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));update();close();button.focus()});menu.appendChild(b)});
function close(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('click',e=>{if(!wrapper.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
select.addEventListener('change',update);
select.classList.add('flag-native-select');
select.parentNode.insertBefore(wrapper,select);
wrapper.append(select,button,menu);
update();
})();