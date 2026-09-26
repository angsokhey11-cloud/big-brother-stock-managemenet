/* BIG BROTHER Stock Key-In — Desktop parity with the proven mobile workflow.
 * Generated from the current mobile interaction logic; stock save/RPC engine is unchanged.
 */
(function(){
  const style=document.createElement('style');
  style.id='bb-stock-desktop-parity-base-style';
  style.textContent="\n:root{--bb-navy:#173f77;--bb-blue:#245fae;--bb-line:#dce5ef;--bb-bg:#eef3f8;--bb-muted:#6d7f93;--bb-green:#16855c;--bb-red:#b43a3a}\nhtml,body{background:var(--bb-bg)!important}\nbody.bb-stock-desktop-parity{padding-bottom:84px!important}\nbody.bb-stock-desktop-parity .page{width:min(760px,100%)!important;max-width:760px!important;margin:0 auto!important;padding:5px!important}\nbody.bb-stock-desktop-parity .topbar{display:none!important}\nbody.bb-stock-desktop-parity #status{margin:0 0 6px!important;padding:7px 9px!important;border-radius:9px!important;font-size:8px!important;line-height:1.35!important}\nbody.bb-stock-desktop-parity .card{margin:0 0 6px!important;padding:8px!important;border-radius:11px!important;box-shadow:none!important}\nbody.bb-stock-desktop-parity .section-title{margin:0 0 7px!important;color:var(--bb-navy)!important;font-size:12px!important}\nbody.bb-stock-desktop-parity .grid,body.bb-stock-desktop-parity .grid2,body.bb-stock-desktop-parity .dynamic .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}\nbody.bb-stock-desktop-parity .field{min-width:0!important}\nbody.bb-stock-desktop-parity .field label{margin-bottom:3px!important;font-size:7px!important}\nbody.bb-stock-desktop-parity .field input,body.bb-stock-desktop-parity .field select,body.bb-stock-desktop-parity .field textarea{width:100%!important;min-width:0!important;min-height:36px!important;padding:6px 7px!important;border-radius:8px!important;font-size:10px!important;box-sizing:border-box!important}\nbody.bb-stock-desktop-parity .field textarea{min-height:52px!important}\nbody.bb-stock-desktop-parity .helper{margin-top:3px!important;font-size:7px!important;line-height:1.3!important}\nbody.bb-stock-desktop-parity .bb-transaction-card>div[style*=\"height\"]{display:none!important}\nbody.bb-stock-desktop-parity .bb-flow-shell{margin:0 0 6px}\nbody.bb-stock-desktop-parity .bb-flow-shell .flow-toggle{grid-template-columns:1fr 1fr!important;gap:5px!important}\nbody.bb-stock-desktop-parity .bb-flow-shell .flow-btn{min-height:38px!important;padding:6px!important;border-radius:8px!important;font-size:9px!important;background:#fff}\nbody.bb-stock-desktop-parity .bb-flow-shell #flowInBtn.active{background:#245fae!important;border-color:#245fae!important;color:#fff!important}\nbody.bb-stock-desktop-parity .bb-flow-shell #flowOutBtn.active{background:#173f77!important;border-color:#173f77!important;color:#fff!important}\nbody.bb-stock-desktop-parity .bb-mobile-category-source{display:none!important}\nbody.bb-stock-desktop-parity .bb-category-card{padding:0!important;overflow:hidden}\nbody.bb-stock-desktop-parity .bb-category-toggle{width:100%;min-height:36px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;border:0;background:#fff;padding:7px 9px;color:var(--bb-navy);text-align:left;cursor:pointer}\nbody.bb-stock-desktop-parity .bb-category-toggle strong{display:block;font-size:9px;line-height:1.1}\nbody.bb-stock-desktop-parity .bb-category-toggle .bb-current{display:block;margin-top:2px;color:#708298;font-size:7px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\nbody.bb-stock-desktop-parity .bb-category-chevron{font-size:13px;font-weight:1000;transition:transform .15s ease}\nbody.bb-stock-desktop-parity .bb-category-card:not(.open) .bb-category-chevron{transform:rotate(-90deg)}\nbody.bb-stock-desktop-parity .bb-category-options{padding:0 6px 6px;border-top:1px solid #edf1f5}\nbody.bb-stock-desktop-parity .bb-category-card:not(.open) .bb-category-options{display:none!important}\nbody.bb-stock-desktop-parity .bb-mobile-categories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding-top:5px}\nbody.bb-stock-desktop-parity .bb-mobile-category-btn{min-width:0;min-height:30px;display:flex;align-items:center;gap:5px;padding:4px 6px;border:1px solid #d6e0eb;border-radius:7px;background:#fff;color:#4e6176;font-size:7px;font-weight:900;line-height:1.1;cursor:pointer;text-align:left}\nbody.bb-stock-desktop-parity .bb-mobile-category-btn span{font-size:10px;line-height:1}\nbody.bb-stock-desktop-parity .bb-mobile-category-btn.active{border-color:#9dbbe0;background:#eef5ff;color:var(--bb-navy)}\nbody.bb-stock-desktop-parity .bb-work-card .section-title,body.bb-stock-desktop-parity .bb-products-card .section-title{font-size:12px!important}\nbody.bb-stock-desktop-parity .bb-purchase-date-field{display:none!important}\nbody.bb-stock-desktop-parity .bb-purchase-callout{margin-top:7px;padding:7px 8px;border-radius:8px;background:#eaf4ff;color:#245fae;font-size:7px;font-weight:800;line-height:1.35}\nbody.bb-stock-desktop-parity .purchase-summary{display:none!important}\nbody.bb-stock-desktop-parity .client-detail{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}\nbody.bb-stock-desktop-parity .client-detail .box{min-height:44px!important;padding:6px!important}\nbody.bb-stock-desktop-parity .client-detail small{font-size:6px!important}\nbody.bb-stock-desktop-parity .client-detail strong{font-size:8px!important}\nbody.bb-stock-desktop-parity #manualProductPanel #productEntry,body.bb-stock-desktop-parity #productEntry.bb-zero-cost-batch{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}\nbody.bb-stock-desktop-parity #productEntry .search-picker{grid-column:1/-1!important}\nbody.bb-stock-desktop-parity #productEntry #addProductBtn{grid-column:1/-1!important;width:100%!important;min-height:36px!important}\nbody.bb-stock-desktop-parity .product-search-results{max-height:220px!important}\nbody.bb-stock-desktop-parity .product-result{padding:7px!important}\nbody.bb-stock-desktop-parity .product-result strong{font-size:9px!important}\nbody.bb-stock-desktop-parity .product-result span{font-size:7px!important}\nbody.bb-stock-desktop-parity .bb-products-card .table-wrap{overflow:visible!important;border:0!important;border-radius:0!important}\nbody.bb-stock-desktop-parity .bb-products-card table{display:block!important;width:100%!important;min-width:0!important;border-collapse:separate!important}\nbody.bb-stock-desktop-parity .bb-products-card thead{display:none!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody{display:block!important;width:100%!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody tr{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%!important;margin:0 0 6px;padding:7px;border:1px solid var(--bb-line);border-radius:9px;background:#fbfcfe}\nbody.bb-stock-desktop-parity .bb-products-card tbody tr:last-child{margin-bottom:0}\nbody.bb-stock-desktop-parity .bb-products-card tbody td{display:flex!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:0!important;flex-direction:column;align-items:stretch;justify-content:flex-start;padding:0!important;border:0!important;font-size:8px!important;white-space:normal!important;text-align:left!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody td::before{content:attr(data-bb-label);display:block;margin-bottom:3px;color:#7b8da0;font-size:6px;font-weight:1000;text-transform:uppercase}\nbody.bb-stock-desktop-parity .bb-products-card tbody td:first-child{grid-column:1/-1;padding-bottom:3px!important;border-bottom:1px solid #edf1f5!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody td:first-child::before{display:none!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody td.empty{grid-column:1/-1!important;display:block!important;padding:12px 7px!important;text-align:center!important;border:0!important}\nbody.bb-stock-desktop-parity .bb-products-card tbody td.empty::before{display:none!important}\nbody.bb-stock-desktop-parity #purchaseReceivingPanel td:nth-child(2),body.bb-stock-desktop-parity #purchaseReceivingPanel td:nth-child(3),body.bb-stock-desktop-parity #purchaseReceivingPanel td:nth-child(4){display:none!important}\nbody.bb-stock-desktop-parity .bb-mobile-product-code{display:block;margin-top:2px;color:#7b8da0;font-size:6px;font-weight:700}\nbody.bb-stock-desktop-parity .bb-products-card input,body.bb-stock-desktop-parity .bb-products-card select,body.bb-stock-desktop-parity .receive-input,body.bb-stock-desktop-parity .receive-input[type=date]{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}\nbody.bb-stock-desktop-parity .receive-input{min-height:33px!important;padding:5px 6px!important;font-size:9px!important}\nbody.bb-stock-desktop-parity #manualProductPanel .remove{width:100%!important;min-height:29px;padding:5px 6px!important;font-size:7px!important}\nbody.bb-stock-desktop-parity #manualProductPanel tbody td:last-child{justify-content:flex-end}\nbody.bb-stock-desktop-parity .preview-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important;margin-bottom:6px!important}\nbody.bb-stock-desktop-parity .preview-kpi{min-width:0;padding:6px!important}\nbody.bb-stock-desktop-parity .preview-kpi small{font-size:5.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\nbody.bb-stock-desktop-parity .preview-kpi strong{font-size:9px!important}\nbody.bb-stock-desktop-parity .bb-preview-card .table-wrap{overflow:auto!important}\nbody.bb-stock-desktop-parity .bb-preview-card table{min-width:510px!important}\nbody.bb-stock-desktop-parity .bb-preview-card th,body.bb-stock-desktop-parity .bb-preview-card td{padding:5px 6px!important;font-size:7px!important}\nbody.bb-stock-desktop-parity .success-panel{padding:8px!important}\nbody.bb-stock-desktop-parity .success-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}\nbody.bb-stock-desktop-parity .actions{position:fixed!important;z-index:1000;left:50%!important;bottom:0!important;transform:translateX(-50%);width:min(760px,100%)!important;display:grid!important;grid-template-columns:1fr 44px 1.7fr!important;gap:5px!important;margin:0!important;padding:7px max(7px,env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(7px,env(safe-area-inset-left))!important;border-top:1px solid #d8e3ef;background:rgba(255,255,255,.97);box-shadow:0 -5px 18px rgba(23,63,119,.10);backdrop-filter:blur(10px)}\nbody.bb-stock-desktop-parity .actions .btn{width:100%!important;min-height:40px!important;padding:6px!important;border-radius:8px!important;font-size:9px!important}\nbody.bb-stock-desktop-parity #refreshBtn{font-size:0!important;padding:0!important}\nbody.bb-stock-desktop-parity #refreshBtn::after{content:'↻';font-size:18px!important}\nbody.bb-stock-desktop-parity .bb-mobile-note-collapsed{margin-top:7px;border:1px solid var(--bb-line);border-radius:8px;background:#fbfcfe;overflow:hidden}\nbody.bb-stock-desktop-parity .bb-mobile-note-toggle{width:100%;min-height:32px;border:0;background:#fbfcfe;color:#52677e;padding:6px 8px;text-align:left;font-size:8px;font-weight:900;cursor:pointer}\nbody.bb-stock-desktop-parity .bb-mobile-note-body{padding:0 7px 7px}\nbody.bb-stock-desktop-parity .bb-mobile-note-collapsed:not(.open) .bb-mobile-note-body{display:none!important}\nbody.bb-stock-desktop-parity #damageClearFields>div,body.bb-stock-desktop-parity #damageExchangeReceiveFields>div{padding:8px!important;border-radius:9px!important}\n@media(max-width:370px){body.bb-stock-desktop-parity .preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:345px){body.bb-stock-desktop-parity .page{padding:4px!important}body.bb-stock-desktop-parity .grid,body.bb-stock-desktop-parity .grid2,body.bb-stock-desktop-parity .dynamic .grid{gap:5px!important}body.bb-stock-desktop-parity .field input,body.bb-stock-desktop-parity .field select{font-size:9px!important}}";
  document.head.appendChild(style);
})();

