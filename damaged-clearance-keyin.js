/* BIG BROTHER — Damaged Stock Cleared inside existing Stock In-Out Keyin V1 */
(function(){
  'use strict';

  const params=new URLSearchParams(location.search);
  const view=String(params.get('view')||'keyin').toLowerCase();
  if(view!=='keyin')return;

  const TYPE='DAMAGE_CLEAR';
  let clearanceTypes=[];

  function byId(id){return document.getElementById(id)}
  function selectedClearanceType(){
    const select=byId('damageClearanceTypeSelect');
    const code=String(select?.value||'').trim();
    return clearanceTypes.find(x=>String(x.typeCode||'')===code)||null;
  }

  function installCategory(){
    if(typeof FLOW_CATEGORIES==='undefined'||!FLOW_CATEGORIES.OUTFLOW)return;
    if(!FLOW_CATEGORIES.OUTFLOW.some(x=>x.value===TYPE)){
      FLOW_CATEGORIES.OUTFLOW.push({value:TYPE,label:'Damaged Stock Cleared'});
    }
  }

  function installFields(){
    if(byId('damageClearFields'))return;
    const anchor=byId('damageFields');
    if(!anchor)return;

    const box=document.createElement('div');
    box.id='damageClearFields';
    box.className='dynamic';
    box.hidden=true;
    box.innerHTML=`
      <div class="grid">
        <div class="field">
          <label>Damaged Stock Outflow</label>
          <select id="damageClearanceTypeSelect" disabled>
            <option value="">Loading 3 clearance options...</option>
          </select>
          <div id="damageClearanceTypeHelp" class="helper">Choose why this damaged stock is being cleared. This classification is saved permanently for later cost calculation.</div>
        </div>
      </div>
      <div class="helper" style="margin-top:7px">This movement reduces Damaged Stock only. Warehouse Good and Batch Pending do not change.</div>`;
    anchor.insertAdjacentElement('afterend',box);

    byId('damageClearanceTypeSelect').addEventListener('change',()=>{
      try{clearSaveRequestState()}catch(_){}
    });
  }

  async function loadClearanceTypes(){
    const select=byId('damageClearanceTypeSelect');
    const help=byId('damageClearanceTypeHelp');
    if(!select||!window.BBStockAdapter?.rpc)return;

    try{
      const result=await window.BBStockAdapter.rpc('bb_stock_damage_clearance_types');
      clearanceTypes=Array.isArray(result?.rows)?result.rows:[];

      select.innerHTML='<option value="">Select Damaged Stock outflow</option>'+clearanceTypes.map(x=>
        '<option value="'+esc(x.typeCode)+'">'+esc(x.label)+'</option>'
      ).join('');
      select.disabled=clearanceTypes.length===0;

      if(help){
        help.textContent=clearanceTypes.length
          ? clearanceTypes.length+' of 3 clearance option'+(clearanceTypes.length===1?'':'s')+' configured · selection is saved permanently for later cost calculation.'
          : 'The 3 clearance option names are not configured yet. Saving Damaged Stock Cleared is disabled until they are added.';
      }
    }catch(error){
      clearanceTypes=[];
      select.innerHTML='<option value="">Could not load clearance options</option>';
      select.disabled=true;
      if(help)help.textContent=String(error?.message||error);
    }
  }

  function syncMode(){
    const active=(typeof movementType!=='undefined'&&movementType===TYPE);
    const fields=byId('damageClearFields');
    if(fields)fields.hidden=!active;

    if(active){
      ['purchaseFields','receiveClientFields','newBatchFields','existingBatchFields','damageFields','allowanceFields'].forEach(id=>{
        const el=byId(id);if(el)el.hidden=true;
      });
      const save=byId('saveBtn');
      if(save)save.textContent='Save Damaged Stock Cleared';
      updateProductAvailability();
      updatePreview();
    }else{
      const save=byId('saveBtn');
      if(save&&save.textContent==='Save Damaged Stock Cleared')save.textContent='Save Stock Movement';
    }
  }

  installCategory();
  installFields();

  const baseCurrentAvailable=currentAvailable;
  currentAvailable=function(code){
    if(movementType===TYPE)return num(stockFor(code).damaged);
    return baseCurrentAvailable(code);
  };

  const baseAvailableLabel=availableLabel;
  availableLabel=function(){
    if(movementType===TYPE)return 'Damaged Stock';
    return baseAvailableLabel();
  };

  const baseManualProductPool=manualProductPool;
  manualProductPool=function(){
    if(movementType===TYPE){
      return products.filter(p=>num(stockFor(p.productCode).damaged)>0.000001);
    }
    return baseManualProductPool();
  };

  const baseMovementLabel=movementLabel;
  movementLabel=function(){
    if(movementType===TYPE){
      const chosen=selectedClearanceType();
      return chosen
        ? 'Damaged → Cleared · '+chosen.label
        : 'Damaged → Cleared';
    }
    return baseMovementLabel();
  };

  const baseDelta=delta;
  delta=function(item){
    if(movementType===TYPE){
      const q=num(item?.qty);
      return {warehouse:0,pending:0,damaged:-q,company:0};
    }
    return baseDelta(item);
  };

  const baseAddProduct=addProduct;
  addProduct=function(){
    if(movementType===TYPE){
      const p=selectedProduct;
      const q=num(byId('qty')?.value);
      if(!p)return setStatus('Select a damaged Product first.','error');
      if(!(q>0))return setStatus('Qty must be greater than 0.','error');
      const available=num(currentAvailable(p.productCode));
      if(q>available+0.000001){
        return setStatus(
          p.productName+': Qty '+q+' is greater than Damaged Stock '+available+'.',
          'error'
        );
      }
    }
    return baseAddProduct();
  };

  const baseBuildPayload=buildPayload;
  buildPayload=function(){
    const data=baseBuildPayload();
    if(movementType===TYPE){
      const chosen=selectedClearanceType();
      data.flow='OUTFLOW';
      data.movementType=TYPE;
      data.damageSource='';
      data.clearanceType=chosen?.typeCode||'';
      data.clearanceTypeLabel=chosen?.label||'';
    }
    return data;
  };

  const baseValidate=validate;
  validate=function(data){
    const error=baseValidate(data);
    if(error)return error;

    if(movementType===TYPE){
      if(!clearanceTypes.length)return 'The 3 Damaged Stock clearance options are not configured yet.';
      if(!String(data?.clearanceType||'').trim())return 'Select a Damaged Stock outflow option.';

      for(const item of data.items||[]){
        const available=num(stockFor(item.productCode).damaged);
        if(num(item.qty)>available+0.000001){
          return item.productName+': Qty '+num(item.qty)+' is greater than Damaged Stock '+available+'.';
        }
      }
    }

    return '';
  };

  const baseBuildSaveFingerprint=buildSaveFingerprint;
  buildSaveFingerprint=function(data){
    const base=JSON.parse(baseBuildSaveFingerprint(data));
    base.clearanceType=clean(data?.clearanceType);
    return JSON.stringify(base);
  };

  const baseSetMovementType=setMovementType;
  setMovementType=function(type){
    const result=baseSetMovementType(type);
    syncMode();
    return result;
  };

  const baseClearForm=clearForm;
  clearForm=function(){
    const result=baseClearForm();
    const select=byId('damageClearanceTypeSelect');
    if(select)select.value='';
    syncMode();
    return result;
  };

  /* Existing onclick handlers captured old function references; refresh only the two we wrap. */
  if(byId('addProductBtn'))byId('addProductBtn').onclick=addProduct;
  if(byId('clearBtn'))byId('clearBtn').onclick=clearForm;

  loadClearanceTypes();
  syncMode();
})();
