(()=>{
  const altSlider=document.getElementById('why-share');
  const bondsSlider=document.getElementById('why-bonds');
  if(!altSlider||!bondsSlider)return;
  const $=id=>document.getElementById(id);
  function render(changed){
    let alt=Number(altSlider.value);
    let bonds=Number(bondsSlider.value);
    if(alt+bonds>100){
      if(changed==="alt") bonds=100-alt;
      else alt=100-bonds;
    }
    const stocks=100-alt-bonds;
    altSlider.value=alt;
    bondsSlider.value=bonds;
    $("why-share-value").textContent=alt+" %";
    $("why-bonds-value").textContent=bonds+" %";
    $("why-stock-label").textContent=stocks+" %";
    $("why-bonds-label").textContent=bonds+" %";
    $("why-alt-label").textContent=alt+" %";
    $("why-stock-bar").style.width=stocks+"%";
    $("why-bonds-bar").style.width=bonds+"%";
    $("why-alt-bar").style.width=alt+"%";
    document.querySelector(".why-bar-three").setAttribute("aria-label",
      `Portföljfördelning: aktier ${stocks} procent, obligationer ${bonds} procent, alternativa strategier ${alt} procent`);
  }
  altSlider.addEventListener("input",()=>render("alt"));
  bondsSlider.addEventListener("input",()=>render("bonds"));
  render("alt");
})();
