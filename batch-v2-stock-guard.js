/* BIG BROTHER — Stock Management Batch V2 live availability layer */
(function(){
'use strict';
const EPS=0.000001;
const n=v=>Number(v)||0;
const s=v=>String(v==null?'':v).trim();

function isBatchMove(){
  try{return movementType==='BACK_SALE'||(movementType==='STOCK_DAMAGE'&&damageSource==='BATCH')}catch(_){return false}
}
function batch(){try{return typeof selectedBatch==='function'?selectedBatch():null}catch(_){return null}}
function batchItem(code){
  const b=batch();if(!b)return null;
  return (Array.isArray(b.items)?b.items:[]).find(x=>s(x.productCode)===s(code))||null;
}
function rem(row){return n(row?.remainingQty!==undefined?row.remainingQty:row?.pendingQty)}

/* Batch key-in catalogue = only products that still exist in the selected Batch. */
window.manualProductPool=function(){
  if(!isBatchMove())return Array.isArray(products)?products:[];
  const b=batch();if(!b)return [];
  return (Array.isArray(b.items)?b.items:[])
    .filter(x=>s(x.productCode)&&rem(x)>EPS)
    .map(x=>{
      const master=(Array.isArray(products)?products:[]).find(p=>s(p.productCode)===s(x.productCode))||{};
      return {...master,
        productCode:s(x.productCode),
        productName:s(x.productName)||s(master.productName)||s(x.productCode),
        unit:s(x.unit)||s(master.unit),
        batchRemaining:rem(x)
      };
    });
};

window.currentAvailable=function(code){
  if(isBatchMove())return rem(batchItem(code));
  try{return n(stockFor(code).warehouseGood)}catch(_){return 0}
};
window.availableLabel=function(){return isBatchMove()?'Batch Remaining':'Warehouse Good'};
window.updateProductAvailability=function(){
  const p=typeof selectedProduct!=='undefined'?selectedProduct:null;
  if(document.getElementById('productCode'))document.getElementById('productCode').value=p?s(p.productCode):'';
  if(document.getElementById('availableLabel'))document.getElementById('availableLabel').textContent=availableLabel();
  if(document.getElementById('availableQty'))document.getElementById('availableQty').value=p?currentAvailable(p.productCode):0;
};

const oldAdd=window.addProduct;
if(typeof oldAdd==='function'){
  window.addProduct=function(){
    if(isBatchMove()){
      const b=batch();
      if(!b)return setStatus('Select an Open Batch first.','error');
      const p=typeof selectedProduct!=='undefined'?selectedProduct:null;
      const q=n(document.getElementById('qty')?.value);
      if(p){
        const a=currentAvailable(p.productCode);
        if(a<=EPS)return setStatus(s(p.productName)+': no stock remains in '+s(b.batchId)+'.','error');
        if(q>a+EPS)return setStatus(s(p.productName)+': Qty '+q+' is greater than Batch Remaining '+a+'.','error');
      }
      const before=Array.isArray(items)?items.length:0;
      const a=p?currentAvailable(p.productCode):0;
      const r=oldAdd.apply(this,arguments);
      if(Array.isArray(items)&&items.length>before){items[items.length-1].availableBefore=a;try{renderItems()}catch(_){}}
      return r;
    }
    return oldAdd.apply(this,arguments);
  };
  const btn=document.getElementById('addProductBtn');if(btn)btn.onclick=window.addProduct;
}

function refreshBatchUi(){
  try{clearProductSearch()}catch(_){}
  try{updateProductAvailability()}catch(_){}
  const b=batch();
  if(isBatchMove()&&b){
    const total=(Array.isArray(b.items)?b.items:[]).reduce((a,x)=>a+rem(x),0);
    setStatus(s(b.batchId)+' selected · '+total.toLocaleString(undefined,{maximumFractionDigits:3})+' live Batch stock remaining.','success');
  }
}
const select=document.getElementById('batchSelect');if(select)select.addEventListener('change',()=>setTimeout(refreshBatchUi,0));

/* After a Batch Back/Damage save, reload the authoritative open-Batch list immediately. */
const oldSuccess=window.showSaveSuccess;
if(typeof oldSuccess==='function'){
  window.showSaveSuccess=function(r,d){
    const out=oldSuccess.apply(this,arguments);
    if(d&&(d.movementType==='BACK_SALE'||(d.movementType==='STOCK_DAMAGE'&&d.damageSource==='BATCH'))){
      setTimeout(()=>{try{loadStockFast(true,false)}catch(_){}},0);
    }
    return out;
  };
}

/* Remove the old reference-only wording from the live Supabase page. */
const subtitle=document.querySelector('.topbar .subtitle');
if(subtitle)subtitle.textContent='Physical Stock key-in with real-time Batch control. Back Sale / Batch Damage cannot exceed live Batch remaining stock.';
const batchHelp=document.querySelector('#existingBatchFields .helper');
if(batchHelp)batchHelp.textContent='Only OPEN batches with remaining stock are available. Cleared / Closed batches cannot be keyed in.';
})();
