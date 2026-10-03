/* Editable Back Sale quantities in the PC Stock In-Out selected-product table.
   Only the presentation changes; movement saving continues to use the existing items array. */
(function(){
'use strict';
if(window.BBBackSaleDesktopQtyEdit)return;
window.BBBackSaleDesktopQtyEdit=true;
const style=document.createElement('style');
style.textContent='#itemRows .bb-bs-edit-wrap{display:inline-flex;align-items:center;justify-content:flex-end;gap:5px}#itemRows .bb-bs-edit-qty{width:75px;max-width:100%;box-sizing:border-box;padding:6px;border:1px solid #9fbee4;border-radius:7px;color:#163e7a;background:white;text-align:right;font-weight:800;font-size:14px}#itemRows .bb-bs-edit-qty:focus{outline:2px solid #4985c7;outline-offset:1px}';
document.head.appendChild(style);
const body=document.getElementById('itemRows');
if(!body)return;
function active(){try{return movementType==='BACK_SALE'&&Array.isArray(items)}catch(_){return false}}
function enhance(){
 if(!active())return;
 [...body.querySelectorAll('tr')].forEach((tr,index)=>{
   const item=items[index],cells=tr.querySelectorAll('td');
   if(!item||cells.length<7||cells[3].querySelector('.bb-bs-edit-qty'))return;
   const wrap=document.createElement('span');wrap.className='bb-bs-edit-wrap';
   const input=document.createElement('input');input.type='number';input.min='1';input.step='1';input.inputMode='numeric';input.className='bb-bs-edit-qty';
   input.setAttribute('aria-label','Edit returned quantity for '+(item.productName||item.productCode));
   input.value=Number(item.qty)>0?String(item.qty):'';
   const unit=document.createElement('span');unit.textContent=String(item.unit||'PCS');
   wrap.append(input,unit);cells[3].replaceChildren(wrap);
   function commit(){
     if(!active()||items[index]!==item)return;
     const q=Number(input.value);
     if(!input.value.trim()||!Number.isSafeInteger(q)||q<=0){input.value=Number(item.qty)>0?String(item.qty):'';return}
     if(q===Number(item.qty))return;
     item.qty=q;
     try{if(typeof updatePreview==='function')updatePreview()}catch(e){console.error('Back Sale preview:',e)}
   }
   input.addEventListener('change',commit);input.addEventListener('blur',commit);
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();input.blur()}});
 });
}
new MutationObserver(enhance).observe(body,{childList:true,subtree:false});
['movementCategorySelect','batchSelect'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(enhance,0)));
enhance();
})();