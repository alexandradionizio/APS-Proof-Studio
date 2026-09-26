const loadedFontFaces=new Map();

function fontId(f){
  return f.postscriptName||`${f.family||''}|||${f.fullName||''}|||${f.style||''}`;
}

function fontLabel(f){
  const full=f.fullName||f.family||'Fonte sem nome';
  const fam=f.family&&f.family!==full?` — ${f.family}`:'';
  return `${full}${fam}`;
}

function fontBlobKey(model,role){
  return `fontblob:${model.id}:${role}`;
}

function fontTokenHash(value=''){
  let h=2166136261;
  for(let i=0;i<value.length;i++){
    h^=value.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return (h>>>0).toString(36);
}

function clearLoadedFont(key){
  const oldFace=loadedFontFaces.get(key);
  if(oldFace){
    try{document.fonts.delete(oldFace)}catch{}
    loadedFontFaces.delete(key);
  }
  fontAliases.delete(key);
}

function populateFontSelectors(){
  const m=typographySource(getActiveModel());
  const ns=$('#nameFontSelect'),xs=$('#numberFontSelect');
  if(!m||!ns||!xs)return;

  const opts=(role)=>{
    const ps=m[`${role}FontPostscript`]||'';
    const fam=m[`${role}FontFamily`]||'';
    const full=m[`${role}FontFullName`]||'Fonte padrão do sistema';
    const selectedId=ps||'';
    const hasSelected=localFonts.some(f=>(ps&&fontId(f)===ps)||(!ps&&fam&&f.family===fam));
    const rows=['<option value="">Fonte padrão do sistema</option>'];

    if(!hasSelected && full && full!=='Fonte padrão do sistema'){
      rows.push(`<option value="${esc(selectedId||'__cached__')}" selected disabled>${esc(full)} • salva localmente</option>`);
    }

    rows.push(...localFonts.map(f=>{
      const active=(ps&&fontId(f)===ps)||(!ps&&fam&&f.family===fam);
      return `<option value="${esc(fontId(f))}" ${active?'selected':''}>${esc(fontLabel(f))}</option>`;
    }));
    return rows.join('');
  };

  ns.innerHTML=opts('name');
  xs.innerHTML=opts('number');
}

async function loadFontFace(model,role){
  const ps=model[`${role}FontPostscript`]||'';
  const fam=model[`${role}FontFamily`]||'';
  const full=model[`${role}FontFullName`]||'Fonte padrão do sistema';
  const key=`${model.id}:${role}`;
  const selectedToken=ps||fam||(full!=='Fonte padrão do sistema'?full:'');

  if(!selectedToken){
    clearLoadedFont(key);
    try{if(db)await dbDelete(fontBlobKey(model,role))}catch{}
    return false;
  }

  try{
    const item=
      localFonts.find(f=>ps&&fontId(f)===ps)||
      localFonts.find(f=>full&&f.fullName===full)||
      localFonts.find(f=>fam&&f.family===fam);

    let blob=null;
    let cached=null;

    if(item){
      blob=await item.blob();
      cached={
        blob,
        id:fontId(item),
        family:item.family||fam,
        fullName:item.fullName||full,
        postscriptName:item.postscriptName||ps
      };
      try{if(db)await dbSet(fontBlobKey(model,role),cached)}catch(e){console.warn('Não foi possível guardar a fonte local no IndexedDB',e)}
    }else{
      try{if(db)cached=await dbGet(fontBlobKey(model,role))}catch{}
      if(cached instanceof Blob)blob=cached;
      else if(cached?.blob instanceof Blob)blob=cached.blob;
    }

    if(!blob){
      clearLoadedFont(key);
      return false;
    }

    const identity=ps||cached?.id||full||fam;
    const alias=`APS_${model.id.replace(/[^a-z0-9]/gi,'')}_${role}_${fontTokenHash(identity)}`;

    clearLoadedFont(key);

    const buffer=await blob.arrayBuffer();
    const face=new FontFace(alias,buffer);
    await face.load();
    document.fonts.add(face);
    loadedFontFaces.set(key,face);
    fontAliases.set(key,alias);

    await document.fonts.load(`32px "${alias}"`);
    await document.fonts.ready;
    return true;
  }catch(e){
    console.warn('Falha ao aplicar fonte local',e);
    clearLoadedFont(key);
    return false;
  }
}

async function applyAllSelectedFonts(){
  await Promise.all(state.models.flatMap(m=>[
    loadFontFace(m,'name'),
    loadFontFace(m,'number')
  ]));
  renderPreview();
}

function setFontStatus(msg,kind='info'){
  const el=$('#fontStatus');
  if(el){el.textContent=msg;el.dataset.kind=kind}
}

async function scanLocalFonts(){
  const btn=$('#loadLocalFontsBtn');
  if(typeof window.queryLocalFonts!=='function'){
    setFontStatus('Este navegador não oferece acesso à lista de fontes instaladas. Abra o APS no Chrome ou Edge para usar esta função.','error');
    return;
  }
  if(!window.isSecureContext){
    setFontStatus('O navegador não considera esta abertura segura para ler fontes locais. Abra o APS em localhost.','error');
    return;
  }

  try{
    btn.disabled=true;
    btn.textContent='Lendo fontes…';
    const fonts=await window.queryLocalFonts();
    const seen=new Set();
    localFonts=[...fonts]
      .filter(f=>{
        const k=fontId(f);
        if(seen.has(k))return false;
        seen.add(k);
        return true;
      })
      .sort((a,b)=>fontLabel(a).localeCompare(fontLabel(b),'pt-BR'));

    populateFontSelectors();
    await applyAllSelectedFonts();
    if(typeof broadcastPreviewState==='function')broadcastPreviewState();
    setFontStatus(`${localFonts.length} fontes do computador disponíveis. As fontes escolhidas ficam armazenadas somente neste navegador para o Preview.`,'ok');
  }catch(e){
    setFontStatus(`Não consegui ler as fontes instaladas: ${e?.message||'erro desconhecido'}`,'error');
  }finally{
    btn.disabled=false;
    btn.textContent='Ler fontes do meu PC';
  }
}
