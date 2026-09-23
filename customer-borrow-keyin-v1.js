/* BIG BROTHER — Customer Borrow Stock / Clear Borrowed Stock */
(function(){
'use strict';

const BORROW='CUSTOMER_BORROW';
const CLEAR='CUSTOMER_BORROW_CLEAR';
const EPS=0.000001;
const $=id=>document.getElementById(id);
const clean=v=>String(v==null?'':v).trim();
const number=v=>{const n=Number(v);return Number.isFinite(n)?n:0;};

let borrowData={borrows:[],openBatches:[]};
let borrowBusy=false;

function movement(){
  try{return clean(movementType)}catch(_){return ''}
}

function allCustomers(){
  try{return (Array.isArray(customers)?customers:[]).filter(x=>x&&x.active!==false)}catch(_){return []}
}

function baseOpenBatches(){
  try{return Array.isArray(openBatches)?openBatches:[]}catch(_){return []}
}

function optionLabelBatch(b){
  return [
    clean(b?.batchId),
    clean(b?.salesmanName),
    clean(b?.locationName||b?.locationCode)
  ].filter(Boolean).join(' · ');
}

function batchItem(batch,code){
  const wanted=clean(code).toUpperCase();
  const pools=[
    Array.isArray(batch?.exactItems)?batch.exactItems:[],
    Array.isArray(batch?.items)?batch.items:[]
  ];
  for(const pool of pools){
    const found=pool.find(x=>clean(x?.productCode).toUpperCase()===wanted);
    if(found)return found;
  }
  return null;
}

function batchAvailable(batch,code){
  const item=batchItem(batch,code);
  if(!item)return 0;
  const p=number(
    item.purchasedRemainingQty!==undefined
      ? item.purchasedRemainingQty
      : item.purchasedPendingQty
  );
  const z=number(
    item.zeroCostRemainingQty!==undefined
      ? item.zeroCostRemainingQty
      : item.zeroCostPendingQty
  );
  if(p||z)return Math.max(0,p+z);
  return Math.max(0,number(item.remainingQty!==undefined?item.remainingQty:item.pendingQty));
}

function ensureFields(){
  if($('bbBorrowStockFields')&&$('bbBorrowClearFields'))return true;

  const anchor=$('existingBatchFields')||$('allowanceFields');
  const parent=anchor?.parentElement;
  if(!parent)return false;

  if(!$('bbBorrowStockFields')){
    const wrap=document.createElement('div');
    wrap.id='bbBorrowStockFields';
    wrap.className='dynamic';
    wrap.hidden=true;
    wrap.innerHTML=
      '<div class="grid">'+
        '<div class="field"><label>Borrow From Customer</label><select id="bbBorrowCustomer"><option value="">Select Customer</option></select></div>'+
        '<div class="field"><label>Manual Customer Name</label><input id="bbBorrowManualCustomer" autocomplete="off" placeholder="Type customer name if not in list"><div class="helper">Use either Customer list or Manual Customer Name.</div></div>'+
        '<div class="field"><label>Open Batch</label><select id="bbBorrowBatch"><option value="">Select Open Batch</option></select><div class="helper">Borrowed stock goes directly into this Batch as Purchased stock for normal COGS.</div></div>'+
      '</div>';
    parent.insertBefore(wrap,anchor.nextSibling);
  }

  if(!$('bbBorrowClearFields')){
    const wrap=document.createElement('div');
    wrap.id='bbBorrowClearFields';
    wrap.className='dynamic';
    wrap.hidden=true;
    wrap.innerHTML=
      '<div class="grid">'+
        '<div class="field"><label>Borrow Reference</label><select id="bbBorrowRef"><option value="">Select Outstanding Borrow</option></select></div>'+
        '<div class="field"><label>Current Open Batch</label><select id="bbBorrowClearBatch"><option value="">Select Current Open Batch</option></select><div class="helper">Returned stock is deducted from the salesman\'s current Batch. No Sale / COGS is created.</div></div>'+
      '</div>';
    parent.insertBefore(wrap,$('bbBorrowStockFields').nextSibling);
  }

  $('bbBorrowRef')?.addEventListener('change',()=>{
    try{items=[];renderItems();clearProductSearch();updateProductAvailability();updatePreview()}catch(_){}
    fillClearBatchSelect();
  });
  $('bbBorrowClearBatch')?.addEventListener('change',()=>{
    try{items=[];renderItems();clearProductSearch();updateProductAvailability();updatePreview()}catch(_){}
  });
  $('bbBorrowBatch')?.addEventListener('change',()=>{
    try{items=[];renderItems();clearProductSearch();updateProductAvailability();updatePreview()}catch(_){}
  });
  $('bbBorrowCustomer')?.addEventListener('change',()=>{
    if(clean($('bbBorrowCustomer')?.value)&&$('bbBorrowManualCustomer')){
      $('bbBorrowManualCustomer').value='';
    }
    try{items=[];renderItems();clearProductSearch();updateProductAvailability();updatePreview()}catch(_){}
  });
  $('bbBorrowManualCustomer')?.addEventListener('input',()=>{
    if(clean($('bbBorrowManualCustomer')?.value)&&$('bbBorrowCustomer')){
      $('bbBorrowCustomer').value='';
    }
  });

  return true;
}

function fillBorrowCustomers(){
  if(!ensureFields())return;
  const select=$('bbBorrowCustomer');
  if(!select)return;
  const keep=clean(select.value);
  const rows=allCustomers().slice().sort((a,b)=>
    clean(a?.customerName||a?.name).localeCompare(clean(b?.customerName||b?.name))
  );
  select.innerHTML='<option value="">Select Customer</option>'+
    rows.map(c=>{
      const id=clean(c?.customerId||c?.id);
      const name=clean(c?.customerName||c?.name)||id;
      return '<option value="'+id.replace(/"/g,'&quot;')+'">'+
        name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+
      '</option>';
    }).join('');
  if(keep&&rows.some(c=>clean(c?.customerId||c?.id)===keep))select.value=keep;
}

function fillBorrowBatchSelect(){
  if(!ensureFields())return;
  const select=$('bbBorrowBatch');
  if(!select)return;
  const keep=clean(select.value);
  const rows=baseOpenBatches();
  select.innerHTML='<option value="">Select Open Batch</option>'+
    rows.map(b=>'<option value="'+clean(b.batchId)+'">'+optionLabelBatch(b)+'</option>').join('');
  if(keep&&rows.some(b=>clean(b.batchId)===keep))select.value=keep;
}

function selectedBorrow(){
  const id=clean($('bbBorrowRef')?.value);
  return (borrowData.borrows||[]).find(x=>clean(x.borrowId)===id)||null;
}

function selectedClearBatch(){
  const id=clean($('bbBorrowClearBatch')?.value);
  return (borrowData.openBatches||[]).find(x=>clean(x.batchId)===id)||null;
}

function selectedBorrowBatch(){
  const id=clean($('bbBorrowBatch')?.value);
  return baseOpenBatches().find(x=>clean(x.batchId)===id)||null;
}

function selectedBorrowCustomer(){
  const id=clean($('bbBorrowCustomer')?.value);
  return allCustomers().find(x=>clean(x?.customerId||x?.id)===id)||null;
}

function fillBorrowRefs(){
  if(!ensureFields())return;
  const select=$('bbBorrowRef');
  if(!select)return;
  const keep=clean(select.value);
  const rows=Array.isArray(borrowData.borrows)?borrowData.borrows:[];
  select.innerHTML='<option value="">Select Outstanding Borrow</option>'+
    rows.map(b=>{
      const label=[
        clean(b.borrowId),
        clean(b.customerName),
        clean(b.salesmanName),
        'Outstanding '+number(b.outstandingQty).toLocaleString()
      ].filter(Boolean).join(' · ');
      return '<option value="'+clean(b.borrowId)+'">'+label+'</option>';
    }).join('');
  if(keep&&rows.some(b=>clean(b.borrowId)===keep))select.value=keep;
}

function fillClearBatchSelect(){
  if(!ensureFields())return;
  const select=$('bbBorrowClearBatch');
  if(!select)return;
  const borrow=selectedBorrow();
  const keep=clean(select.value);
  const outstanding=Array.isArray(borrow?.items)?borrow.items:[];
  let rows=Array.isArray(borrowData.openBatches)?borrowData.openBatches.slice():[];

  if(borrow){
    rows=rows.filter(b=>
      clean(b.salesmanStaffId)===clean(borrow.salesmanStaffId) &&
      outstanding.some(item=>
        number(item.outstandingQty)>EPS &&
        batchAvailable(b,item.productCode)>EPS
      )
    );
  }else{
    rows=[];
  }

  select.innerHTML='<option value="">Select Current Open Batch</option>'+
    rows.map(b=>'<option value="'+clean(b.batchId)+'">'+optionLabelBatch(b)+'</option>').join('');
  if(keep&&rows.some(b=>clean(b.batchId)===keep))select.value=keep;
}

async function refreshBorrowOptions(silent=true){
  if(borrowBusy)return borrowData;
  borrowBusy=true;
  try{
    const adapter=window.BBStockAdapter;
    if(!adapter?.rpc)throw new Error('Stock data is not ready.');
    const data=await adapter.rpc('bb_stock_customer_borrow_options');
    borrowData={
      borrows:Array.isArray(data?.borrows)?data.borrows:[],
      openBatches:Array.isArray(data?.openBatches)?data.openBatches:[]
    };
    fillBorrowRefs();
    fillClearBatchSelect();
    return borrowData;
  }catch(error){
    if(!silent&&typeof setStatus==='function'){
      setStatus(clean(error?.message)||'Could not load Borrow Stock records.','error');
    }
    throw error;
  }finally{
    borrowBusy=false;
  }
}

function outstandingFor(code){
  const b=selectedBorrow();
  if(!b)return 0;
  const item=(Array.isArray(b.items)?b.items:[])
    .find(x=>clean(x.productCode).toUpperCase()===clean(code).toUpperCase());
  return Math.max(0,number(item?.outstandingQty));
}

function clearAvailableFor(code){
  return Math.max(0,batchAvailable(selectedClearBatch(),code));
}

function forceBorrowProductUi(){
  const t=movement();
  if(t!==BORROW&&t!==CLEAR)return;
  const panel=$('manualProductPanel');
  if(panel)panel.hidden=false;
  const launcher=$('bbMobileProductLauncher');
  if(launcher)launcher.hidden=false;
  const button=$('bbMobileAddProductBtn');
  if(button)button.hidden=false;
}
function syncCustomFields(){
  if(!ensureFields())return;
  fillBorrowCustomers();
  fillBorrowBatchSelect();
  $('bbBorrowStockFields').hidden=movement()!==BORROW;
  $('bbBorrowClearFields').hidden=movement()!==CLEAR;
  if(movement()===CLEAR)void refreshBorrowOptions(true);
  forceBorrowProductUi();
  [0,60,200,600].forEach(ms=>setTimeout(forceBorrowProductUi,ms));
}

try{
  if(typeof FLOW_CATEGORIES!=='undefined'){
    if(!FLOW_CATEGORIES.INFLOW.some(x=>x.value===BORROW)){
      FLOW_CATEGORIES.INFLOW.push({value:BORROW,label:'Borrow Stock from Customer'});
    }
    if(!FLOW_CATEGORIES.OUTFLOW.some(x=>x.value===CLEAR)){
      FLOW_CATEGORIES.OUTFLOW.push({value:CLEAR,label:'Clear Borrowed Stock'});
    }
  }
}catch(_){}

if(typeof fillSelectors==='function'){
  const baseFillSelectors=fillSelectors;
  fillSelectors=function(){
    const result=baseFillSelectors.apply(this,arguments);
    fillBorrowCustomers();
    fillBorrowBatchSelect();
    return result;
  };
  window.fillSelectors=fillSelectors;
}

if(typeof setMovementType==='function'){
  const baseSetMovementType=setMovementType;
  setMovementType=function(t){
    const result=baseSetMovementType.apply(this,arguments);
    syncCustomFields();
    return result;
  };
  window.setMovementType=setMovementType;
}

if(typeof manualProductPool==='function'){
  const baseManualProductPool=manualProductPool;
  manualProductPool=function(){
    const t=movement();
    if(t===BORROW){
      try{return Array.isArray(products)?products:[]}catch(_){return []}
    }
    if(t===CLEAR){
      const borrow=selectedBorrow();
      const batch=selectedClearBatch();
      if(!borrow||!batch)return [];
      const productRows=(()=>{try{return Array.isArray(products)?products:[]}catch(_){return []}})();
      return (Array.isArray(borrow.items)?borrow.items:[])
        .filter(x=>number(x.outstandingQty)>EPS&&batchAvailable(batch,x.productCode)>EPS)
        .map(x=>{
          const p=productRows.find(p=>clean(p.productCode).toUpperCase()===clean(x.productCode).toUpperCase())||{};
          return {
            ...p,
            productCode:x.productCode,
            productName:x.productName||p.productName||x.productCode,
            unit:x.unit||p.unit||'',
            borrowOutstanding:number(x.outstandingQty),
            batchRemaining:batchAvailable(batch,x.productCode)
          };
        });
    }
    return baseManualProductPool.apply(this,arguments);
  };
  window.manualProductPool=manualProductPool;
}

if(typeof isSimpleBatchReferenceMovement==='function'){
  const baseSimple=isSimpleBatchReferenceMovement;
  isSimpleBatchReferenceMovement=function(){
    if(movement()===BORROW)return true;
    return baseSimple.apply(this,arguments);
  };
  window.isSimpleBatchReferenceMovement=isSimpleBatchReferenceMovement;
}

if(typeof currentAvailable==='function'){
  const baseCurrentAvailable=currentAvailable;
  currentAvailable=function(code){
    if(movement()===BORROW)return null;
    if(movement()===CLEAR)return clearAvailableFor(code);
    return baseCurrentAvailable.apply(this,arguments);
  };
  window.currentAvailable=currentAvailable;
}

if(typeof availableLabel==='function'){
  const baseAvailableLabel=availableLabel;
  availableLabel=function(){
    if(movement()===BORROW)return 'Borrow Stock';
    if(movement()===CLEAR)return 'Current Batch';
    return baseAvailableLabel.apply(this,arguments);
  };
  window.availableLabel=availableLabel;
}

if(typeof movementLabel==='function'){
  const baseMovementLabel=movementLabel;
  movementLabel=function(){
    if(movement()===BORROW)return 'Customer → Batch';
    if(movement()===CLEAR)return 'Batch → Borrow Customer';
    return baseMovementLabel.apply(this,arguments);
  };
  window.movementLabel=movementLabel;
}

if(typeof delta==='function'){
  const baseDelta=delta;
  delta=function(x){
    if(movement()===BORROW){
      const q=number(x?.qty);
      return {warehouse:0,pending:q,damaged:0,company:q};
    }
    if(movement()===CLEAR){
      const q=number(x?.qty);
      return {warehouse:0,pending:-q,damaged:0,company:-q};
    }
    return baseDelta.apply(this,arguments);
  };
  window.delta=delta;
}

if(typeof buildPayload==='function'){
  const baseBuildPayload=buildPayload;
  buildPayload=function(){
    const d=baseBuildPayload.apply(this,arguments);
    if(movement()===BORROW){
      const batch=selectedBorrowBatch();
      const customer=selectedBorrowCustomer();
      const manualCustomerName=clean($('bbBorrowManualCustomer')?.value);
      d.batchId=clean(batch?.batchId);
      d.customerId=manualCustomerName?'':clean(customer?.customerId||customer?.id);
      d.manualCustomerName=manualCustomerName;
      d.customerName=manualCustomerName||clean(customer?.customerName||customer?.name);
      d.salesmanStaffId=clean(batch?.salesmanStaffId);
      d.salesmanName=clean(batch?.salesmanName);
      d.locationCode=clean(batch?.locationCode);
      d.locationName=clean(batch?.locationName||batch?.locationCode);
    }
    if(movement()===CLEAR){
      const borrow=selectedBorrow();
      const batch=selectedClearBatch();
      d.borrowId=clean(borrow?.borrowId);
      d.batchId=clean(batch?.batchId);
      d.customerId=clean(borrow?.customerId);
      d.customerName=clean(borrow?.customerName);
      d.salesmanStaffId=clean(batch?.salesmanStaffId);
      d.salesmanName=clean(batch?.salesmanName);
      d.locationCode=clean(batch?.locationCode);
      d.locationName=clean(batch?.locationName||batch?.locationCode);
    }
    return d;
  };
  window.buildPayload=buildPayload;
}

if(typeof validate==='function'){
  const baseValidate=validate;
  validate=function(d){
    const base=baseValidate.apply(this,arguments);
    if(base)return base;

    if(movement()===BORROW){
      if(!d.customerId&&!clean(d.manualCustomerName))return 'Borrow From Customer or Manual Customer Name is required.';
      if(!d.batchId)return 'Open Batch is required.';
    }

    if(movement()===CLEAR){
      if(!d.borrowId)return 'Borrow Reference is required.';
      if(!d.batchId)return 'Current Open Batch is required.';
      for(const x of d.items||[]){
        const q=number(x.qty);
        const outstanding=outstandingFor(x.productCode);
        const available=clearAvailableFor(x.productCode);
        if(q>outstanding+EPS){
          return (x.productName||x.productCode)+': Qty '+q+' exceeds Borrow Outstanding '+outstanding+'.';
        }
        if(q>available+EPS){
          return (x.productName||x.productCode)+': Qty '+q+' exceeds Current Batch '+available+'.';
        }
      }
    }

    return '';
  };
  window.validate=validate;
}

if(typeof addProduct==='function'){
  const baseAddProduct=addProduct;
  addProduct=function(){
    if(movement()===CLEAR){
      const borrow=selectedBorrow();
      const batch=selectedClearBatch();
      if(!borrow)return typeof setStatus==='function'&&setStatus('Select a Borrow Reference first.','error');
      if(!batch)return typeof setStatus==='function'&&setStatus('Select a Current Open Batch first.','error');

      let p=null,q=0;
      try{p=selectedProduct;q=number($('qty')?.value)}catch(_){}
      if(p&&q>0){
        const outstanding=outstandingFor(p.productCode);
        const available=clearAvailableFor(p.productCode);
        const max=Math.min(outstanding,available);
        if(q>max+EPS){
          return typeof setStatus==='function'&&setStatus(
            (p.productName||p.productCode)+': Max clear Qty is '+max.toLocaleString()+'.',
            'error'
          );
        }
      }
    }
    return baseAddProduct.apply(this,arguments);
  };
  window.addProduct=addProduct;
}

if(typeof clearForm==='function'){
  const baseClearForm=clearForm;
  clearForm=function(){
    const result=baseClearForm.apply(this,arguments);
    if($('bbBorrowCustomer'))$('bbBorrowCustomer').value='';
    if($('bbBorrowManualCustomer'))$('bbBorrowManualCustomer').value='';
    if($('bbBorrowBatch'))$('bbBorrowBatch').value='';
    if($('bbBorrowRef'))$('bbBorrowRef').value='';
    if($('bbBorrowClearBatch'))$('bbBorrowClearBatch').value='';
    fillClearBatchSelect();
    return result;
  };
  window.clearForm=clearForm;
}

if(typeof showSaveSuccess==='function'){
  const baseShowSaveSuccess=showSaveSuccess;
  showSaveSuccess=function(r,d){
    const type=movement();
    const result=baseShowSaveSuccess.apply(this,arguments);
    if(type===BORROW||type===CLEAR){
      void refreshBorrowOptions(true);
      setTimeout(()=>{
        try{
          if(typeof refreshStockOnly==='function')refreshStockOnly(true);
        }catch(_){}
      },100);
    }
    return result;
  };
  window.showSaveSuccess=showSaveSuccess;
}

function boot(){
  ensureFields();
  fillBorrowCustomers();
  fillBorrowBatchSelect();
  try{
    if(typeof fillMovementCategorySelect==='function')fillMovementCategorySelect();
  }catch(_){}
  syncCustomFields();
  [300,900,1800,3500].forEach(ms=>setTimeout(()=>{
    fillBorrowCustomers();
    fillBorrowBatchSelect();
    syncCustomFields();
  },ms));
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

window.BBStockCustomerBorrow={
  refresh:refreshBorrowOptions,
  selectedBorrow,
  selectedClearBatch,
  outstandingFor,
  clearAvailableFor
};
})();
