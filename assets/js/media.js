const VISUAL_FILE_ACCEPT='.png,.jpg,.jpeg,.webp,.svg,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf';

function visualFileExtension(file){
  const name=String(file?.name||'').toLowerCase();
  const m=name.match(/\.([a-z0-9]+)$/);
  return m?m[1]:'';
}

function isPdfVisualFile(file){
  return !!file&&(file.type==='application/pdf'||visualFileExtension(file)==='pdf');
}

function isSupportedVisualFile(file){
  if(!file)return false;
  const ext=visualFileExtension(file);
  return file.type?.startsWith('image/')||['png','jpg','jpeg','webp','svg','pdf'].includes(ext);
}

async function pdfToPngDataURL(file){
  if(!window.pdfjsLib){
    throw new Error('O conversor de PDF não carregou. Verifique a internet e recarregue o APS.');
  }

  const bytes=new Uint8Array(await file.arrayBuffer());
  const pdf=await window.pdfjsLib.getDocument({data:bytes}).promise;

  if(!pdf.numPages)throw new Error('O PDF não possui páginas.');

  const page=await pdf.getPage(1);
  const base=page.getViewport({scale:1});
  const longest=Math.max(base.width,base.height);
  const scale=Math.min(4,Math.max(1.5,1800/Math.max(1,longest)));
  const viewport=page.getViewport({scale});

  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:true});

  if(!ctx)throw new Error('Não foi possível criar a imagem do PDF.');

  ctx.clearRect(0,0,canvas.width,canvas.height);

  await page.render({
    canvasContext:ctx,
    viewport
  }).promise;

  const png=canvas.toDataURL('image/png');
  try{await pdf.destroy()}catch{}
  return png;
}

async function visualFileToDataURL(file){
  if(!isSupportedVisualFile(file)){
    throw new Error('Formato não suportado. Use PNG, JPG, JPEG, WEBP, SVG ou PDF.');
  }
  if(isPdfVisualFile(file))return await pdfToPngDataURL(file);
  return await fileToDataURL(file);
}

async function applyVisualFile(file,target,id,modelId){
  if(!file)return;
  if(!isSupportedVisualFile(file)){
    alert('Formato não suportado. Use PNG, JPG, JPEG, WEBP, SVG ou PDF.');
    return;
  }

  try{
    const data=await optimizeImage(file,target);
    setImage(target,data,id,modelId);
  }catch(err){
    console.error('Falha ao carregar arquivo visual',err);
    alert(err?.message||'Não consegui carregar este arquivo.');
  }
}

const imagePicker=$('#imagePicker');
imagePicker.accept=VISUAL_FILE_ACCEPT;

imagePicker.onchange=async e=>{
  const f=e.target.files?.[0];
  if(!f||!imageTarget)return;
  await applyVisualFile(f,imageTarget.target,imageTarget.id,imageTarget.modelId);
  e.target.value='';
};

document.addEventListener('click',e=>{
  const dz=e.target.closest('.dropzone');
  if(!dz)return;
  if(dz.classList.contains('composition-dropzone')&&samplingColorId)return;
  imageTarget={target:dz.dataset.target,id:dz.dataset.id,modelId:dz.dataset.modelId};
  imagePicker.click();
});

document.addEventListener('dragover',e=>{
  const dz=e.target.closest('.dropzone');
  if(dz){
    e.preventDefault();
    dz.classList.add('dragover');
  }
});

document.addEventListener('dragleave',e=>{
  const dz=e.target.closest('.dropzone');
  if(dz)dz.classList.remove('dragover');
});

document.addEventListener('drop',async e=>{
  const dz=e.target.closest('.dropzone');
  if(!dz)return;
  e.preventDefault();
  dz.classList.remove('dragover');

  const f=[...(e.dataTransfer?.files||[])].find(isSupportedVisualFile);
  if(f)await applyVisualFile(f,dz.dataset.target,dz.dataset.id,dz.dataset.modelId);
});

