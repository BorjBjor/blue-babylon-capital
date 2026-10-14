/* Shared legal navigation and concise CFD-riskinformation. */
(()=>{
  const strip=document.createElement('aside');
  strip.className='risk-strip';
  strip.setAttribute('aria-label','CFD-riskinformation');
  strip.innerHTML='<strong>Riskinformation:</strong> CFD-handel innebär betydande risk för förlust. Historiska resultat garanterar inte framtida avkastning. <a href="risk-disclosure.html">Läs mer om riskerna</a>.';
  const footer=document.querySelector('footer');
  if(footer)footer.insertAdjacentElement('beforebegin',strip);
  else document.body.append(strip);
  const links=document.createElement('nav');
  links.className='legal-links';
  links.setAttribute('aria-label','Juridik och riskinformation');
  links.innerHTML='<a href="risk-disclosure.html">Riskinformation</a><a href="legal.html">Juridisk information</a><a href="privacy.html">Integritet</a><a href="how-to-invest.html">Så investerar du</a>';
  if(footer)footer.insertAdjacentElement('beforebegin',links);
  else document.body.append(links);
})();
