function fontId(f){return f.postscriptName||`${f.family||''}|||${f.fullName||''}|||${f.style||''}`}
  function fontLabel(f){const full=f.fullName||f.family||'Fonte sem nome',fam=f.family&&f.family!==full?` — ${f.family}`:'';return `${full}${fam}`}
  function populateFontSelectors(){const m=typographySource(getActiveModel()),ns=$('#nameFontSelect'),xs=$('#numberFontSelect');if(!m||!ns||!xs)return;const opts=(ps,fam)=>['<option value="">Fonte padrão do sistema</option>',...localFonts.map(f=>`<option value="${esc(fontId(f))}" ${((ps&&fontId(f)===ps)||(!ps&&fam&&f.family===fam))?'selected':''}>${esc(fontLabel(f))}</option>`)].join('');ns.innerHTML=opts(m.nameFontPostscript,m.nameFontFamily);xs.innerHTML=opts(m.numberFontPostscript,m.numberFontFamily);if(!localFonts.length){ns.value='';xs.value=''}}
  async function loadFontFace(model,role){
    const ps=model[`${role}FontPostscript`],fam=model[`${role}FontFamily`],
      item=localFonts.find(f=>fontId(f)===ps)||localFonts.find(f=>f.family===fam),
      key=`${model.id}:${role}`;
    if(!item){fontAliases.delete(key);return}
    try{
      const blob=await item.blob(),url=URL.createObjectURL(blob),
        alias=`APS_${model.id.replace(/[^a-z0-9]/gi,'')}_${role}`;
      const face=new FontFace(alias,`url(${url})`);
      await face.load();
      document.fonts.add(face);
      fontAliases.set(key,alias);
      await document.fonts.load(`32px "${alias}"`);
      await document.fonts.ready;
    }catch(e){
      console.warn('Falha ao aplicar fonte local',e);
      fontAliases.delete(key);
    }
  }
  async function applyAllSelectedFonts(){await Promise.all(state.models.flatMap(m=>[loadFontFace(m,'name'),loadFontFace(m,'number')]));renderPreview()}
  function setFontStatus(msg,kind='info'){const el=$('#fontStatus');if(el){el.textContent=msg;el.dataset.kind=kind}}
  async function scanLocalFonts(){const btn=$('#loadLocalFontsBtn');if(typeof window.queryLocalFonts!=='function'){setFontStatus('Este navegador não oferece acesso à lista de fontes instaladas. Abra o APS no Chrome ou Edge para usar esta função.','error');return}if(!window.isSecureContext){setFontStatus('O navegador não considera esta abertura segura para ler fontes locais. Abra o APS em localhost.','error');return}try{btn.disabled=true;btn.textContent='Lendo fontes…';const fonts=await window.queryLocalFonts(),seen=new Set();localFonts=[...fonts].filter(f=>{const k=fontId(f);if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>fontLabel(a).localeCompare(fontLabel(b),'pt-BR'));populateFontSelectors();await applyAllSelectedFonts();if(typeof broadcastPreviewState==='function')broadcastPreviewState();setFontStatus(`${localFonts.length} fontes do computador disponíveis.`,'ok')}catch(e){setFontStatus(`Não consegui ler as fontes instaladas: ${e?.message||'erro desconhecido'}`,'error')}finally{btn.disabled=false;btn.textContent='Ler fontes do meu PC'}}
