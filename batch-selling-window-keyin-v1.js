/* BIG BROTHER — Batch Issue Selling Date Window V1 · desktop + mobile */
(function(){
'use strict';
if(window.BBBatchSellingWindowKeyinV1)return;window.BBBatchSellingWindowKeyinV1=true;
const $=id=>document.getElementById(id);
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):'';
let previousActivity='';
let fromInput,toInput,hint;
function isIssue(){return (typeof movementType!=='undefined'?String(movementType):'')==='BATCH_STOCK'}
function updateHint(){
 if(!hint||!fromInput||!toInput)return;
 const a=iso(fromInput.value),b=iso(toInput.value);
 const invalid=!a||!b||a>b;
 hint.style.color=invalid?'#bd3c3c':'#2f6d4e';
 hint.textContent=invalid?'Select a valid From Date and To Date.':
  a===b?'Allowed selling day: '+a+'. Invoice Generator will restrict staff to this date.':
   'Allowed selling dates: '+a+' through '+b+' (inclusive). Invoice Generator will enforce these dates.';
}
function syncActivity(){
 const current=iso($('activityDate')?.value);
 if(!current)return;
 if(!fromInput.value||fromInput.value===previousActivity)fromInput.value=current;
 if(!toInput.value||toInput.value===previousActivity)toInput.value=current;
 previousActivity=current;updateHint();
}
function install(){
 const parent=$('newBatchFields');
 if(!parent||$('bbBatchSellingWindowKeyin'))return;
 const css=document.createElement('style');
 css.textContent='#bbBatchSellingWindowKeyin{margin:12px 0;padding:13px;border:1px solid #a9c9e5;border-radius:10px;background:#f1f8ff}'+
 '#bbBatchSellingWindowKeyin>strong{display:block;font-size:14px;color:#174974;margin-bottom:6px}'+
 '#bbBatchSellingWindowKeyin .bb-selling-dates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}'+
 '#bbBatchSellingWindowKeyin label{font-size:12px;font-weight:700;color:#274d71;display:flex;flex-direction:column;gap:4px}'+
 '#bbBatchSellingWindowKeyin input{font:inherit;width:100%;box-sizing:border-box;min-height:40px;padding:8px;border:1px solid #b0c8df;border-radius:8px;background:#fff}'+
 '#bbBatchSellingWindowKeyin .bb-selling-hint{font-size:12px;font-weight:600;margin-top:7px;line-height:1.5}'+
 '@media(max-width:480px){#bbBatchSellingWindowKeyin .bb-selling-dates{grid-template-columns:1fr}}';
 document.head.appendChild(css);
 const card=document.createElement('section');card.id='bbBatchSellingWindowKeyin';
 const label=document.createElement('strong');label.textContent='Batch Selling Date Range · Staff Restriction';
 const line=document.createElement('div');line.className='bb-selling-dates';
 const make=(id,title)=>{
  const wrapper=document.createElement('label');
  wrapper.textContent=title;
  const input=document.createElement('input');input.type='date';input.id=id;input.required=true;
  input.addEventListener('input',updateHint);input.addEventListener('change',updateHint);
  wrapper.append(input);line.append(wrapper);return input;
 };
 fromInput=make('bbBatchSellingFrom','Allowed From Date');
 toInput=make('bbBatchSellingTo','Allowed To Date');
 hint=document.createElement('div');hint.className='bb-selling-hint';
 card.append(label,line,hint);
 const explanation=document.createElement('small');
 explanation.textContent='Set one day or a multi-day trip. Staff can save Batch invoices only within this range; Admin corrections remain separate.';
 explanation.style.cssText='display:block;color:#536b80;font-size:11px;margin-top:6px';
 card.append(explanation);parent.append(card);
 $('activityDate')?.addEventListener('change',syncActivity);
 $('activityDate')?.addEventListener('input',syncActivity);
 syncActivity();
}
const originalBuild=window.buildPayload;
if(typeof originalBuild==='function'){
 window.buildPayload=function(){
  const payload=originalBuild.apply(this,arguments);
  if(isIssue()){
   if(!fromInput||!toInput)install();
   payload.sellingDateFrom=String(fromInput?.value||'');
   payload.sellingDateTo=String(toInput?.value||'');
  }
  return payload;
 };
}
const originalValidate=window.validate;
if(typeof originalValidate==='function'){
 window.validate=function(payload){
  const error=originalValidate.apply(this,arguments);
  if(error)return error;
  if(isIssue()){
   const start=iso(payload.sellingDateFrom),end=iso(payload.sellingDateTo);
   if(!start||!end)return 'Set both Allowed Batch Selling Dates before issuing stock.';
   if(start>end)return 'Batch Allowed From Date cannot be later than To Date.';
  }
  return '';
 };
}
const originalFingerprint=window.buildSaveFingerprint;
if(typeof originalFingerprint==='function'){
 window.buildSaveFingerprint=function(data){
  const result=originalFingerprint.apply(this,arguments);
  return String(data?.movementType)==='BATCH_STOCK'
   ? result+'|SellingFrom:'+String(data.sellingDateFrom||'')+'|SellingTo:'+String(data.sellingDateTo||'')
   : result;
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();