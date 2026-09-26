function download(name,data,type='application/octet-stream'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

  ['teamInput','subtitleInput','versionInput','dateInput','statusInput','approvedByInput','approvalRefInput','accentInput','accent2Input'].forEach(id=>{const map={teamInput:'team',subtitleInput:'subtitle',versionInput:'version',dateInput:'date',statusInput:'status',approvedByInput:'approvedBy',approvalRefInput:'approvalRef',accentInput:'accent',accent2Input:'accent2'};$('#'+id).addEventListener('input',e=>{state[map[id]]=e.target.value;update()})});
  $('#modeInput').onchange=e=>{state.mode=e.target.value;state.subtitle=state.mode==='art'?'Apresentação visual para conferência e aprovação':'Apresentação de lista para conferência e aprovação';$('#subtitleInput').value=state.subtitle;renderChecklistEditor();update()};
  $$('.model-selector').forEach(sel=>sel.onchange=e=>{state.activeModelId=e.target.value;syncAll()});
  $('#addModelBtn').onclick=()=>{const main=getMainModel(),m=createModel(`Modelo ${state.models.length+1}`,false,main);state.models.push(m);state.activeModelId=m.id;syncAll()};
  $('#includeBottomInput').onchange=e=>{const m=getActiveModel();m.includeBottom=e.target.checked;renderCompositionEditor();renderIdentityEditor();update()};
  $('#compositionNotesInput').oninput=e=>{getActiveModel().compositionNotes=e.target.value;update()};
  $('#addColorBtn').onclick=()=>{getActiveModel().palette.push({id:uid(),hex:'#888888',name:'Nova cor'});renderPaletteEditor();renderIdentityEditor();update()};
  $('#crestNameInput').oninput=e=>{identitySource(getActiveModel()).crest.name=e.target.value;update()};
  $('#crestLocationInput').onchange=e=>{const c=identitySource(getActiveModel()).crest;c.location=e.target.value;$('#crestCustomLocationInput').classList.toggle('is-hidden',c.location!=='Outro');update()};
  $('#crestCustomLocationInput').oninput=e=>{identitySource(getActiveModel()).crest.customLocation=e.target.value;update()};
  $('#addTopElementBtn').onclick=()=>{identitySource(getActiveModel()).elements.push({id:uid(),image:'',type:'Patrocínio',customType:'',name:'',location:'',customLocation:'',bg:'#FFFFFF'});renderElementsEditor();update()};
  $('#addBottomElementBtn').onclick=()=>{identitySource(getActiveModel()).bottomElements.push({id:uid(),image:'',type:'Patrocínio',customType:'',name:'',location:'',customLocation:'',bg:'#FFFFFF'});renderElementsEditor();update()};
  ['alphabetInput','numbersInput','nameSampleInput','numberSampleInput'].forEach(id=>$('#'+id).oninput=e=>{const m=typographySource(getActiveModel()),map={alphabetInput:'alphabet',numbersInput:'numbers',nameSampleInput:'nameSample',numberSampleInput:'numberSample'};m[map[id]]=e.target.value;update()});
  $('#loadLocalFontsBtn').onclick=scanLocalFonts;
  $('#nameFontSelect').onchange=async e=>{const m=typographySource(getActiveModel()),f=localFonts.find(x=>fontId(x)===e.target.value);m.nameFontFamily=f?.family||'';m.nameFontFullName=f?.fullName||f?.family||'Fonte padrão do sistema';m.nameFontPostscript=f?fontId(f):'';const ok=await loadFontFace(m,'name');setFontStatus(ok?`Fonte do nome aplicada: ${m.nameFontFullName}`:`Não consegui aplicar a fonte do nome: ${m.nameFontFullName}`,ok?'ok':'error');update()};
  $('#numberFontSelect').onchange=async e=>{const m=typographySource(getActiveModel()),f=localFonts.find(x=>fontId(x)===e.target.value);m.numberFontFamily=f?.family||'';m.numberFontFullName=f?.fullName||f?.family||'Fonte padrão do sistema';m.numberFontPostscript=f?fontId(f):'';const ok=await loadFontFace(m,'number');setFontStatus(ok?`Fonte do número aplicada: ${m.numberFontFullName}`:`Não consegui aplicar a fonte do número: ${m.numberFontFullName}`,ok?'ok':'error');update()};
  $('#addListRowBtn').onclick=()=>{state.listRows.push({id:uid(),name:'',number:'',size:'',obs:''});renderListEditor();update()};$('#addChecklistBtn').onclick=()=>{getChecklist().push('Novo item de conferência');renderChecklistEditor();update()};


