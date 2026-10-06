/* ============================================================
   BIG BROTHER
   STOCK MANAGEMENT — ZERO-COST BATCH UI V3
   2026-09-12

   BATCH STOCK:
   Purchased Warehouse → Purchased Batch
   Zero-Cost Warehouse → Zero-Cost Batch

   SALES RULE:
   ZERO-COST FIRST
   PURCHASED SECOND

   BACK SALE:
   Staff enters ONE total Back Sale Qty.
   Backend automatically restores the correct source.
   ============================================================ */

(function(){

'use strict';


const EPS = 0.000001;


const n = value => {

  const x = Number(value);

  return Number.isFinite(x)
    ? x
    : 0;

};


const s = value =>
  String(
    value == null
      ? ''
      : value
  ).trim();


const h = value =>
  String(
    value == null
      ? ''
      : value
  )
  .replace(
    /[&<>"']/g,
    c => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    })[c]
  );


function fmtQty(value){

  return n(value)
    .toLocaleString(
      'en-US',
      {
        maximumFractionDigits:2
      }
    );

}


/* ============================================================
   ORIGINAL FUNCTIONS
   ============================================================ */

const originalAddProduct =
  window.addProduct;


const originalRenderItems =
  window.renderItems;


const originalBuildPayload =
  window.buildPayload;


const originalUpdateAvailability =
  window.updateProductAvailability;


const originalSetMovementType =
  window.setMovementType;


const originalClearForm =
  window.clearForm;


const originalShowSaveSuccess =
  window.showSaveSuccess;



/* ============================================================
   BATCH HELPERS
   ============================================================ */

function isBatchReferenceMove(){

  try{

    return(

      movementType === 'BACK_SALE'

      ||

      (
        movementType === 'STOCK_DAMAGE'
        &&
        damageSource === 'BATCH'
      )

    );

  }catch(error){

    return false;

  }

}


function isNewBatchStock(){

  try{

    return movementType === 'BATCH_STOCK';

  }catch(error){

    return false;

  }

}


function selectedOpenBatch(){

  try{

    return typeof selectedBatch === 'function'
      ?
      selectedBatch()
      :
      null;

  }catch(error){

    return null;

  }

}


function selectedBatchItem(
  code
){

  const batch =
    selectedOpenBatch();


  if(
    !batch
  ){

    return null;

  }


  return(
    Array.isArray(
      batch.items
    )
      ?
      batch.items
      :
      []
  )
  .find(
    item =>
      s(item.productCode)
      ===
      s(code)
  )
  ||
  null;

}


function batchRemaining(
  row
){

  return n(

    row?.remainingQty

    !==
    undefined

      ?

      row.remainingQty

      :

      row?.pendingQty

  );

}


function stockRow(
  code
){

  try{

    return stockFor(
      code
    )
    ||
    {};

  }catch(error){

    return {};

  }

}


function purchasedWarehouseAvailable(
  code
){

  const row =
    stockRow(
      code
    );


  return n(

    row.warehousePurchased

    !==
    undefined

      ?

      row.warehousePurchased

      :

      row.warehouseGood

  );

}


function zeroCostWarehouseAvailable(
  code
){

  const row =
    stockRow(
      code
    );


  return n(
    row.warehouseZeroCost
  );

}


function physicalWarehouseAvailable(
  code
){

  return(

    purchasedWarehouseAvailable(
      code
    )

    +

    zeroCostWarehouseAvailable(
      code
    )

  );

}


function stockSourceMode(){
  const select=document.getElementById('bbBatchStockSource');
  return select&&select.value==='OPEN_BATCH'?'OPEN_BATCH':'WAREHOUSE';
}

function isBatchTransferSource(){
  return isNewBatchStock()&&stockSourceMode()==='OPEN_BATCH';
}

function selectedTransferSourceBatch(){
  if(!isBatchTransferSource())return null;
  const select=document.getElementById('bbBatchSourceSelect');
  if(!select||select.value==='')return null;
  const index=Number(select.value);
  try{
    return Number.isInteger(index)&&index>=0&&Array.isArray(openBatches)
      ?(openBatches[index]||null):null;
  }catch(_){
    return null;
  }
}

function transferSourceItem(code){
  const batch=selectedTransferSourceBatch();
  if(!batch)return null;
  const rows=Array.isArray(batch.items)?batch.items:(Array.isArray(batch.exactItems)?batch.exactItems:[]);
  return rows.find(row=>s(row.productCode)===s(code))||null;
}

function purchasedTransferAvailable(code){
  const row=transferSourceItem(code);
  return n(row?.purchasedPendingQty!==undefined?row.purchasedPendingQty:row?.purchasedRemainingQty);
}

function zeroCostTransferAvailable(code){
  const row=transferSourceItem(code);
  return n(row?.zeroCostPendingQty!==undefined?row.zeroCostPendingQty:row?.zeroCostRemainingQty);
}

function batchSourcePurchasedAvailable(code){
  return isBatchTransferSource()?purchasedTransferAvailable(code):purchasedWarehouseAvailable(code);
}

function batchSourceZeroAvailable(code){
  return isBatchTransferSource()?zeroCostTransferAvailable(code):zeroCostWarehouseAvailable(code);
}

function batchSourcePhysicalAvailable(code){
  return batchSourcePurchasedAvailable(code)+batchSourceZeroAvailable(code);
}

function sourceBatchProductPool(){
  const batch=selectedTransferSourceBatch();
  if(!batch)return [];
  const rows=Array.isArray(batch.items)?batch.items:(Array.isArray(batch.exactItems)?batch.exactItems:[]);
  return rows.filter(row=>s(row.productCode)&&batchRemaining(row)>EPS).map(row=>{
    const master=(Array.isArray(products)?products:[]).find(p=>s(p.productCode)===s(row.productCode))||{};
    return {
      ...master,
      productCode:s(row.productCode),
      productName:s(row.productName)||s(master.productName)||s(row.productCode),
      unit:s(row.unit)||s(master.unit),
      batchRemaining:batchRemaining(row),
      purchasedBatchRemaining:n(row.purchasedPendingQty!==undefined?row.purchasedPendingQty:row.purchasedRemainingQty),
      zeroCostBatchRemaining:n(row.zeroCostPendingQty!==undefined?row.zeroCostPendingQty:row.zeroCostRemainingQty)
    };
  });
}

function fillTransferSourceBatches(preferredId=''){
  const select=document.getElementById('bbBatchSourceSelect');
  if(!select)return;
  let currentId=preferredId;
  if(!currentId&&select.value!==''){
    const current=Number(select.value);
    try{
      if(Number.isInteger(current)&&current>=0&&openBatches[current])currentId=s(openBatches[current].batchId);
    }catch(_){}
  }
  let rows=[];
  try{rows=Array.isArray(openBatches)?openBatches:[]}catch(_){}
  select.innerHTML='<option value="">Select Source Open Batch</option>'+
    rows.map((batch,index)=>'<option value="'+index+'">'+h(
      s(batch.batchId)+' · '+s(batch.locationName||batch.locationCode||'-')+' · '+s(batch.salesmanName||'-')+
      ' · Remaining '+fmtQty(batch.totalRemainingQty!==undefined?batch.totalRemainingQty:(batch.items||[]).reduce((sum,row)=>sum+batchRemaining(row),0))
    )+'</option>').join('');
  if(currentId){
    const next=rows.findIndex(batch=>s(batch.batchId)===s(currentId));
    if(next>=0)select.value=String(next);
  }
}

function syncTransferTeamRestrictions(){
  const source=selectedTransferSourceBatch();
  const salesman=document.getElementById('salesmanSelect');
  const driver1=document.getElementById('driverSelect');
  const driver2=document.getElementById('driver2Select');
  const sourceSales=s(source?.salesmanStaffId);
  const sourceDrivers=new Set([s(source?.driverStaffId),s(source?.driver2StaffId)].filter(Boolean));

  const sync=(select,list,blocked)=>{
    if(!select)return;
    [...select.options].forEach(option=>{
      if(option.value===''){option.disabled=false;return}
      const index=Number(option.value);
      const row=Number.isInteger(index)&&Array.isArray(list)?list[index]:null;
      option.disabled=!!row&&blocked(s(row.staffId));
    });
    const current=Number(select.value);
    const row=Number.isInteger(current)&&Array.isArray(list)?list[current]:null;
    if(row&&blocked(s(row.staffId)))select.value='';
  };

  try{sync(salesman,salesmen,id=>!!sourceSales&&id===sourceSales)}catch(_){}
  try{sync(driver1,drivers,id=>sourceDrivers.has(id))}catch(_){}
  try{sync(driver2,drivers,id=>sourceDrivers.has(id))}catch(_){}
}

function setTransferDefaultLocation(){
  const select=document.getElementById('batchLocationSelect');
  if(select)select.value='';
}

function transferSourceChanged(options={}){
  const keepLocation=options.keepLocation===true;
  try{items=[]}catch(_){}
  try{clearProductSearch()}catch(_){}
  resetBatchSourceInput();
  try{window.renderItems()}catch(_){}
  try{updatePreview()}catch(_){}
  if(!keepLocation)setTransferDefaultLocation();
  syncTransferTeamRestrictions();
  updateBatchSourceAvailability();
  const source=selectedTransferSourceBatch();
  if(source){
    try{setStatus('Source '+s(source.batchId)+' selected · choose a different Salesman / Driver and transfer only its live remaining stock.','success')}catch(_){}
  }
}

function installStockSourceControls(){
  const host=document.getElementById('newBatchFields');
  const grid=host?.querySelector('.grid');
  if(!grid||document.getElementById('bbBatchStockSource'))return;

  const sourceField=document.createElement('div');
  sourceField.className='field bb-stock-source-choice';
  sourceField.innerHTML='<label>Stock Source</label><select id="bbBatchStockSource"><option value="WAREHOUSE">Warehouse Stock</option><option value="OPEN_BATCH">Open Batch Stock</option></select><div class="helper">Choose where this new Batch receives stock from.</div>';

  const batchField=document.createElement('div');
  batchField.className='field bb-open-batch-source';
  batchField.hidden=true;
  batchField.innerHTML='<label>Source Open Batch</label><select id="bbBatchSourceSelect"><option value="">Select Source Open Batch</option></select><div class="helper">Only live remaining stock from this Batch can be transferred.</div>';

  grid.insertBefore(batchField,grid.firstChild);
  grid.insertBefore(sourceField,grid.firstChild);

  const style=document.createElement('style');
  style.textContent='.bb-stock-source-choice select,.bb-open-batch-source select{font-weight:800}.bb-open-batch-source[hidden]{display:none!important}';
  document.head.appendChild(style);

  document.getElementById('bbBatchStockSource').addEventListener('change',()=>{
    const open=stockSourceMode()==='OPEN_BATCH';
    batchField.hidden=!open;
    fillTransferSourceBatches();
    transferSourceChanged();
    if(!open)syncTransferTeamRestrictions();
  });
  document.getElementById('bbBatchSourceSelect').addEventListener('change',()=>transferSourceChanged());
  fillTransferSourceBatches();
}

function syncStockSourceControls(){
  installStockSourceControls();
  const batchField=document.querySelector('.bb-open-batch-source');
  if(batchField)batchField.hidden=!isBatchTransferSource();
  fillTransferSourceBatches();
  syncTransferTeamRestrictions();
}

window.BBBatchStockSource={
  isOpenBatch:()=>isBatchTransferSource(),
  sourceBatch:()=>selectedTransferSourceBatch(),
  sourceBatchId:()=>s(selectedTransferSourceBatch()?.batchId),
  purchasedAvailable:code=>batchSourcePurchasedAvailable(code),
  zeroAvailable:code=>batchSourceZeroAvailable(code),
  physicalAvailable:code=>batchSourcePhysicalAvailable(code),
  refresh:()=>{syncStockSourceControls();updateBatchSourceAvailability()},
  setWarehouse:()=>{
    installStockSourceControls();
    const mode=document.getElementById('bbBatchStockSource');
    if(mode)mode.value='WAREHOUSE';
    syncStockSourceControls();
    transferSourceChanged({keepLocation:true});
    return true;
  },
  setOpenBatch:(batchId)=>{
    installStockSourceControls();
    fillTransferSourceBatches(batchId);
    const mode=document.getElementById('bbBatchStockSource');
    if(mode)mode.value='OPEN_BATCH';
    const select=document.getElementById('bbBatchSourceSelect');
    let index=-1;
    try{index=(Array.isArray(openBatches)?openBatches:[]).findIndex(batch=>s(batch.batchId)===s(batchId))}catch(_){}
    if(index<0)return false;
    select.value=String(index);
    const field=document.querySelector('.bb-open-batch-source');
    if(field)field.hidden=false;
    transferSourceChanged();
    return true;
  }
};



/* ============================================================
   BATCH REFERENCE CATALOGUE
   ============================================================ */

window.manualProductPool = function(){

  if(isBatchTransferSource()){
    return sourceBatchProductPool();
  }

  if(
    !isBatchReferenceMove()
  ){

    return Array.isArray(
      products
    )
      ?
      products
      :
      [];

  }


  const batch =
    selectedOpenBatch();


  if(
    !batch
  ){

    return [];

  }


  return(

    Array.isArray(
      batch.items
    )
      ?
      batch.items
      :
      []

  )

  .filter(
    item =>
      s(item.productCode)
      &&
      batchRemaining(item)
      >
      EPS
  )

  .map(
    item =>{


      const master =
        (
          Array.isArray(
            products
          )
            ?
            products
            :
            []
        )
        .find(
          product =>
            s(product.productCode)
            ===
            s(item.productCode)
        )
        ||
        {};


      return{

        ...master,

        productCode:
          s(
            item.productCode
          ),

        productName:
          s(
            item.productName
          )
          ||
          s(
            master.productName
          )
          ||
          s(
            item.productCode
          ),

        unit:
          s(
            item.unit
          )
          ||
          s(
            master.unit
          ),

        batchRemaining:
          batchRemaining(
            item
          ),

        purchasedBatchRemaining:
          n(
            item.purchasedPendingQty
          ),

        zeroCostBatchRemaining:
          n(
            item.zeroCostPendingQty
          )

      };

    }
  );

};



/* ============================================================
   CURRENT AVAILABLE
   ============================================================ */

window.currentAvailable = function(
  code
){

  if(
    isBatchReferenceMove()
  ){

    return batchRemaining(
      selectedBatchItem(
        code
      )
    );

  }


  /*
   * Normal warehouse movements remain Purchased Warehouse only.
   *
   * Zero-Cost is controlled separately and is currently only
   * released through BATCH_STOCK.
   */

  return purchasedWarehouseAvailable(
    code
  );

};


window.availableLabel = function(){

  if(
    isBatchReferenceMove()
  ){

    return 'Batch Remaining';

  }


  if(
    isNewBatchStock()
  ){

    return isBatchTransferSource()
      ? 'Total Source Batch Available'
      : 'Total Warehouse Available';

  }


  return 'Warehouse Purchased';

};



/* ============================================================
   INSTALL ZERO-COST BATCH FIELDS
   ============================================================ */

function createField(
  id,
  label,
  inputHtml
){

  const wrap =
    document.createElement(
      'div'
    );


  wrap.className =
    'field bb-batch-source-field';


  wrap.id =
    id
    +
    'Wrap';


  wrap.hidden =
    true;


  wrap.innerHTML =
    '<label>'
    +
    h(label)
    +
    '</label>'
    +
    inputHtml;


  return wrap;

}


function installBatchFields(){

  if(
    document.getElementById(
      'bbPurchasedOut'
    )
  ){

    return;

  }


  const entry =
    document.getElementById(
      'productEntry'
    );


  const addButton =
    document.getElementById(
      'addProductBtn'
    );


  if(
    !entry
    ||
    !addButton
  ){

    return;

  }


  const purchasedAvailableField =
    createField(

      'bbPurchasedAvailable',

      'Purchased Available',

      '<input id="bbPurchasedAvailable" readonly value="0">'

    );


  const zeroAvailableField =
    createField(

      'bbZeroAvailable',

      'Zero-Cost Available',

      '<input id="bbZeroAvailable" readonly value="0">'

    );


  const purchasedOutField =
    createField(

      'bbPurchasedOut',

      'Purchased Out',

      '<input id="bbPurchasedOut" type="number" min="0" step="0.01" inputmode="decimal" value="0">'

    );


  const zeroOutField =
    createField(

      'bbZeroOut',

      'Zero-Cost Out',

      '<input id="bbZeroOut" type="number" min="0" step="0.01" inputmode="decimal" value="0">'

    );


  const totalField =
    createField(

      'bbBatchTotal',

      'Batch Qty',

      '<input id="bbBatchTotal" readonly value="0">'

    );


  entry.insertBefore(
    purchasedAvailableField,
    addButton
  );


  entry.insertBefore(
    zeroAvailableField,
    addButton
  );


  entry.insertBefore(
    purchasedOutField,
    addButton
  );


  entry.insertBefore(
    zeroOutField,
    addButton
  );


  entry.insertBefore(
    totalField,
    addButton
  );


  const style =
    document.createElement(
      'style'
    );


  style.textContent = `

    .bb-batch-source-field[hidden]{
      display:none!important;
    }

    #productEntry.bb-zero-cost-batch{
      grid-template-columns:
        minmax(250px,2fr)
        1fr
        1fr
        1fr
        1fr
        1fr
        1fr
        auto;
    }

    #bbPurchasedAvailable{
      background:#f3f8ff;
      color:#245fae;
      font-weight:900;
    }

    #bbZeroAvailable{
      background:#f6f1ff;
      color:#7450b5;
      font-weight:900;
    }

    #bbPurchasedOut{
      border-color:#9fbfe4;
      color:#17457a;
      font-weight:900;
    }

    #bbZeroOut{
      border-color:#c6afea;
      color:#6842a5;
      font-weight:900;
    }

    #bbBatchTotal{
      background:#edf9f3;
      color:#16855c;
      font-weight:1000;
    }

    .bb-zero{
      color:#704ab0;
      font-weight:900;
    }

    .bb-purchased{
      color:#245fae;
      font-weight:900;
    }

    .bb-total{
      color:#16855c;
      font-weight:1000;
    }

    @media(max-width:1200px){

      #productEntry.bb-zero-cost-batch{
        grid-template-columns:
          repeat(4,minmax(0,1fr));
      }

    }

  `;


  document.head.appendChild(
    style
  );


  document
    .getElementById(
      'bbPurchasedOut'
    )
    .addEventListener(
      'input',
      updateBatchTotal
    );


  document
    .getElementById(
      'bbZeroOut'
    )
    .addEventListener(
      'input',
      updateBatchTotal
    );

}



/* ============================================================
   FIELD VISIBILITY
   ============================================================ */

function batchFields(){

  return Array.from(
    document.querySelectorAll(
      '.bb-batch-source-field'
    )
  );

}


function originalAvailableWrap(){

  return document
    .getElementById(
      'availableQty'
    )
    ?.closest(
      '.field'
    )
    ||
    null;

}


function originalQtyWrap(){

  return document
    .getElementById(
      'qty'
    )
    ?.closest(
      '.field'
    )
    ||
    null;

}


function showBatchSourceFields(
  show
){

  installBatchFields();


  batchFields()
    .forEach(
      field =>
        field.hidden =
          !show
    );


  const entry =
    document.getElementById(
      'productEntry'
    );


  if(
    entry
  ){

    entry.classList.toggle(
      'bb-zero-cost-batch',
      show
    );

  }


  const availableWrap =
    originalAvailableWrap();


  const qtyWrap =
    originalQtyWrap();


  if(
    availableWrap
  ){

    availableWrap.hidden =
      show;

  }


  if(
    qtyWrap
  ){

    qtyWrap.hidden =
      show;

  }


  /*
   * Zero-Cost controls are conditional even while Batch Stock
   * mode is active. Do not waste space when this SKU has no
   * Zero-Cost Warehouse stock.
   */
  if(
    show
  ){

    updateBatchSourceAvailability();

  }

}



/* ============================================================
   BATCH SOURCE AVAILABILITY
   ============================================================ */

function updateBatchTotal(){

  const purchased =
    n(
      document.getElementById(
        'bbPurchasedOut'
      )?.value
    );


  const zero =
    n(
      document.getElementById(
        'bbZeroOut'
      )?.value
    );


  const total =
    purchased
    +
    zero;


  const field =
    document.getElementById(
      'bbBatchTotal'
    );


  if(
    field
  ){

    field.value =
      fmtQty(
        total
      );

  }


  /*
   * Keep original hidden Qty synchronized so the legacy
   * preview continues to work with Total Batch Qty.
   */

  const legacyQty =
    document.getElementById(
      'qty'
    );


  if(
    legacyQty
  ){

    legacyQty.value =
      total
      >
      0
        ?
        total
        :
        '';

  }

}


function resetBatchSourceInput(){

  const purchased =
    document.getElementById(
      'bbPurchasedOut'
    );


  const zero =
    document.getElementById(
      'bbZeroOut'
    );


  const total =
    document.getElementById(
      'bbBatchTotal'
    );


  if(
    purchased
  ){

    purchased.value =
      '0';

  }


  if(
    zero
  ){

    zero.value =
      '0';

  }


  if(
    total
  ){

    total.value =
      '0';

  }

}


function updateBatchSourceAvailability(){

  installBatchFields();


  const purchasedField =
    document.getElementById(
      'bbPurchasedAvailable'
    );


  const zeroField =
    document.getElementById(
      'bbZeroAvailable'
    );


  if(
    !purchasedField
    ||
    !zeroField
  ){

    return;

  }


  const zeroAvailableWrap =
    document.getElementById(
      'bbZeroAvailableWrap'
    );


  const zeroOutWrap =
    document.getElementById(
      'bbZeroOutWrap'
    );


  const zeroOut =
    document.getElementById(
      'bbZeroOut'
    );


  let product = null;


  try{

    product =
      selectedProduct;

  }catch(error){}


  const zeroAvailable =
    product
      ?
      batchSourceZeroAvailable(
        product.productCode
      )
      :
      0;


  const showZeroCost =
    isNewBatchStock()
    &&
    zeroAvailable
    >
    EPS;


  if(
    zeroAvailableWrap
  ){

    zeroAvailableWrap.hidden =
      !showZeroCost;

  }


  if(
    zeroOutWrap
  ){

    zeroOutWrap.hidden =
      !showZeroCost;

  }


  if(
    !showZeroCost
    &&
    zeroOut
  ){

    zeroOut.value =
      '0';

  }


  if(
    !product
  ){

    purchasedField.value =
      '0';

    zeroField.value =
      '0';

    updateBatchTotal();

    return;

  }


  purchasedField.value =
    fmtQty(
      batchSourcePurchasedAvailable(
        product.productCode
      )
    );


  zeroField.value =
    fmtQty(
      zeroAvailable
    );


  updateBatchTotal();

}



/* ============================================================
   PRODUCT AVAILABILITY
   ============================================================ */

window.updateProductAvailability =
function(){

  if(
    typeof originalUpdateAvailability
    ===
    'function'
  ){

    originalUpdateAvailability
      .apply(
        this,
        arguments
      );

  }


  const product =
    (()=>{

      try{

        return selectedProduct;

      }catch(error){

        return null;

      }

    })();


  const codeInput =
    document.getElementById(
      'productCode'
    );


  if(
    codeInput
  ){

    codeInput.value =
      product
        ?
        s(
          product.productCode
        )
        :
        '';

  }


  if(
    isNewBatchStock()
  ){

    const available =
      document.getElementById(
        'availableQty'
      );


    const label =
      document.getElementById(
        'availableLabel'
      );


    if(
      label
    ){

      label.textContent =
        isBatchTransferSource()
          ? 'Total Source Batch Available'
          : 'Total Warehouse Available';

    }


    if(
      available
    ){

      available.value =
        product
          ?
          fmtQty(
            batchSourcePhysicalAvailable(
              product.productCode
            )
          )
          :
          '0';

    }


    updateBatchSourceAvailability();

  }

};



/* ============================================================
   ADD BATCH PRODUCT
   ============================================================ */

function addZeroCostBatchProduct(){

  let product = null;


  try{

    product =
      selectedProduct;

  }catch(error){}


  if(
    !product
  ){

    return setStatus(
      'Select a Product first.',
      'error'
    );

  }


  const purchasedQty =
    n(
      document.getElementById(
        'bbPurchasedOut'
      )?.value
    );


  const zeroCostQty =
    n(
      document.getElementById(
        'bbZeroOut'
      )?.value
    );


  const totalQty =
    purchasedQty
    +
    zeroCostQty;


  if(
    purchasedQty
    <
    0

    ||

    zeroCostQty
    <
    0
  ){

    return setStatus(
      'Purchased Qty and Zero-Cost Qty cannot be negative.',
      'error'
    );

  }


  if(
    totalQty
    <=
    EPS
  ){

    return setStatus(
      'Enter Purchased Out or Zero-Cost Out Qty.',
      'error'
    );

  }


  if(
    items.some(
      item =>
        s(item.productCode)
        ===
        s(product.productCode)
    )
  ){

    return setStatus(
      product.productName
      +
      ' is already in this Batch.',
      'error'
    );

  }


  const purchasedAvailable =
    batchSourcePurchasedAvailable(
      product.productCode
    );


  const zeroAvailable =
    batchSourceZeroAvailable(
      product.productCode
    );


  if(
    purchasedQty
    >
    purchasedAvailable
    +
    EPS
  ){

    return setStatus(

      product.productName

      +

      ': Purchased Out '

      +

      fmtQty(
        purchasedQty
      )

      +

      ' is greater than Purchased Available '

      +

      fmtQty(
        purchasedAvailable
      )

      +

      '.',

      'error'

    );

  }


  if(
    zeroCostQty
    >
    zeroAvailable
    +
    EPS
  ){

    return setStatus(

      product.productName

      +

      ': Zero-Cost Out '

      +

      fmtQty(
        zeroCostQty
      )

      +

      ' is greater than Zero-Cost Available '

      +

      fmtQty(
        zeroAvailable
      )

      +

      '.',

      'error'

    );

  }


  items.push({

    productCode:
      s(
        product.productCode
      ),

    productName:
      s(
        product.productName
      )
      ||
      s(
        product.productCode
      ),

    unit:
      s(
        product.unit
      ),

    qty:
      totalQty,

    purchasedQty:
      purchasedQty,

    zeroCostQty:
      zeroCostQty,

    unitCost:
      0,

    availableBefore:
      purchasedAvailable
      +
      zeroAvailable,

    purchasedAvailableBefore:
      purchasedAvailable,

    zeroCostAvailableBefore:
      zeroAvailable

  });


  try{

    clearProductSearch();

  }catch(error){}


  resetBatchSourceInput();


  window.renderItems();


  try{

    updatePreview();

  }catch(error){}


  setStatus(

    items.length

    +

    ' Batch product line'

    +

    (
      items.length
      ===
      1
        ?
        ''
        :
        's'
    )

    +

    ' ready.',

    'success'

  );

}



/* ============================================================
   OLD BATCH LIVE-GUARD + NEW ADD
   ============================================================ */

window.addProduct =
function(){


  /* ==========================================================
     NEW BATCH STOCK
     ========================================================== */

  if(
    isNewBatchStock()
  ){

    return addZeroCostBatchProduct();

  }


  /*
   * Reported Batch Damage is now warehouse receipt ONLY.
   * Salesman reporting already removed the items from sellable batch stock.
   * The old batch-remaining guard must not block these receipts.
   * The database validates each receipt against outstanding reported damage.
   */
  if(
    movementType === 'STOCK_DAMAGE' &&
    damageSource === 'BATCH'
  ){
    const receiving = window.BBReportedDamageReceiving;
    let product = null;
    try{product=selectedProduct;}catch(_){}
    const quantity=Number(document.getElementById('qty')?.value)||0;
    const already=Array.isArray(items)?
      items.filter(x=>x.productCode===product?.productCode)
        .reduce((total,x)=>total+(Number(x.qty)||0),0):0;
    const pending=Number(receiving?.pendingQty?.(product?.productCode))||0;
    if(!receiving?.ready?.()||!product||quantity<=0||
       quantity+already>pending+0.000001){
      return setStatus(
        'Select a reported damage product. Maximum remaining receipt: '+
        Math.max(0,pending-already)+'.','error'
      );
    }
    return originalAddProduct.apply(this,arguments);
  }

  /* ==========================================================
     EXISTING BATCH BACK SALE / DAMAGE
     ========================================================== */

  if(
    isBatchReferenceMove()
  ){

    const batch =
      selectedOpenBatch();


    if(
      !batch
    ){

      return setStatus(
        'Select an Open Batch first.',
        'error'
      );

    }


    let product = null;


    try{

      product =
        selectedProduct;

    }catch(error){}


    const qty =
      n(
        document.getElementById(
          'qty'
        )?.value
      );


    if(
      product
    ){

      const available =
        batchRemaining(
          selectedBatchItem(
            product.productCode
          )
        );


      if(
        available
        <=
        EPS
      ){

        return setStatus(

          s(
            product.productName
          )

          +

          ': no stock remains in '

          +

          s(
            batch.batchId
          )

          +

          '.',

          'error'

        );

      }


      if(
        qty
        >
        available
        +
        EPS
      ){

        return setStatus(

          s(
            product.productName
          )

          +

          ': Qty '

          +

          fmtQty(
            qty
          )

          +

          ' is greater than Batch Remaining '

          +

          fmtQty(
            available
          )

          +

          '.',

          'error'

        );

      }

    }


    const before =
      Array.isArray(
        items
      )
        ?
        items.length
        :
        0;


    const available =
      product
        ?
        batchRemaining(
          selectedBatchItem(
            product.productCode
          )
        )
        :
        0;


    const result =
      originalAddProduct
        .apply(
          this,
          arguments
        );


    if(
      Array.isArray(
        items
      )

      &&

      items.length
      >
      before
    ){

      items[
        items.length
        -
        1
      ]
      .availableBefore =
        available;


      window.renderItems();

    }


    return result;

  }


  return originalAddProduct
    .apply(
      this,
      arguments
    );

};



/* ============================================================
   TABLE HEADER
   ============================================================ */

let originalHeaderHtml =
  '';


function tableHeader(){

  return document
    .querySelector(
      '#manualProductPanel table thead tr'
    );

}


function saveOriginalHeader(){

  const header =
    tableHeader();


  if(
    header
    &&
    !originalHeaderHtml
  ){

    originalHeaderHtml =
      header.innerHTML;

  }

}


function renderBatchHeader(){

  saveOriginalHeader();


  const header =
    tableHeader();


  if(
    !header
  ){

    return;

  }


  header.innerHTML = `

    <th>Product</th>

    <th>Code</th>

    <th class="amount">
      Purchased Available
    </th>

    <th class="amount">
      Zero-Cost Available
    </th>

    <th class="amount">
      Purchased Out
    </th>

    <th class="amount">
      Zero-Cost Out
    </th>

    <th class="amount">
      Batch Qty
    </th>

    <th>
      Movement
    </th>

    <th></th>

  `;

}


function restoreOriginalHeader(){

  if(
    !originalHeaderHtml
  ){

    return;

  }


  const header =
    tableHeader();


  if(
    header
  ){

    header.innerHTML =
      originalHeaderHtml;

  }

}



/* ============================================================
   RENDER ITEMS
   ============================================================ */

window.renderItems =
function(){

  if(
    !isNewBatchStock()
  ){

    restoreOriginalHeader();


    return originalRenderItems
      .apply(
        this,
        arguments
      );

  }


  renderBatchHeader();


  const body =
    document.getElementById(
      'itemRows'
    );


  if(
    !body
  ){

    return;

  }


  if(
    !items.length
  ){

    body.innerHTML =

      '<tr>'

      +

      '<td colspan="9" class="empty">'

      +

      'No Batch products added yet.'

      +

      '</td>'

      +

      '</tr>';


    try{

      updatePreview();

    }catch(error){}


    return;

  }


  body.innerHTML =
    items
      .map(
        (
          item,
          index
        ) =>{


          const purchased =
            n(
              item.purchasedQty
            );


          const zero =
            n(
              item.zeroCostQty
            );


          const total =
            purchased
            +
            zero;


          return `

<tr>

  <td>

    <strong>
      ${h(item.productName)}
    </strong>

  </td>

  <td>
    ${h(item.productCode)}
  </td>

  <td class="amount bb-purchased">

    ${fmtQty(
      item.purchasedAvailableBefore
    )}

  </td>

  <td class="amount bb-zero">

    ${fmtQty(
      item.zeroCostAvailableBefore
    )}

  </td>

  <td class="amount bb-purchased">

    <input aria-label="Purchased Out Qty" type="number" min="0" step="1" inputmode="numeric" style="width:78px;max-width:100%;padding:6px;border:1px solid #aac5e5;border-radius:6px;text-align:right;font-weight:700" value="${purchased}" oninput="window.bbBatchEditQty(${index},'purchasedQty',this)" onchange="window.bbBatchEditFinish()">

    ${h(item.unit)}

  </td>

  <td class="amount bb-zero">

    <input aria-label="Zero-Cost Out Qty" type="number" min="0" step="1" inputmode="numeric" style="width:78px;max-width:100%;padding:6px;border:1px solid #aac5e5;border-radius:6px;text-align:right;font-weight:700" value="${zero}" oninput="window.bbBatchEditQty(${index},'zeroCostQty',this)" onchange="window.bbBatchEditFinish()">

    ${h(item.unit)}

  </td>

  <td class="amount bb-total">

    ${fmtQty(
      total
    )}

    ${h(item.unit)}

  </td>

  <td>

    <span class="badge">

      ${isBatchTransferSource()?'Source Batch → New Batch':'Warehouse → Batch'}

    </span>

  </td>

  <td>

    <button
      class="remove"
      onclick="removeProduct(${index})"
    >
      Remove
    </button>

  </td>

</tr>

`;

        }
      )
      .join(
        ''
      );


  try{

    updatePreview();

  }catch(error){}

};



window.bbBatchEditQty=function(index,field,input){
 if(!isNewBatchStock()||!items[index])return;
 const row=items[index],value=Number(input.value),available=field==='purchasedQty'?batchSourcePurchasedAvailable(row.productCode):batchSourceZeroAvailable(row.productCode);
 if(!Number.isFinite(value)||value<0){input.setCustomValidity('Enter a nonnegative quantity.');return}
 if(value>available+EPS){input.setCustomValidity('Available '+fmtQty(available));input.style.borderColor='#d33';return}
 input.setCustomValidity('');input.style.borderColor='#aac5e5';row[field]=value;row.qty=n(row.purchasedQty)+n(row.zeroCostQty);
 const cells=input.closest('tr')?.querySelectorAll('td');if(cells?.[6])cells[6].textContent=fmtQty(row.qty)+' '+s(row.unit);
 try{updatePreview()}catch(_){}
};
window.bbBatchEditFinish=function(){try{window.renderItems()}catch(_){}};

/* ============================================================
   PAYLOAD
   ============================================================ */

window.buildPayload =
function(){

  const payload =
    originalBuildPayload
      .apply(
        this,
        arguments
      );


  if(
    !isNewBatchStock()
  ){

    return payload;

  }


  payload.items =
    items.map(
      item =>{

        const purchased =
          n(
            item.purchasedQty
          );


        const zero =
          n(
            item.zeroCostQty
          );


        return{

          productCode:
            s(
              item.productCode
            ),

          productName:
            s(
              item.productName
            ),

          unit:
            s(
              item.unit
            ),

          purchasedQty:
            purchased,

          zeroCostQty:
            zero,

          qty:
            purchased
            +
            zero,

          unitCost:
            0

        };

      }
    );


  payload.inventoryAllocationRule =
    'ZERO_COST_FIRST_ON_SALE';

  payload.stockSource =
    isBatchTransferSource()
      ? 'OPEN_BATCH'
      : 'WAREHOUSE';

  payload.sourceBatchId =
    isBatchTransferSource()
      ? s(selectedTransferSourceBatch()?.batchId)
      : '';


  return payload;

};



/* ============================================================
   MODE
   ============================================================ */

function syncMode(){

  installBatchFields();
  syncStockSourceControls();


  const batchMode =
    isNewBatchStock();


  showBatchSourceFields(
    batchMode
  );


  if(
    batchMode
  ){

    updateBatchSourceAvailability();

    updateBatchTotal();


    const subtitle =
      document.querySelector(
        '.topbar .subtitle'
      );


    if(
      subtitle
    ){

      subtitle.textContent =
        'Physical Stock key-in with separate Purchased and Zero-Cost Batch stock. Sales consume Zero-Cost first.';

    }


    const help =
      document.querySelector(
        '#newBatchFields .helper'
      );


    if(
      help
    ){

      help.textContent =
        isBatchTransferSource()
          ? 'Transfer keeps Purchased Qty and Zero-Cost Qty separate. Warehouse stock is unchanged.'
          : 'Each Batch keeps Purchased Qty and Zero-Cost Qty separately.';

    }


  }else{


    resetBatchSourceInput();


    const subtitle =
      document.querySelector(
        '.topbar .subtitle'
      );


    if(
      subtitle
    ){

      subtitle.textContent =
        'Physical Stock key-in with real-time Batch control. Back Sale / Batch Damage cannot exceed live Batch remaining stock.';

    }

  }


  window.renderItems();

}



/* ============================================================
   MOVEMENT TYPE
   ============================================================ */

window.setMovementType =
function(
  type
){

  const result =
    originalSetMovementType
      .apply(
        this,
        arguments
      );


  setTimeout(
    syncMode,
    0
  );


  return result;

};



/* ============================================================
   CLEAR
   ============================================================ */

window.clearForm =
function(){

  const result =
    originalClearForm
      .apply(
        this,
        arguments
      );


  resetBatchSourceInput();


  setTimeout(
    syncMode,
    0
  );


  return result;

};



/* ============================================================
   SELECTED BATCH STATUS
   ============================================================ */

function refreshBatchReferenceUi(){

  try{

    clearProductSearch();

  }catch(error){}


  try{

    window.updateProductAvailability();

  }catch(error){}


  const batch =
    selectedOpenBatch();


  if(
    isBatchReferenceMove()
    &&
    batch
  ){

    const total =

      (
        Array.isArray(
          batch.items
        )
          ?
          batch.items
          :
          []
      )

      .reduce(
        (
          sum,
          item
        ) =>
          sum
          +
          batchRemaining(
            item
          ),
        0
      );


    setStatus(

      s(
        batch.batchId
      )

      +

      ' selected · '

      +

      fmtQty(
        total
      )

      +

      ' live Batch stock remaining.',

      'success'

    );

  }

}



/* ============================================================
   SAVE SUCCESS
   ============================================================ */

window.showSaveSuccess =
function(
  response,
  payload
){

  const result =
    originalShowSaveSuccess
      .apply(
        this,
        arguments
      );


  if(
    payload

    &&

    (
      payload.movementType
      ===
      'BATCH_STOCK'

      ||

      payload.movementType
      ===
      'BACK_SALE'

      ||

      (
        payload.movementType
        ===
        'STOCK_DAMAGE'

        &&

        payload.damageSource
        ===
        'BATCH'
      )
    )
  ){

    setTimeout(
      ()=>{

        try{

          loadStockFast(
            true,
            false
          );

        }catch(error){}


        syncMode();

      },
      0
    );

  }


  return result;

};



/* ============================================================
   EVENTS
   ============================================================ */

function wire(){

  installBatchFields();
  installStockSourceControls();


  const addButton =
    document.getElementById(
      'addProductBtn'
    );


  if(
    addButton
  ){

    addButton.onclick =
      window.addProduct;

  }


  const clearButton =
    document.getElementById(
      'clearBtn'
    );


  if(
    clearButton
  ){

    clearButton.onclick =
      window.clearForm;

  }


  const batchSelect =
    document.getElementById(
      'batchSelect'
    );


  if(
    batchSelect
  ){

    batchSelect.addEventListener(
      'change',
      ()=>setTimeout(
        refreshBatchReferenceUi,
        0
      )
    );

  }


  const category =
    document.getElementById(
      'movementCategorySelect'
    );


  if(
    category
  ){

    category.addEventListener(
      'change',
      ()=>setTimeout(
        syncMode,
        0
      )
    );

  }


  const flowIn =
    document.getElementById(
      'flowInBtn'
    );


  const flowOut =
    document.getElementById(
      'flowOutBtn'
    );


  if(
    flowIn
  ){

    flowIn.addEventListener(
      'click',
      ()=>setTimeout(
        syncMode,
        0
      )
    );

  }


  if(
    flowOut
  ){

    flowOut.addEventListener(
      'click',
      ()=>setTimeout(
        syncMode,
        0
      )
    );

  }


  const search =
    document.getElementById(
      'productSearchInput'
    );


  if(
    search
  ){

    search.addEventListener(
      'input',
      ()=>setTimeout(
        updateBatchSourceAvailability,
        0
      )
    );

  }


  const results =
    document.getElementById(
      'productSearchResults'
    );


  if(
    results
  ){

    results.addEventListener(
      'click',
      ()=>setTimeout(
        ()=>{

          updateBatchSourceAvailability();

          updateBatchTotal();

        },
        0
      )
    );

  }


  const refresh =
    document.getElementById(
      'refreshBtn'
    );


  if(
    refresh
  ){

    refresh.addEventListener(
      'click',
      ()=>setTimeout(
        ()=>{

          fillTransferSourceBatches();
          updateBatchSourceAvailability();

          syncMode();

        },
        600
      )
    );

  }


  saveOriginalHeader();


  syncMode();

}



/* ============================================================
   START
   ============================================================ */

if(
  document.readyState
  ===
  'loading'
){

  document.addEventListener(
    'DOMContentLoaded',
    wire,
    {
      once:true
    }
  );

}else{

  wire();

}


})();
