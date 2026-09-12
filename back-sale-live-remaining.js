/* ============================================================
   BIG BROTHER
   BACK SALE — LIVE BATCH REMAINING V1
   2026-09-12

   PURPOSE
   ------------------------------------------------------------
   Back Sale must show the real live remaining Qty from the
   selected Batch.

   Staff enters ONE Back Sale Qty only.

   Backend handles:
   Purchased Back
   Zero-Cost Back
   automatically.
   ============================================================ */

(function(){

'use strict';


const EPS = 0.000001;


const n = value => {

  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ?
    number
    :
    0;

};


const s = value =>
  String(
    value == null
      ?
      ''
      :
      value
  )
  .trim();


function qty(
  value
){

  return n(
    value
  )
  .toLocaleString(
    'en-US',
    {
      maximumFractionDigits:2
    }
  );

}


/* ============================================================
   MOVEMENT MODE
   ============================================================ */

function isBackSale(){

  try{

    return(
      movementType
      ===
      'BACK_SALE'
    );

  }catch(error){

    return false;

  }

}


function isBatchDamage(){

  try{

    return(

      movementType
      ===
      'STOCK_DAMAGE'

      &&

      damageSource
      ===
      'BATCH'

    );

  }catch(error){

    return false;

  }

}


function isBatchReference(){

  return(
    isBackSale()
    ||
    isBatchDamage()
  );

}


/* ============================================================
   SELECTED BATCH
   ============================================================ */

function getBatch(){

  try{

    if(
      typeof selectedBatch
      ===
      'function'
    ){

      const batch =
        selectedBatch();

      if(
        batch
      ){

        return batch;

      }

    }

  }catch(error){}


  try{

    const select =
      document.getElementById(
        'batchSelect'
      );


    const index =
      Number(
        select?.value
      );


    if(
      Number.isInteger(
        index
      )

      &&

      index
      >=
      0

      &&

      Array.isArray(
        openBatches
      )

      &&

      openBatches[index]
    ){

      return openBatches[index];

    }

  }catch(error){}


  return null;

}


/* ============================================================
   SELECTED PRODUCT CODE
   ============================================================ */

function getProductCode(){

  try{

    if(
      selectedProduct?.productCode
    ){

      return s(
        selectedProduct.productCode
      );

    }

  }catch(error){}


  return s(
    document
      .getElementById(
        'productCode'
      )
      ?.value
  );

}


/* ============================================================
   FIND BATCH ITEM
   ============================================================ */

function getBatchItem(){

  const batch =
    getBatch();


  const code =
    getProductCode();


  if(
    !batch
    ||
    !code
  ){

    return null;

  }


  const items =
    Array.isArray(
      batch.items
    )
      ?
      batch.items
      :
      [];


  return(

    items.find(
      item =>
        s(
          item.productCode
        )
        ===
        code
    )

    ||

    null

  );

}


/* ============================================================
   BALANCE HELPERS
   ============================================================ */

function totalRemaining(
  item
){

  if(
    !item
  ){

    return 0;

  }


  if(
    item.remainingQty
    !==
    undefined
  ){

    return n(
      item.remainingQty
    );

  }


  return n(
    item.pendingQty
  );

}


function purchasedRemaining(
  item
){

  if(
    !item
  ){

    return 0;

  }


  if(
    item.purchasedPendingQty
    !==
    undefined
  ){

    return n(
      item.purchasedPendingQty
    );

  }


  if(
    item.purchasedRemainingQty
    !==
    undefined
  ){

    return n(
      item.purchasedRemainingQty
    );

  }


  return totalRemaining(
    item
  );

}


function zeroCostRemaining(
  item
){

  if(
    !item
  ){

    return 0;

  }


  if(
    item.zeroCostPendingQty
    !==
    undefined
  ){

    return n(
      item.zeroCostPendingQty
    );

  }


  if(
    item.zeroCostRemainingQty
    !==
    undefined
  ){

    return n(
      item.zeroCostRemainingQty
    );

  }


  return 0;

}


/* ============================================================
   SOURCE DETAIL HELPER
   ============================================================ */

function ensureSourceHelper(){

  const available =
    document.getElementById(
      'availableQty'
    );


  if(
    !available
  ){

    return null;

  }


  const field =
    available.closest(
      '.field'
    );


  if(
    !field
  ){

    return null;

  }


  let helper =
    document.getElementById(
      'bbBatchRemainingSource'
    );


  if(
    helper
  ){

    return helper;

  }


  helper =
    document.createElement(
      'div'
    );


  helper.id =
    'bbBatchRemainingSource';


  helper.className =
    'helper';


  helper.style.marginTop =
    '5px';


  helper.style.fontWeight =
    '800';


  helper.style.color =
    '#526d89';


  field.appendChild(
    helper
  );


  return helper;

}


/* ============================================================
   UPDATE LIVE DISPLAY
   ============================================================ */

function updateLiveRemaining(){

  if(
    !isBatchReference()
  ){

    const helper =
      document.getElementById(
        'bbBatchRemainingSource'
      );


    if(
      helper
    ){

      helper.textContent =
        '';

    }


    return;

  }


  const label =
    document.getElementById(
      'availableLabel'
    );


  const available =
    document.getElementById(
      'availableQty'
    );


  if(
    label
  ){

    label.textContent =
      'Batch Remaining';

  }


  if(
    !available
  ){

    return;

  }


  const batch =
    getBatch();


  const code =
    getProductCode();


  const item =
    getBatchItem();


  const helper =
    ensureSourceHelper();


  if(
    !batch
  ){

    available.value =
      '';


    if(
      helper
    ){

      helper.textContent =
        'Select an Open Batch.';

    }


    return;

  }


  if(
    !code
  ){

    available.value =
      '';


    if(
      helper
    ){

      helper.textContent =
        'Select a Product from this Batch.';

    }


    return;

  }


  if(
    !item
  ){

    available.value =
      '0';


    if(
      helper
    ){

      helper.textContent =
        'This Product has no remaining stock in the selected Batch.';

    }


    return;

  }


  const remaining =
    totalRemaining(
      item
    );


  const purchased =
    purchasedRemaining(
      item
    );


  const zero =
    zeroCostRemaining(
      item
    );


  available.value =
    qty(
      remaining
    );


  available.style.fontWeight =
    '900';


  available.style.color =
    remaining
    >
    EPS
      ?
      '#173f77'
      :
      '#8b98a7';


  if(
    helper
  ){

    helper.innerHTML =

      '<span style="color:#245fae">'

      +

      'Purchased Remaining: '

      +

      qty(
        purchased
      )

      +

      '</span>'

      +

      ' · '

      +

      '<span style="color:#704ab0">'

      +

      'Zero-Cost Remaining: '

      +

      qty(
        zero
      )

      +

      '</span>';

  }


  /*
   * Replace the old reference-only wording.
   */

  const batchHelper =
    document.querySelector(
      '#existingBatchFields .helper'
    );


  if(
    batchHelper
  ){

    batchHelper.textContent =
      'Live Batch balance. Back Sale cannot exceed the remaining Batch Qty.';

  }

}


/* ============================================================
   VALIDATE BEFORE ADD
   ============================================================ */

function validateQty(){

  if(
    !isBatchReference()
  ){

    return true;

  }


  const item =
    getBatchItem();


  if(
    !item
  ){

    return true;

  }


  const entered =
    n(
      document
        .getElementById(
          'qty'
        )
        ?.value
    );


  const remaining =
    totalRemaining(
      item
    );


  if(
    entered
    <=
    0
  ){

    return true;

  }


  if(
    entered
    >
    remaining
    +
    EPS
  ){

    if(
      typeof setStatus
      ===
      'function'
    ){

      setStatus(

        'Qty '

        +

        qty(
          entered
        )

        +

        ' is greater than Batch Remaining '

        +

        qty(
          remaining
        )

        +

        '.',

        'error'

      );

    }


    return false;

  }


  return true;

}


/* ============================================================
   ADD BUTTON GUARD
   ============================================================ */

function wireAddGuard(){

  const button =
    document.getElementById(
      'addProductBtn'
    );


  if(
    !button
    ||
    button.dataset.bbLiveRemainingGuard
  ){

    return;

  }


  button.dataset.bbLiveRemainingGuard =
    '1';


  button.addEventListener(

    'click',

    event =>{


      if(
        !validateQty()
      ){

        event.preventDefault();

        event.stopImmediatePropagation();

        return false;

      }

    },

    true

  );

}


/* ============================================================
   EVENTS
   ============================================================ */

function wireEvents(){

  const batchSelect =
    document.getElementById(
      'batchSelect'
    );


  if(
    batchSelect
  ){

    batchSelect.addEventListener(

      'change',

      ()=>{

        setTimeout(
          updateLiveRemaining,
          0
        );


        setTimeout(
          updateLiveRemaining,
          100
        );

      }

    );

  }


  const productSearch =
    document.getElementById(
      'productSearchInput'
    );


  if(
    productSearch
  ){

    productSearch.addEventListener(

      'input',

      ()=>{

        setTimeout(
          updateLiveRemaining,
          0
        );

      }

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

      ()=>{

        /*
         * Legacy page assigns selectedProduct during this click.
         * Run immediately after it and once more after the DOM
         * settles so "Not Checked" cannot overwrite the value.
         */

        setTimeout(
          updateLiveRemaining,
          0
        );


        setTimeout(
          updateLiveRemaining,
          50
        );


        setTimeout(
          updateLiveRemaining,
          150
        );

      }

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

      ()=>{

        setTimeout(
          updateLiveRemaining,
          0
        );


        setTimeout(
          updateLiveRemaining,
          100
        );

      }

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
        updateLiveRemaining,
        50
      )

    );

  }


  if(
    flowOut
  ){

    flowOut.addEventListener(

      'click',

      ()=>setTimeout(
        updateLiveRemaining,
        50
      )

    );

  }


  wireAddGuard();

}


/* ============================================================
   WATCH LEGACY DOM CHANGES
   ============================================================ */

function observe(){

  const productCode =
    document.getElementById(
      'productCode'
    );


  const available =
    document.getElementById(
      'availableQty'
    );


  if(
    productCode
  ){

    const observer =
      new MutationObserver(
        ()=>setTimeout(
          updateLiveRemaining,
          0
        )
      );


    observer.observe(
      productCode,
      {
        attributes:true
      }
    );

  }


  /*
   * The legacy page may write "Not Checked" after our update.
   * This small observer immediately corrects it.
   */

  if(
    available
  ){

    let lastValue =
      available.value;


    setInterval(

      ()=>{

        if(
          !isBatchReference()
        ){

          lastValue =
            available.value;

          return;

        }


        const expectedItem =
          getBatchItem();


        if(
          !expectedItem
        ){

          return;

        }


        const expected =
          qty(
            totalRemaining(
              expectedItem
            )
          );


        if(
          available.value
          !==
          expected
        ){

          updateLiveRemaining();

        }


        lastValue =
          available.value;

      },

      250

    );

  }

}


/* ============================================================
   START
   ============================================================ */

function start(){

  wireEvents();

  observe();


  setTimeout(
    updateLiveRemaining,
    0
  );


  setTimeout(
    updateLiveRemaining,
    250
  );

}


if(
  document.readyState
  ===
  'loading'
){

  document.addEventListener(
    'DOMContentLoaded',
    start,
    {
      once:true
    }
  );

}else{

  start();

}


})();
