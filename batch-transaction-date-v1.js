/* BIG BROTHER: dedicated Batch Stock to Salesman transaction date.
   The existing activityDate is the canonical field sent to saveStockMovement. */
(function(){
  function init(){
    const root=document.getElementById('newBatchFields');
    const original=document.getElementById('activityDate');
    const salesman=document.getElementById('salesmanSelect');
    if(!root||!original||!salesman||document.getElementById('bbBatchTransactionDate'))return;
    const field=document.createElement('div');
    field.className='field';
    field.innerHTML='<label for="bbBatchTransactionDate">Batch Transaction Date</label><input type="date" id="bbBatchTransactionDate" required><div class="helper">Past, today, and future dates allowed.</div>';
    salesman.closest('.field').insertAdjacentElement('afterend',field);
    const dedicated=field.querySelector('input');
    const localToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
    function isBatch(){const category=document.getElementById('movementCategorySelect');return category?.value==='BATCH_STOCK'}
    function syncFromOriginal(){if(isBatch())dedicated.value=original.value||localToday()}
    dedicated.addEventListener('input',()=>{if(!isBatch())return;original.value=dedicated.value;original.dispatchEvent(new Event('change',{bubbles:true}))});
    original.addEventListener('change',syncFromOriginal);
    const category=document.getElementById('movementCategorySelect');
    category?.addEventListener('change',()=>setTimeout(syncFromOriginal,0));
    document.getElementById('flowOutBtn')?.addEventListener('click',()=>setTimeout(syncFromOriginal,0));
    // Re-sync after legacy save resets the main transaction date.
    const observer=new MutationObserver(()=>{if(!root.hidden&&isBatch()&&document.activeElement!==dedicated&&dedicated.value!==original.value)syncFromOriginal()});
    observer.observe(root,{attributes:true,attributeFilter:['hidden']});
    syncFromOriginal();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();