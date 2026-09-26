window.apsGetPreviewFontSource=async function(modelId,role){
  const model=getModel(modelId);
  if(!model||!['name','number'].includes(role)) return null;
  const ps=model[`${role}FontPostscript`]||'';
  const fam=model[`${role}FontFamily`]||'';
  const full=model[`${role}FontFullName`]||'Fonte padrão do sistema';
  const token=ps||fam||(full!=='Fonte padrão do sistema'?full:'');
  if(!token) return null;

  try{
    const item=
      localFonts.find(f=>ps&&fontId(f)===ps)||
      localFonts.find(f=>full&&f.fullName===full)||
      localFonts.find(f=>fam&&f.family===fam);

    if(item){
      const blob=await item.blob();
      const buffer=await blob.arrayBuffer();
      return {buffer,identity:fontId(item)||token};
    }

    if(db){
      const cached=await dbGet(fontBlobKey(model,role));
      const blob=cached instanceof Blob?cached:cached?.blob;
      if(blob instanceof Blob){
        return {buffer:await blob.arrayBuffer(),identity:cached?.id||token};
      }
    }
  }catch(e){
    console.warn('Não foi possível fornecer a fonte ao Preview',e);
  }
  return null;
};

const apsPreviewChannel=('BroadcastChannel' in window)?new BroadcastChannel('aps-proof-studio'):null;
let apsPreviewWindow=null;

function broadcastPreviewState(){
  try{
    const fonts=(typeof getPreviewFontPayload==='function')?getPreviewFontPayload():[];
    apsPreviewChannel?.postMessage({
      type:'STATE',
      state:deep(state),
      fonts,
      sentAt:Date.now()
    });
  }catch(e){console.warn('Preview sync failed',e)}
}

const apsBaseUpdate=update;
update=function(){
  apsBaseUpdate();
  broadcastPreviewState();
};

function openPreviewWindow(printAfter=false){
  const url='preview.html'+(printAfter?'?print=1':'');
  apsPreviewWindow=window.open(url,'APSProofStudioPreview','width=1180,height=900,resizable=yes,scrollbars=yes');
  if(!apsPreviewWindow){
    alert('O navegador bloqueou a janela de preview. Libere pop-ups para o APS Proof Studio.');
    return;
  }
  setTimeout(broadcastPreviewState,350);
  setTimeout(broadcastPreviewState,1200);
}

const previewBtn=document.getElementById('previewBtn');
if(previewBtn) previewBtn.onclick=()=>openPreviewWindow(false);
const printBtn=document.getElementById('printBtn');
if(printBtn) printBtn.onclick=()=>openPreviewWindow(true);

const saveNote=document.getElementById('saveNote');
if(saveNote){
  const obs=new MutationObserver(()=>{
    const text=saveNote.textContent||'';
    saveNote.classList.toggle('saving',/Salvando/i.test(text));
    saveNote.classList.toggle('error',/Não foi possível/i.test(text));
  });
  obs.observe(saveNote,{childList:true,characterData:true,subtree:true});
}

apsPreviewChannel?.addEventListener('message',e=>{
  if(e.data?.type==='PREVIEW_READY'){
    broadcastPreviewState();
  }
});

window.addEventListener('beforeunload',()=>apsPreviewChannel?.close());
