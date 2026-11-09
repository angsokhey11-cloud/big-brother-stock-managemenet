/* BIG BROTHER — Stock Key-In: actual Open Batch → Existing Open Batch transfer.
   This is a REAL stock movement, not the Batch Transfer prefill workflow.
   All quantities are verified and saved atomically in the protected database RPC. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const str=v=>String(v==null?'':v).trim();
const num=v=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,n):0};
const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PENDING_KEY='BB_STOCK_KEYIN_EXISTING_BATCH_PENDING_V1';
const EPS=.000001;
let batches=[],sourceItems=[],selected={},loading=false,saving=false,lastRevision='',lastReceipt=null;
let initialized=false;

function rpc(name,args={}){
  if(!window.BBStockAdapter||typeof window.BBStockAdapter.rpc!=='function')
    throw Error('Stock Key-In database adapter is not ready.');
  return window.BBStockAdapter.rpc(name,args);
}
function currentType(){
  try{return str(movementType)}catch(_){return str($('movementCategorySelect')?.value)}
}
function mode(){return $('bbCarryMode')?.value==='existing'&&currentType()==='BATCH_STOCK'}
function isOpen(b){return str(b?.status).toUpperCase()==='OPEN'}
function physical(x){return num(x?.pendingQty??x?.remainingQty)}
function purchased(x){return num(x?.purchasedPendingQty??x?.purchasedRemainingQty)}
function zero(x){return num(x?.zeroCostPendingQty??x?.zeroCostRemainingQty)}
function sourceBatch(){return batches.find(b=>b.batchId===$('bbCarrySource')?.value)||null}
function targetBatch(){return batches.find(b=>b.batchId===$('bbCarryTarget')?.value)||null}
function lineItems(b){return Array.isArray(b?.items)?b.items:(Array.isArray(b?.exactItems)?b.exactItems:[])}
function status(message,error=false){
  const box=$('bbCarryStatus');
  if(box){box.textContent=message;box.dataset.error=error?'1':'0'}
}
function setButtons(disabled){
  for(const id of ['bbCarryRefresh','bbCarryFillAll','bbCarryClear','bbCarrySave','bbCarryCheckPending']){
    const el=$(id);if(el)el.disabled=disabled;
  }
}
function pendingRead(){
  try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'null')}catch(_){return null}
}
function pendingWrite(p){
  try{if(p)localStorage.setItem(PENDING_KEY,JSON.stringify(p));else localStorage.removeItem(PENDING_KEY)}
  catch(_){}
}
function pendingUi(){
  const p=pendingRead(),el=$('bbCarryPending');
  if(!el)return;
  el.hidden=!p;
  if(p)el.querySelector('.bb-carry-pending-text').textContent=
    'Previous transfer request '+p.id+' has not been confirmed on this device. Check its result before starting a different transfer.';
}
function selectOptions(){
  const src=$('bbCarrySource'),dst=$('bbCarryTarget');
  const oldSource=src.value,oldTarget=dst.value;
  src.innerHTML='<option value="">Select old Source Batch</option>'+
    batches.map(b=>'<option value="'+esc(b.batchId)+'">'+esc(
      b.batchId+' · '+(b.locationName||b.locationCode||'-')+' · '+(b.salesmanName||'-')+' · '+num(b.totalRemainingQty)+' remaining'
    )+'</option>').join('');
  if(batches.some(b=>b.batchId===oldSource))src.value=oldSource;
  dst.innerHTML='<option value="">Select current Destination Batch</option>'+
    batches.filter(b=>b.batchId!==src.value).map(b=>'<option value="'+esc(b.batchId)+'">'+esc(
      b.batchId+' · '+(b.locationName||b.locationCode||'-')+' · '+(b.salesmanName||'-')+' · '+num(b.totalRemainingQty)+' remaining'
    )+'</option>').join('');
  if(batches.some(b=>b.batchId===oldTarget&&b.batchId!==src.value))dst.value=oldTarget;
}
function listSource(){
  const b=sourceBatch();
  sourceItems=lineItems(b).filter(x=>physical(x)>EPS);
  const next={};
  for(const x of sourceItems){
    const code=str(x.productCode);
    if(Object.prototype.hasOwnProperty.call(selected,code))next[code]=Math.min(num(selected[code]),physical(x));
  }
  selected=next;
  renderLines();
}
function renderLines(){
  const host=$('bbCarryLines');
  if(!host)return;
  if(!sourceBatch()){
    host.innerHTML='<div class="bb-carry-empty">Select an old Open Batch to see its live pending products.</div>';
    preview();return;
  }
  if(!sourceItems.length){
    host.innerHTML='<div class="bb-carry-empty">This Batch has no transferable pending stock.</div>';
    preview();return;
  }
  host.innerHTML=sourceItems.map((x,i)=>{
    const code=str(x.productCode),max=physical(x),p=purchased(x),z=zero(x);
    return '<div class="bb-carry-item"><div class="bb-carry-desc"><strong>'+(i+1)+'. '+esc(x.productName||code)+'</strong>'+
      '<small>'+esc(code)+' · Available '+max+' '+esc(x.unit||'PCS')+'<span class="bb-carry-source-split"> · Purchased '+p+' / Zero-Cost '+z+'</span></small></div>'+
      '<label>Transfer Qty<input class="bb-carry-qty" inputmode="decimal" type="number" min="0" step="any" max="'+max+
      '" data-code="'+esc(code)+'" value="'+num(selected[code])+'"></label></div>';
  }).join('');
  host.querySelectorAll('.bb-carry-qty').forEach(input=>input.addEventListener('input',()=>{
    selected[input.dataset.code]=num(input.value);
    const source=sourceItems.find(x=>str(x.productCode)===input.dataset.code);
    const good=num(input.value)<=physical(source)+EPS&&Number(input.value)>=0;
    input.dataset.invalid=good?'0':'1';
    preview();
  }));
  preview();
}
function preview(){
  const source=sourceBatch(),dest=targetBatch(),box=$('bbCarryPreview');
  if(!box)return;
  let total=0,p=0,z=0,products=0,invalid=false;
  for(const x of sourceItems){
    const q=num(selected[str(x.productCode)]);
    if(!(q>EPS))continue;
    total+=q;products++;
    p+=Math.min(q,purchased(x));
    z+=Math.max(0,q-purchased(x));
    if(q>physical(x)+EPS||q>purchased(x)+zero(x)+EPS)invalid=true;
  }
  const left=Math.max(0,num(source?.totalRemainingQty)-total);
  box.textContent=source
    ?'Selected '+products+' products · '+total+' units (Purchased '+p+', Zero-Cost '+z+')\n'+
      'Old Batch remaining after transfer: '+left+' units\n'+
      (dest?'Destination '+dest.batchId+': '+num(dest.totalRemainingQty)+' → '+(num(dest.totalRemainingQty)+total)+' units':'Select a destination Open Batch.')+
      (left<=EPS&&total>0?'\n✓ Old Batch will be ready for normal Close Batch checks.':'')+
      (invalid?'\n⚠ Selected Qty exceeds the source stock.':'')
    :'Waiting for Source Batch.';
  box.dataset.error=invalid?'1':'0';
}
async function refresh(){
  if(loading||saving)return;
  loading=true;setButtons(true);status('Loading current Open Batch balances…');
  try{
    const data=await rpc('bb_stock_keyin_fast');
    batches=(data.openBatches||[]).filter(b=>isOpen(b)&&num(b.totalRemainingQty)>EPS);
    lastRevision=str(data.revision);
    selectOptions();listSource();
    status('Live stock loaded · '+batches.length+' Open Batches. Stock is not moved until you confirm Save.');
  }catch(error){
    status('Could not load live Batch stock: '+(error?.message||String(error)),true);
  }finally{loading=false;setButtons(false);pendingUi()}
}
function fillAll(){
  if(!sourceBatch())return status('Choose your old Source Batch first.',true);
  selected={};
  for(const x of sourceItems)selected[str(x.productCode)]=physical(x);
  renderLines();
}
function clear(){
  selected={};renderLines();
}
function receipt(result){
  lastReceipt=result;
  const box=$('bbCarryReceipt');
  if(!box)return;
  box.hidden=false;
  box.textContent='✓ Saved: '+str(result.sourceBatchId)+' → '+str(result.targetBatchId)+
    '\nMoved '+num(result.transferQty)+' units. Movement '+str(result.movementId)+'.'+
    (result.sourceCleared?'\nOld Batch has no remaining stock. Use Stock Report → Close Batch after checking outstanding damage.':
      '\nOld Batch still has '+num(result.sourceRemainingQty)+' units.');
}
async function checkPending(){
  const pending=pendingRead();
  if(!pending)return;
  setButtons(true);
  try{
    const d=await rpc('bb_stock_movement_by_request_id',{p_request_id:pending.id});
    if(d.found){
      receipt(d);
      pendingWrite(null);
      status('Previous transfer confirmed in stock ledger. Safe to continue.');
      setButtons(false);
      await refresh();
    }else{
      status('Previous request not found in Stock Movement requests. Retry using the SAME selections and Save.',true);
    }
  }catch(error){status('Could not verify previous request: '+(error?.message||String(error)),true)}
  finally{setButtons(false);pendingUi()}
}
async function save(){
  if(saving)return;
  const source=sourceBatch(),dest=targetBatch();
  if(!source||!dest)return status('Select both Source and Destination Open Batches.',true);
  if(source.batchId===dest.batchId)return status('Source and Destination must be different.',true);
  const items=[],split=[];let qty=0,invalid=false;
  for(const x of sourceItems){
    const q=num(selected[str(x.productCode)]);if(!(q>EPS))continue;
    if(q>physical(x)+EPS||q>purchased(x)+zero(x)+EPS)invalid=true;
    items.push({productCode:str(x.productCode),qty:q});
    split.push((x.productName||x.productCode)+': '+q);
    qty+=q;
  }
  if(!items.length)return status('Enter Qty or choose Transfer All Remaining.',true);
  if(invalid)return status('Some Qty exceeds current Source stock. Please correct before Save.',true);
  const activityDate=str($('activityDate')?.value);
  if(!activityDate)return status('Choose Transaction Date above.',true);
  const signature=JSON.stringify({sourceBatchId:source.batchId,targetBatchId:dest.batchId,activityDate,items});
  let pending=pendingRead();
  if(pending&&pending.signature!==signature){
    status('A previous transfer request is unresolved. Use Check Previous Transfer before changing the transfer.',true);
    pendingUi();return;
  }
  const prompt='CONFIRM REAL BATCH STOCK TRANSFER\n\n'+source.batchId+' → '+dest.batchId+
    '\n'+split.join('\n')+'\n\nTotal: '+qty+' units\n\nThis immediately updates BOTH pending batches.'+
    '\nWarehouse stock, sales revenue, and COGS are unchanged.'+
    '\nClose the source batch separately using the normal checks.\n\nContinue?';
  if(!window.confirm(prompt))return;
  if(!pending){
    pending={
      id:'BB-BATCH-KEYIN-'+Date.now()+'-'+Math.random().toString(36).slice(2,10),
      signature,sourceBatchId:source.batchId,targetBatchId:dest.batchId
    };
    pendingWrite(pending);
  }
  saving=true;setButtons(true);status('Posting stock transfer transaction…');
  try{
    const result=await rpc('bb_stock_transfer_between_open_batches',{p_payload:{
      requestId:pending.id,sourceBatchId:source.batchId,targetBatchId:dest.batchId,
      activityDate,items
    }});
    if(!result?.success)throw Error(result?.message||'Transfer could not be confirmed');
    receipt(result);pendingWrite(null);
    selected={};sourceItems=[];
    status('Stock successfully carried forward · '+num(result.transferQty)+' units.');
  }catch(error){
    status('Transfer not confirmed: '+(error?.message||String(error))+
      ' Check Previous Transfer before starting another request to prevent duplication.',true);
  }finally{
    saving=false;setButtons(false);pendingUi();
  }
  if(!pendingRead())await refresh();
}
function applyMode(){
  if(!$('bbCarryMode'))return;
  if(currentType()!=='BATCH_STOCK'&&$('bbCarryMode').value==='existing')$('bbCarryMode').value='new';
  const active=mode();
  const host=$('newBatchFields'),panel=$('bbCarryPanel');
  document.body.classList.toggle('bb-existing-transfer-active',active);
  host?.classList.toggle('bb-carry-mode',active);
  if(panel)panel.hidden=!active;
  if(active&&!batches.length&&!loading)refresh();
}
function makeUi(){
  const host=$('newBatchFields');
  if(!host||$('bbCarryMode'))return !!$('bbCarryMode');
  const style=document.createElement('style');style.id='bb-existing-batch-keyin-style';
  style.textContent=
    '#bbCarryModeWrap{margin:0 0 13px;padding:12px;border:1px solid #bcd0e7;border-radius:11px;background:#f0f6fe}'+
    '#bbCarryModeWrap label{display:block;font-weight:850;color:#17457a;font-size:12px;margin-bottom:5px}'+
    '#bbCarryModeWrap select{width:100%;min-height:40px;padding:8px;border:1px solid #afc6df;border-radius:8px;background:white;font-size:13px;font-weight:750}'+
    '#newBatchFields.bb-carry-mode > :not(#bbCarryModeWrap):not(#bbCarryPanel){display:none!important}'+
    'body.bb-existing-transfer-active .page > .card:has(#manualProductPanel),'+
    'body.bb-existing-transfer-active .page > .card:has(#saveBtn){display:none!important}'+
    '#bbCarryPanel[hidden],#bbCarryPending[hidden],#bbCarryReceipt[hidden]{display:none!important}'+
    '#bbCarryPanel{border:1px solid #bfdbd1;padding:13px;border-radius:11px;background:#f8fcfa}'+
    '#bbCarryPanel h3{margin:0 0 5px;color:#174b39;font-size:16px}'+
    '.bb-carry-hint{font-size:11px;color:#607484;margin:4px 0 12px;line-height:1.45}'+
    '.bb-carry-pickers{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
    '.bb-carry-pickers label{display:block;font-size:11px;font-weight:850;color:#355971}'+
    '.bb-carry-pickers select{width:100%;min-width:0;margin-top:5px;padding:10px;border:1px solid #bbcede;border-radius:8px;background:#fff;font-size:12px}'+
    '.bb-carry-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}'+
    '.bb-carry-toolbar button,.bb-carry-submit,#bbCarryCheckPending{min-height:38px;border:1px solid #aac1d6;border-radius:8px;padding:8px 12px;background:#fff;color:#17457a;font-weight:850;cursor:pointer}'+
    '.bb-carry-submit{background:#17694b;border-color:#17694b;color:#fff;width:100%;font-size:13px;margin-top:12px}'+
    '.bb-carry-submit:disabled,.bb-carry-toolbar button:disabled{opacity:.55;cursor:wait}'+
    '.bb-carry-item{display:grid;grid-template-columns:minmax(0,1fr) 130px;align-items:center;gap:12px;padding:10px 8px;border-top:1px solid #e2eaf0}'+
    '.bb-carry-desc{min-width:0}.bb-carry-desc strong{display:block;font-size:12px;color:#284b66}'+
    '.bb-carry-desc small{display:block;margin-top:3px;font-size:10px;color:#60768c;line-height:1.4}'+
    '.bb-carry-item label{font-size:10px;color:#536b84;font-weight:800}'+
    '.bb-carry-item input{display:block;width:100%;box-sizing:border-box;min-height:38px;margin-top:4px;padding:8px;border:1px solid #b7cadc;border-radius:8px;font-size:13px;text-align:right;background:white}'+
    '.bb-carry-item input[data-invalid="1"]{border-color:#bd3a39;background:#fff4f4}'+
    '#bbCarryPreview,#bbCarryStatus,#bbCarryPending,#bbCarryReceipt{white-space:pre-line;line-height:1.5;font-size:11px;padding:10px 11px;border-radius:9px;margin-top:10px}'+
    '#bbCarryPreview{background:#eaf7f1;color:#20593e;border:1px solid #cce5d7}'+
    '#bbCarryStatus{background:#edf4fa;color:#244b72;border:1px solid #d4e3f0}'+
    '#bbCarryStatus[data-error="1"],#bbCarryPreview[data-error="1"]{background:#fff2ee;color:#9b2d26;border-color:#e8c8c0}'+
    '#bbCarryPending{background:#fff5e8;color:#7b5527;border:1px solid #ecd5ad}'+
    '#bbCarryReceipt{background:#e9f9ee;color:#1d6544;border:1px solid #bee4c7}'+
    '@media(max-width:650px){.bb-carry-pickers{grid-template-columns:1fr}.bb-carry-item{grid-template-columns:minmax(0,1fr) 85px;gap:6px;padding:8px 2px}.bb-carry-desc strong{font-size:10px}.bb-carry-desc small{font-size:8px}.bb-carry-toolbar{display:grid;grid-template-columns:1fr 1fr}.bb-carry-toolbar button{font-size:10px;padding:7px 5px}#bbCarryPanel{padding:9px}.bb-carry-item input{font-size:11px}}';
  document.head.appendChild(style);
  const chooser=document.createElement('div');
  chooser.id='bbCarryModeWrap';
  chooser.innerHTML='<label for="bbCarryMode">Batch Destination</label>'+
    '<select id="bbCarryMode"><option value="new">Create New Batch / Batch to Salesman</option>'+
    '<option value="existing">Transfer Stock into Existing Open Batch (Carry Forward)</option></select>';
  host.insertBefore(chooser,host.firstChild);
  const panel=document.createElement('div');
  panel.id='bbCarryPanel';panel.hidden=true;
  panel.innerHTML='<h3>Batch → Existing Batch Stock Transfer</h3>'+
    '<div class="bb-carry-hint">Real Stock Key-In movement. Choose the old batch and the current batch receiving its pending stock. Purchased and Zero-Cost stay separate; no warehouse return.</div>'+
    '<div class="bb-carry-pickers"><label>Old Source Batch<select id="bbCarrySource"><option value="">Select old Source Batch</option></select></label>'+
    '<label>Current Destination Batch<select id="bbCarryTarget"><option value="">Select current Destination Batch</option></select></label></div>'+
    '<div class="bb-carry-toolbar"><button type="button" id="bbCarryRefresh">↻ Refresh Live Batches</button>'+
    '<button type="button" id="bbCarryFillAll">Select All Remaining</button>'+
    '<button type="button" id="bbCarryClear">Clear Qty</button></div>'+
    '<div id="bbCarryLines"><div class="bb-carry-empty">Select a Source Batch.</div></div>'+
    '<div id="bbCarryPreview" aria-live="polite"></div>'+
    '<div id="bbCarryPending" hidden><div class="bb-carry-pending-text"></div><button type="button" id="bbCarryCheckPending">Check Previous Transfer</button></div>'+
    '<button type="button" class="bb-carry-submit" id="bbCarrySave">Save Real Batch Stock Transfer</button>'+
    '<div id="bbCarryStatus" aria-live="polite">Choose the two Open Batches.</div>'+
    '<div id="bbCarryReceipt" hidden></div>';
  host.appendChild(panel);
  $('bbCarryMode').addEventListener('change',applyMode);
  $('bbCarrySource').addEventListener('change',()=>{selectOptions();listSource()});
  $('bbCarryTarget').addEventListener('change',preview);
  $('bbCarryRefresh').addEventListener('click',refresh);
  $('bbCarryFillAll').addEventListener('click',fillAll);
  $('bbCarryClear').addEventListener('click',clear);
  $('bbCarrySave').addEventListener('click',save);
  $('bbCarryCheckPending').addEventListener('click',checkPending);
  document.addEventListener('change',e=>{
    if(e.target?.id==='movementCategorySelect'||e.target?.id==='bbMovementCategorySelect')
      setTimeout(applyMode,40);
  });
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#flowInBtn,#flowOutBtn,.bb-mobile-category-btn,.bb-desktop-category-btn'))
      setTimeout(applyMode,45);
  });
  const observer=new MutationObserver(()=>setTimeout(applyMode,0));
  observer.observe(host,{attributes:true,attributeFilter:['hidden']});
  pendingUi();
  applyMode();
  return true;
}
function boot(){
  if(initialized)return;
  if(!makeUi()){setTimeout(boot,250);return}
  initialized=true;
  setTimeout(applyMode,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
