/* BIG BROTHER — Remaining / Cleared Damaged Stock Viewer V1 */
(function(){
  'use strict';

  const params=new URLSearchParams(location.search);
  const view=String(params.get('view')||'keyin').toLowerCase();
  if(view!=='keyin')return;

  const TYPE='DAMAGE_CLEAR';
  const $=id=>document.getElementById(id);
  const n=v=>Number(v)||0;
  const s=v=>String(v==null?'':v).trim();
  const h=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const qty=v=>n(v).toLocaleString(undefined,{maximumFractionDigits:3});
  const money=v=>'$'+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

  let mode='remaining';
  let damage={rows:[],totals:{}};
  let cleared={rows:[],totals:{}};
  let loading=false;

  function installStyle(){
    if($('bbDamageViewerStyle'))return;
    const style=document.createElement('style');
    style.id='bbDamageViewerStyle';
    style.textContent=`
      #damageStockViewer[hidden]{display:none!important}
      .bb-dmg-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
      .bb-dmg-tab{border:1px solid #cbd8e7;background:#fff;color:#53677d;border-radius:9px;padding:9px 12px;font-size:10px;font-weight:1000;cursor:pointer}
      .bb-dmg-tab.active{background:#173f77;border-color:#173f77;color:#fff}
      .bb-dmg-tools{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}
      .bb-dmg-tools input{min-width:260px;min-height:38px;border:1px solid #cbd8e7;border-radius:9px;padding:8px 10px;font:inherit;font-size:11px}
      .bb-dmg-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}
      .bb-dmg-kpi{border:1px solid #dce5ef;border-radius:10px;background:#fbfcfe;padding:10px}
      .bb-dmg-kpi small{display:block;color:#7b8da0;font-size:8px;font-weight:900;text-transform:uppercase}
      .bb-dmg-kpi strong{display:block;margin-top:4px;color:#173f77;font-size:14px}
      .bb-dmg-table{overflow:auto;border:1px solid #dce5ef;border-radius:10px}
      .bb-dmg-table table{min-width:950px}
      .bb-dmg-use{border:0;border-radius:7px;background:#eef5ff;color:#173f77;padding:6px 8px;font-size:9px;font-weight:900;cursor:pointer}
      .bb-dmg-badge{display:inline-block;border-radius:999px;background:#eef5ff;color:#245fae;padding:4px 7px;font-size:8px;font-weight:900}
      .bb-dmg-meta{margin-top:8px;color:#8797a8;font-size:9px}
      @media(max-width:800px){.bb-dmg-kpis{grid-template-columns:1fr 1fr}.bb-dmg-tools input{min-width:0;width:100%}}
      @media(max-width:520px){.bb-dmg-kpis{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function installViewer(){
    if($('damageStockViewer'))return;
    const productCard=$('manualProductPanel')?.closest('.card');
    if(!productCard)return;

    const card=document.createElement('div');
    card.id='damageStockViewer';
    card.className='card';
    card.hidden=true;
    card.innerHTML=`
      <div class="section-title">3. Damaged Stock Viewer</div>
      <div class="bb-dmg-tabs">
        <button type="button" id="bbDamageRemainingTab" class="bb-dmg-tab active">⚠️ Remaining Damaged Stock</button>
        <button type="button" id="bbDamageClearedTab" class="bb-dmg-tab">✅ Cleared Damaged Stock</button>
      </div>
      <div class="bb-dmg-tools">
        <input id="bbDamageSearch" placeholder="Search product / code / movement / clearance type">
        <button type="button" id="bbDamageRefresh" class="btn secondary">↻ Refresh Damaged Stock</button>
      </div>
      <div class="bb-dmg-kpis">
        <div class="bb-dmg-kpi"><small>Remaining Products</small><strong id="bbDmgRemainingProducts">0</strong></div>
        <div class="bb-dmg-kpi"><small>Remaining Qty</small><strong id="bbDmgRemainingQty">0</strong></div>
        <div class="bb-dmg-kpi"><small>Remaining Value</small><strong id="bbDmgRemainingValue">$0.00</strong></div>
        <div class="bb-dmg-kpi"><small>Total Cleared Cost</small><strong id="bbDmgClearedValue">$0.00</strong></div>
      </div>
      <div class="bb-dmg-table">
        <table>
          <thead id="bbDamageHead"></thead>
          <tbody id="bbDamageRows"><tr><td class="empty">Loading damaged stock...</td></tr></tbody>
        </table>
      </div>
      <div id="bbDamageMeta" class="bb-dmg-meta"></div>`;

    productCard.insertAdjacentElement('beforebegin',card);

    $('bbDamageRemainingTab').onclick=()=>{mode='remaining';render()};
    $('bbDamageClearedTab').onclick=()=>{mode='cleared';render()};
    $('bbDamageSearch').oninput=render;
    $('bbDamageRefresh').onclick=()=>load(true);
  }

  function isActive(){
    try{return movementType===TYPE}catch(_){return false}
  }

  function syncVisibility(){
    const card=$('damageStockViewer');
    if(card)card.hidden=!isActive();
    if(isActive()&&!(damage.rows||[]).length&&!(cleared.rows||[]).length)load(false);
  }

  function renderKpis(){
    $('bbDmgRemainingProducts').textContent=qty(damage.totals?.productCount);
    $('bbDmgRemainingQty').textContent=qty(damage.totals?.damagedQty);
    $('bbDmgRemainingValue').textContent=money(damage.totals?.damagedValue);
    $('bbDmgClearedValue').textContent=money(cleared.totals?.clearedValue);
  }

  function chooseProduct(code){
    if(!isActive())return;
    try{
      if(typeof selectProductSearch==='function'){
        selectProductSearch(code);
        $('qty')?.focus();
        setStatus('Damaged product selected from Remaining Damaged Stock. Enter Qty to clear.','success');
      }
    }catch(error){console.error(error)}
  }
  window.bbChooseDamagedProduct=chooseProduct;

  function renderRemaining(query){
    const rows=(Array.isArray(damage.rows)?damage.rows:[]).filter(r=>{
      const hay=[r.productName,r.productCode,r.category,r.unit].join(' ').toLowerCase();
      return !query||hay.includes(query);
    });

    $('bbDamageHead').innerHTML='<tr><th>Product</th><th>Code</th><th class="amount">Remaining Damaged</th><th>Unit</th><th class="amount">Average Cost</th><th class="amount">Remaining Value</th><th></th></tr>';
    $('bbDamageRows').innerHTML=rows.length?rows.map(r=>`<tr>
      <td><strong>${h(r.productName)}</strong></td>
      <td>${h(r.productCode)}</td>
      <td class="amount"><strong>${qty(r.damagedQty)}</strong></td>
      <td>${h(r.unit)}</td>
      <td class="amount">${money(r.averageCost)}</td>
      <td class="amount"><strong>${money(r.damagedValue)}</strong></td>
      <td><button type="button" class="bb-dmg-use" onclick="bbChooseDamagedProduct('${h(String(r.productCode).replace(/'/g,"&#39;"))}')">Use</button></td>
    </tr>`).join(''):'<tr><td colspan="7" class="empty">No remaining damaged stock.</td></tr>';
  }

  function renderCleared(query){
    const rows=(Array.isArray(cleared.rows)?cleared.rows:[]).filter(r=>{
      const hay=[r.productName,r.productCode,r.movementId,r.referenceNo,r.clearanceType,r.clearanceTypeLabel,r.controllerName,r.note].join(' ').toLowerCase();
      return !query||hay.includes(query);
    });

    $('bbDamageHead').innerHTML='<tr><th>Date</th><th>Clearance Type</th><th>Movement</th><th>Product</th><th>Code</th><th class="amount">Cleared Qty</th><th>Unit</th><th class="amount">Unit Cost</th><th class="amount">Cleared Cost</th><th>Reference</th></tr>';
    $('bbDamageRows').innerHTML=rows.length?rows.map(r=>`<tr>
      <td>${h(r.activityDate)}</td>
      <td><span class="bb-dmg-badge">${h(r.clearanceTypeLabel||r.clearanceType||'Not classified')}</span></td>
      <td>${h(r.movementId||'-')}</td>
      <td><strong>${h(r.productName)}</strong></td>
      <td>${h(r.productCode)}</td>
      <td class="amount"><strong>${qty(r.qty)}</strong></td>
      <td>${h(r.unit)}</td>
      <td class="amount">${money(r.unitCost)}</td>
      <td class="amount"><strong>${money(r.lineValue)}</strong></td>
      <td>${h(r.referenceNo||'-')}</td>
    </tr>`).join(''):'<tr><td colspan="10" class="empty">No cleared damaged stock yet.</td></tr>';
  }

  function render(){
    if(!$('damageStockViewer'))return;
    renderKpis();
    const q=s($('bbDamageSearch')?.value).toLowerCase();
    $('bbDamageRemainingTab').className='bb-dmg-tab'+(mode==='remaining'?' active':'');
    $('bbDamageClearedTab').className='bb-dmg-tab'+(mode==='cleared'?' active':'');

    if(mode==='cleared')renderCleared(q);
    else renderRemaining(q);

    $('bbDamageMeta').textContent=
      'Remaining stock revision: '+s(damage.revision||'-')+
      ' · Cleared stock revision: '+s(cleared.revision||'-')+
      ' · Last refresh: '+new Date().toLocaleTimeString();
  }

  async function load(showStatus){
    if(loading||!window.BBStockAdapter?.rpc)return;
    loading=true;
    if($('bbDamageRefresh'))$('bbDamageRefresh').disabled=true;
    if(showStatus)setStatus('Refreshing Remaining and Cleared Damaged Stock...');

    try{
      const [d,c]=await Promise.all([
        window.BBStockAdapter.rpc('bb_stock_damage_report'),
        window.BBStockAdapter.rpc('bb_stock_damage_cleared',{p_limit:1000})
      ]);
      damage=d||{rows:[],totals:{}};
      cleared=c||{rows:[],totals:{}};
      render();
      if(showStatus)setStatus('Remaining and Cleared Damaged Stock refreshed.','success');
    }catch(error){
      console.error(error);
      if(showStatus)setStatus(s(error?.message||error)||'Could not load Damaged Stock.','error');
      if($('bbDamageRows'))$('bbDamageRows').innerHTML='<tr><td class="empty">Could not load Damaged Stock viewer.</td></tr>';
    }finally{
      loading=false;
      if($('bbDamageRefresh'))$('bbDamageRefresh').disabled=false;
    }
  }

  installStyle();
  installViewer();

  const previousSetMovementType=setMovementType;
  setMovementType=function(type){
    const out=previousSetMovementType(type);
    syncVisibility();
    return out;
  };

  const previousSuccess=showSaveSuccess;
  showSaveSuccess=function(result,data){
    const out=previousSuccess.apply(this,arguments);
    if(data?.movementType===TYPE){
      setTimeout(()=>load(false),0);
    }
    return out;
  };

  syncVisibility();
})();
