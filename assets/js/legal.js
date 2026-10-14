/* Shared information footer and provisional CFD risk statement. */
(()=>{
const isLegal=document.body.classList.contains('legal-page');
const strip=document.createElement('aside');strip.className='risk-strip';strip.setAttribute('aria-label','CFD risk warning');
strip.innerHTML='<strong>CFD risk:</strong> CFDs are leveraged products and can result in rapid losses. Copy trading does not remove risk. <a href="risk-disclosure.html">Read the full risk disclosure</a><span class="draft-note">Pre-launch draft: the applicable broker-specific mandatory retail loss warning must be added and verified before public marketing.</span>';
const header=document.querySelector('header');if(header)header.insertAdjacentElement('afterend',strip);else document.body.prepend(strip);
const links=document.createElement('nav');links.className='legal-links';links.setAttribute('aria-label','Legal and risk information');
links.innerHTML='<a href="risk-disclosure.html">Risk Disclosure</a><a href="legal.html">Legal Information</a><a href="privacy.html">Privacy</a><a href="how-to-invest.html">How to Invest</a>';
const footer=document.querySelector('footer');if(footer)footer.insertAdjacentElement('beforebegin',links);else document.body.append(links);
})();
