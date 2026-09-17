/* BIG BROTHER — Batch Incentive Eligibility V1
   Keeps the operational/accounting Salesman on the batch, while explicitly
   separating whether that batch has a real incentive-eligible salesperson. */
(function(){
'use strict';
if(window.BBBatchIncentiveModeV1)return;
window.BBBatchIncentiveModeV1=true;

const ASSIGNED='SALESPERSON_ASSIGNED';
const DRIVER_CARRY='NO_SALESPERSON_DRIVER_CARRY';
const $=id=>document.getElementById(id);

function install(){
  const host=$('newBatchFields');
  const salesman=$('salesmanSelect');
  if(!host||!salesman)return false;
  if($('bbBatchIncentiveMode'))return true;

  const grid=host.querySelector('.grid');
  const salesmanField=salesman.closest('.field');
  if(!grid||!salesmanField)return false;

  const field=document.createElement('div');
  field.className='field';
  field.id='bbBatchIncentiveModeField';
  field.innerHTML=`
    <label>Sales Assignment</label>
    <select id="bbBatchIncentiveMode">
      <option value="${ASSIGNED}">Salesperson Assigned — Incentive Eligible</option>
      <option value="${DRIVER_CARRY}">Driver Carry — No Incentive Salesperson</option>
    </select>
    <div class="helper" id="bbBatchIncentiveModeHelp">The selected Salesman is eligible for Batch Sales Incentive.</div>`;
  grid.insertBefore(field,salesmanField);

  let salesmanHelp=$('bbBatchSalesmanModeHelp');
  if(!salesmanHelp){
    salesmanHelp=document.createElement('div');
    salesmanHelp.id='bbBatchSalesmanModeHelp';
    salesmanHelp.className='helper';
    salesmanField.appendChild(salesmanHelp);
  }

  const select=$('bbBatchIncentiveMode');
  function apply(){
    const driverCarry=select.value===DRIVER_CARRY;
    const label=salesmanField.querySelector('label');
    if(label)label.textContent=driverCarry?'Accounting Salesman / Batch Owner':'Salesman';
    $('bbBatchIncentiveModeHelp').textContent=driverCarry
      ? 'No salesperson earns incentive from this carry batch. Admin Batch Earning Review will require Incentive Reject.'
      : 'The selected Salesman is incentive-eligible for this batch.';
    salesmanHelp.textContent=driverCarry
      ? 'Still required for invoice clearing / batch responsibility. This name does NOT make the batch incentive-eligible.'
      : 'This person is the incentive-eligible salesperson for the batch.';
    field.style.borderColor=driverCarry?'#e5c77e':'';
  }
  select.addEventListener('change',apply);
  apply();

  const baseBuild=window.buildPayload;
  if(typeof baseBuild==='function'&&!baseBuild.__bbIncentiveWrapped){
    const wrapped=function(){
      const d=baseBuild.apply(this,arguments)||{};
      try{
        if(typeof movementType!=='undefined'&&movementType==='BATCH_STOCK'){
          d.incentiveMode=$('bbBatchIncentiveMode')?.value||ASSIGNED;
        }
      }catch(_){
        d.incentiveMode=$('bbBatchIncentiveMode')?.value||ASSIGNED;
      }
      return d;
    };
    wrapped.__bbIncentiveWrapped=true;
    window.buildPayload=wrapped;
  }

  const baseClear=window.clearForm;
  if(typeof baseClear==='function'&&!baseClear.__bbIncentiveWrapped){
    const wrappedClear=function(){
      const result=baseClear.apply(this,arguments);
      const el=$('bbBatchIncentiveMode');
      if(el){el.value=ASSIGNED;apply();}
      return result;
    };
    wrappedClear.__bbIncentiveWrapped=true;
    window.clearForm=wrappedClear;
  }

  return true;
}

let tries=0;
function boot(){
  tries+=1;
  if(!install()&&tries<80)setTimeout(boot,150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
