/* BIG BROTHER — Batch Transfer prefill loader for Batch to Salesman */
(function(){
'use strict';
const URL='https://sjfhlaclgmkwwofzstok.supabase.co';
const KEY='sb_publishable_w762jR65CWwlO30fKQsYOw_6L9grx8S';
const SESSION='BB_SUPABASE_DEV_SESSION_V1';
const $=id=>document.getElementById(id);
let saved=[];

async function request(action,extra={}){
  let session=JSON.parse(localStorage.getItem(SESSION)||'null');
  if(!session?.access_token)throw Error('Please sign in again.');
  if(session.expires_at&&session.expires_at<Date.now()/1000+45){
    const rr=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{
      method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:session.refresh_token})
    });
    if(!rr.ok)throw Error('Login expired.');
    session=await rr.json();
    session.expires_at=Math.floor(Date.now()/1000)+Number(session.expires_in||0);
    localStorage.setItem(SESSION,JSON.stringify(session));
  }
  const res=await fetch(URL+'/functions/v1/bb-batch-transfer-prefill',{
    method:'POST',
    headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
    body:JSON.stringify({action,...extra})
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.success)throw Error(data.message||'Could not load Batch Transfers');
  return data;
}

function setIndex(id,list,key,value){
  const el=$(id);
  if(!el)return false;
  const index=(Array.isArray(list)?list:[]).findIndex(x=>String(x?.[key]??'')===String(value??''));
  el.value=index>=0?String(index):'';
  try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}
  return index>=0;
}

