/* Shared legal navigation and concise CFD risk disclosure. */
(()=>{
  const strip=document.createElement('aside');
  strip.className='risk-strip';
  strip.setAttribute('aria-label','CFD risk disclosure');
  strip.innerHTML='<strong>Risk Disclosure:</strong> Trading CFDs involves substantial risk of loss. Past performance does not guarantee future results. <a href="risk-disclosure.html">Read more about the risks</a>.';
  const footer=document.querySelector('footer');
  if(footer)footer.insertAdjacentElement('beforebegin',strip);
  else document.body.append(strip);
  const links=document.createElement('nav');
  links.className='legal-links';
  links.setAttribute('aria-label','Legal and risk information');
  links.innerHTML='<a href="risk-disclosure.html">Risk Disclosure</a><a href="legal.html">Legal Information</a><a href="privacy.html">Privacy</a><a href="how-to-invest.html">How to Invest</a>';
  if(footer)footer.insertAdjacentElement('beforebegin',links);
  else document.body.append(links);
})();
