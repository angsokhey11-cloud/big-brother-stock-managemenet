/* BIG BROTHER — Batch Driver Picker: all active staff V1 */
(function(){
  'use strict';

  function allActiveStaff(){
    try{
      return (Array.isArray(staff)?staff:[]).filter(function(x){
        return String(x?.status||'Active').trim().toLowerCase()==='active';
      });
    }catch(_){
      return [];
    }
  }

  function refreshDriverPickers(){
    const all=allActiveStaff();
    if(!all.length)return false;

    try{drivers=all;}catch(_){}

    const d1=document.getElementById('driverSelect');
    const d2=document.getElementById('driver2Select');
    if(!d1||!d2||typeof selectOptions!=='function')return false;

    const keep1=d1.value;
    const keep2=d2.value;
    const label=function(x){return x.staffName+' — '+x.staffId;};

    d1.innerHTML=selectOptions(all,label,'Select Driver 1');
    d2.innerHTML=selectOptions(all,label,'No Driver 2');

    if(keep1&&all.some(function(x){return x.staffId===keep1;}))d1.value=keep1;
    if(keep2&&all.some(function(x){return x.staffId===keep2;}))d2.value=keep2;

    return true;
  }

  const oldSplit=window.splitStaff;
  if(typeof oldSplit==='function'){
    window.splitStaff=function(){
      const result=oldSplit.apply(this,arguments);
      refreshDriverPickers();
      return result;
    };
  }

  const oldFill=window.fillSelectors;
  if(typeof oldFill==='function'){
    window.fillSelectors=function(){
      const all=allActiveStaff();
      if(all.length){try{drivers=all;}catch(_){}}
      const result=oldFill.apply(this,arguments);
      refreshDriverPickers();
      return result;
    };
  }

  let tries=0;
  (function ensure(){
    tries+=1;
    if(!refreshDriverPickers()&&tries<40)setTimeout(ensure,250);
  })();
})();
