const APS_VIEWS={
  project:{title:'01. Projeto',subtitle:'Informações gerais da prova'},
  models:{title:'02. Modelos',subtitle:'Mockups e variações do projeto'},
  composition:{title:'03. Fundo & composição',subtitle:'Texturas, cores e composição por modelo'},
  identity:{title:'04. Identidade & elementos',subtitle:'Escudo, patrocinadores e aplicações'},
  typography:{title:'05. Nome & numeração',subtitle:'Fontes, caracteres e exemplos'},
  final:{title:'06. Conferência final',subtitle:'Checklist e aprovação'},
  list:{title:'02. Lista de produção',subtitle:'Nomes, números, tamanhos e observações'}
};

let currentStudioView='project';

function setStudioView(view){
  const target=document.querySelector('.config-view[data-view="'+view+'"]');
  if(!target || target.style.display==='none') return;
  currentStudioView=view;
  document.querySelectorAll('.config-view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const meta=APS_VIEWS[view]||APS_VIEWS.project;
  const title=document.getElementById('topbarViewTitle');
  const kicker=document.getElementById('topbarViewKicker');
  if(title) title.textContent=meta.title;
  if(kicker) kicker.textContent=meta.subtitle;
  document.querySelector('.studio-content')?.scrollTo({top:0,behavior:'smooth'});
}

function ensureStudioView(){
  const btn=document.querySelector('.nav-button.active');
  if(btn && getComputedStyle(btn).display!=='none') return;
  setStudioView('project');
}

document.querySelectorAll('.nav-button').forEach(btn=>{
  btn.addEventListener('click',()=>setStudioView(btn.dataset.view));
});

document.getElementById('modeInput')?.addEventListener('change',()=>{
  setTimeout(ensureStudioView,0);
});

setStudioView('project');
