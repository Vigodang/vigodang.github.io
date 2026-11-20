import {orbitContent,renderChapterBody} from './play/orbit-content.js';

const root=document.querySelector('.hero-badge-experience');
if(root)mountBadge(root);

function mountBadge(root){
  const stage=root.querySelector('#hero-badge-stage');
  const canvas=root.querySelector('#hero-badge-canvas');
  const dialog=document.querySelector('#hero-badge-dialog');
  if(!stage||!canvas||!dialog)return;
  const links=[...root.querySelectorAll('[data-hero-chapter]')];
  const turn=root.querySelector('[data-badge-turn]');
  const motion=root.querySelector('[data-badge-motion]');
  const hint=root.querySelector('.hero-badge-hint');
  const status=root.querySelector('[data-badge-status]');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let scene=null,paused=false,inView=true,opener=null,leaving=false,failed=false;
  const updateMotion=()=>{
    if(motion){motion.disabled=preference.matches;motion.textContent=preference.matches?'Reduced motion':paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused||preference.matches));}
    scene?.setPaused(paused||dialog.open||!inView);
  };
  function chapterBody(chapter){
    const template=document.createElement('template');template.innerHTML=renderChapterBody(chapter);
    const base=new URL('./play/',import.meta.url);
    template.content.querySelectorAll('[href],[src]').forEach(element=>{
      for(const attribute of ['href','src'])if(element.hasAttribute(attribute))element.setAttribute(attribute,new URL(element.getAttribute(attribute),base).href);
    });
    return template.content;
  }
  function openChapter(id,trigger){
    const chapter=orbitContent.chapters.find(item=>item.id===id);if(!chapter)return;
    opener=trigger||links.find(link=>link.dataset.heroChapter===id)||stage;
    dialog.querySelector('#hero-chapter-eyebrow').textContent=chapter.eyebrow;
    dialog.querySelector('#hero-chapter-title').textContent=chapter.title;
    dialog.querySelector('#hero-chapter-intro').textContent=chapter.intro;
    dialog.querySelector('#hero-chapter-body').replaceChildren(chapterBody(chapter));
    links.forEach(link=>link.toggleAttribute('data-selected',link.dataset.heroChapter===id));
    dialog.querySelector('.chapter-scroll').scrollTop=0;
    scene?.focus(id);if(!dialog.open)dialog.showModal();
    dialog.querySelector('[data-badge-close]').focus({preventScroll:true});updateMotion();
  }
  function closeChapter(){
    if(!dialog.open)return;dialog.close();updateMotion();
    if(opener?.getClientRects().length)opener.focus({preventScroll:true});
  }
  links.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openChapter(link.dataset.heroChapter,link);}));
  dialog.querySelectorAll('[data-badge-close]').forEach(button=>button.addEventListener('click',closeChapter));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeChapter();});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeChapter();
  });
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(element=>element.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });
  turn?.addEventListener('click',()=>scene?.turn());
  motion?.addEventListener('click',()=>{paused=!paused;updateMotion();});
  preference.addEventListener('change',()=>{scene?.setReducedMotion(preference.matches);updateMotion();});
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;updateMotion();},{threshold:.04}):null;
  observer?.observe(stage);
  function stillEdition(){
    failed=true;scene?.dispose();scene=null;root.classList.remove('badge-ready');
    stage.removeAttribute('tabindex');canvas.dataset.ready='false';
    if(turn)turn.hidden=true;if(motion)motion.hidden=true;
    if(hint)hint.textContent='Meet the person. Explore the work.';
    if(status)status.textContent='Choose a chapter below to explore.';
  }
  stage.addEventListener('scene-unavailable',stillEdition);
  updateMotion();
  (async()=>{
    try{
      const {createOrbitScene}=await import('./play/orbit-scene.js');if(leaving)return;
      const created=await createOrbitScene({canvas,stage,layout:'hero',reducedMotion:preference.matches,
        onSelect:id=>openChapter(id),
        onFrame:()=>{
          if(leaving||failed||root.classList.contains('badge-ready'))return;
          root.classList.add('badge-ready');stage.tabIndex=0;
          stage.setAttribute('aria-label','Vigo’s interactive portfolio badge. Drag to rotate, tap to flip, or use the arrow keys. Choose a chapter below.');
          if(turn)turn.hidden=false;if(motion)motion.hidden=false;
          if(hint)hint.textContent='Drag to turn. Tap the card to flip.';
          if(status)status.textContent='Interactive badge ready.';
        }});
      if(leaving||failed){created.dispose();return;}scene=created;updateMotion();
    }catch{if(!leaving)stillEdition();}
  })();
  addEventListener('pagehide',event=>{if(!event.persisted){leaving=true;observer?.disconnect();scene?.dispose();}});
}
