const loadedFontFaces=new Map();
const fontTransferCache=new Map();

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

function selectedFontToken(model,role){
  if(!model)return '';
  return model[`${role}FontPostscript`]||
    (model[`${role}FontFullName`]&&model[`${role}FontFullName`]!=='Fonte padrão do sistema'
      ?`${model[`${role}FontFamily`]||''}|||${model[`${role}FontFullName`]||''}`
      :'');
}

function isOwnTypographyModel(model){
  return !!model && (model.isMain||!model.inheritTypography);
}

function isArrayBufferLike(value){
  return !!value && typeof value.byteLength==='number' && Object.prototype.toString.call(value)==='[object ArrayBuffer]';
}

async function fontSourceToBuffer(source){
  if(source instanceof Blob)return await source.arrayBuffer();
  if(isArrayBufferLike(source))return source.slice?source.slice(0):new Uint8Array(source).slice().buffer;
  if(ArrayBuffer.isView(source))return source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength);
  return null;
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

async function clearFontRoleCache(model,role,removeStored=true){
  if(!model)return;
  const key=`${model.id}:${role}`;
  clearLoadedFont(key);
  fontTransferCache.delete(key);
  if(removeStored){
    try{if(db)await dbDelete(fontBlobKey(model,role))}catch(e){
      console.warn('Não foi possível limpar o cache da fonte',e);
    }
  }
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
    const hasSelected=localFonts.some(f=>
      (ps&&fontId(f)===ps)||
      (!ps&&full&&f.fullName===full)||
      (!ps&&!full&&fam&&f.family===fam)
    );
    const rows=['<option value="">Fonte padrão do sistema</option>'];

    if(!hasSelected&&full&&full!=='Fonte padrão do sistema'){
      rows.push(`<option value="${esc(selectedId||'__cached__')}" selected disabled>${esc(full)} • salva localmente</option>`);
    }

    rows.push(...localFonts.map(f=>{
      const active=(ps&&fontId(f)===ps)||(!ps&&full&&f.fullName===full);
      return `<option value="${esc(fontId(f))}" ${active?'selected':''}>${esc(fontLabel(f))}</option>`;
    }));
    return rows.join('');
  };

  ns.innerHTML=opts('name');
  xs.innerHTML=opts('number');
}

async function registerFontSource(model,role,source,identity=''){
  if(!model)return false;
  const expected=selectedFontToken(model,role);
  const token=identity||expected;
  if(!token)return false;

  // Nunca permite que um arquivo antigo seja aplicado depois de a seleção mudar.
  if(expected&&identity&&identity!==expected){
    console.warn('Fonte ignorada por estar desatualizada',role,identity,'esperada:',expected);
    return false;
  }

  const buffer=await fontSourceToBuffer(source);
  if(!buffer)return false;

  // Confere novamente depois da operação assíncrona.
  if(selectedFontToken(model,role)!==expected)return false;

  const key=`${model.id}:${role}`;
  const alias=`APS_${model.id.replace(/[^a-z0-9]/gi,'')}_${role}_${fontTokenHash(token)}`;

  clearLoadedFont(key);

  const face=new FontFace(alias,buffer);
  await face.load();

  if(selectedFontToken(model,role)!==expected)return false;

  document.fonts.add(face);
  loadedFontFaces.set(key,face);
  fontAliases.set(key,alias);

  const blob=source instanceof Blob?source:new Blob([buffer],{type:'font/ttf'});
  fontTransferCache.set(key,{blob,buffer,identity:token});

  await document.fonts.load(`32px "${alias}"`);
  await document.fonts.ready;

  return document.fonts.check(`32px "${alias}"`);
}

async function selectLocalFont(model,role,font){
  if(!model||!['name','number'].includes(role))return false;

  const previous=selectedFontToken(model,role);
  const next=font?fontId(font):'';

  // Limpa o blob/alias da fonte anterior ANTES de trocar os metadados.
  if(previous!==next)await clearFontRoleCache(model,role,true);

  model[`${role}FontFamily`]=font?.family||'';
  model[`${role}FontFullName`]=font?.fullName||font?.family||'Fonte padrão do sistema';
  model[`${role}FontPostscript`]=next;

  if(!font){
    await clearFontRoleCache(model,role,true);
    return true;
  }

  return await loadFontFace(model,role);
}

