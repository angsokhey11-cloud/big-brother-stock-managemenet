/* BIG BROTHER Back Sale explicit source selector — Cloud V1.
   Requires source-aware SQL migration, and batch-v2-stock-guard payload patch. */
(function(){
'use strict';
if(window.BBBackSaleSourceSelectorV1)return;
window.BBBackSaleSourceSelectorV1=true;
const style=document.createElement('style');
style.textContent='.bb-source-split{display:grid;grid-template-columns:repeat(2,minmax(95px,1fr));gap:6px;min-width:230px;text-align:left}.bb-source-split label{font-size:11px;font-weight:700;color:#17457a;display:flex;flex-direction:column;gap:3px}.bb-source-split input{width:95px;max-width:100%;box-sizing:border-box;padding:7px;border:1px solid #9db9d9;border-radius:7px;font-weight:800;color:#17457a}.bb-source-total{grid-column:1/-1;font-size:11px;color:#45617d}.bb-source-error{color:#af2222!important;font-weight:800}';
document.head.appendChild(style);
function active(){try{return typeof items!=='undefined'&&Array.isArray(items)&&movementType==='BACK_SALE'}catch(_){return false}}
function selectedRow(code){
 try{
  const batch=typeof selectedBatch==='function'?selectedBatch():null;
  return (batch&&Array.isArray(batch.items)?batch.items:[]).find(x=>String(x.productCode)===String(code))||null;
 }catch(_){return null}
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function available(row,type){
 if(!row)return null;
 const names=type==='purchased'?['purchasedPendingQty','purchasedRemainingQty']:['zeroCostPendingQty','zeroCostRemainingQty'];
 for(const key of names)if(row[key]!==undefined&&row[key]!==null)return Math.max(0,num(row[key]));
 return null;
}
function decorate(){
 if(!active())return;
 const body=document.getElementById('itemRows');if(!body)return;
 [...body.querySelectorAll('tr')].forEach((tr,index)=>{
  const item=items[index],cells=tr.querySelectorAll('td');
  if(!item||cells.length<7||tr.querySelector('.bb-source-split'))return;
  const row=selectedRow(item.productCode);
  const pa=available(row,'purchased'),za=available(row,'zero');
  if(pa===null||za===null){
   const note=document.createElement('small');note.className='bb-source-error';
   note.textContent='Source balances unavailable — source selection disabled';
   cells[3].append(note);return;
  }
  const quantity=num(item.qty);
  const p=item.purchasedQty!==undefined?num(item.purchasedQty):Math.min(quantity,pa);
  const z=item.zeroCostQty!==undefined?num(item.zeroCostQty):Math.max(0,quantity-p);
  item.purchasedQty=p;item.zeroCostQty=z;
  const box=document.createElement('div');box.className='bb-source-split';
  const make=(label,key,value,max)=>{
   const wrap=document.createElement('label');wrap.textContent=label+' (max '+max+')';
   const input=document.createElement('input');input.type='number';input.min='0';input.max=String(max);input.step='any';input.value=String(value);input.dataset.key=key;input.setAttribute('aria-label',label+' returned quantity');
   wrap.append(input);return wrap;
  };
  box.append(make('Purchased','purchasedQty',p,pa),make('Zero-Cost','zeroCostQty',z,za));
  const total=document.createElement('div');total.className='bb-source-total';
  box.append(total);
  function update(){
   if(items[index]!==item)return;
   const inputs=[...box.querySelectorAll('input')],pv=Number(inputs[0].value),zv=Number(inputs[1].value);
   const ok=inputs.every(x=>x.value.trim()!==''&&Number.isFinite(Number(x.value))&&Number(x.value)>=0&&Number(x.value)<=Number(x.max)+0.000001)&&pv+zv>0;
   inputs.forEach(x=>x.setCustomValidity(ok?'':'Invalid source quantity or exceeds available source'));
   if(!ok){total.className='bb-source-total bb-source-error';total.textContent='Check source quantities';return}
   item.purchasedQty=pv;item.zeroCostQty=zv;item.qty=pv+zv;
   total.className='bb-source-total';total.textContent='Total Back Sale: '+item.qty+' '+String(item.unit||'');
   try{if(typeof updatePreview==='function')updatePreview()}catch(_){}
  }
  inputsInit();
  function inputsInit(){box.querySelectorAll('input').forEach(input=>{input.addEventListener('input',update);input.addEventListener('change',update)});update()}
  cells[3].replaceChildren(box);
 });
}
function init(){
 const body=document.getElementById('itemRows');if(!body){setTimeout(init,150);return}
 new MutationObserver(decorate).observe(body,{childList:true,subtree:false});
 ['movementCategorySelect','batchSelect','flowInBtn'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(decorate,0)));
 decorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
