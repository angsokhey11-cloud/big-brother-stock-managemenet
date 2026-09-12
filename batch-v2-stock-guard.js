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



/* ============================================================
   BATCH REFERENCE CATALOGUE
   ============================================================ */

window.manualProductPool = function(){

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

    return 'Total Warehouse Available';

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


  let product = null;


  try{

    product =
      selectedProduct;

  }catch(error){}


  if(
    !product
  ){

    purchasedField.value =
      '0';

    zeroField.value =
      '0';

    return;

  }


  purchasedField.value =
    fmtQty(
      purchasedWarehouseAvailable(
        product.productCode
      )
    );


  zeroField.value =
    fmtQty(
      zeroCostWarehouseAvailable(
        product.productCode
      )
    );

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
        'Total Warehouse Available';

    }


    if(
      available
    ){

      available.value =
        product
          ?
          fmtQty(
            physicalWarehouseAvailable(
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
    purchasedWarehouseAvailable(
      product.productCode
    );


  const zeroAvailable =
    zeroCostWarehouseAvailable(
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

    ${fmtQty(
      purchased
    )}

    ${h(item.unit)}

  </td>

  <td class="amount bb-zero">

    ${fmtQty(
      zero
    )}

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

      Warehouse
      →
      Batch

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


  return payload;

};



/* ============================================================
   MODE
   ============================================================ */

function syncMode(){

  installBatchFields();


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
        'Each Batch keeps Purchased Qty and Zero-Cost Qty separately.';

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
