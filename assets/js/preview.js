const previewChannel=('BroadcastChannel' in window)?new BroadcastChannel('aps-proof-studio'):null;
let previewPrintHandled=false;
let previewSyncSeq=0;

function setPreviewTheme(){
  document.documentElement.style.setProperty('--accent',state.accent||'#c9952f');
  document.documentElement.style.setProperty('--accent2',state.accent2||'#0a0a0a');
  document.body.dataset.mode=state.mode;
}

function setPreviewStatus(text,kind='info'){
  const el=document.getElementById('previewSyncStatus');
  if(el){
    el.textContent=text;
    el.dataset.kind=kind;
  }
}

function withTimeout(promise,ms,label='operação'){
  return Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' excedeu '+ms+' ms')),ms))
  ]);
}

function selectedFontCount(){
  let count=0;
  for(const model of state.models){
    for(const role of ['name','number']){
      const selected=model[`${role}FontPostscript`]||model[`${role}FontFamily`]||
        (model[`${role}FontFullName`]&&model[`${role}FontFullName`]!=='Fonte padrão do sistema'
          ?model[`${role}FontFullName`]:'');
      if(selected)count++;
    }
  }
  return count;
}

function renderPreviewImmediately(){
  setPreviewTheme();
  renderPreview();
}

async function installIncomingFonts(payload=[]){
  let attempted=0,installed=0;
  for(const item of payload){
    const model=getModel(item?.modelId);
    if(!model||!['name','number'].includes(item?.role))continue;
    const source=item.buffer||item.blob;
    if(!source)continue;
    attempted++;
    try{
      const ok=await withTimeout(
        registerFontSource(model,item.role,source,item.identity||''),
        3500,
        'carregamento da fonte'
      );
      if(ok)installed++;
    }catch(e){
      console.warn('Fonte do Preview não carregou',item?.modelId,item?.role,e);
    }
  }
  return {attempted,installed};
}

async function applyIncomingState(nextState,fontPayload=[]){
  const seq=++previewSyncSeq;
  if(nextState)state=normalizeState(nextState);

  // A prova nunca deve ficar bloqueada esperando fonte.
  renderPreviewImmediately();

  const expected=selectedFontCount();
  if(expected) setPreviewStatus(`Prova carregada • aplicando fontes 0/${expected}…`);
  else setPreviewStatus('Sincronizado agora');

  const result=await installIncomingFonts(fontPayload||[]);
  if(seq!==previewSyncSeq)return;

  // Reaplica os aliases somente depois de as FontFace estarem realmente prontas.
  applyRenderedFontAliases();

  if(expected){
    const ok=result.installed;
    const kind=ok>=expected?'ok':(ok>0?'warn':'error');
    setPreviewStatus(`Sincronizado • fontes ${ok}/${expected}`,kind);
  }else{
    setPreviewStatus('Sincronizado agora','ok');
  }

  if(new URLSearchParams(location.search).get('print')==='1'&&!previewPrintHandled){
    previewPrintHandled=true;
    setTimeout(()=>window.print(),250);
  }
}

async function loadStoredPreview(){
  setPreviewStatus('Abrindo projeto…');
  try{
    await withTimeout(openDB(),1800,'IndexedDB');
    const saved=await withTimeout(dbGet('current'),1800,'leitura do projeto');
    if(saved)state=normalizeState(saved);
  }catch(e){
    console.warn('Preview abriu sem aguardar armazenamento local',e);
  }

  renderPreviewImmediately();
  const expected=selectedFontCount();
  setPreviewStatus(expected?'Prova carregada • aguardando fontes…':'Prova carregada','ok');

  // Pede ao painel o estado e os arquivos de fonte já autorizados/carregados.
  previewChannel?.postMessage({type:'PREVIEW_READY',sentAt:Date.now()});

  // Se não houver painel aberto, o Preview continua utilizável.
  setTimeout(()=>{
    const el=document.getElementById('previewSyncStatus');
    if(el&&/aguardando fontes/i.test(el.textContent||'')){
      setPreviewStatus('Prova carregada • fonte pendente do painel','warn');
    }
  },1800);

  if(new URLSearchParams(location.search).get('print')==='1'&&!previewPrintHandled&&!expected){
    previewPrintHandled=true;
    setTimeout(()=>window.print(),250);
  }
}

previewChannel?.addEventListener('message',e=>{
  if(e.data?.type==='STATE'&&e.data.state){
    applyIncomingState(e.data.state,e.data.fonts||[]);
  }
});

document.getElementById('refreshPreviewBtn').onclick=()=>{
  previewChannel?.postMessage({type:'PREVIEW_READY',sentAt:Date.now()});
  loadStoredPreview();
};
document.getElementById('printPreviewBtn').onclick=()=>window.print();
window.addEventListener('beforeunload',()=>previewChannel?.close());

loadStoredPreview();
