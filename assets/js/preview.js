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
  try{
    await Promise.all(state.models.flatMap(m=>[
      loadFontFace(m,'name'),
      loadFontFace(m,'number')
    ]));
  }catch(e){
    console.warn('Preview cached fonts unavailable',e);
  }
}

async function renderDetachedPreview(nextState=null,fontPayload=[]){
  if(nextState) state=normalizeState(nextState);
  setPreviewTheme();
  if(fontPayload?.length && typeof installPreviewFontPayload==='function'){
    await installPreviewFontPayload(fontPayload);
  }
  await loadPreviewFonts();
  renderPreview();
  setPreviewStatus('Sincronizado agora');
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