function init(){
  const box=$('newBatchFields');
  if(!box||!window.BBBatchStockSource){setTimeout(init,300);return}
  if($('batchTransferPrefill'))return;

  const panel=document.createElement('div');
  panel.id='batchTransferPrefill';
  panel.style.cssText='margin:14px 0;padding:14px;border:1px solid #c9b8ea;background:#f8f4ff;border-radius:12px';
  panel.innerHTML=
    '<label style="display:block;margin-bottom:7px;font-weight:800">🔀 Load Saved Batch Transfer (Optional)</label>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      '<select id="batchTransferPrefillSelect" style="min-width:230px;flex:1"><option value="">Refresh to see saved Batch Transfers</option></select>'+
      '<button id="batchTransferPrefillRefresh" type="button">↻ Refresh</button>'+
      '<button id="batchTransferPrefillLoad" type="button">Load into Form</button>'+
    '</div>'+
    '<small id="batchTransferPrefillStatus" style="display:block;margin-top:7px">Loads Source Batch + new team + planned items. Purchased is the default source; you can move Qty to Zero-Cost before Save.</small>';
  box.appendChild(panel);

  const status=text=>{$('batchTransferPrefillStatus').textContent=text};

  async function refresh(silent=false){
    const current=saved[Number($('batchTransferPrefillSelect').value)]?.allocation_id;
    if(!silent)status('Loading saved Batch Transfers…');
    try{
      saved=(await request('list')).transfers||[];
      const select=$('batchTransferPrefillSelect');
      select.replaceChildren(new Option('Select saved Batch Transfer',''));
      saved.forEach((row,index)=>{
        const p=row.payload||{};
        const date=p.fields?.date||p.transferDate||p.created||row.created_at;
        const label=[
          p.sourceBatchId||p.fields?.sourceBatchId||'Source Batch',
          p.salesmanName||p.fields?.salesmanName||'',
          date?String(date).slice(0,10):''
        ].filter(Boolean).join(' · ');
        select.add(new Option(label,String(index)));
      });
      if(current){
        const next=saved.findIndex(row=>row.allocation_id===current);
        if(next>=0)select.value=String(next);
      }
      if(!silent)status(saved.length+' saved Batch Transfer'+(saved.length===1?'':'s')+' available.');
    }catch(error){
      if(!silent)status('Load error: '+error.message);
    }
  }

  $('batchTransferPrefillRefresh').onclick=()=>refresh(false);

  $('batchTransferPrefillLoad').onclick=async()=>{
    const value=$('batchTransferPrefillSelect').value;
    if(value==='')return status('Choose a Batch Transfer first.');
    const row=saved[Number(value)];
    const p=row?.payload;
    if(!p)return status('Batch Transfer not found. Refresh.');

    const sourceBatchId=String(p.sourceBatchId||p.fields?.sourceBatchId||'').trim();
    if(!sourceBatchId)return status('This prefill has no Source Batch.');
    const missing=(p.items||[]).filter(x=>!products.some(y=>String(y.productCode)===String(x.code||x.productCode)));
    if(missing.length)return status('Cannot consume Batch Transfer: missing product(s): '+missing.map(x=>x.name||x.code||x.productCode).join(', '));

    if(!confirm(
      'Load '+sourceBatchId+' Batch Transfer into the current Batch to Salesman form?\n\n'+
      'This prefill will be removed from the shared database immediately after it loads. Stock is NOT moved until you press the normal Save Stock Movement button.'
    ))return;

    const button=$('batchTransferPrefillLoad');
    button.disabled=true;
    status('Loading Batch Transfer…');

    try{
      if(typeof setFlow!=='function'||typeof setMovementType!=='function')throw Error('Batch form is not ready yet.');
      setFlow('OUTFLOW');
      setMovementType('BATCH_STOCK');

      await new Promise(resolve=>setTimeout(resolve,0));
      if(!window.BBBatchStockSource.setOpenBatch(sourceBatchId)){
        throw Error('Source Batch '+sourceBatchId+' is not currently open or accessible.');
      }

      const fields=p.fields||{};
      if(fields.date&&$('activityDate')){
        $('activityDate').value=String(fields.date).slice(0,10);
        try{$('activityDate').dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}
      }

      setIndex('batchLocationSelect',locations,'locationCode',fields.location||p.locationCode);
      setIndex('salesmanSelect',salesmen,'staffId',fields.salesman);
      setIndex('driverSelect',drivers,'staffId',fields.driver1);
      setIndex('driver2Select',drivers,'staffId',fields.driver2);

      const shortfalls=[];
      items=(p.items||[]).map(x=>{
        const code=String(x.code||x.productCode||'');
        const product=products.find(y=>String(y.productCode)===code);
        if(!product)return null;
        const qty=Math.max(0,Number(x.qty)||0);
        const purchasedAvailable=Number(window.BBBatchStockSource.purchasedAvailable(code))||0;
        const zeroAvailable=Number(window.BBBatchStockSource.zeroAvailable(code))||0;
        if(qty>purchasedAvailable+0.000001){
          shortfalls.push((product.productName||code)+': planned '+qty+', Purchased available '+purchasedAvailable+(zeroAvailable>0?', Zero-Cost available '+zeroAvailable:''));
        }
        return {
          productCode:product.productCode,
          productName:product.productName,
          unit:product.unit,
          qty,
          unitCost:0,
          purchasedQty:qty,
          zeroCostQty:0,
          plannedQty:qty,
          purchasedAvailableBefore:purchasedAvailable,
          zeroCostAvailableBefore:zeroAvailable,
          availableBefore:purchasedAvailable+zeroAvailable
        };
      }).filter(Boolean);

      if(typeof clearProductSearch==='function')clearProductSearch();
      if(typeof window.renderItems==='function')window.renderItems();
      if(typeof updatePreview==='function')updatePreview();
      if(typeof window.updateProductAvailability==='function')window.updateProductAvailability();

      await request('consume',{allocation_id:row.allocation_id});
      saved=saved.filter(x=>x.allocation_id!==row.allocation_id);
      $('batchTransferPrefillSelect').replaceChildren(new Option('Refresh to see pending Batch Transfers',''));

      status(
        'Imported '+items.length+' product'+(items.length===1?'':'s')+' from '+sourceBatchId+
        '. Purchased Out defaults to the planned Qty. Review Purchased / Zero-Cost before normal Save.'+
        (shortfalls.length?' ⚠ '+shortfalls.join(' | '):'')
      );
    }catch(error){
      status('Batch Transfer was not consumed: '+error.message);
    }finally{
      button.disabled=false;
    }
  };

  setInterval(()=>{
    if(!document.hidden&&$('batchTransferPrefill')&&!$('newBatchFields')?.hidden)refresh(true);
  },15000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();