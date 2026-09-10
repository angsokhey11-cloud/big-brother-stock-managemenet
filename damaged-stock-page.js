/* BIG BROTHER — Dedicated Damaged Stock workspace */
(function(){
'use strict';

const params=new URLSearchParams(location.search);
if(String(params.get('view')||'').toLowerCase()!=='damaged')return;

const $=id=>document.getElementById(id);

function decorate(){
  document.title='BIG BROTHER — Damaged Stock';

  const title=document.querySelector('.topbar h1');
  if(title)title.textContent='⚠️ Damaged Stock';

  const subtitle=document.querySelector('.topbar .subtitle');
  if(subtitle)subtitle.textContent='Record damaged stock from Warehouse or an OPEN Batch. Good Stock moves into the Damaged Stock bucket and remains fully traceable in Supabase.';

  const db=document.getElementById('dbPill');
  if(db)db.textContent='SUPABASE DAMAGED STOCK';

  const cards=document.querySelectorAll('.card');
  const firstTitle=cards[0]?.querySelector('.section-title');
  if(firstTitle)firstTitle.textContent='1. Damage Transaction';
  const secondTitle=cards[1]?.querySelector('.section-title');
  if(secondTitle)secondTitle.textContent='2. Damage Details';

  const flowWrap=$('flowOutBtn')?.parentElement;
  if(flowWrap)flowWrap.style.display='none';

  const movementGrid=$('movementCategorySelect')?.closest('.grid');
  if(movementGrid)movementGrid.style.display='none';

  const save=$('saveBtn');
  if(save)save.textContent='Save Damaged Stock';

  const clear=$('clearBtn');
  if(clear)clear.textContent='Clear Form';
}

function activateDamageMode(){
  try{
    if(typeof window.setFlow==='function')window.setFlow('OUTFLOW');
    if(typeof window.setMovementType==='function')window.setMovementType('STOCK_DAMAGE');
  }catch(error){
    console.error('Could not activate Damaged Stock mode',error);
  }
  decorate();
}

/* The legacy page is written first, then this file runs from the wrapper. */
activateDamageMode();

/* Keep this dedicated route locked to STOCK_DAMAGE after Clear Form as well. */
const oldClear=window.clearForm;
if(typeof oldClear==='function'){
  window.clearForm=function(){
    const out=oldClear.apply(this,arguments);
    try{
      if(typeof window.setFlow==='function'&&String(window.flow||'')!=='OUTFLOW')window.setFlow('OUTFLOW');
      if(typeof window.setMovementType==='function'&&String(window.movementType||'')!=='STOCK_DAMAGE')window.setMovementType('STOCK_DAMAGE');
    }catch(_){}
    decorate();
    return out;
  };
  if($('clearBtn'))$('clearBtn').onclick=window.clearForm;
}

/* Hidden controls should never be able to switch this route to another movement. */
const movementSelect=$('movementCategorySelect');
if(movementSelect){
  movementSelect.addEventListener('change',()=>{
    if(movementSelect.value!=='STOCK_DAMAGE'){
      try{window.setMovementType('STOCK_DAMAGE')}catch(_){}
    }
  });
}

window.addEventListener('pageshow',decorate);
})();
