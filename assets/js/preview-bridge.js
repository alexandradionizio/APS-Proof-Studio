const apsPreviewChannel=('BroadcastChannel' in window)?new BroadcastChannel('aps-proof-studio'):null;
let apsPreviewWindow=null;

function broadcastPreviewState(){
  try{
    apsPreviewChannel?.postMessage({type:'STATE',state:deep(state),sentAt:Date.now()});
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

window.addEventListener('beforeunload',()=>apsPreviewChannel?.close());
