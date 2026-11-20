import {orbitContent,renderChapterBody} from './orbit-content.js';

const stage=document.querySelector('#orbit-stage');
const canvas=document.querySelector('#orbit-canvas');
const world=document.querySelector('.world');
const dialog=document.querySelector('#chapter-dialog');
const nav=[...document.querySelectorAll('[data-chapter]')];
const hotspots=[...document.querySelectorAll('[data-open-chapter]')];
const controls=document.querySelector('.view-controls');
const motionToggle=document.querySelector('#motion-toggle');
const hint=document.querySelector('#hint-text');
const status=document.querySelector('#scene-status');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let scene=null,userPaused=false,opener=null,closingTimer=0,unavailable=false,leaving=false;

const selectedChapter=id=>{
  nav.forEach(link=>{if(link.dataset.chapter===id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
  hotspots.forEach(button=>button.classList.toggle('is-selected',button.dataset.openChapter===id));
};
function updateMotion(){
  motionToggle.disabled=motionPreference.matches;
  motionToggle.textContent=motionPreference.matches?'Reduced motion':userPaused?'Resume motion':'Pause motion';
  motionToggle.setAttribute('aria-pressed',String(userPaused||motionPreference.matches));
  scene?.setPaused(userPaused||dialog.open);
}
function openChapter(id,trigger){
  const chapter=orbitContent.chapters.find(item=>item.id===id);
  if(!chapter)return;
  clearTimeout(closingTimer);dialog.classList.remove('is-closing');
  opener=trigger||nav.find(link=>link.dataset.chapter===id);
  document.querySelector('#chapter-eyebrow').textContent=chapter.eyebrow;
  document.querySelector('#chapter-title').textContent=chapter.title;
  document.querySelector('#chapter-intro').textContent=chapter.intro;
  document.querySelector('#chapter-body').innerHTML=renderChapterBody(chapter);
  document.querySelector('.chapter-scroll').scrollTop=0;
  selectedChapter(id);scene?.focus(id);
  if(!dialog.open)dialog.showModal();
  document.querySelector('#close-chapter').focus({preventScroll:true});
  updateMotion();
}
function closeChapter(){
  if(!dialog.open||dialog.classList.contains('is-closing'))return;
  const complete=()=>{
    dialog.close();dialog.classList.remove('is-closing');updateMotion();
    const fallback=nav.find(link=>link.hasAttribute('aria-current'));
    const target=opener&&!opener.hidden&&opener.getClientRects().length?opener:fallback;
    target?.focus({preventScroll:true});
  };
  if(motionPreference.matches)complete();
  else{dialog.classList.add('is-closing');closingTimer=setTimeout(complete,250);}
}
nav.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openChapter(link.dataset.chapter,link);}));
hotspots.forEach(button=>button.addEventListener('click',()=>openChapter(button.dataset.openChapter,button)));
document.querySelector('#close-chapter').addEventListener('click',closeChapter);
document.querySelector('#return-scene').addEventListener('click',closeChapter);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeChapter();});
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(element=>element.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
});
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeChapter();
});
document.querySelector('#reset-view').addEventListener('click',()=>{scene?.reset();selectedChapter(null);});
document.querySelector('#turn-view').addEventListener('click',()=>scene?.turn());
motionToggle.addEventListener('click',()=>{userPaused=!userPaused;updateMotion();});
motionPreference.addEventListener('change',()=>{scene?.setReducedMotion(motionPreference.matches);updateMotion();});
document.querySelector('.skip-link').addEventListener('click',()=>{
  document.querySelector('#direct-access').classList.add('show-direct');
  requestAnimationFrame(()=>document.querySelector('#direct-access').focus({preventScroll:true}));
});
// Chapter links and their content work independently from the graphics layer.
document.body.classList.add('enhanced');
updateMotion();

function stillView(){
  unavailable=true;scene?.dispose();scene=null;
  world.classList.remove('scene-ready');controls.hidden=true;
  hotspots.forEach(button=>button.hidden=true);
  stage.removeAttribute('tabindex');
  stage.setAttribute('aria-label','Vigo Dang’s portfolio ID badge. Choose a chapter below to explore.');
  hint.textContent='Choose a chapter to explore.';
  status.textContent='You’re viewing the still edition.';
  canvas.dataset.ready='false';
}
stage.addEventListener('scene-unavailable',stillView);

async function startScene(){
  try{
    const {createOrbitScene}=await import('./orbit-scene.js');
    if(leaving)return;
    const created=await createOrbitScene({
      canvas,stage,reducedMotion:motionPreference.matches,
      onSelect:id=>openChapter(id,nav.find(link=>link.dataset.chapter===id)),
      onFrame:({projected})=>{
        if(unavailable||leaving)return;
        world.classList.add('scene-ready');controls.hidden=false;
        if(stage.getAttribute('tabindex')!=='0'){
          stage.tabIndex=0;
          stage.setAttribute('aria-label','Interactive portfolio ID badge. Drag left or right to turn, tap the card to flip, or use the arrow keys. Choose a chapter below.');
          hint.textContent='Drag to turn. Tap the card to flip.';
        }
        projected.forEach(point=>{
          const button=hotspots.find(item=>item.dataset.openChapter===point.id);
          // Keep a focused card row available while the badge turns.
          button.hidden=!point.visible&&document.activeElement!==button;
          button.style.width=`${Math.max(44,point.width)}px`;
          button.style.height=`${Math.max(44,point.height)}px`;
          button.style.transform=`translate(${point.x}px,${point.y}px) translate(-50%,-50%)`;
        });
      }
    });
    if(leaving||unavailable){created.dispose();return;}
    scene=created;updateMotion();
  }catch{if(!leaving)stillView();}
}
startScene();
addEventListener('pagehide',event=>{
  // Keep a back/forward-cache page resumable; the scene handles tab visibility.
  if(!event.persisted){leaving=true;clearTimeout(closingTimer);scene?.dispose();}
});
