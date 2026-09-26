const previewChannel=('BroadcastChannel' in window)?new BroadcastChannel('aps-proof-studio'):null;
let previewPrintHandled=false;

function setPreviewTheme(){
  document.documentElement.style.setProperty('--accent',state.accent||'#c9952f');
  document.documentElement.style.setProperty('--accent2',state.accent2||'#0a0a0a');
  document.body.dataset.mode=state.mode;
}

function setPreviewStatus(text){
  const el=document.getElementById('previewSyncStatus');
  if(el) el.textContent=text;
}

async function loadPreviewFonts(){
  let requested=0,installed=0;
  try{
    if(window.opener && !window.opener.closed && typeof window.opener.apsGetPreviewFontSource==='function'){
      for(const model of state.models){
        for(const role of ['name','number']){
          const selected=model[`${role}FontPostscript`]||model[`${role}FontFamily`]||
            (model[`${role}FontFullName`]&&model[`${role}FontFullName`]!=='Fonte padrão do sistema'?model[`${role}FontFullName`]:'');
          if(!selected) continue;
          requested++;
          const payload=await window.opener.apsGetPreviewFontSource(model.id,role);
          if(payload?.buffer){
            if(await registerFontSource(model,role,payload.buffer,payload.identity||selected)) installed++;
          }
        }
      }
    }

    if(installed<requested){
      for(const model of state.models){
        for(const role of ['name','number']){
          const selected=model[`${role}FontPostscript`]||model[`${role}FontFamily`]||
            (model[`${role}FontFullName`]&&model[`${role}FontFullName`]!=='Fonte padrão do sistema'?model[`${role}FontFullName`]:'');
          if(!selected) continue;
          const key=`${model.id}:${role}`;
          if(fontAliases.has(key)) continue;
          if(await loadFontFace(model,role)) installed++;
        }
      }
    }
  }catch(e){
    console.warn('Preview local fonts unavailable',e);
  }
  return {requested,installed};
}

async function renderDetachedPreview(nextState=null,fontPayload=[]){
  if(nextState) state=normalizeState(nextState);
  setPreviewTheme();
  if(fontPayload?.length && typeof installPreviewFontPayload==='function'){
    await installPreviewFontPayload(fontPayload);
  }
  const fontResult=await loadPreviewFonts();
  renderPreview();
  const fontText=fontResult.requested
    ? ` • fontes ${fontResult.installed}/${fontResult.requested}`
    : '';
  setPreviewStatus('Sincronizado agora'+fontText);
  if(new URLSearchParams(location.search).get('print')==='1' && !previewPrintHandled){
    previewPrintHandled=true;
    setTimeout(()=>window.print(),300);
  }
}

async function loadStoredPreview(){
  try{
    await openDB();
    const saved=await dbGet('current');
    if(saved) state=normalizeState(saved);
  }catch(e){console.warn(e)}
  await renderDetachedPreview();
}

previewChannel?.addEventListener('message',e=>{
  if(e.data?.type==='STATE'&&e.data.state){
    renderDetachedPreview(e.data.state,e.data.fonts||[]);
  }
});

document.getElementById('refreshPreviewBtn').onclick=loadStoredPreview;
document.getElementById('printPreviewBtn').onclick=()=>window.print();
window.addEventListener('beforeunload',()=>previewChannel?.close());

loadStoredPreview();
