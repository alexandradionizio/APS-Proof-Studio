window.apsGetPreviewFontSource=async function(modelId,role){
  const model=getModel(modelId);
  if(!model||!['name','number'].includes(role))return null;
  if(typeof isOwnTypographyModel==='function'&&!isOwnTypographyModel(model))return null;

  const token=typeof selectedFontToken==='function'
    ?selectedFontToken(model,role)
    :(model[`${role}FontPostscript`]||'');
  if(!token)return null;

  try{
    const ps=model[`${role}FontPostscript`]||'';
    const fam=model[`${role}FontFamily`]||'';
    const full=model[`${role}FontFullName`]||'Fonte padrão do sistema';

    const item=
      localFonts.find(f=>ps&&fontId(f)===ps)||
      localFonts.find(f=>full&&f.fullName===full)||
      localFonts.find(f=>!ps&&fam&&f.family===fam);

    if(item){
      const identity=fontId(item);
      if(identity!==token)return null;
      const blob=await item.blob();
      return {buffer:await blob.arrayBuffer(),identity};
    }

    if(db){
      const cached=await dbGet(fontBlobKey(model,role));
      const blob=cached instanceof Blob?cached:cached?.blob;
      const identity=cached?.id||cached?.postscriptName||'';
      if(blob instanceof Blob&&identity===token){
        return {buffer:await blob.arrayBuffer(),identity};
      }
      if(blob&&identity!==token){
        try{await dbDelete(fontBlobKey(model,role))}catch{}
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