(function(){
'use strict';
const $=id=>document.getElementById(id);
const categories=[
 {value:'PURCHASE',flow:'INFLOW',icon:'🛒',label:'Purchase'},
 {value:'RECEIVE_FROM_CLIENT',flow:'INFLOW',icon:'📦',label:'Receive from Client'},
 {value:'CUSTOMER_BORROW',flow:'INFLOW',icon:'🤝',label:'Borrow Stock'},
 {value:'BACK_SALE',flow:'INFLOW',icon:'↩',label:'Back Sale'},
 {value:'DAMAGE_EXCHANGE_RECEIVE',flow:'INFLOW',icon:'🔄',label:'Damage Exchange Received'},
 {value:'BATCH_STOCK',flow:'OUTFLOW',icon:'🚚',label:'Batch Stock'},
 {value:'CUSTOMER_BORROW_CLEAR',flow:'OUTFLOW',icon:'↪',label:'Clear Borrow'},
 {value:'STOCK_DAMAGE',flow:'OUTFLOW',icon:'⚠️',label:'Stock Damage'},
 {value:'STAFF_ALLOWANCE',flow:'OUTFLOW',icon:'👤',label:'Staff Allowance'},
 {value:'DAMAGE_CLEAR',flow:'OUTFLOW',icon:'🗑️',label:'Damaged Stock Cleared'}
];
const titles={
 PURCHASE:['🛒 Purchase Receiving','📦 Products Receiving'],
 RECEIVE_FROM_CLIENT:['📦 Receive from Client','📦 Products'],
 CUSTOMER_BORROW:['🤝 Borrow Stock from Customer','📦 Borrowed Products'],
 BACK_SALE:['↩ Back Sale','📦 Batch Return Products'],
 BATCH_STOCK:['🚚 Batch Stock to Salesman','📦 Batch Products'],
 CUSTOMER_BORROW_CLEAR:['↪ Clear Borrowed Stock','📦 Return Products'],
 STOCK_DAMAGE:['⚠️ Stock Damage','📦 Damage Products'],
 STAFF_ALLOWANCE:['👤 Staff Allowance','📦 Allowance Products'],
 DAMAGE_CLEAR:['🗑️ Damaged Stock Cleared','📦 Damaged Products'],
 DAMAGE_EXCHANGE_RECEIVE:['🔄 Damage Exchange Received','📦 Exchange Receiving Items']
};
const clean=v=>String(v==null?'':v).trim();
function currentType(){try{return clean(movementType)||'PURCHASE'}catch(_){return 'PURCHASE'}}
function currentFlow(){try{return clean(flow)==='OUTFLOW'?'OUTFLOW':'INFLOW'}catch(_){return 'INFLOW'}}
function cards(){return [...document.querySelectorAll('.page > .card:not(.bb-category-card)')]}
function installBase(){
 document.body.classList.add('bb-stock-desktop-parity');
 const refresh=$('refreshBtn');if(refresh){refresh.title='Refresh Stock';refresh.setAttribute('aria-label','Refresh Stock')}
 const c=cards();
 if(c[0]){c[0].classList.add('bb-transaction-card');const t=c[0].querySelector('.section-title');if(t)t.textContent='Transaction Information'}
 if(c[1])c[1].classList.add('bb-work-card');
 if(c[2])c[2].classList.add('bb-products-card');
 if(c[3])c[3].classList.add('bb-preview-card');
}
function installWorkspace(){
 const c=cards(),transaction=c[0],work=c[1];if(!transaction||!work)return;
 const flowToggle=$('flowInBtn')?.closest('.flow-toggle');
 const sourceField=$('movementCategorySelect')?.closest('.field');
 const sourceGrid=sourceField?.closest('.grid');if(sourceGrid)sourceGrid.classList.add('bb-mobile-category-source');
 [...transaction.children].filter(el=>el.tagName==='DIV'&&/height/i.test(el.getAttribute('style')||'')).forEach(el=>el.style.display='none');
 let flowShell=$('bbMobileFlowShell');
 if(!flowShell){flowShell=document.createElement('div');flowShell.id='bbMobileFlowShell';flowShell.className='bb-flow-shell';transaction.insertAdjacentElement('afterend',flowShell)}
 if(flowToggle&&flowToggle.parentNode!==flowShell)flowShell.appendChild(flowToggle);
 let categoryCard=$('bbMobileCategoryCard');
 if(!categoryCard){
   categoryCard=document.createElement('section');categoryCard.id='bbMobileCategoryCard';categoryCard.className='card bb-category-card';
   categoryCard.innerHTML='<button type="button" id="bbCategoryToggle" class="bb-category-toggle"><div><strong>Movement Category</strong><span id="bbCategoryCurrent" class="bb-current">Select movement</span></div><span class="bb-category-chevron">⌄</span></button><div class="bb-category-options"><div id="bbMobileCategories" class="bb-mobile-categories"></div></div>';
   categoryCard.querySelector('#bbCategoryToggle')?.addEventListener('click',()=>categoryCard.classList.toggle('open'));
   flowShell.insertAdjacentElement('afterend',categoryCard);
 }
 const exchange=$('damageExchangeReceiveFields');
 if(exchange&&exchange.closest('.bb-work-card')!==work){const note=work.querySelector('.bb-mobile-note-collapsed')||work.querySelector('#note')?.closest('.field');work.insertBefore(exchange,note||null)}
}
function activateCategory(meta){
 if(!meta)return;
 if(currentFlow()!==meta.flow&&typeof setFlow==='function')setFlow(meta.flow);
 setTimeout(()=>{
   const select=$('movementCategorySelect');
   if(select&&[...select.options].some(o=>o.value===meta.value))select.value=meta.value;
   if(typeof setMovementType==='function')setMovementType(meta.value);
   $('bbMobileCategoryCard')?.classList.remove('open');
   setTimeout(syncAll,0);
 },0);
}
function renderCategories(){
 const host=$('bbMobileCategories');if(!host)return;
 const type=currentType(),f=currentFlow(),visible=categories.filter(x=>x.flow===f),current=categories.find(x=>x.value===type);
 const label=$('bbCategoryCurrent');if(label)label.textContent=(current?.icon||'•')+' '+(current?.label||'Select movement');
 host.innerHTML=visible.map(x=>'<button type="button" class="bb-mobile-category-btn'+(x.value===type?' active':'')+'" data-type="'+x.value+'"><span>'+x.icon+'</span>'+x.label+'</button>').join('');
 host.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>activateCategory(categories.find(x=>x.value===btn.dataset.type))));
}
function installPurchaseWork(){
 const fields=$('purchaseFields');if(!fields)return;const grid=fields.querySelector('.grid');if(!grid)return;
 const dateField=$('purchaseDateView')?.closest('.field');if(dateField)dateField.classList.add('bb-purchase-date-field');
 if(!$('bbPurchasePurchaser')){const invoice=$('purchaseInvoiceView')?.closest('.field'),f=document.createElement('div');f.className='field';f.innerHTML='<label>Purchaser</label><input id="bbPurchasePurchaser" readonly placeholder="Auto from Purchase">';grid.insertBefore(f,invoice||null)}
 if(!$('bbPurchaseCallout')){const info=document.createElement('div');info.id='bbPurchaseCallout';info.className='bb-purchase-callout';info.textContent='ⓘ Purchase Qty + Promotion Qty are included in receiving.';fields.appendChild(info)}
 const select=$('purchaseSelect');if(select&&!select.dataset.bbMobileMeta){select.dataset.bbMobileMeta='1';select.addEventListener('change',()=>[50,250,700,1500].forEach(ms=>setTimeout(updatePurchaseMeta,ms)))}
}
function updatePurchaseMeta(){
 const out=$('bbPurchasePurchaser');if(!out)return;let name='';
 try{if(typeof purchaseDetail!=='undefined')name=clean(purchaseDetail?.purchase?.purchaserName);if(!name&&typeof selectedPurchaseSummary==='function')name=clean(selectedPurchaseSummary()?.purchaserName)}catch(_){}
 out.value=name||'Auto from Purchase';
}
function decorateTable(table){
 if(!table)return;const headers=[...table.querySelectorAll('thead th')].map(th=>clean(th.textContent));
 [...table.querySelectorAll('tbody tr')].forEach(tr=>[...tr.querySelectorAll('td')].forEach((td,i)=>{const label=headers[i]||'';if(td.dataset.bbLabel!==label)td.dataset.bbLabel=label}));
}
function decorateProducts(){
 const purchase=$('purchaseReceiveRows')?.closest('table'),manual=$('itemRows')?.closest('table');decorateTable(purchase);decorateTable(manual);
 const purchaseBody=$('purchaseReceiveRows');
 if(purchaseBody){
   [...purchaseBody.querySelectorAll('tr')].forEach(tr=>{const cells=tr.querySelectorAll('td');if(cells.length<8)return;const code=clean(cells[1].textContent);if(code&&!cells[0].querySelector('.bb-mobile-product-code')){const d=document.createElement('div');d.className='bb-mobile-product-code';d.textContent=code;cells[0].appendChild(d)}});
 }
 const manualBody=$('itemRows');
 if(manualBody){
   [...manualBody.querySelectorAll('tr')].forEach(tr=>{
     const cells=[...tr.querySelectorAll('td')];
     if(!cells.length||cells.some(td=>td.classList.contains('empty')))return;
     const codeCell=cells.find(td=>clean(td.dataset.bbLabel)==='Code');
     const productCell=cells[0];
     const code=clean(codeCell?.textContent);
     if(productCell&&code&&!productCell.querySelector('.bb-mobile-product-code')){
       const d=document.createElement('div');d.className='bb-mobile-product-code';d.textContent=code;productCell.appendChild(d);
     }
     const remove=tr.querySelector('.remove');
     if(remove){
       if(clean(remove.textContent)!=='×')remove.textContent='×';
       remove.title='Remove product';
       remove.setAttribute('aria-label','Remove product');
     }
   });
 }
}
function installProductObservers(){
 ['purchaseReceiveRows','itemRows'].forEach(id=>{const body=$(id);if(!body||body.dataset.bbMobileObserver)return;body.dataset.bbMobileObserver='1';const table=body.closest('table');new MutationObserver(decorateProducts).observe(table||body,{childList:true,subtree:true})});
 decorateProducts();
}
function installNote(){
 const note=$('note');if(!note)return;const field=note.closest('.field');if(!field||field.closest('.bb-mobile-note-collapsed'))return;
 const box=document.createElement('div');box.className='bb-mobile-note-collapsed';const btn=document.createElement('button');btn.type='button';btn.className='bb-mobile-note-toggle';btn.textContent='▸ Note (Optional)';const body=document.createElement('div');body.className='bb-mobile-note-body';field.parentNode.insertBefore(box,field);body.appendChild(field);box.append(btn,body);btn.addEventListener('click',()=>{box.classList.toggle('open');btn.textContent=(box.classList.contains('open')?'▾':'▸')+' Note (Optional)'})
}
function syncTitles(){const c=cards(),pair=titles[currentType()]||['Movement Details','Products'];const wt=c[1]?.querySelector('.section-title'),pt=c[2]?.querySelector('.section-title');if(wt)wt.textContent=pair[0];if(pt)pt.textContent=pair[1]}
function keepActionsLast(){const actions=document.querySelector('.actions');if(actions&&actions.parentNode!==document.body)document.body.appendChild(actions)}
function syncAll(){installWorkspace();renderCategories();syncTitles();updatePurchaseMeta();decorateProducts()}
function hookMovementType(){if(typeof setMovementType!=='function'||setMovementType.__bbMobileHook)return;const base=setMovementType;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(syncAll,0);return r};wrapped.__bbMobileHook=true;setMovementType=wrapped}
function init(){
 installBase();installNote();installWorkspace();installPurchaseWork();installProductObservers();keepActionsLast();hookMovementType();
 ['flowInBtn','flowOutBtn','damageWarehouseBtn','damageBatchBtn'].forEach(id=>$(id)?.addEventListener('click',()=>setTimeout(syncAll,20)));
 syncAll();[100,400,1000,1800].forEach(ms=>setTimeout(syncAll,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

(function(){
'use strict';
if(window.BBStockDesktopParityV1)return;
window.BBStockDesktopParityV1=true;

const $=id=>document.getElementById(id);
const clean=v=>String(v==null?'':v).trim();
const number=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const EPS=0.000001;
let clientProductRows=[];
let clientProductClientId='';
let clientProductLoading=false;
let activeProduct=null;
let batchWorkInitialized=false;

const style=document.createElement('style');
style.id='bb-stock-desktop-parity-ux-v2-style';
style.textContent=
'body.bb-stock-desktop-parity .bb-preview-card{display:none!important}'+
'body.bb-stock-desktop-parity #receiveClientDetail{display:none!important}'+
'body.bb-stock-desktop-parity #manualProductPanel #productEntry{display:none!important}'+
'body.bb-stock-desktop-parity .bb-mobile-hidden-field{display:none!important}'+
'body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide{grid-template-columns:minmax(0,1fr)!important}'+
'body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide>.field:not(.bb-mobile-hidden-field){grid-column:1/-1!important;width:100%!important;max-width:none!important}'+
'body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide #batchSelect{width:100%!important;max-width:none!important}'+
'body.bb-stock-desktop-parity .bb-collapsible>.section-title{position:relative;cursor:pointer;padding-right:28px!important;user-select:none}'+
'body.bb-stock-desktop-parity .bb-collapsible>.section-title:after{content:"⌄";position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:1000;transition:transform .15s ease}'+
'body.bb-stock-desktop-parity .bb-collapsible.bb-collapsed>.section-title:after{transform:translateY(-50%) rotate(-90deg)}'+
'body.bb-stock-desktop-parity .bb-collapsible.bb-collapsed>.bb-collapse-body{display:none!important}'+
'body.bb-stock-desktop-parity .bb-collapse-summary{display:none;margin:-1px 0 6px;color:#718398;font-size:7px;font-weight:800;line-height:1.35}'+
'body.bb-stock-desktop-parity .bb-collapsible.bb-collapsed>.bb-collapse-summary{display:block}'+
'body.bb-stock-desktop-parity .bb-add-launcher{margin:0 0 7px}'+
'body.bb-stock-desktop-parity .bb-add-launcher[hidden]{display:none!important}'+
'body.bb-stock-desktop-parity .bb-add-product-btn{width:100%;min-height:42px;border:0;border-radius:9px;background:#173f77!important;color:#fff!important;font-size:11px;font-weight:1000;letter-spacing:.2px;box-shadow:0 5px 14px rgba(23,63,119,.16);cursor:pointer}'+
'body.bb-stock-desktop-parity .bb-add-product-btn:active{transform:translateY(1px)}'+
'body.bb-stock-desktop-parity .bb-mobile-overlay{position:fixed;z-index:4000;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:10px;background:rgba(11,29,50,.46);backdrop-filter:blur(2px)}'+
'body.bb-stock-desktop-parity .bb-mobile-overlay[hidden]{display:none!important}'+
'body.bb-stock-desktop-parity .bb-mobile-sheet{width:min(760px,100%);max-height:82vh;display:flex;flex-direction:column;border:1px solid #d5e1ed;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(16,42,72,.24);overflow:hidden}'+
'body.bb-stock-desktop-parity .bb-mobile-sheet-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 12px;border-bottom:1px solid #e5ecf3;color:#173f77}'+
'body.bb-stock-desktop-parity .bb-mobile-sheet-head strong{font-size:13px}'+
'body.bb-stock-desktop-parity .bb-mobile-sheet-close{width:34px;height:34px;border:0;border-radius:9px;background:#f0f4f8;color:#52677e;font-size:18px;font-weight:900;cursor:pointer}'+
'body.bb-stock-desktop-parity .bb-mobile-picker-search{padding:9px 10px;border-bottom:1px solid #edf1f5}'+
'body.bb-stock-desktop-parity .bb-mobile-picker-search input{width:100%;height:42px;box-sizing:border-box;border:1px solid #cfdbe8;border-radius:9px;padding:8px 10px;font-size:16px;color:#173f77;outline:none}'+
'body.bb-stock-desktop-parity .bb-mobile-product-list{overflow:auto;padding:0 10px 10px}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice{width:100%;min-height:36px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center;margin:0;padding:7px 2px;border:0;border-bottom:1px solid #e5ecf3;border-radius:0;background:#fff;color:#173f77;text-align:left;cursor:pointer}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice:last-child{border-bottom:0}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice>span:first-child{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice strong{display:inline;font-size:10px}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice small{display:inline;margin-left:6px;color:#74869a;font-size:7px;font-weight:700}'+
'body.bb-stock-desktop-parity .bb-mobile-product-choice .avail{font-size:7px;font-weight:900;color:#245fae;text-align:right;white-space:nowrap}'+
'body.bb-stock-desktop-parity .bb-mobile-empty{padding:18px 8px;color:#7a8b9e;font-size:10px;font-weight:800;text-align:center}'+
'body.bb-stock-desktop-parity .bb-qty-body{padding:12px}'+
'body.bb-stock-desktop-parity .bb-qty-product{padding:9px 10px;border:1px solid #dfe7ef;border-radius:10px;background:#f8fbfe}'+
'body.bb-stock-desktop-parity .bb-qty-product strong{display:block;color:#173f77;font-size:12px}'+
'body.bb-stock-desktop-parity .bb-qty-product span{display:block;margin-top:3px;color:#72859a;font-size:8px;font-weight:800}'+
'body.bb-stock-desktop-parity .bb-qty-available{margin:7px 0 0;color:#526d89;font-size:8px;font-weight:900;line-height:1.4}'+
'body.bb-stock-desktop-parity .bb-qty-field{margin-top:10px}'+
'body.bb-stock-desktop-parity .bb-qty-field[hidden]{display:none!important}'+
'body.bb-stock-desktop-parity .bb-qty-field label{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;color:#52677e;font-size:8px;font-weight:1000}'+
'body.bb-stock-desktop-parity .bb-qty-control{display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:6px}'+
'body.bb-stock-desktop-parity .bb-qty-control button{min-height:42px;border:1px solid #ccd9e6;border-radius:9px;background:#f4f7fa;color:#173f77;font-size:18px;font-weight:1000}'+
'body.bb-stock-desktop-parity .bb-qty-control input{width:100%;min-width:0;height:42px;box-sizing:border-box;border:1px solid #bdcddd;border-radius:9px;padding:6px 8px;text-align:center;font-size:18px;font-weight:1000;color:#173f77}'+
'body.bb-stock-desktop-parity .bb-qty-actions{display:grid;grid-template-columns:1fr 1.45fr;gap:7px;margin-top:12px}'+
'body.bb-stock-desktop-parity .bb-qty-actions button{min-height:43px;border:0;border-radius:9px;font-size:10px;font-weight:1000;cursor:pointer}'+
'body.bb-stock-desktop-parity .bb-qty-cancel{background:#edf2f6;color:#52677e}'+
'body.bb-stock-desktop-parity #unitCostWrap{display:none!important}'+
'body.bb-stock-desktop-parity .bb-products-card tbody td[data-bb-label="Unit Cost"]{display:none!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody tr:not(:has(td.empty)){grid-template-columns:minmax(0,1fr) auto 32px!important;gap:8px!important;align-items:center!important;margin:0!important;padding:8px 2px!important;border:0!important;border-bottom:1px solid #e4ebf2!important;border-radius:0!important;background:#fff!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody tr:not(:has(td.empty)):last-child{border-bottom:0!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td{justify-content:center!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td:first-child{grid-column:auto!important;padding:0!important;border:0!important;justify-content:center!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td:first-child strong{font-size:10px!important;line-height:1.25!important;color:#173f77!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td:first-child .bb-mobile-product-code{margin-top:2px!important;font-size:6.5px!important;color:#7b8da0!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Code"],body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Available Before"],body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Purchased Available"],body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Zero-Cost Available"],body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Movement"]{display:none!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Qty"],body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Batch Qty"]{min-width:50px!important;align-items:flex-end!important;text-align:right!important;font-size:10px!important;font-weight:1000!important;color:#173f77!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Qty"]::before,body.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label="Batch Qty"]::before{margin-bottom:1px!important;font-size:6px!important}'+
'body.bb-stock-desktop-parity #manualProductPanel tbody td:last-child{width:32px!important;align-items:flex-end!important;justify-content:center!important}'+
'body.bb-stock-desktop-parity #manualProductPanel .remove{width:30px!important;height:30px!important;min-height:30px!important;padding:0!important;border-radius:8px!important;font-size:16px!important;line-height:1!important}'+
'body.bb-stock-desktop-parity[data-bb-movement="BATCH_STOCK"] #manualProductPanel tbody tr:not(:has(td.empty)){grid-template-columns:minmax(0,1fr) auto auto auto 32px!important}'+
'body.bb-stock-desktop-parity[data-bb-movement="BATCH_STOCK"] #manualProductPanel tbody td[data-bb-label="Purchased Out"],body.bb-stock-desktop-parity[data-bb-movement="BATCH_STOCK"] #manualProductPanel tbody td[data-bb-label="Zero-Cost Out"]{min-width:42px!important;align-items:flex-end!important;text-align:right!important;font-size:8px!important;font-weight:900!important}'+
'body.bb-stock-desktop-parity[data-bb-movement="BATCH_STOCK"] #manualProductPanel tbody td[data-bb-label="Purchased Out"]::before,body.bb-stock-desktop-parity[data-bb-movement="BATCH_STOCK"] #manualProductPanel tbody td[data-bb-label="Zero-Cost Out"]::before{margin-bottom:1px!important;font-size:5.5px!important}'+
'body.bb-stock-desktop-parity .bb-qty-confirm{background:#173f77!important;color:#fff!important}'+
'body.bb-stock-desktop-parity #successPanel.bb-mobile-success{width:calc(100% - 10px);max-width:750px;box-sizing:border-box;margin:0 auto 7px;padding:8px;border-radius:10px}';
document.head.appendChild(style);

function movement(){
  try{return clean(movementType)||'PURCHASE'}catch(_){return 'PURCHASE'}
}
function damageMode(){
  try{return clean(damageSource)||'WAREHOUSE'}catch(_){return 'WAREHOUSE'}
}
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function selectedClient(){
  try{return typeof pick==='function'?pick(clients,'receiveClient'):null}catch(_){return null}
}
function selectedOpenBatchMobile(){
  try{return typeof selectedBatch==='function'?selectedBatch():null}catch(_){return null}
}
function stockRow(code){
  try{return typeof stockFor==='function'?(stockFor(code)||{}):{}}catch(_){return {}}
}
function purchasedAvailable(code){
  const row=stockRow(code);
  return number(row.warehousePurchased!==undefined?row.warehousePurchased:row.warehouseGood);
}
function zeroAvailable(code){
  return number(stockRow(code).warehouseZeroCost);
}
function physicalAvailable(code){
  return purchasedAvailable(code)+zeroAvailable(code);
}
function fmtQty(v){
  return number(v).toLocaleString('en-US',{maximumFractionDigits:2});
}

function moveSuccessOutsidePreview(){
  const preview=document.querySelector('.bb-preview-card');
  const success=$('successPanel');
  if(preview&&success&&success.parentNode===preview&&preview.parentNode){
    preview.parentNode.insertBefore(success,preview);
    success.classList.add('bb-mobile-success');
  }
}

function hidePurchaseDetails(){
  const fields=$('purchaseFields');
  const keep=$('purchaseSelect')?.closest('.field');
  if(fields){
    fields.querySelectorAll('.field').forEach(field=>{
      field.classList.toggle('bb-mobile-hidden-field',field!==keep);
    });
  }
  const callout=$('bbPurchaseCallout');
  if(callout)callout.style.display='none';
}

function simplifyBackSale(){
  const parent=$('existingBatchFields');
  if(!parent)return;
  const keep=$('batchSelect')?.closest('.field');
  const isBackSale=movement()==='BACK_SALE';
  parent.classList.toggle('bb-back-sale-batch-wide',isBackSale);
  parent.querySelectorAll('.field').forEach(field=>{
    field.classList.toggle('bb-mobile-hidden-field',isBackSale&&field!==keep);
  });
}

function ensureCollapse(card,kind,defaultOpen){
  if(!card)return null;
  if(!card.dataset.bbCollapseReady){
    const title=card.querySelector(':scope > .section-title');
    if(!title)return null;
    const summary=document.createElement('div');
    summary.className='bb-collapse-summary';
    const body=document.createElement('div');
    body.className='bb-collapse-body';
    while(summary.nextSibling){}
    const nodes=[...card.childNodes].filter(node=>node!==title);
    nodes.forEach(node=>body.appendChild(node));
    card.appendChild(summary);
    card.appendChild(body);
    card.dataset.bbCollapseReady='1';
    card.dataset.bbCollapseKind=kind;
    card.dataset.bbOpen=defaultOpen?'1':'0';
    title.addEventListener('click',()=>{
      if(!card.classList.contains('bb-collapsible'))return;
      setCollapse(card,card.dataset.bbOpen!=='1');
    });
  }
  return card;
}
function setCollapse(card,open){
  if(!card)return;
  card.dataset.bbOpen=open?'1':'0';
  card.classList.toggle('bb-collapsed',!open);
}
function indexItem(list,selectId){
  const select=$(selectId);
  const index=Number(select?.value);
  return Number.isInteger(index)&&index>=0&&Array.isArray(list)?(list[index]||null):null;
}
function controllerPreferenceKey(){
  let id='device';
  try{
    const session=JSON.parse(localStorage.getItem('BB_SUPABASE_DEV_SESSION_V1')||'null');
    id=clean(session?.user?.id);
    if(!id&&session?.access_token){
      const part=String(session.access_token).split('.')[1]||'';
      const json=JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/')));
      id=clean(json?.sub);
    }
  }catch(_){}
  return 'bb_stock_mobile_controller_v1::'+(id||'device');
}
function currentController(){
  try{return indexItem(controllers,'controllerSelect')}catch(_){return null}
}
function currentWarehouse(){
  try{return indexItem(locations,'locationSelect')}catch(_){return null}
}
function saveControllerPreference(){
  const row=currentController();
  if(!row)return;
  try{localStorage.setItem(controllerPreferenceKey(),clean(row.staffId))}catch(_){}
  updateCollapseSummaries();
}
function restoreControllerPreference(){
  const select=$('controllerSelect');
  if(!select||select.value)return;
  let wanted='';
  try{wanted=clean(localStorage.getItem(controllerPreferenceKey()))}catch(_){}
  if(!wanted)return;
  let index=-1;
  try{index=(Array.isArray(controllers)?controllers:[]).findIndex(row=>clean(row.staffId)===wanted)}catch(_){}
  if(index>=0){
    select.value=String(index);
    updateCollapseSummaries();
  }
}
function updateCollapseSummaries(){
  const transaction=document.querySelector('.bb-transaction-card');
  if(transaction){
    const summary=transaction.querySelector(':scope > .bb-collapse-summary');
    if(summary){
      const date=clean($('activityDate')?.value)||'Date';
      const controller=currentController();
      const warehouse=currentWarehouse();
      summary.textContent=[
        date,
        controller?.staffName||'Controller not selected',
        warehouse?.locationName||warehouse?.locationCode||'Warehouse'
      ].join(' · ');
    }
  }
  const work=document.querySelector('.bb-work-card');
  if(work){
    const summary=work.querySelector(':scope > .bb-collapse-summary');
    if(summary){
      let text='Tap to expand';
      if(movement()==='BATCH_STOCK'){
        let salesman=null,location=null;
        try{salesman=indexItem(salesmen,'salesmanSelect');location=indexItem(locations,'batchLocationSelect')}catch(_){}
        text=[salesman?.staffName||'Salesman not selected',location?.locationName||location?.locationCode||'Location not selected'].join(' · ');
      }
      summary.textContent=text;
    }
  }
}
function syncCollapsibles(){
  const transaction=ensureCollapse(document.querySelector('.bb-transaction-card'),'transaction',false);
  if(transaction){
    transaction.classList.add('bb-collapsible');
    if(!transaction.dataset.bbInitialCollapse){
      transaction.dataset.bbInitialCollapse='1';
      setCollapse(transaction,false);
    }else{
      setCollapse(transaction,transaction.dataset.bbOpen==='1');
    }
  }

  const work=ensureCollapse(document.querySelector('.bb-work-card'),'work',true);
  if(work){
    const isBatch=movement()==='BATCH_STOCK';
    work.classList.toggle('bb-collapsible',isBatch);
    if(isBatch){
      if(!batchWorkInitialized){
        batchWorkInitialized=true;
        setCollapse(work,true);
      }else{
        setCollapse(work,work.dataset.bbOpen==='1');
      }
    }else{
      batchWorkInitialized=false;
      setCollapse(work,true);
    }
  }
  updateCollapseSummaries();
}

async function loadClientProducts(force){
  const client=selectedClient();
  const id=clean(client?.clientId);
  if(!id){
    clientProductRows=[];
    clientProductClientId='';
    return [];
  }
  if(!force&&clientProductClientId===id&&clientProductRows.length)return clientProductRows;
  if(clientProductLoading)return clientProductRows;
  clientProductLoading=true;
  try{
    const result=await window.BBStockAdapter.rpc('bb_stock_client_products',{p_client_id:id});
    const rows=Array.isArray(result?.rows)?result.rows:[];
    clientProductRows=rows.map(row=>{
      let master=null;
      try{master=(Array.isArray(products)?products:[]).find(p=>clean(p.productCode)===clean(row.productCode))||null}catch(_){}
      return Object.assign({},master||{},row,{
        productCode:clean(row.productCode),
        productName:clean(row.productName)||clean(master?.productName)||clean(row.productCode),
        unit:clean(row.unit)||clean(master?.unit),
        barcode:clean(row.barcode)||clean(master?.barcode)
      });
    });
    clientProductClientId=id;
    return clientProductRows;
  }catch(error){
    clientProductRows=[];
    clientProductClientId=id;
    if(typeof setStatus==='function')setStatus(clean(error?.message)||'Could not load Client products.','error');
    return [];
  }finally{
    clientProductLoading=false;
  }
}

function baseMobilePool(){
  const t=movement();
  if(t==='RECEIVE_FROM_CLIENT')return clientProductRows.slice();
  try{
    if(typeof manualProductPool==='function'){
      const rows=manualProductPool();
      return Array.isArray(rows)?rows.slice():[];
    }
  }catch(_){}
  try{return Array.isArray(products)?products.slice():[]}catch(_){return []}
}
const BB_DEFAULT_PRODUCT_ORDER=[
  'KIR3-2L',
  'KIRB-2L',
  'KIR0-830',
  'KIR3-830',
  'FF-2L',
  'AF-2L',
  'VP-2L',
  'OM-2L',
  'GF-190',
  'GF-1L',
  'GFJ-1L',
  'KIRP-Y135',
  'KIRS-Y135',
  'KIRV-Y135',
  'CH-O220',
  'CHM-220',
  'CHP-220',
  'CHS-220',
  'CHT-220'
];
const BB_DEFAULT_PRODUCT_RANK=new Map(
  BB_DEFAULT_PRODUCT_ORDER.map((code,index)=>[code,index])
);
function defaultProductCompare(a,b){
  const aCode=clean(a?.productCode);
  const bCode=clean(b?.productCode);
  const aRank=BB_DEFAULT_PRODUCT_RANK.has(aCode)?BB_DEFAULT_PRODUCT_RANK.get(aCode):9999;
  const bRank=BB_DEFAULT_PRODUCT_RANK.has(bCode)?BB_DEFAULT_PRODUCT_RANK.get(bCode):9999;
  if(aRank!==bRank)return aRank-bRank;
  return clean(a?.productName).localeCompare(clean(b?.productName));
}

function mobilePool(){
  const t=movement();
  let rows=baseMobilePool();
  if(t==='BATCH_STOCK'){
    rows=rows.filter(p=>physicalAvailable(p.productCode)>EPS);
  }else if(t==='STAFF_ALLOWANCE'){
    rows=rows.filter(p=>physicalAvailable(p.productCode)>EPS);
  }else if(t==='STOCK_DAMAGE'&&damageMode()==='WAREHOUSE'){
    rows=rows.filter(p=>{
      try{return number(currentAvailable(p.productCode))>EPS}catch(_){return purchasedAvailable(p.productCode)>EPS}
    });
  }
  let existing=new Set();
  try{existing=new Set((Array.isArray(items)?items:[]).map(x=>clean(x.productCode)))}catch(_){}
  return rows.filter(p=>clean(p.productCode)&&!existing.has(clean(p.productCode)))
    .sort(defaultProductCompare);
}
function availabilityText(product){
  const t=movement();
  if(t==='RECEIVE_FROM_CLIENT')return 'Client product';
  if(t==='CUSTOMER_BORROW')return 'Borrow into Batch';
  if(t==='CUSTOMER_BORROW_CLEAR'){
    try{return 'Batch '+fmtQty(currentAvailable(product.productCode))}catch(_){return 'Current Batch'}
  }
  if(t==='BATCH_STOCK'){
    const p=purchasedAvailable(product.productCode),z=zeroAvailable(product.productCode);
    return 'Purchased '+fmtQty(p)+(z>EPS?' · Zero-Cost '+fmtQty(z):'');
  }
  if(t==='BACK_SALE'||(t==='STOCK_DAMAGE'&&damageMode()==='BATCH')){
    const remaining=number(product.batchRemaining!==undefined?product.batchRemaining:(()=>{try{return currentAvailable(product.productCode)}catch(_){return 0}})());
    return 'Batch '+fmtQty(remaining);
  }
  if(t==='DAMAGE_CLEAR'){
    try{return 'Damaged '+fmtQty(currentAvailable(product.productCode))}catch(_){return 'Damaged stock'}
  }
  try{return 'Available '+fmtQty(currentAvailable(product.productCode))}catch(_){return ''}
}

function installProductUi(){
  const panel=$('manualProductPanel');
  const entry=$('productEntry');
  if(!panel||!entry)return false;

  let launcher=$('bbMobileProductLauncher');
  if(!launcher){
    launcher=document.createElement('div');
    launcher.id='bbMobileProductLauncher';
    launcher.className='bb-add-launcher';
    launcher.innerHTML='<button type="button" id="bbMobileAddProductBtn" class="bb-add-product-btn">＋ Add Product</button>';
    entry.insertAdjacentElement('afterend',launcher);
    $('bbMobileAddProductBtn').addEventListener('click',openProductPicker);
  }

  if(!$('bbMobileProductPicker')){
    const overlay=document.createElement('div');
    overlay.id='bbMobileProductPicker';
    overlay.className='bb-mobile-overlay';
    overlay.hidden=true;
    overlay.innerHTML=
      '<div class="bb-mobile-sheet" role="dialog" aria-modal="true" aria-label="Select Product">'+
        '<div class="bb-mobile-sheet-head"><strong>Select Product</strong><button type="button" class="bb-mobile-sheet-close" id="bbMobilePickerClose">×</button></div>'+
        '<div class="bb-mobile-picker-search"><input id="bbMobileProductSearch" autocomplete="off" spellcheck="false" placeholder="Search product name, code or barcode"></div>'+
        '<div id="bbMobileProductList" class="bb-mobile-product-list"></div>'+
      '</div>';
    document.body.appendChild(overlay);
    $('bbMobilePickerClose').addEventListener('click',closeProductPicker);
    $('bbMobileProductSearch').addEventListener('input',renderProductPicker);
    $('bbMobileProductList').addEventListener('click',event=>{
      const btn=event.target.closest('[data-bb-product-code]');
      if(btn)chooseProduct(btn.dataset.bbProductCode);
    });
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeProductPicker()});
  }

  if(!$('bbMobileQtyModal')){
    const overlay=document.createElement('div');
    overlay.id='bbMobileQtyModal';
    overlay.className='bb-mobile-overlay';
    overlay.hidden=true;
    overlay.innerHTML=
      '<div class="bb-mobile-sheet" role="dialog" aria-modal="true" aria-label="Product Quantity">'+
        '<div class="bb-mobile-sheet-head"><strong>Product Quantity</strong><button type="button" class="bb-mobile-sheet-close" id="bbMobileQtyClose">×</button></div>'+
        '<div class="bb-qty-body">'+
          '<div class="bb-qty-product"><strong id="bbMobileQtyProductName">Product</strong><span id="bbMobileQtyProductCode">-</span><div id="bbMobileQtyAvailability" class="bb-qty-available"></div></div>'+
          '<div id="bbMobileSingleQtyWrap" class="bb-qty-field"><label><span>QTY</span></label><div class="bb-qty-control"><button type="button" data-bb-step="-1" data-bb-target="bbMobileQtyInput">−</button><input id="bbMobileQtyInput" type="number" min="0" step="0.01" inputmode="decimal"><button type="button" data-bb-step="1" data-bb-target="bbMobileQtyInput">＋</button></div></div>'+
          '<div id="bbMobilePurchasedQtyWrap" class="bb-qty-field" hidden><label><span>Purchased QTY</span><span id="bbMobilePurchasedAvailable"></span></label><div class="bb-qty-control"><button type="button" data-bb-step="-1" data-bb-target="bbMobilePurchasedQty">−</button><input id="bbMobilePurchasedQty" type="number" min="0" step="0.01" inputmode="decimal"><button type="button" data-bb-step="1" data-bb-target="bbMobilePurchasedQty">＋</button></div></div>'+
          '<div id="bbMobileZeroQtyWrap" class="bb-qty-field" hidden><label><span>Zero-Cost QTY</span><span id="bbMobileZeroAvailable"></span></label><div class="bb-qty-control"><button type="button" data-bb-step="-1" data-bb-target="bbMobileZeroQty">−</button><input id="bbMobileZeroQty" type="number" min="0" step="0.01" inputmode="decimal"><button type="button" data-bb-step="1" data-bb-target="bbMobileZeroQty">＋</button></div></div>'+
          '<div class="bb-qty-actions"><button type="button" id="bbMobileQtyCancel" class="bb-qty-cancel">Cancel</button><button type="button" id="bbMobileQtyConfirm" class="bb-qty-confirm">Add Product</button></div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);
    $('bbMobileQtyClose').addEventListener('click',closeQtyModal);
    $('bbMobileQtyCancel').addEventListener('click',closeQtyModal);
    $('bbMobileQtyConfirm').addEventListener('click',confirmProductQty);
    overlay.querySelectorAll('[data-bb-step]').forEach(btn=>btn.addEventListener('click',()=>{
      const input=$(btn.dataset.bbTarget);
      if(!input)return;
      input.value=String(Math.max(0,number(input.value)+number(btn.dataset.bbStep)));
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }));
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeQtyModal()});
  }
  return true;
}

function syncProductLauncher(){
  if(!installProductUi())return;
  const launcher=$('bbMobileProductLauncher');
  if(!launcher)return;
  const t=movement();
  const manual=$('manualProductPanel');
  launcher.hidden=!!manual?.hidden||t==='PURCHASE'||t==='DAMAGE_EXCHANGE_RECEIVE';
}

async function openProductPicker(){
  const t=movement();
  if(t==='RECEIVE_FROM_CLIENT'){
    const client=selectedClient();
    if(!client){
      if(typeof setStatus==='function')setStatus('Select a Client first.','error');
      return;
    }
    await loadClientProducts(false);
  }
  if((t==='BACK_SALE'||(t==='STOCK_DAMAGE'&&damageMode()==='BATCH'))&&!selectedOpenBatchMobile()){
    if(typeof setStatus==='function')setStatus('Select an Open Batch first.','error');
    return;
  }
  const overlay=$('bbMobileProductPicker');
  if(!overlay)return;
  $('bbMobileProductSearch').value='';
  overlay.hidden=false;
  renderProductPicker();
}
function closeProductPicker(){
  const overlay=$('bbMobileProductPicker');
  if(overlay)overlay.hidden=true;
}
function renderProductPicker(){
  const host=$('bbMobileProductList');
  if(!host)return;
  const q=clean($('bbMobileProductSearch')?.value).toLowerCase();
  const rows=mobilePool().filter(product=>{
    if(!q)return true;
    return [product.productName,product.productCode,product.barcode].join(' ').toLowerCase().includes(q);
  });
  host.innerHTML=rows.length?rows.map(product=>
    '<button type="button" class="bb-mobile-product-choice" data-bb-product-code="'+esc(product.productCode)+'">'+
      '<span><strong>'+esc(product.productName||product.productCode)+'</strong><small>'+esc(product.productCode)+(product.unit?' · '+esc(product.unit):'')+'</small></span>'+
      '<span class="avail">'+esc(availabilityText(product))+'</span>'+
    '</button>'
  ).join(''):'<div class="bb-mobile-empty">'+(movement()==='RECEIVE_FROM_CLIENT'?'No linked products available for this Client.':'No available products for this movement.')+'</div>';
}
function chooseProduct(code){
  const product=mobilePool().find(p=>clean(p.productCode)===clean(code));
  if(!product)return;
  activeProduct=product;
  try{selectedProduct=product}catch(_){}
  try{
    if($('productSearchInput'))$('productSearchInput').value=(product.productName||product.productCode)+' — '+product.productCode;
    if(typeof updateProductAvailability==='function')updateProductAvailability();
  }catch(_){}
  closeProductPicker();
  openQtyModal(product);
}
function openQtyModal(product){
  const overlay=$('bbMobileQtyModal');
  if(!overlay)return;
  $('bbMobileQtyProductName').textContent=clean(product.productName)||clean(product.productCode);
  $('bbMobileQtyProductCode').textContent=clean(product.productCode)+(product.unit?' · '+clean(product.unit):'');
  $('bbMobileQtyAvailability').textContent=availabilityText(product);
  $('bbMobileQtyInput').value='';
  $('bbMobilePurchasedQty').value='';
  $('bbMobileZeroQty').value='';

  const batch=movement()==='BATCH_STOCK';
  $('bbMobileSingleQtyWrap').hidden=batch;
  $('bbMobilePurchasedQtyWrap').hidden=!batch;

  if(batch){
    const p=purchasedAvailable(product.productCode);
    const z=zeroAvailable(product.productCode);
    $('bbMobilePurchasedAvailable').textContent='Available '+fmtQty(p);
    $('bbMobileZeroAvailable').textContent='Available '+fmtQty(z);
    $('bbMobileZeroQtyWrap').hidden=!(z>EPS);
  }else{
    $('bbMobileZeroQtyWrap').hidden=true;
  }
  overlay.hidden=false;
  const qtyFocus=batch
    ?($('bbMobilePurchasedQtyWrap').hidden?$('bbMobileZeroQty'):$('bbMobilePurchasedQty'))
    :$('bbMobileQtyInput');
  if(qtyFocus){
    try{qtyFocus.focus({preventScroll:false})}catch(_){try{qtyFocus.focus()}catch(__){}}
    try{qtyFocus.select()}catch(_){}
  }
}
function closeQtyModal(){
  const overlay=$('bbMobileQtyModal');
  if(overlay)overlay.hidden=true;
  activeProduct=null;
}
function confirmProductQty(){
  if(!activeProduct)return;
  const batch=movement()==='BATCH_STOCK';
  let qty=0;
  if(batch){
    const pQty=number($('bbMobilePurchasedQty').value);
    const zQty=$('bbMobileZeroQtyWrap').hidden?0:number($('bbMobileZeroQty').value);
    const pAvail=purchasedAvailable(activeProduct.productCode);
    const zAvail=zeroAvailable(activeProduct.productCode);
    qty=pQty+zQty;
    if(!(qty>0)){
      if(typeof setStatus==='function')setStatus('Qty must be greater than 0.','error');
      return;
    }
    if(pQty>pAvail+EPS){
      if(typeof setStatus==='function')setStatus('Purchased Qty is greater than Purchased Available '+fmtQty(pAvail)+'.','error');
      return;
    }
    if(zQty>zAvail+EPS){
      if(typeof setStatus==='function')setStatus('Zero-Cost Qty is greater than Zero-Cost Available '+fmtQty(zAvail)+'.','error');
      return;
    }
    if($('bbPurchasedOut'))$('bbPurchasedOut').value=String(pQty);
    if($('bbZeroOut'))$('bbZeroOut').value=String(zQty);
    if($('qty'))$('qty').value=String(qty);
    try{$('bbPurchasedOut')?.dispatchEvent(new Event('input',{bubbles:true}));$('bbZeroOut')?.dispatchEvent(new Event('input',{bubbles:true}))}catch(_){}
  }else{
    qty=number($('bbMobileQtyInput').value);
    if(!(qty>0)){
      if(typeof setStatus==='function')setStatus('Qty must be greater than 0.','error');
      return;
    }
    if($('qty'))$('qty').value=String(qty);
  }

  let before=0;
  try{before=Array.isArray(items)?items.length:0}catch(_){}
  try{
    if(typeof window.addProduct==='function')window.addProduct();
    else if(typeof addProduct==='function')addProduct();
  }catch(error){
    if(typeof setStatus==='function')setStatus(clean(error?.message)||'Could not add Product.','error');
    return;
  }
  let after=before;
  try{after=Array.isArray(items)?items.length:before}catch(_){}
  if(after>before){
    closeQtyModal();
    activeProduct=null;
    setTimeout(syncAllV2,0);
  }
}

function clearManualItemsForContext(){
  try{
    items=[];
    if(typeof clearProductSearch==='function')clearProductSearch();
    if(typeof renderItems==='function')renderItems();
    if(typeof updatePreview==='function')updatePreview();
  }catch(_){}
}

function wireContextEvents(){
  const client=$('receiveClient');
  if(client&&!client.dataset.bbMobileClientProducts){
    client.dataset.bbMobileClientProducts='1';
    client.addEventListener('change',()=>{
      clientProductRows=[];
      clientProductClientId='';
      clearManualItemsForContext();
      setTimeout(()=>loadClientProducts(true),0);
      setTimeout(syncAllV2,0);
    });
  }

  const controller=$('controllerSelect');
  if(controller&&!controller.dataset.bbMobileRemember){
    controller.dataset.bbMobileRemember='1';
    controller.addEventListener('change',saveControllerPreference);
    new MutationObserver(()=>setTimeout(restoreControllerPreference,0)).observe(controller,{childList:true});
  }

  ['activityDate','locationSelect','salesmanSelect','batchLocationSelect','driverSelect','driver2Select'].forEach(id=>{
    const el=$(id);
    if(el&&!el.dataset.bbCollapseSummary){
      el.dataset.bbCollapseSummary='1';
      el.addEventListener('change',updateCollapseSummaries);
    }
  });
}

function syncAllV2(){
  document.body.dataset.bbMovement=movement();
  moveSuccessOutsidePreview();
  hidePurchaseDetails();
  simplifyBackSale();
  syncCollapsibles();
  syncProductLauncher();
  wireContextEvents();
  restoreControllerPreference();
  updateCollapseSummaries();
}

function boot(){
  syncAllV2();
  ['flowInBtn','flowOutBtn','movementCategorySelect','damageWarehouseBtn','damageBatchBtn','batchSelect'].forEach(id=>{
    const el=$(id);
    if(el&&!el.dataset.bbMobileUxV2){
      el.dataset.bbMobileUxV2='1';
      el.addEventListener('click',()=>setTimeout(syncAllV2,30));
      el.addEventListener('change',()=>setTimeout(syncAllV2,30));
    }
  });
  [80,250,600,1200,2200,4000].forEach(ms=>setTimeout(syncAllV2,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
(function(){
  const style=document.createElement('style');
  style.id='bb-stock-desktop-parity-override-style';
  style.textContent="\n/* Desktop sizing only. Behavior intentionally stays identical to mobile Stock Key-In. */\nbody.bb-stock-desktop-parity{padding-bottom:78px!important}\nbody.bb-stock-desktop-parity .page{\n  width:min(1180px,calc(100% - 24px))!important;\n  max-width:1180px!important;\n  margin:0 auto!important;\n  padding:12px!important\n}\nbody.bb-stock-desktop-parity .topbar{\n  display:flex!important;\n  width:min(1180px,calc(100% - 24px))!important;\n  max-width:1180px!important;\n  margin:10px auto 8px!important\n}\nbody.bb-stock-desktop-parity #status{\n  margin:0 0 10px!important;\n  padding:9px 12px!important;\n  font-size:11px!important\n}\nbody.bb-stock-desktop-parity .card{\n  margin:0 0 10px!important;\n  padding:14px!important;\n  border-radius:12px!important\n}\nbody.bb-stock-desktop-parity .section-title{\n  margin:0 0 10px!important;\n  font-size:15px!important\n}\nbody.bb-stock-desktop-parity .grid,\nbody.bb-stock-desktop-parity .grid2,\nbody.bb-stock-desktop-parity .dynamic .grid{\n  grid-template-columns:repeat(4,minmax(0,1fr))!important;\n  gap:10px!important\n}\nbody.bb-stock-desktop-parity .field label{\n  margin-bottom:5px!important;\n  font-size:10px!important\n}\nbody.bb-stock-desktop-parity .field input,\nbody.bb-stock-desktop-parity .field select,\nbody.bb-stock-desktop-parity .field textarea{\n  min-height:40px!important;\n  padding:8px 10px!important;\n  font-size:12px!important\n}\nbody.bb-stock-desktop-parity .helper{\n  margin-top:4px!important;\n  font-size:9px!important\n}\nbody.bb-stock-desktop-parity .bb-flow-shell .flow-btn{\n  min-height:42px!important;\n  font-size:11px!important\n}\nbody.bb-stock-desktop-parity .bb-category-toggle{\n  min-height:43px!important;\n  padding:9px 12px!important\n}\nbody.bb-stock-desktop-parity .bb-category-toggle strong{font-size:11px!important}\nbody.bb-stock-desktop-parity .bb-category-toggle .bb-current{font-size:9px!important}\nbody.bb-stock-desktop-parity .bb-mobile-categories{\n  grid-template-columns:repeat(4,minmax(0,1fr))!important;\n  gap:7px!important;\n  padding-top:7px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-category-btn{\n  min-height:38px!important;\n  padding:7px 9px!important;\n  font-size:10px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-category-btn span{font-size:13px!important}\nbody.bb-stock-desktop-parity .bb-collapse-summary{\n  margin:-2px 0 8px!important;\n  font-size:10px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-note-toggle{\n  min-height:38px!important;\n  padding:8px 10px!important;\n  font-size:10px!important\n}\nbody.bb-stock-desktop-parity .bb-add-product-btn{\n  min-height:46px!important;\n  font-size:12px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-overlay{\n  align-items:center!important;\n  padding:22px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-sheet{\n  width:min(720px,92vw)!important;\n  max-height:82vh!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-sheet-head{\n  padding:14px 16px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-sheet-head strong{font-size:16px!important}\nbody.bb-stock-desktop-parity .bb-mobile-picker-search{padding:11px 14px!important}\nbody.bb-stock-desktop-parity .bb-mobile-picker-search input{\n  height:44px!important;\n  font-size:13px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-product-list{padding:0 14px 14px!important}\nbody.bb-stock-desktop-parity .bb-mobile-product-choice{\n  min-height:50px!important;\n  padding:9px 4px!important\n}\nbody.bb-stock-desktop-parity .bb-mobile-product-choice strong{font-size:12px!important}\nbody.bb-stock-desktop-parity .bb-mobile-product-choice small{font-size:9px!important}\nbody.bb-stock-desktop-parity .bb-mobile-product-choice .avail{font-size:10px!important}\nbody.bb-stock-desktop-parity .bb-qty-body{padding:16px!important}\nbody.bb-stock-desktop-parity .bb-qty-product strong{font-size:14px!important}\nbody.bb-stock-desktop-parity .bb-qty-product span,\nbody.bb-stock-desktop-parity .bb-qty-available{font-size:10px!important}\nbody.bb-stock-desktop-parity .bb-qty-field label{font-size:10px!important}\nbody.bb-stock-desktop-parity .bb-qty-control{\n  grid-template-columns:48px minmax(0,1fr) 48px!important;\n  gap:8px!important\n}\nbody.bb-stock-desktop-parity .bb-qty-control button,\nbody.bb-stock-desktop-parity .bb-qty-control input{\n  min-height:46px!important;\n  height:46px!important\n}\nbody.bb-stock-desktop-parity .bb-qty-actions button{\n  min-height:46px!important;\n  font-size:11px!important\n}\nbody.bb-stock-desktop-parity .bb-products-card .table-wrap{\n  border:1px solid #e0e8f1!important;\n  border-radius:10px!important;\n  overflow:hidden!important\n}\nbody.bb-stock-desktop-parity #manualProductPanel tbody tr:not(:has(td.empty)){\n  grid-template-columns:minmax(0,1fr) 110px 42px!important;\n  gap:12px!important;\n  padding:10px 12px!important\n}\nbody.bb-stock-desktop-parity[data-bb-movement=\"BATCH_STOCK\"] #manualProductPanel tbody tr:not(:has(td.empty)){\n  grid-template-columns:minmax(0,1fr) 100px 100px 110px 42px!important\n}\nbody.bb-stock-desktop-parity #manualProductPanel tbody td:first-child strong{\n  font-size:12px!important\n}\nbody.bb-stock-desktop-parity #manualProductPanel tbody td:first-child .bb-mobile-product-code{\n  font-size:8px!important\n}\nbody.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label=\"Qty\"],\nbody.bb-stock-desktop-parity #manualProductPanel tbody td[data-bb-label=\"Batch Qty\"]{\n  min-width:90px!important;\n  font-size:12px!important\n}\nbody.bb-stock-desktop-parity[data-bb-movement=\"BATCH_STOCK\"] #manualProductPanel tbody td[data-bb-label=\"Purchased Out\"],\nbody.bb-stock-desktop-parity[data-bb-movement=\"BATCH_STOCK\"] #manualProductPanel tbody td[data-bb-label=\"Zero-Cost Out\"]{\n  min-width:80px!important;\n  font-size:11px!important\n}\nbody.bb-stock-desktop-parity #manualProductPanel .remove{\n  width:34px!important;\n  height:34px!important;\n  min-height:34px!important\n}\nbody.bb-stock-desktop-parity .actions{\n  width:min(1180px,100%)!important;\n  grid-template-columns:1fr 56px 1.6fr!important;\n  padding:9px 12px!important\n}\nbody.bb-stock-desktop-parity .actions .btn{\n  min-height:44px!important;\n  font-size:11px!important\n}\nbody.bb-stock-desktop-parity #refreshBtn::after{font-size:20px!important}\nbody.bb-stock-desktop-parity #successPanel.bb-mobile-success{\n  width:min(1156px,calc(100% - 24px))!important;\n  max-width:1156px!important;\n  padding:12px!important\n}\n@media(max-width:900px){\n  body.bb-stock-desktop-parity .grid,\n  body.bb-stock-desktop-parity .grid2,\n  body.bb-stock-desktop-parity .dynamic .grid{\n    grid-template-columns:repeat(2,minmax(0,1fr))!important\n  }\n  body.bb-stock-desktop-parity .bb-mobile-categories{\n    grid-template-columns:repeat(2,minmax(0,1fr))!important\n  }\n}\n";
  document.head.appendChild(style);
})();

/* BIG BROTHER Desktop Stock Key-In — Wide Workspace V2 */
(function(){
  if(document.getElementById('bb-stock-desktop-wide-v2-style'))return;
  const style=document.createElement('style');
  style.id='bb-stock-desktop-wide-v2-style';
  style.textContent=`
body.bb-stock-desktop-parity{
  padding-bottom:86px!important
}
body.bb-stock-desktop-parity .page{
  width:min(1360px,calc(100% - 24px))!important;
  max-width:1360px!important;
  margin:0 auto!important;
  padding:16px!important
}
body.bb-stock-desktop-parity .topbar{
  display:flex!important;
  width:100%!important;
  max-width:none!important;
  margin:0 0 12px!important
}
body.bb-stock-desktop-parity #status{
  margin:0 0 12px!important;
  padding:10px 13px!important;
  font-size:12px!important;
  line-height:1.4!important
}
body.bb-stock-desktop-parity .card{
  margin:0 0 12px!important;
  padding:16px!important;
  border-radius:13px!important
}
body.bb-stock-desktop-parity .section-title{
  margin:0 0 11px!important;
  font-size:16px!important
}
body.bb-stock-desktop-parity .grid,
body.bb-stock-desktop-parity .grid2,
body.bb-stock-desktop-parity .dynamic .grid{
  gap:12px!important
}
body.bb-stock-desktop-parity .field label{
  margin-bottom:5px!important;
  font-size:10px!important
}
body.bb-stock-desktop-parity .field input,
body.bb-stock-desktop-parity .field select,
body.bb-stock-desktop-parity .field textarea{
  min-height:44px!important;
  padding:9px 11px!important;
  font-size:13px!important
}
body.bb-stock-desktop-parity .helper{
  margin-top:5px!important;
  font-size:9px!important;
  line-height:1.4!important
}
body.bb-stock-desktop-parity .bb-flow-shell .flow-btn{
  min-height:48px!important;
  font-size:12px!important
}
body.bb-stock-desktop-parity .bb-category-toggle{
  min-height:48px!important;
  padding:10px 13px!important
}
body.bb-stock-desktop-parity .bb-category-toggle strong{
  font-size:12px!important
}
body.bb-stock-desktop-parity .bb-category-toggle .bb-current{
  font-size:10px!important
}
body.bb-stock-desktop-parity .bb-mobile-category-btn{
  min-height:42px!important;
  padding:8px 10px!important;
  font-size:11px!important
}
body.bb-stock-desktop-parity .bb-add-product-btn{
  min-height:50px!important;
  font-size:13px!important
}
body.bb-stock-desktop-parity #manualProductPanel tbody tr:not(:has(td.empty)){
  padding:12px 14px!important
}
body.bb-stock-desktop-parity #manualProductPanel tbody td:first-child strong{
  font-size:13px!important
}
body.bb-stock-desktop-parity #manualProductPanel tbody td:first-child .bb-mobile-product-code{
  font-size:9px!important
}
body.bb-stock-desktop-parity .actions{
  width:min(1360px,100%)!important;
  padding:10px 14px!important
}
body.bb-stock-desktop-parity .actions .btn{
  min-height:46px!important;
  font-size:12px!important
}
body.bb-stock-desktop-parity #successPanel.bb-mobile-success{
  width:min(1336px,calc(100% - 24px))!important;
  max-width:1336px!important
}

/* Back Sale: existingBatchFields wraps its real grid one level deeper. */
body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide>.grid{
  grid-template-columns:minmax(0,1fr)!important;
  width:100%!important
}
body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide>.grid>.field:not(.bb-mobile-hidden-field){
  grid-column:1/-1!important;
  width:100%!important;
  max-width:none!important
}
body.bb-stock-desktop-parity #existingBatchFields.bb-back-sale-batch-wide #batchSelect{
  width:100%!important;
  max-width:none!important;
  min-height:48px!important;
  font-size:13px!important
}

@media(max-width:1100px){
  body.bb-stock-desktop-parity .page{
    width:min(100%,calc(100% - 16px))!important;
    padding:10px!important
  }
  body.bb-stock-desktop-parity .actions{
    width:100%!important
  }
}
`;
  document.head.appendChild(style);
})();
