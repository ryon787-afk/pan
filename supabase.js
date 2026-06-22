// Supabase接続設定
const SUPABASE_URL = 'https://zrisjqabhrcguvtctqtp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UOPVBEAm3tMq-ckQWu_cqA_H1X6Y8Sv';
const CLOUD_TABLE = 'bakery_cloud_data';
const SAVE_ID = 'kubochan-pan-main';
const client = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let cloudReady = false;
let savingCloud = false;
let lastCloudJson = '';
let syncTimer = null;
let channel = null;

async function initCloud(){
  if(!client){setSync('Supabaseライブラリを読み込めませんでした。ローカル保存で動作中です。','err');return;}
  setSync('Supabaseに接続中...','warn');
  const {data,error} = await client.from(CLOUD_TABLE).select('id,data,updated_at').eq('id',SAVE_ID).maybeSingle();
  if(error){
    setSync('Supabase未接続：テーブル作成・RLS設定を確認してください。ローカル保存で動作中です。','err');
    console.error('Supabase load error:', error);
    return;
  }
  if(data && data.data){
    const d=data.data;
    reservations = Array.isArray(d.reservations) ? d.reservations : reservations;
    sales = Array.isArray(d.sales) ? d.sales : sales;
    products = Array.isArray(d.products) ? d.products : products;
    localPersist();
  } else {
    await saveCloudNow(true);
  }
  cloudReady = true;
  lastCloudJson = JSON.stringify(makeCloudPayload());
  setSync('Supabase同期中：他のスマホにも自動反映されます。','ok');
  render();
  setupRealtime();
}

function setupRealtime(){
  if(!client) return;
  channel = client.channel('bakery-cloud-sync-'+SAVE_ID)
    .on('postgres_changes',{event:'*',schema:'public',table:CLOUD_TABLE,filter:'id=eq.'+SAVE_ID}, payload => {
      if(savingCloud) return;
      const d=(payload.new && payload.new.data) ? payload.new.data : null;
      if(!d) return;
      const json=JSON.stringify(d);
      if(json===lastCloudJson) return;
      reservations = Array.isArray(d.reservations) ? d.reservations : reservations;
      sales = Array.isArray(d.sales) ? d.sales : sales;
      products = Array.isArray(d.products) ? d.products : products;
      lastCloudJson = json;
      localPersist();
      render();
      toast('他の端末の変更を反映しました');
    })
    .subscribe(status => {
      if(status==='SUBSCRIBED') setSync('Supabase同期中：自動反映されます。','ok');
    });
}

async function saveCloudNow(initial=false){
  if(!client) return;
  const payload=makeCloudPayload();
  const json=JSON.stringify(payload);
  if(!initial && json===lastCloudJson) return;
  savingCloud = true;
  const {error} = await client.from(CLOUD_TABLE).upsert({id:SAVE_ID,data:payload,updated_at:new Date().toISOString()},{onConflict:'id'});
  savingCloud = false;
  if(error){setSync('Supabase保存に失敗しました。ローカルには保存済みです。','err'); console.error('Supabase save error:', error); toast('Supabase保存に失敗しました','err'); return;}
  cloudReady = true;
  lastCloudJson = json;
  setSync('Supabase同期中：保存済みです。','ok');
}