function getPreviewFontPayload(){
  const payload=[];
  for(const model of state.models){
    if(!isOwnTypographyModel(model))continue;
    for(const role of ['name','number']){
      const key=`${model.id}:${role}`;
      const expected=selectedFontToken(model,role);
      const cached=fontTransferCache.get(key);

      // Só envia o blob se ele realmente pertence à fonte atualmente selecionada.
      if(!expected||!cached||cached.identity!==expected)continue;
      if(cached.blob instanceof Blob||cached.buffer){
        payload.push({
          modelId:model.id,
          role,
          blob:cached.blob instanceof Blob?cached.blob:null,
          buffer:cached.buffer||null,
          identity:cached.identity
        });
      }
    }
  }
  return payload;
}

async function installPreviewFontPayload(payload=[]){
  let installed=0;
  for(const item of payload){
    const model=getModel(item?.modelId);
    if(!model||!isOwnTypographyModel(model)||!['name','number'].includes(item?.role))continue;
    const expected=selectedFontToken(model,item.role);
    if(!expected||item.identity!==expected)continue;
    const source=item.buffer||item.blob;
    if(!source)continue;
    try{
      if(await registerFontSource(model,item.role,source,item.identity))installed++;
    }catch(e){
      console.warn('Falha ao receber fonte do painel',e);
    }
  }
  return installed;
}

async function loadFontFace(model,role){
  if(!model)return false;
  const ps=model[`${role}FontPostscript`]||'';
  const fam=model[`${role}FontFamily`]||'';
  const full=model[`${role}FontFullName`]||'Fonte padrão do sistema';
  const key=`${model.id}:${role}`;
  const selectedToken=selectedFontToken(model,role);

  if(!selectedToken){
    await clearFontRoleCache(model,role,true);
    return false;
  }

  try{
    const memory=fontTransferCache.get(key);

    // O bug antigo estava aqui: qualquer blob da mesma função (nome/número)
    // era reutilizado mesmo depois de escolher outra fonte.
    if(memory){
      if(memory.identity===selectedToken&&(memory.blob instanceof Blob||memory.buffer)){
        return await registerFontSource(model,role,memory.buffer||memory.blob,memory.identity);
      }
      fontTransferCache.delete(key);
      clearLoadedFont(key);
    }

    const item=
      localFonts.find(f=>ps&&fontId(f)===ps)||
      localFonts.find(f=>full&&f.fullName===full)||
      localFonts.find(f=>!ps&&fam&&f.family===fam);

    if(item){
      const blob=await item.blob();
      const identity=fontId(item);

      // Se a seleção mudou enquanto o blob era lido, descarta este resultado.
      if(selectedFontToken(model,role)!==selectedToken)return false;

      const cached={
        blob,
        id:identity,
        family:item.family||fam,
        fullName:item.fullName||full,
        postscriptName:item.postscriptName||ps
      };
      try{if(db)await dbSet(fontBlobKey(model,role),cached)}catch(e){
        console.warn('Não foi possível guardar a fonte local no IndexedDB',e);
      }
      return await registerFontSource(model,role,blob,identity);
    }

    let cached=null;
    try{if(db)cached=await dbGet(fontBlobKey(model,role))}catch{}

    const cachedBlob=cached instanceof Blob?cached:cached?.blob;
    const cachedIdentity=cached?.id||cached?.postscriptName||'';

    // Também rejeita cache persistente antigo que não corresponde à seleção atual.
    if(cachedBlob instanceof Blob&&cachedIdentity===selectedToken){
      return await registerFontSource(model,role,cachedBlob,cachedIdentity);
    }

    if(cachedBlob){
      try{if(db)await dbDelete(fontBlobKey(model,role))}catch{}
    }
    clearLoadedFont(key);
    return false;
  }catch(e){
    console.warn('Falha ao aplicar fonte local',e);
    clearLoadedFont(key);
    return false;
  }
}

async function applyAllSelectedFonts(){
  const jobs=[];
  for(const model of state.models){
    if(!isOwnTypographyModel(model))continue;
    jobs.push(loadFontFace(model,'name'),loadFontFace(model,'number'));
  }
  await Promise.all(jobs);
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
    setFontStatus(`${localFonts.length} fontes do computador disponíveis.`,'ok');
  }catch(e){
    setFontStatus(`Não consegui ler as fontes instaladas: ${e?.message||'erro desconhecido'}`,'error');
  }finally{
    btn.disabled=false;
    btn.textContent='Ler fontes do meu PC';
  }
}
