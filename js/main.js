(() => {
  'use strict';
  const DEMO_KEY = 'bt_demo_articles_v1';
  const content = document.querySelector('#content');
  const params = new URLSearchParams(window.location.search);
  const fmt = (value) => { const d = new Date(`${value || ''}T12:00:00`);return Number.isNaN(+d) ? '' : new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',year:'numeric'}).format(d); };
  const esc = (str) => String(str ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeImg = (src) => { const s = String(src || ''); return /^(https?:\/\/[^\s]+|assets\/[a-zA-Z0-9_.\-/]+)$/.test(s) ? s : 'assets/market-lines.svg'; };
  const sortPosts = (posts) => [...posts].sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
  const urlFor = (p) => `?artikel=${encodeURIComponent(p.id)}`;
  const shorten = (s,len=140) => String(s||'').length > len ? String(s||'').slice(0,len-1).trimEnd()+'…' : s;
  const meta = (p) => `<div class="meta">${esc(p.category)} <span class="sep">/</span> ${esc(fmt(p.date))}</div>`;
  function imageEl(p,cls) { return `<img class="${cls}" loading="lazy" src="${esc(safeImg(p.image))}" alt="Illustration till ${esc(p.title)}">`; }
  function card(p){ return `<article class="article-card"><a href="${urlFor(p)}">${imageEl(p,'thumb')}</a><div class="card-content">${meta(p)}<h3><a href="${urlFor(p)}">${esc(p.title)}</a></h3><p>${esc(shorten(p.excerpt,177))}</p><a class="read-more" href="${urlFor(p)}">Läs artikeln <span aria-hidden="true">→</span></a></div></article>`; }
  async function loadPosts(){
    try { const res=await fetch('api.php?action=articles',{cache:'no-store'}); if(res.ok && (res.headers.get('content-type')||'').includes('application/json')){ const data=await res.json(); if(Array.isArray(data.articles)) return data.articles; } } catch(_e){}
    try {const saved=JSON.parse(localStorage.getItem(DEMO_KEY));if(Array.isArray(saved))return saved.filter(p=>p.status==='published');}catch(_e){}
    return (window.BT_SEED||[]).filter(p=>p.status==='published');
  }
  function homepage(posts){
    if(!posts.length)return `<div class="no-results"><h1>Inga artiklar publicerade ännu.</h1><p>Logga in på redaktionssidan och publicera en artikel.</p></div>`;
    const lead=posts[0];
    return `<section class="section-heading"><div class="kicker">Analys &amp; perspektiv</div><span class="site-flag">TESTVERSION 1.0</span></section>
      <section class="lead-grid"><article class="featured">${imageEl(lead,'feature-cover')}<div class="feature-inner"><span class="pill">Senaste analysen</span><h1>${esc(lead.title)}</h1><p>${esc(lead.excerpt)}</p><a href="${urlFor(lead)}" class="link-light">Läs hela analysen <span aria-hidden="true">→</span></a></div></article>
      <aside class="sidebar-latest" aria-label="Senaste nytt"><div class="kicker">Börstjänaren</div><h2>Senaste nytt</h2>${posts.slice(0,3).map(p=>`<article class="sidebar-post">${meta(p)}<a href="${urlFor(p)}">${esc(p.title)}</a><p>${esc(shorten(p.excerpt,85))}</p></article>`).join('')}<a class="all-link" href="#senaste">Fler artiklar →</a></aside></section>
      <div class="focus-bar"><span><strong>En enklare Börstjänaren.</strong> Samma fokus på marknaderna – med tydligare navigation och lättlästa analyser.</span><a href="admin.html">Prova redaktionen →</a></div>
      <section id="senaste"><div class="content-head"><h2>Senaste artiklarna</h2><small>${posts.length} publicerade artiklar</small></div><div class="article-grid">${posts.map(card).join('')}</div></section>`;
  }
  function archive(posts, category, query){
    let match = posts.filter(p=> category ? p.category===category : true).filter(p=>query ? [p.title,p.excerpt,p.category,p.content].join(' ').toLocaleLowerCase('sv-SE').includes(query.toLocaleLowerCase('sv-SE')) : true);
    const title=query ? `Sökresultat för ”${query}”` : category;
    return `<div class="browse-head"><div class="kicker">Börstjänaren / Arkiv</div><h1>${esc(title)}</h1><p>${match.length} ${match.length===1?'artikel':'artiklar'} ${query?'matchar din sökning':'i denna kategori'}.</p></div>${match.length ? `<div class="article-grid">${match.map(card).join('')}</div>` : `<div class="no-results"><h2>Inga artiklar hittades</h2><p>Den här kategorin har ännu inga testartiklar.</p><a href="./">← Till startsidan</a></div>`}`;
  }
  function story(posts,id){
    const p=posts.find(p=>p.id===id);if(!p)return `<div class="no-results"><h1>Artikeln hittades inte</h1><a href="./">← Till startsidan</a></div>`;
    const paragraphs=String(p.content||'').split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean).map(v=>`<p>${esc(v).replace(/\n/g,'<br>')}</p>`).join('');
    document.title=`${p.title} – Börstjänaren`;
    return `<article class="story"><a class="back-link" href="./">← Tillbaka till startsidan</a><header class="story-header"><div class="kicker">${esc(p.category)}</div><h1>${esc(p.title)}</h1><p class="story-excerpt">${esc(p.excerpt)}</p><div class="meta">${esc(p.author || 'Börstjänaren')} <span class="sep">/</span> ${esc(fmt(p.date))}</div></header>${imageEl(p,'story-image')}<div class="story-body">${paragraphs}<p class="story-end">Börstjänaren • Testartikel. Materialet är inte personlig investeringsrådgivning.</p></div><div class="story-actions"><a href="./">← Fler artiklar</a></div></article>`;
  }
  function setup(){
    const now=new Date();document.querySelector('#today').textContent=new Intl.DateTimeFormat('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
    document.querySelector('#year').textContent=String(now.getFullYear());
    const category=params.get('kategori');
    document.querySelectorAll('[data-category]').forEach(a=>{a.classList.toggle('active', category ? a.dataset.category===category : a.dataset.category==='Alla');});
    const menu=document.querySelector('#menuToggle');menu.addEventListener('click',()=>{const open=document.querySelector('#primaryNav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
    const searchForm=document.querySelector('#searchForm');searchForm.addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#searchInput').value.trim();window.location.href=q?`?sok=${encodeURIComponent(q)}`:'./';});
  }
  async function init(){setup();const posts=sortPosts(await loadPosts());const id=params.get('artikel');const cat=params.get('kategori');const query=params.get('sok');content.innerHTML=id?story(posts,id):cat||query?archive(posts,cat,query):homepage(posts);if(query){document.querySelector('#searchInput').value=query;} }
  init().catch(e=>{console.error(e);content.innerHTML='<p>Kunde inte läsa artiklarna.</p>';});
})();
