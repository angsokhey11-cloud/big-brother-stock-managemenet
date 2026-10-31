/* BIG BROTHER Back Sale exact stock-source return V2 — staged.
   Only active in Stock Key-in BACK_SALE; no changes to other movement types. */
(function(){
'use strict';
if(window.BBBackSaleSourceV2)return;
window.BBBackSaleSourceV2=true;
const EPS=0.000001;
const el=id=>document.getElementById(id),num=x=>Number(x)||0,clean=x=>String(x??'').trim();
const active=()=>{try{return movementType==='BACK_SALE'&&Array.isArray(items)}catch(_){return false}};
const getBatch=()=>{try{return typeof selectedBatch==='function'?selectedBatch():null}catch(_){return null}};
const currentBatchId=()=>clean(el('batchSelect')?.value||getBatch()?.batchId);
const batchItem=code=>(getBatch()?.items||[]).find(i=>clean(i.productCode)===clean(code))||null;
const balance=(code,key)=>{
 const item=batchItem(code);
 if(!item)return 0;
 if(key==='p')return Math.max(0,num(item.purchasedPendingQty??item.purchasedRemainingQty??0));
 return Math.max(0,num(item.zeroCostPendingQty??item.zeroCostRemainingQty??0));
};
const selectedSource=(row)=>clean(row.querySelector('.bb-bs-source')?.value);
const body=el('itemRows');
if(!body)return;
const style=document.createElement('style');
style.textContent='.bb-bs-source-box{margin-top:5px;font-size:10px;color:#4e6885}.bb-bs-source-info{margin-bottom:4px;font-size:9px}.bb-bs-source-fields{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.bb-bs-source-fields select,.bb-bs-source-fields input{box-sizing:border-box;border:1px solid #bcd0e6;border-radius:6px;background:#fff;color:#16416e;min-height:28px;padding:3px 5px;font:inherit;font-weight:700}.bb-bs-source-fields select{min-width:120px;max-width:100%}.bb-bs-source-fields label{display:none;align-items:center;gap:3px;font-size:9px}.bb-bs-source-box[data-mode="MIXED"] .bb-bs-source-fields label{display:inline-flex}.bb-bs-source-fields label input{width:58px;min-width:50px;text-align:center}.bb-bs-source-error{color:#b53434;font-size:9px;font-weight:800;margin-top:3px}.bb-bs-source-ok{color:#16734c}@media(max-width:900px){.bb-bs-source-box{font-size:9px}.bb-bs-source-fields select{max-width:165px;min-width:115px}.bb-bs-source-fields label{width:100%}.bb-bs-source-fields label input{width:60px}.bb-bs-source-info{white-space:normal}}';
document.head.appendChild(style);
function split(item,box){
 const mode=selectedSource(box);
 const q=num(item.qty);
 if(mode==='PURCHASED')return {p:q,z:0};
 if(mode==='ZERO_COST')return {p:0,z:q};
 if(mode==='MIXED')return {p:num(box.querySelector('.bb-bs-p').value),z:num(box.querySelector('.bb-bs-z').value)};
 return null;
}
function validateOne(item,box){
 if(!box)return 'Choose Back Sale stock source for '+item.productName;
 const x=split(item,box);
 if(!x)return 'Choose Back Sale stock source for '+item.productName;
 if(x.p<0||x.z<0||Math.abs(x.p+x.z-num(item.qty))>EPS)
  return item.productName+': Purchased + Zero-Cost return must equal Qty '+num(item.qty);
 if(x.p>balance(item.productCode,'p')+EPS)return item.productName+': purchased return exceeds Batch source balance';
 if(x.z>balance(item.productCode,'z')+EPS)return item.productName+': zero-cost return exceeds Batch source balance';
 return '';
}
function syncItem(row,item){
 const box=row.querySelector('.bb-bs-source-box');if(!box)return;
 const mode=selectedSource(box);box.dataset.mode=mode;
 const x=split(item,box),error=validateOne(item,box);
 const text=box.querySelector('.bb-bs-source-error');
 if(text){text.textContent=error||'Purchased '+(x?.p||0)+' · Zero-Cost '+(x?.z||0);text.className='bb-bs-source-error'+(error?'':' bb-bs-source-ok')}
 if(x&&!error){item.purchasedQty=x.p;item.zeroCostQty=x.z;item.bbSourceSelected=true}
 else{delete item.purchasedQty;delete item.zeroCostQty;item.bbSourceSelected=false}
}
function enhance(){
 if(!active())return;
 const batchId=currentBatchId();
 [...body.querySelectorAll('tr')].forEach((row,i)=>{
  const item=items[i],cells=row.querySelectorAll('td');if(!item||cells.length!==7)return;
  let box=row.querySelector('.bb-bs-source-box');
  if(!box){
   box=document.createElement('div');box.className='bb-bs-source-box';
   box.innerHTML='<div class="bb-bs-source-info"></div><div class="bb-bs-source-fields"><select class="bb-bs-source" aria-label="Back Sale source"><option value="">Select return source…</option><option value="PURCHASED">Purchased</option><option value="ZERO_COST">Zero-Cost</option><option value="MIXED">Mixed</option></select><label>Purchased <input class="bb-bs-p" type="number" min="0" step="any" inputmode="decimal"></label><label>Zero-Cost <input class="bb-bs-z" type="number" min="0" step="any" inputmode="decimal"></label></div><div class="bb-bs-source-error"></div>';
   cells[0].appendChild(box);
   box.querySelector('.bb-bs-source').addEventListener('change',()=>{
    const choice=selectedSource(box);item.bbSourceChoice=choice;
    if(choice==='MIXED'){box.querySelector('.bb-bs-p').value=String(item.purchasedQty||'');box.querySelector('.bb-bs-z').value=String(item.zeroCostQty||'')}
    syncItem(row,item);
   });
   for(const type of ['p','z'])box.querySelector('.bb-bs-'+type).addEventListener('input',()=>{
    if(selectedSource(box)!=='MIXED')return;
    const p=num(box.querySelector('.bb-bs-p').value),z=num(box.querySelector('.bb-bs-z').value);
    item.qty=p+z;
    const qty=row.querySelector('.bb-bs-edit-qty, .bb-back-sale-edit-qty');
    if(qty)qty.value=String(item.qty);
    syncItem(row,item);
    try{updatePreview()}catch(_){}
   });
  }
  if(box.dataset.batchId!==batchId){box.dataset.batchId=batchId;item.bbSourceChoice='';delete item.purchasedQty;delete item.zeroCostQty;item.bbSourceSelected=false;box.querySelector('.bb-bs-source').value='';box.querySelector('.bb-bs-p').value='';box.querySelector('.bb-bs-z').value='';}
  box.querySelector('.bb-bs-source-info').textContent='Batch Source · Purchased '+balance(item.productCode,'p')+' · Zero-Cost '+balance(item.productCode,'z');
  if(item.bbSourceChoice&&selectedSource(box)!==item.bbSourceChoice)box.querySelector('.bb-bs-source').value=item.bbSourceChoice;
  syncItem(row,item);
 });
}
function validate(){
 if(!active())return {ok:true};
 const requested=new Map();
 for(const [i,item] of items.entries()){
  const row=[...body.querySelectorAll('tr')][i],box=row?.querySelector('.bb-bs-source-box');
  const error=validateOne(item,box);
  if(error)return {ok:false,message:error};
  const x=split(item,box),key=clean(item.productCode);
  const v=requested.get(key)||{p:0,z:0};
  v.p+=x.p;v.z+=x.z;requested.set(key,v);
 }
 for(const [code,x] of requested){
  if(x.p>balance(code,'p')+EPS||x.z>balance(code,'z')+EPS)return {ok:false,message:code+': source return exceeds Batch balance'};
 }
 return {ok:true};
}
function ensureValid(){
 const v=validate();
 if(!v.ok){if(typeof setStatus==='function')setStatus(v.message,'error');alert(v.message);return false}
 for(const [i,item] of items.entries()){
  const box=[...body.querySelectorAll('tr')][i]?.querySelector('.bb-bs-source-box');
  const v=split(item,box);
  item.purchasedQty=v.p;item.zeroCostQty=v.z;
 }
 return true;
}
body.addEventListener('input',ev=>{if(ev.target.matches('.bb-bs-edit-qty,.bb-back-sale-edit-qty'))setTimeout(enhance,0)});
body.addEventListener('change',ev=>{if(ev.target.matches('.bb-bs-edit-qty,.bb-back-sale-edit-qty'))setTimeout(enhance,0)});
new MutationObserver(enhance).observe(body,{childList:true,subtree:false});
el('batchSelect')?.addEventListener('change',()=>setTimeout(enhance,0));
el('movementCategorySelect')?.addEventListener('change',()=>setTimeout(enhance,0));
el('saveBtn')?.addEventListener('click',ev=>{if(!active())return;if(!ensureValid()){ev.preventDefault();ev.stopImmediatePropagation()}},true);
const oldBuild=window.buildPayload;
if(typeof oldBuild==='function')window.buildPayload=function(){
 if(active()&&!ensureValid())throw Error('Back Sale source selection required');
 const payload=oldBuild.apply(this,arguments);
 if(!active())return payload;
 (payload.items||[]).forEach((line,i)=>{
  line.purchasedQty=num(items[i]?.purchasedQty);
  line.zeroCostQty=num(items[i]?.zeroCostQty);
 });
 return payload;
};
setTimeout(enhance,0);
})();