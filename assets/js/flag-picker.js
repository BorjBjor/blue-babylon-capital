(()=>{
const codes={sv:['se','SE','Svenska'],en:['gb','EN','English'],es:['es','ES','Español'],fr:['fr','FR','Français'],de:['de','DE','Deutsch'],tr:['tr','TR','Türkçe'],nb:['no','NO','Norsk'],da:['da','DA','Dansk'],fi:['fi','FI','Suomi']};
const select=document.getElementById('lang')||document.getElementById('global-language');
if(!select)return;
const wrapper=document.createElement('div');wrapper.className='flag-select';
const button=document.createElement('button');button.type='button';button.className='flag-current';button.setAttribute('aria-label','Välj språk');button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');
const menu=document.createElement('div');menu.className='flag-menu';menu.hidden=true;menu.setAttribute('role','menu');
const img=c=>'<img src="assets/flags/'+c+'.svg" alt="" width="23" height="16">';
const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false')};
const notice=document.createElement('div');notice.className='flag-notice';notice.hidden=true;notice.setAttribute('role','status');
Object.entries(codes).forEach(([code,[flag,label,name]])=>{
 const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitemradio');
 b.setAttribute('aria-checked',String(code==='sv'));
 b.innerHTML=img(flag)+'<span>'+label+'</span><span class="flag-language-name">'+name+'</span>';
 b.addEventListener('click',()=>{
  if(code==='sv'){notice.hidden=true;close();return}
  notice.textContent=name+' – översättningen kommer när den svenska sajten är färdig.';
  notice.hidden=false;close();button.focus();
 });
 menu.appendChild(b);
});
button.innerHTML=img('se')+'<span>SE</span><span class="flag-chevron" aria-hidden="true">⌄</span>';
button.addEventListener('click',()=>{notice.hidden=true;menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('click',e=>{if(!wrapper.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
select.classList.add('flag-native-select');select.value='sv';
select.parentNode.insertBefore(wrapper,select);wrapper.append(select,button,menu,notice);
})();
