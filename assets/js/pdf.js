function pageHeader(pageNum){const proof=state.mode==='art'?'PROVA DE ARTE':'PROVA DE LISTA';return `<div class="pdf-header"><div class="h-title">${proof}</div><div class="h-meta">${esc(state.team||'SEM NOME')} • ${esc(state.version||'V01')} • PÁG. ${pageNum}</div></div>`}
  function sectionHead(t,st=''){return `<h1 class="pdf-section-title">${esc(t)}</h1><div class="pdf-title-rule"></div>${st?`<div class="pdf-subtitle">${esc(st)}</div>`:''}`}
  function pageWrap(n,t,st,b,extra=''){return `<section class="pdf-page" style="--p-accent:${state.accent};--p-accent2:${state.accent2}">${pageHeader(n)}<div class="pdf-body">${sectionHead(t,st)}${extra}${b}<div class="pdf-footer">Documento de conferência • gerado no APS Proof Studio</div></div></section>`}
  function coverPage(){const main=getMainModel(),proof=state.mode==='art'?'PROVA DE ARTE':'PROVA DE LISTA',image=main?.mockup?`<img src="${main.mockup}">`:`<div class="cover-empty">Insira o mockup do modelo principal</div>`;return `<section class="pdf-page cover-page" style="--p-accent:${state.accent};--p-accent2:${state.accent2}"><div class="pdf-top-line"></div><div class="cover-content"><div class="cover-kicker">${proof}</div><div class="cover-team">${esc(state.team||'NOME DO TIME')}</div><div class="cover-sub">${esc(state.subtitle||'')}</div><div class="cover-image-card">${image}</div><div class="cover-meta"><div><span class="pdf-pill">${esc(state.version||'V01')}</span><span class="cover-status">${esc(state.status)}</span></div><div class="cover-date">${fmtDate(state.date)} • DOCUMENTO DE CONFERÊNCIA</div></div></div></section>`}
  function modelProofPage(model,n){const img=model.mockup?`<img src="${model.mockup}">`:`<div class="empty-card">Sem mockup</div>`;const body=`<div class="model-proof-card"><div class="model-proof-meta"><div class="model-proof-name">${esc(model.name||'MODELO')}</div></div><div class="model-proof-image">${img}</div></div>`;return pageWrap(n,'MODELO DO PROJETO','Apresentação visual do uniforme',body)}
  function compositionPage(model,n){const sw=(model.palette||[]).map(p=>`<div class="swatch"><div class="swatch-color" style="background:${p.hex}"></div>${esc(p.name||p.hex)}</div>`).join(''),top=model.compositionImage?`<img src="${model.compositionImage}">`:'<div class="empty-card" style="color:#bbb">Sem arte da camisa</div>',bottom=model.bottomCompositionImage?`<img src="${model.bottomCompositionImage}">`:'<div class="empty-card" style="color:#bbb">Sem arte do calção</div>',pieces=model.includeBottom?`<div class="composition-art-stack with-bottom"><div class="composition-piece-card top-with-bottom"><div class="composition-piece-label"><span class="card-label">PARTE DE CIMA</span></div><div class="composition-piece-image">${top}</div></div><div class="composition-piece-card bottom-piece"><div class="composition-piece-label"><span class="card-label">PARTE DE BAIXO</span></div><div class="composition-piece-image">${bottom}</div></div></div>`:`<div class="composition-art-stack"><div class="composition-piece-card single"><div class="composition-piece-label"><span class="card-label">PARTE DE CIMA</span></div><div class="composition-piece-image">${top}</div></div></div>`;const details=`<div class="composition-details"><div class="visual-reading"><h3>LEITURA VISUAL</h3><div class="visual-notes">${multiline(model.compositionNotes||'')}</div></div><div class="palette-block"><h3>PALETA DE REFERÊNCIA</h3><div class="swatches">${sw}</div></div></div>`;return pageWrap(n,`FUNDO & COMPOSIÇÃO • ${model.name||'MODELO'}`,'Detalhamento visual da estampa e das cores de referência',`<div class="composition-layout">${pieces}${details}</div>`)}
  const resolvedType=d=>d?.type==='Outro'&&d?.customType?.trim()?d.customType.trim():(d?.type||'Elemento');
  const resolvedLocation=d=>d?.location==='Outro'&&d?.customLocation?.trim()?d.customLocation.trim():(d?.location||'Não informada');
  function identityGridCardMarkup(entry){
    const d=entry.data||{};
    const img=d.image
      ?`<img src="${d.image}" alt="${esc(d.name||entry.kind||'Elemento')}">`
      :'<div class="identity-grid-placeholder">Sem imagem</div>';
    const type=entry.kind==='crest'?'ESCUDO':resolvedType(d);
    const loc=entry.kind==='crest'
      ?(d.location==='Outro'&&d.customLocation?.trim()?d.customLocation.trim():(d.location||'Não informada'))
      :resolvedLocation(d);
    const bg=(d.bg||'#FFFFFF').toUpperCase();
    const scope=entry.scope==='bottom'?'PARTE DE BAIXO':'PARTE DE CIMA';

    return `<article class="identity-grid-card">
      <div class="identity-grid-image" style="background:${bg}">${img}</div>
      <div class="identity-grid-info">
        <div class="identity-grid-meta"><span>${esc(scope)}</span><span>${esc(type)}</span></div>
        <div class="identity-grid-name">${esc(d.name||'Sem nome')}</div>
        <div class="identity-grid-location">${esc(loc)}</div>
      </div>
    </article>`;
  }

  function identityPageWrap(model,n,{crest=null,items=[],scope='top'}={},continued=false){
    const isBottom=scope==='bottom';
    const title=isBottom
      ?(continued?'IDENTIDADE & ELEMENTOS • PARTE DE BAIXO • CONTINUAÇÃO':'IDENTIDADE & ELEMENTOS • PARTE DE BAIXO')
      :(continued?'IDENTIDADE & ELEMENTOS • PARTE DE CIMA • CONTINUAÇÃO':'IDENTIDADE & ELEMENTOS');

    const subtitle=isBottom
      ?`Patrocinadores e aplicações do calção • ${model.name||'MODELO'}`
      :(continued
        ?`Continuação dos patrocinadores e demais elementos da parte de cima • ${model.name||'MODELO'}`
        :`Escudo central + patrocinadores e demais aplicações da parte de cima • ${model.name||'MODELO'}`);

    const crestMarkup=crest
      ?`<div class="identity-crest-zone">${identityGridCardMarkup(crest)}</div>`
      :'';

    const scopeHeading=isBottom
      ?'<div class="identity-scope-heading"><span>PARTE DE BAIXO</span><small>Elementos do calção</small></div>'
      :'';

    const itemsMarkup=items.length
      ?`<div class="identity-elements-grid">${items.map(identityGridCardMarkup).join('')}</div>`
      :'';

    const body=`<div class="identity-layout identity-layout-${scope}">${crestMarkup}${scopeHeading}${itemsMarkup}</div>`;

    return `<section class="pdf-page identity-page" style="--p-accent:${state.accent};--p-accent2:${state.accent2}">
      ${pageHeader(n)}
      <div class="pdf-body">
        ${sectionHead(title,subtitle)}
        ${body}
        <div class="pdf-footer">Documento de conferência • gerado no APS Proof Studio</div>
      </div>
    </section>`;
  }

  function identityPagesForModel(model,start){
    if(!model.isMain&&model.inheritIdentity)return [];

    const src=identitySource(model);
    const crest={kind:'crest',scope:'top',data:src.crest};
    const topElements=src.elements.map(e=>({kind:'element',scope:'top',data:e}));
    const bottomElements=model.includeBottom
      ?src.bottomElements.map(e=>({kind:'element',scope:'bottom',data:e}))
      :[];

    const pages=[];

    // O escudo pertence sempre à primeira página e é independente das grades.
    // A primeira página recebe até dois itens da PARTE DE CIMA abaixo dele.
    pages.push(identityPageWrap(
      model,
      start,
      {crest,items:topElements.slice(0,2),scope:'top'},
      false
    ));

    // Continuação exclusiva da PARTE DE CIMA.
    const remainingTop=topElements.slice(2);
    for(let i=0;i<remainingTop.length;i+=4){
      pages.push(identityPageWrap(
        model,
        start+pages.length,
        {crest:null,items:remainingTop.slice(i,i+4),scope:'top'},
        true
      ));
    }

    // A PARTE DE BAIXO nunca é misturada com a continuação da parte de cima:
    // ela sempre começa em uma página/bloco próprio.
    for(let i=0;i<bottomElements.length;i+=4){
      pages.push(identityPageWrap(
        model,
        start+pages.length,
        {crest:null,items:bottomElements.slice(i,i+4),scope:'bottom'},
        i>0
      ));
    }

    return pages;
  }
  function fontCss(model,role){
    const key=`${model.id}:${role}`,alias=fontAliases.get(key);
    const full=model[`${role}FontFullName`],fam=model[`${role}FontFamily`];
    const stack=[];
    if(alias)stack.push(`"${String(alias).replace(/"/g,'\\\"')}"`);
    if(full && full!=='Fonte padrão do sistema')stack.push(`"${String(full).replace(/"/g,'\\\"')}"`);
    if(fam && fam!==full)stack.push(`"${String(fam).replace(/"/g,'\\\"')}"`);
    stack.push('"Arial Black"','Impact','sans-serif');
    return stack.join(',');
  }
  function typographyPage(model,n){
    if(!model.isMain&&model.inheritTypography)return null;
    const src=typographySource(model),
      nf=esc(src.nameFontFullName||src.nameFontFamily||'Fonte padrão do sistema'),
      xf=esc(src.numberFontFullName||src.numberFontFamily||'Fonte padrão do sistema'),
      mid=esc(src.id||model.id);
    const body=`<div class="font-summary"><div><b>FONTE DO NOME</b><span>${nf}</span></div><div><b>FONTE DO NÚMERO</b><span>${xf}</span></div></div>
      <div class="typography-grid">
        <div class="type-card"><div class="type-label">Caracteres / nome</div><div class="type-preview alpha name-font" data-font-model="${mid}" data-font-role="name">${esc(src.alphabet)}</div></div>
        <div class="type-card"><div class="type-label">Numeração completa</div><div class="type-preview numbers number-font" data-font-model="${mid}" data-font-role="number">${esc(src.numbers)}</div></div>
        <div class="type-card"><div class="type-label">Exemplo de nome</div><div class="type-preview sample-name name-font" data-font-model="${mid}" data-font-role="name">${esc(src.nameSample)}</div></div>
        <div class="type-card"><div class="type-label">Exemplo de número</div><div class="type-preview sample-number number-font" data-font-model="${mid}" data-font-role="number">${esc(src.numberSample)}</div></div>
      </div>`;
    return pageWrap(n,'NOME & NUMERAÇÃO','Amostra visual da personalização antes da modelagem da grade',body);
  }

  function applyRenderedFontAliases(){
    document.querySelectorAll('#preview [data-font-model][data-font-role]').forEach(el=>{
      const modelId=el.dataset.fontModel,role=el.dataset.fontRole;
      const alias=fontAliases.get(`${modelId}:${role}`);
      const model=getModel(modelId);
      if(alias){
        el.style.setProperty('font-family',`"${alias}"`,'important');
        el.style.setProperty('font-synthesis','none');
      }else if(model){
        el.style.setProperty('font-family',fontCss(model,role),'important');
        el.style.setProperty('font-synthesis','none');
      }
    });
    requestAnimationFrame(()=>renderTypographyCanvases());
  }

  function renderTypographyCanvases(){
    document.querySelectorAll('#preview .type-preview[data-font-model][data-font-role]').forEach(el=>{
      const text=el.dataset.previewText??el.textContent??'';
      if(!el.dataset.previewText)el.dataset.previewText=text;
      if(!text.trim()){el.innerHTML='';return}

      const rect=el.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return;

      const cs=getComputedStyle(el);
      const dpr=Math.max(2,Math.min(4,window.devicePixelRatio||1));
      const canvas=document.createElement('canvas');
      canvas.className='type-preview-canvas';
      canvas.width=Math.max(1,Math.round(rect.width*dpr));
      canvas.height=Math.max(1,Math.round(rect.height*dpr));
      canvas.style.width='100%';
      canvas.style.height='100%';

      const ctx=canvas.getContext('2d');
      if(!ctx)return;

      const weight=cs.fontWeight||'400';
      const style=cs.fontStyle||'normal';
      const family=cs.fontFamily||'sans-serif';
      let size=parseFloat(cs.fontSize)||24;
      const isLargeSample=el.classList.contains('sample-name')||el.classList.contains('sample-number');
      const maxW=canvas.width*(isLargeSample?.94:.88);
      const maxH=canvas.height*(isLargeSample?.88:.72);

      const setFont=px=>{
        ctx.font=`${style} ${weight} ${Math.max(1,px*dpr)}px ${family}`;
      };

      setFont(size);
      let metrics=ctx.measureText(text);
      let inkW=Math.max(1,metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight);
      let inkH=Math.max(1,metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent);

      const fit=Math.min(1,maxW/inkW,maxH/inkH);
      size=Math.max(8,size*fit);
      setFont(size);
      metrics=ctx.measureText(text);

      const left=metrics.actualBoundingBoxLeft||0;
      const right=metrics.actualBoundingBoxRight||metrics.width||1;
      const ascent=metrics.actualBoundingBoxAscent||size*dpr*.75;
      const descent=metrics.actualBoundingBoxDescent||size*dpr*.25;
      const width=left+right;
      const height=ascent+descent;

      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle=cs.color||'#111';
      ctx.textAlign='left';
      ctx.textBaseline='alphabetic';

      const x=(canvas.width-width)/2+left;
      const y=(canvas.height-height)/2+ascent;
      ctx.fillText(text,x,y);

      el.replaceChildren(canvas);
    });
  }
  function listPages(start){const rows=state.listRows.length?state.listRows:[{name:'',number:'',size:'',obs:''}],chunks=[];for(let i=0;i<rows.length;i+=18)chunks.push(rows.slice(i,i+18));return chunks.map((c,idx)=>pageWrap(start+idx,idx===0?'LISTA DE PRODUÇÃO':'LISTA • CONTINUAÇÃO',idx===0?'Nomes, números, tamanhos e observações para conferência':'Continuação da lista cadastrada',`<table class="list-table"><thead><tr><th>Nome</th><th>Nº</th><th>Tamanho</th><th>Observação</th></tr></thead><tbody>${c.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.number)}</td><td>${esc(r.size)}</td><td>${esc(r.obs)}</td></tr>`).join('')}</tbody></table><div class="list-summary">Itens cadastrados: ${state.listRows.length}</div>`))}
  function approvalPage(n){const items=getChecklist().map(x=>`<div class="checklist-item"><span class="check-box"></span><span>${esc(x)}</span></div>`).join(''),text=state.mode==='art'?'Ao aprovar esta prova de arte, o cliente confirma que conferiu e está de acordo com o visual apresentado, incluindo os modelos, cores, escudo, logotipos, patrocinadores, posicionamentos, fundos, composições, nomes e numerações.':'Ao aprovar este documento, o cliente confirma a conferência dos nomes, números, tamanhos, quantidades e observações apresentados nesta lista.',important=state.mode==='art'?`<div class="final-important"><b>IMPORTANTE</b>Revise atentamente todos os modelos e elementos desta prova antes de aprovar. Após a aprovação, esta versão será considerada a referência visual autorizada para continuidade do projeto.</div>`:'';return pageWrap(n,'CONFERÊNCIA FINAL','Checklist do documento antes da liberação para a próxima etapa',`<div class="checklist">${items}</div>${important}<div class="approval-panel"><h3>APROVAÇÃO</h3><p>${text}</p><div class="approval-meta"><div><div class="approval-line">${state.approvedBy?`<span style="font-size:8pt">${esc(state.approvedBy)}</span>`:''}</div><div class="approval-label">Responsável pela aprovação</div></div><div><div class="approval-line">${state.approvalRef?`<span style="font-size:8pt">${esc(state.approvalRef)}</span>`:''}</div><div class="approval-label">Referência / data da aprovação</div></div></div></div>`,`<div class="status-stamp">${esc(state.status)}</div>`)}
  function renderPreview(){let pages=[coverPage()],n=2;if(state.mode==='art'){state.models.forEach(m=>pages.push(modelProofPage(m,n++)));state.models.forEach(m=>pages.push(compositionPage(m,n++)));for(const m of state.models){const ids=identityPagesForModel(m,n);pages.push(...ids);n+=ids.length}for(const m of state.models){const tp=typographyPage(m,n);if(tp){pages.push(tp);n++}}}else{const ls=listPages(n);pages.push(...ls);n+=ls.length}pages.push(approvalPage(n++));$('#preview').innerHTML=pages.join('');applyRenderedFontAliases();$('#pageCountLabel').textContent=`• ${pages.length} páginas`;document.title=`${(state.team||'Projeto').replace(/[^\wÀ-ÿ -]/g,'').trim()}_${state.mode==='art'?'PROVA_ARTE':'PROVA_LISTA'}_${state.version||'V01'}`}
