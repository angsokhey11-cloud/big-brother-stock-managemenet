/* Mobile-only Back Sale quantity editor. Uses the existing items/save payload.
   DOM decoration also covers products added manually and loaded by prefill. */
(function(){
'use strict';
const host=()=>document.getElementById('itemRows');
const isBackSale=()=>document.body.classList.contains('bb-stock-mobile') &&
  document.body.dataset.bbMovement==='BACK_SALE';
function decorate(){
  const body=host();
  if(!body||!isBackSale())return;
  [...body.querySelectorAll('tr')].forEach((tr,i)=>{
    if(tr.querySelector('td.empty')||tr.dataset.bbBackSaleEdit==='1')return;
    const cells=tr.querySelectorAll('td');
    if(cells.length!==7)return; // Do not interfere with Batch Stock or other movement tables.
    tr.dataset.bbBackSaleEdit='1';
    tr.dataset.bbBackSaleIndex=String(i);
    const name=cells[0].querySelector('strong');
    if(name&&!name.querySelector('.bb-back-sale-number')){
      const no=document.createElement('span');
      no.className='bb-back-sale-number';
      no.textContent=(i+1)+'. ';
      name.prepend(no);
    }
    const qty=cells[3];
    const unit=typeof items!=='undefined'?String(items[i]?.unit||''):'';
    const input=document.createElement('input');
    input.type='number';
    input.min='0.01';
    input.step='any';
    input.inputMode='decimal';
    input.className='bb-back-sale-edit-qty';
    input.setAttribute('aria-label','Back Sale Qty for '+(name?.textContent||'product'));
    input.value=String(items[i]?.qty??'');
    qty.replaceChildren(input);
    if(unit)qty.dataset.bbUnit=unit;
  });
}
function update(input,finalize){
  if(!isBackSale())return;
  const tr=input.closest('tr');
  const index=Number(tr?.dataset.bbBackSaleIndex);
  if(!Number.isInteger(index)||!items[index])return;
  const value=Number(input.value);
  if(!input.value.trim()||!Number.isFinite(value)||value<=0){
    if(finalize){input.value=String(items[index].qty);input.setCustomValidity('');}
    else input.setCustomValidity('Enter a quantity greater than zero');
    return;
  }
  input.setCustomValidity('');
  items[index].qty=value;
  if(typeof updatePreview==='function')updatePreview();
}
function init(){
  const body=host();
  if(!body){setTimeout(init,200);return;}
  if(body.dataset.bbBackSaleEditorReady)return;
  body.dataset.bbBackSaleEditorReady='1';
  body.addEventListener('input',e=>{if(e.target.matches('.bb-back-sale-edit-qty'))update(e.target,false);});
  body.addEventListener('change',e=>{if(e.target.matches('.bb-back-sale-edit-qty'))update(e.target,true);});
  body.addEventListener('focusout',e=>{if(e.target.matches('.bb-back-sale-edit-qty'))update(e.target,true);});
  const observer=new MutationObserver(decorate);
  observer.observe(body,{childList:true,subtree:false});
  ['flowInBtn','movementCategorySelect'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(decorate,40)));
  decorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();