document.addEventListener('paste',async e=>{
  if(!imageTarget)return;

  const files=[...(e.clipboardData?.files||[])];
  let f=files.find(isSupportedVisualFile);

  if(!f){
    const items=[...(e.clipboardData?.items||[])];
    for(const item of items){
      if(item.kind!=='file')continue;
      const candidate=item.getAsFile();
      if(isSupportedVisualFile(candidate)){
        f=candidate;
        break;
      }
    }
  }

  if(!f)return;
  e.preventDefault();
  await applyVisualFile(f,imageTarget.target,imageTarget.id,imageTarget.modelId);
});

function bindCompositionSampler(zoneId,imageId,key){
  const zone=$(zoneId);
  zone.addEventListener('click',e=>{
    const m=getActiveModel();
    if(!samplingColorId||!m[key])return;
    e.stopPropagation();
    const img=$(imageId),rect=img.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
    const c=document.createElement('canvas');
    c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext('2d');
    ctx.drawImage(img,0,0);
    const x=Math.max(0,Math.min(img.naturalWidth-1,Math.round((e.clientX-rect.left)/rect.width*img.naturalWidth))),
      y=Math.max(0,Math.min(img.naturalHeight-1,Math.round((e.clientY-rect.top)/rect.height*img.naturalHeight))),
      d=ctx.getImageData(x,y,1,1).data,
      h='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(),
      p=m.palette.find(p=>p.id===samplingColorId);
    if(p)p.hex=h;
    samplingColorId=null;
    $$('.composition-dropzone').forEach(z=>z.classList.remove('sampling'));
    renderPaletteEditor();renderIdentityEditor();update();
  });
}

bindCompositionSampler('#compositionDropzone','#compositionEditorImage','compositionImage');
bindCompositionSampler('#bottomCompositionDropzone','#bottomCompositionEditorImage','bottomCompositionImage');

$('#pasteListBtn').onclick=()=>{
  $('#pasteListArea').classList.toggle('show');
  if($('#pasteListArea').classList.contains('show'))$('#pasteListArea').focus();
};
$('#pasteListArea').onchange=e=>{
  const lines=e.target.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(lines.length){
    state.listRows=lines.map(line=>{
      const p=line.split(/[|;\t]/).map(x=>x.trim());
      return{id:uid(),name:p[0]||'',number:p[1]||'',size:p[2]||'',obs:p.slice(3).join(' | ')||''};
    });
    renderListEditor();update();
  }
};

$('#printBtn').onclick=()=>{renderPreview();setTimeout(()=>window.print(),120)};
$('#exportBtn').onclick=()=>download(
  ((state.team||'Projeto').replace(/[^\wÀ-ÿ-]+/g,'_')+`_${state.mode==='art'?'PROVA_ARTE':'PROVA_LISTA'}_${state.version||'V01'}.apsproof`),
  JSON.stringify(state,null,2),
  'application/json'
);
$('#importProjectInput').onchange=async e=>{
  const f=e.target.files?.[0];
  if(!f)return;
  try{state=normalizeState(JSON.parse(await f.text()));syncAll()}
  catch{alert('Não consegui abrir este projeto. Verifique o arquivo.')}
  e.target.value='';
};
$('#loadSampleBtn').onclick=()=>{
  if(confirm('Carregar o exemplo Aurora FC?')){state=deep(SAMPLE);syncAll()}
};
$('#newProjectBtn').onclick=async()=>{
  if(confirm('Criar um novo projeto vazio?')){
    const main=createModel('Modelo 1',true);
    state=normalizeState({
      mode:'art',team:'',subtitle:'Apresentação visual para conferência e aprovação',
      version:'V01',date:todayISO(),status:'AGUARDANDO APROVAÇÃO',
      models:[main],activeModelId:main.id,accent:'#c9952f',accent2:'#111111',
      listRows:[],approvedBy:'',approvalRef:''
    });
    await dbDelete('current');syncAll();
  }
};

async function init(){
  try{
    await openDB();
    const saved=await dbGet('current');
    if(saved)state=normalizeState(saved);
  }catch(e){console.warn(e)}
  syncAll();
  if(typeof window.queryLocalFonts==='function')
    setFontStatus('Pronto. Clique em “Ler fontes do meu PC” para escolher fontes locais.','info');
  else
    setFontStatus('A leitura automática de fontes locais precisa do Chrome ou Edge no computador.','warn');
}
init();
