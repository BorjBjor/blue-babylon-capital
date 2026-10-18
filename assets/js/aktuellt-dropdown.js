/* Shared header submenus. Guard against pages loading this script twice. */
(()=>{
  function init(){
    document.querySelectorAll('.al-nav-dropdown').forEach(dropdown=>{
      const button=dropdown.querySelector('.al-dropdown-toggle');
      if(!button||button.dataset.dropdownBound==='true')return;
      button.dataset.dropdownBound='true';

      function close(){
        dropdown.classList.remove('is-open');
        button.setAttribute('aria-expanded','false');
      }
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        const opening=!dropdown.classList.contains('is-open');
        document.querySelectorAll('.al-nav-dropdown.is-open').forEach(other=>{
          if(other!==dropdown){
            other.classList.remove('is-open');
            other.querySelector('.al-dropdown-toggle')?.setAttribute('aria-expanded','false');
          }
        });
        dropdown.classList.toggle('is-open',opening);
        button.setAttribute('aria-expanded',String(opening));
      });
      document.addEventListener('click',event=>{
        if(!dropdown.contains(event.target))close();
      });
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape')close();
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
