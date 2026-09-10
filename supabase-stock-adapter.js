/* BIG BROTHER — Stock Management Supabase Adapter V1 */
(function(){
  'use strict';

  const URL='https://sjfhlaclgmkwwofzstok.supabase.co';
  const KEY='sb_publishable_w762jR65CWwlO30fKQsYOw_6L9grx8S';
  const SESSION_KEY='BB_SUPABASE_DEV_SESSION_V1';
  let session=null;
  let referenceCache=null;
  let referenceCacheAt=0;

  function readSession(){
    try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}
    catch(_){return null}
  }

  function saveSession(s){
    session=s||null;
    try{
      if(!s){localStorage.removeItem(SESSION_KEY);return;}
      if(!s.expires_at&&s.expires_in){
        s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in);
      }
      localStorage.setItem(SESSION_KEY,JSON.stringify(s));
    }catch(_){}
  }

  async function parse(response){
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}
    catch(_){data={message:text}}
    if(!response.ok){
      throw new Error(
        data.message||data.error_description||data.error||
        ('Supabase request failed ('+response.status+')')
      );
    }
    return data;
  }

  async function refreshSession(){
    const current=readSession();
    if(!current?.refresh_token){
      throw new Error('Please sign in to BIG BROTHER first.');
    }
    const response=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{
      method:'POST',
      headers:{apikey:KEY,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:current.refresh_token})
    });
    const next=await parse(response);
    saveSession(next);
    return next;
  }

  async function ensureSession(){
    session=readSession();
    if(!session?.access_token){
      throw new Error('Please sign in to BIG BROTHER first.');
    }
    const now=Math.floor(Date.now()/1000);
    if(session.expires_at&&Number(session.expires_at)<now+30){
      await refreshSession();
    }
    return session;
  }

  async function rpc(fn,args={}){
    await ensureSession();
    const response=await fetch(URL+'/rest/v1/rpc/'+fn,{
      method:'POST',
      headers:{
        apikey:KEY,
        Authorization:'Bearer '+session.access_token,
        'Content-Type':'application/json'
      },
      body:JSON.stringify(args||{}),
      cache:'no-store'
    });
    return parse(response);
  }

  async function references(force=false){
    const now=Date.now();
    if(!force&&referenceCache&&now-referenceCacheAt<15000){
      return referenceCache;
    }
    referenceCache=await rpc('bb_stock_references');
    referenceCacheAt=now;
    return referenceCache;
  }

  async function jsonp(_url,params={}){
    const action=String(params?.action||'');
    switch(action){
      case 'stockKeyinFast':
      case 'getStockKeyinFastData':
        return rpc('bb_stock_keyin_fast');

      case 'revision':
        return rpc('bb_stock_revision');

      case 'movementByRequestId':
        return rpc('bb_stock_movement_by_request_id',{
          p_request_id:String(params.requestId||'')
        });

      case 'getPurchaseReceivingList':
        return rpc('bb_stock_purchase_receiving_list',{
          p_limit:Number(params.limit||400)
        });

      case 'getPurchaseReceivingDetail':
        return rpc('bb_stock_purchase_receiving_detail',{
          p_purchase_id:String(params.purchaseId||'')
        });

      case 'stockKeyinReferencesFast':
        return references(true);

      case 'getStaff': {
        const r=await references();
        return {success:true,data:Array.isArray(r.staff)?r.staff:[]};
      }

      case 'getProducts':
      case 'products': {
        const r=await references();
        return {success:true,data:Array.isArray(r.products)?r.products:[]};
      }

      case 'getLocations':
      case 'locations': {
        const r=await references();
        return {success:true,data:Array.isArray(r.locations)?r.locations:[]};
      }

      case 'getCustomers':
      case 'customers': {
        const r=await references();
        return {success:true,data:Array.isArray(r.customers)?r.customers:[]};
      }

      case 'getClients':
      case 'clients': {
        const r=await references();
        return {success:true,data:Array.isArray(r.clients)?r.clients:[]};
      }

      default:
        throw new Error('Unsupported Stock read action: '+action);
    }
  }

  async function apiPost(action,payload={}){
    switch(String(action||'')){
      case 'saveStockMovement':
        return rpc('bb_stock_save_movement',{p_payload:payload||{}});
      default:
        throw new Error('Unsupported Stock write action: '+action);
    }
  }

  function clearLegacyCaches(){
    try{
      [
        'bb_stock_keyin_v24_cache',
        'bb_stock_keyin_v20_cache',
        'bb_stock_report_smart_cache_v15'
      ].forEach(key=>localStorage.removeItem(key));
    }catch(_){}
  }

  clearLegacyCaches();
  window.BBStockAdapter={rpc,jsonp,apiPost,references,clearLegacyCaches};
})();