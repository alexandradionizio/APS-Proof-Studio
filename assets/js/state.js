
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const uid=()=> 'id_'+Math.random().toString(36).slice(2,10);
  const todayISO=()=>new Date().toISOString().slice(0,10);
  const fmtDate=iso=>{if(!iso)return'';const [y,m,d]=iso.split('-');return `${d}/${m}/${y}`};
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const multiline=(v='')=>esc(v).replace(/\n/g,'<br>');
  const deep=v=>structuredClone(v);

  const ELEMENT_TYPES=['Patrocínio','Patrocínio master','Logo','Marca','Ícone / Símbolo','Patch / Selo','Lettering / Frase','Outro'];
  const TOP_LOCATION_GROUPS=[
    {label:'Frente',items:['Peito esquerdo','Peito direito','Peito central','Abdominal','Barra frontal']},
    {label:'Costas',items:['Nuca','Costas superiores','Costas centrais','Abaixo do número','Costas inferiores']},
    {label:'Mangas e laterais',items:['Mangas','Manga esquerda','Manga direita','Ombro esquerdo','Ombro direito','Lateral esquerda','Lateral direita']},
    {label:'Outros',items:['Outro']}
  ];
  const BOTTOM_LOCATION_GROUPS=[{label:'Calção',items:['Frente esquerda','Frente direita','Traseira esquerda','Traseira direita','Lateral esquerda','Lateral direita','Outro']}];
  const LOCATION_ALIASES={'Frente • região abdominal':'Abdominal','Frente • região abdominal central':'Abdominal','Costas • região inferior':'Costas inferiores','Costas • região lombar':'Costas inferiores','Região abdominal':'Abdominal','Região abdominal central':'Abdominal','Região lombar':'Costas inferiores'};
  const canonicalLocation=(v='')=>LOCATION_ALIASES[v]||v;
  const flatLocations=groups=>groups.flatMap(g=>g.items);
  function locationOptions(groups,selected=''){
    selected=canonicalLocation(selected);const known=flatLocations(groups);
    let html='<option value="">Selecione a localização</option>';
    if(selected&&!known.includes(selected))html+=`<option value="${esc(selected)}">${esc(selected)} (anterior)</option>`;
    groups.forEach(g=>{html+=`<optgroup label="${esc(g.label)}">`+g.items.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')+'</optgroup>'});
    return html;
  }
  function typeOptions(selected='Patrocínio'){
    const vals=ELEMENT_TYPES.includes(selected)?ELEMENT_TYPES:[selected,...ELEMENT_TYPES];
    return vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  }

  const defaultPalette=()=>[
    {id:uid(),hex:'#111111',name:'Preto'},
    {id:uid(),hex:'#C9952F',name:'Dourado'},
    {id:uid(),hex:'#F6F6F6',name:'Branco'}
  ];
  const defaultIdentity=()=>({
    crest:{image:'',name:'Escudo',location:'Peito esquerdo',customLocation:'',bg:'#FFFFFF'},
    elements:[],bottomElements:[]
  });
  const defaultTypography=()=>({
    nameFontFamily:'',nameFontFullName:'Fonte padrão do sistema',nameFontPostscript:'',
    numberFontFamily:'',numberFontFullName:'Fonte padrão do sistema',numberFontPostscript:'',
    alphabet:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',numbers:'0123456789',nameSample:'NOME',numberSample:'10'
  });
  function createModel(name='Modelo 1',isMain=false,source=null){
    const identity=source?deep({crest:source.crest,elements:source.elements,bottomElements:source.bottomElements}):defaultIdentity();
    const typo=source?deep({
      nameFontFamily:source.nameFontFamily,nameFontFullName:source.nameFontFullName,nameFontPostscript:source.nameFontPostscript,
      numberFontFamily:source.numberFontFamily,numberFontFullName:source.numberFontFullName,numberFontPostscript:source.numberFontPostscript,
      alphabet:source.alphabet,numbers:source.numbers,nameSample:source.nameSample,numberSample:source.numberSample
    }):defaultTypography();
    return {
      id:uid(),name,isMain,mockup:'',
      includeBottom:false,compositionImage:'',bottomCompositionImage:'',compositionNotes:'',palette:source?deep(source.palette):defaultPalette(),
      inheritIdentity:!isMain,inheritTypography:!isMain,
      ...identity,...typo
    };
  }

  const SAMPLE_MAIN=createModel('LINHA',true);
  Object.assign(SAMPLE_MAIN,{
    mockup:'assets/sample/mockup.svg',
    compositionImage:'assets/sample/texture-top.svg',
    compositionNotes:'Base predominante preta.\nTextura geométrica vertical no centro.\nFiletes dourados definem recortes e gola.\nLaterais claras criam contraste e movimento.',
    palette:[{id:uid(),hex:'#0A0A0A',name:'Preto'},{id:uid(),hex:'#C9952F',name:'Dourado'},{id:uid(),hex:'#F6F6F6',name:'Branco'},{id:uid(),hex:'#5D6066',name:'Cinza'}],
    crest:{image:'assets/sample/crest.svg',name:'AURORA FC',location:'Peito esquerdo',customLocation:'',bg:'#FFFFFF'},
    elements:[
      {id:uid(),image:'assets/sample/sponsor-01.svg',type:'Patrocínio',customType:'',name:'NORTE SPORTS',location:'Abdominal',customLocation:'',bg:'#FFFFFF'},
      {id:uid(),image:'assets/sample/sponsor-02.svg',type:'Patrocínio',customType:'',name:'VIVA ENERGIA',location:'Manga esquerda',customLocation:'',bg:'#FFFFFF'},
      {id:uid(),image:'assets/sample/sponsor-03.svg',type:'Patrocínio',customType:'',name:'PONTO ZERO',location:'Costas inferiores',customLocation:'',bg:'#FFFFFF'}
    ],
    nameSample:'AURORA',numberSample:'10'
  });
  const SAMPLE={
    mode:'art',team:'AURORA FC',subtitle:'Apresentação visual para conferência e aprovação',version:'V01',date:todayISO(),status:'AGUARDANDO APROVAÇÃO',
    models:[SAMPLE_MAIN],activeModelId:SAMPLE_MAIN.id,
    accent:'#C9952F',accent2:'#0A0A0A',
    listRows:[{id:uid(),name:'Exemplo',number:'10',size:'M',obs:''}],
    checklistArt:['Escudo e símbolos','Patrocinadores e logotipos','Textos e grafias','Cores principais','Fundo, textura e grafismos','Posicionamento dos elementos','Modelo de nome','Modelo de numeração'],
    checklistList:['Nomes','Números','Tamanhos','Quantidades','Observações da lista'],approvedBy:'',approvalRef:''
  };

  let state=deep(SAMPLE),imageTarget=null,samplingColorId=null,renderTimer=null,saveTimer=null,db=null,localFonts=[];
  const fontAliases=new Map();

  function normalizeElement(e={}){return {...e,id:e.id||uid(),customType:e.customType||'',location:canonicalLocation(e.location||''),customLocation:e.customLocation||'',bg:(e.bg||'#FFFFFF').toUpperCase()}}
  function normalizeModel(m={},i=0){
    const d=createModel(m.name||`Modelo ${i+1}`,!!m.isMain);
    const out={...d,...m,id:m.id||uid()};
    out.palette=Array.isArray(m.palette)?m.palette.map(p=>({...p,id:p.id||uid()})):d.palette;
    out.crest={...d.crest,...(m.crest||{})};out.crest.location=canonicalLocation(out.crest.location||'');out.crest.bg=(out.crest.bg||'#FFFFFF').toUpperCase();
    out.elements=(Array.isArray(m.elements)?m.elements:[]).map(normalizeElement);
    out.bottomElements=(Array.isArray(m.bottomElements)?m.bottomElements:[]).map(normalizeElement);
    out.includeBottom=!!m.includeBottom;out.inheritIdentity=!!m.inheritIdentity;out.inheritTypography=!!m.inheritTypography;
    return out;
  }
  function normalizeState(raw){
    const base=deep(SAMPLE);let merged={...base,...raw};
    if(Array.isArray(raw?.models)&&raw.models.length){
      merged.models=raw.models.map(normalizeModel);
    }else{
      const legacy=createModel('MODELO PRINCIPAL',true);
      legacy.mockup=raw?.mainImage||'';legacy.includeBottom=!!raw?.includeBottom;legacy.compositionImage=raw?.compositionImage||'';legacy.bottomCompositionImage=raw?.bottomCompositionImage||'';legacy.compositionNotes=raw?.compositionNotes||'';
      legacy.palette=Array.isArray(raw?.palette)?raw.palette:defaultPalette();legacy.crest={...legacy.crest,...(raw?.crest||{})};legacy.elements=(raw?.elements||[]).map(normalizeElement);legacy.bottomElements=(raw?.bottomElements||[]).map(normalizeElement);
      for(const k of Object.keys(defaultTypography())) if(raw?.[k]!==undefined) legacy[k]=raw[k];
      merged.models=[normalizeModel(legacy,0)];
    }
    if(!merged.models.some(m=>m.isMain))merged.models[0].isMain=true;
    let found=false;merged.models.forEach(m=>{if(m.isMain&&!found){found=true;m.inheritIdentity=false;m.inheritTypography=false}else if(m.isMain){m.isMain=false}});
    merged.activeModelId=merged.models.some(m=>m.id===raw?.activeModelId)?raw.activeModelId:merged.models[0].id;
    merged.listRows=Array.isArray(raw?.listRows)?raw.listRows:base.listRows;
    merged.checklistArt=Array.isArray(raw?.checklistArt)?raw.checklistArt:base.checklistArt;
    merged.checklistList=Array.isArray(raw?.checklistList)?raw.checklistList:base.checklistList;
    return merged;
  }
  const getMainModel=()=>state.models.find(m=>m.isMain)||state.models[0];
  const getActiveModel=()=>state.models.find(m=>m.id===state.activeModelId)||state.models[0];
  const getModel=id=>state.models.find(m=>m.id===id);
  const identitySource=m=>(m&&!m.isMain&&m.inheritIdentity)?getMainModel():m;
  const typographySource=m=>(m&&!m.isMain&&m.inheritTypography)?getMainModel():m;

  async function openDB(){return new Promise((res,rej)=>{const q=indexedDB.open('APSProofStudioDB',2);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('store'))q.result.createObjectStore('store')};q.onsuccess=()=>{db=q.result;res(db)};q.onerror=()=>rej(q.error)})}
  async function dbGet(k){if(!db)return null;return new Promise((res,rej)=>{const tx=db.transaction('store','readonly');const q=tx.objectStore('store').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
  async function dbSet(k,v){if(!db)return;return new Promise((res,rej)=>{const tx=db.transaction('store','readwrite');tx.objectStore('store').put(v,k);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
  async function dbDelete(k){if(!db)return;return new Promise((res,rej)=>{const tx=db.transaction('store','readwrite');tx.objectStore('store').delete(k);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
  function scheduleSave(){clearTimeout(saveTimer);$('#saveNote').textContent='Salvando…';saveTimer=setTimeout(async()=>{try{await dbSet('current',state);$('#saveNote').textContent='Salvo automaticamente neste navegador'}catch{$('#saveNote').textContent='Não foi possível salvar automaticamente'}},450)}
  function update(){
    document.documentElement.style.setProperty('--accent',state.accent||'#c9952f');document.documentElement.style.setProperty('--accent2',state.accent2||'#0a0a0a');document.body.dataset.mode=state.mode;
    $$('.art-only').forEach(x=>x.style.display=state.mode==='art'?'':'none');$$('.list-only').forEach(x=>x.style.display=state.mode==='list'?'':'none');$$('.art-only-inline').forEach(x=>x.style.display=state.mode==='art'?'inline':'none');$$('.list-only-inline').forEach(x=>x.style.display=state.mode==='list'?'inline':'none');
    clearTimeout(renderTimer);renderTimer=setTimeout(renderPreview,40);scheduleSave();
  }

  function modelOptions(){return state.models.map(m=>`<option value="${m.id}">${esc(m.name||'Sem nome')}${m.isMain?' • PRINCIPAL':''}</option>`).join('')}
  function syncModelSelectors(){
    $$('.model-selector').forEach(sel=>{sel.innerHTML=modelOptions();sel.value=getActiveModel().id});
  }
  function renderModelsEditor(){
    const root=$('#modelsEditor');root.innerHTML='';
    state.models.forEach((m,idx)=>{
      const card=document.createElement('div');card.className='model-card';
      card.innerHTML=`<div class="model-card-head"><input data-model-name value="${esc(m.name||'')}" placeholder="Nome do modelo"><span class="model-badge" style="${m.isMain?'':'display:none'}">PRINCIPAL</span></div>
        <div class="dropzone large model-mockup-drop ${m.mockup?'has-image':''}" data-target="modelMockup" data-model-id="${m.id}"><img class="drop-preview" ${m.mockup?`src="${m.mockup}"`:''} alt="Mockup"><div class="drop-placeholder"><b>+ Mockup</b><small>arraste, clique ou cole a imagem</small></div></div>
        <div class="model-card-actions">${m.isMain?'':`<button class="btn small-btn set-main">Tornar principal</button>`}<button class="btn small-btn ghost edit-model">Editar este modelo</button><button class="btn small-btn danger delete-model" ${state.models.length===1?'disabled':''}>Excluir</button></div>
        <div class="model-status-line"><span class="model-status-pill ${m.isMain?'main':''}">${m.isMain?'Modelo principal':'Modelo adicional'}</span>${!m.isMain?`<span class="model-status-pill">Identidade: ${m.inheritIdentity?'principal':'própria'}</span><span class="model-status-pill">Nome/número: ${m.inheritTypography?'principal':'próprios'}</span>`:''}</div>`;
      $('[data-model-name]',card).oninput=e=>{m.name=e.target.value;syncModelSelectors();update()};
      $('.set-main',card)?.addEventListener('click',()=>{state.models.forEach(x=>x.isMain=false);m.isMain=true;m.inheritIdentity=false;m.inheritTypography=false;state.activeModelId=m.id;syncAll()});
      $('.edit-model',card).onclick=()=>{state.activeModelId=m.id;syncAll()};
      $('.delete-model',card)?.addEventListener('click',()=>{if(state.models.length===1)return;if(!confirm(`Excluir o modelo “${m.name||'Sem nome'}”?`))return;const wasMain=m.isMain;state.models=state.models.filter(x=>x.id!==m.id);if(wasMain){state.models[0].isMain=true;state.models[0].inheritIdentity=false;state.models[0].inheritTypography=false}if(!state.models.some(x=>x.id===state.activeModelId))state.activeModelId=state.models[0].id;syncAll()});
      root.appendChild(card);
    });
  }

  function getBgColorChoices(model=getActiveModel(),selected=''){
    const map=new Map([['#FFFFFF','Branco'],['#000000','Preto']]);(model?.palette||[]).forEach(p=>{const h=String(p.hex||'').toUpperCase();if(h&&!map.has(h))map.set(h,p.name||h)});const cur=String(selected||'').toUpperCase();if(cur&&!map.has(cur))map.set(cur,'Atual');return [...map].map(([hex,name])=>({hex,name}));
  }
  function bgPaletteMarkup(selected,model=getActiveModel()){const cur=String(selected||'#FFFFFF').toUpperCase();return getBgColorChoices(model,cur).map(c=>`<button type="button" class="item-bg-swatch ${c.hex===cur?'active':''}" data-bg="${c.hex}" title="${esc(c.name)}" style="background:${c.hex}"></button>`).join('')}
  function bindBgPalette(root,onPick){$$('.item-bg-swatch',root).forEach(b=>b.onclick=()=>onPick(b.dataset.bg))}
