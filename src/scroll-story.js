/* Native scrolling owns the timeline. One frame per scroll update, no input
   interception, synthetic camera, easing tail or continuously running loop. */
if (document.body.matches('[data-scroll-story]')) mountStories();

function mountStories() {
  const scenes = [...document.querySelectorAll('[data-motion-sequence="project"]')];
  const photos = [...document.querySelectorAll('[data-parallax]')];
  const header = document.querySelector('.site-header');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1100px) and (min-height: 760px)');
  const print = matchMedia('print');
  const nativeScenes = CSS.supports('animation-timeline: view()');
  let records = [], frame = 0, dirty = true, active = false, printing = false;
  let height = innerHeight, headerHeight = 72;
  const properties = ['--scene-image-y','--scene-scale','--scene-tilt','--scene-copy-y','--scene-word-x','--photo-y'];
  const queue = () => { if (active && !frame && !document.hidden) frame = requestAnimationFrame(paint); };
  const invalidate = () => { dirty = true; queue(); };
  const clear = () => {
    cancelAnimationFrame(frame); frame = 0;
    document.body.classList.remove('scroll-story-ready');
    [...scenes,...photos].forEach(node => {
      properties.forEach(property => node.style.removeProperty(property));
      node.removeAttribute('data-in-view');
      node.removeAttribute('data-motion-static');
    });
  };
  function sync() {
    clear(); active = !reduce.matches && !print.matches && !printing;
    if (active) { document.body.classList.add('scroll-story-ready'); invalidate(); }
  }
  function measure() {
    height = innerHeight;
    headerHeight = Math.ceil(header?.getBoundingClientRect().height || 72);
    document.body.style.setProperty('--motion-header', `${headerHeight}px`);
    [...scenes,...photos].forEach(node => {
      properties.forEach(property => node.style.removeProperty(property));
      node.removeAttribute('data-motion-static');
    });
    // Short windows, zoom and long copy always fall back to normal document flow.
    if (desktop.matches) for (const node of scenes) {
      const stage = node.querySelector('.project-stage');
      if (node.querySelector('.scene-inner').offsetHeight > stage.clientHeight - 24) node.setAttribute('data-motion-static','');
    }
    const y = scrollY;
    records = [...scenes.map(node => ({node,scene:true})),...photos.map(node=>({node,scene:false}))].map(item=>({
      ...item, top:item.node.getBoundingClientRect().top + y, height:item.node.offsetHeight,
      pinned:item.scene && desktop.matches && !item.node.hasAttribute('data-motion-static'),
      stageHeight:item.scene ? item.node.querySelector('.project-stage').clientHeight : 0,
      visible:false, painted:false,
    }));
    dirty = false;
  }
  function paint() {
    frame = 0;
    if (!active || document.hidden) return;
    if (dirty) measure();
    const y = scrollY;
    for (const item of records) {
      const near = item.top < y + height * 1.2 && item.top + item.height > y - height * .2;
      if (near !== item.visible) { item.visible = near; item.node.toggleAttribute('data-in-view',near); }
      if (!near && item.painted) continue;
      if (item.scene) {
        // Supporting browsers sample the view timeline themselves, including
        // while the main thread is occupied. RAF remains the compatible fallback.
        if (nativeScenes && item.pinned) { item.painted = true; continue; }
        const p = item.pinned ? clamp((y + headerHeight - item.top) / Math.max(1,item.height-item.stageHeight))
          : clamp((y + height - item.top)/(height+item.height));
        item.node.style.setProperty('--scene-image-y', `${(item.pinned ? 64-p*124 : 16-p*32).toFixed(2)}px`);
        item.node.style.setProperty('--scene-scale', item.pinned ? (.9+p*.12).toFixed(4) : '1');
        item.node.style.setProperty('--scene-tilt', `${(item.pinned ? 7-p*7 : 0).toFixed(2)}deg`);
        item.node.style.setProperty('--scene-copy-y', `${(item.pinned ? -p*42 : 0).toFixed(2)}px`);
        item.node.style.setProperty('--scene-word-x', `${(-36+p*72).toFixed(2)}px`);
      } else {
        const p = clamp((y+height-item.top)/(height+item.height));
        item.node.style.setProperty('--photo-y', `${(18-p*36).toFixed(2)}px`);
      }
      item.painted = true;
    }
  }
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',invalidate,{passive:true});
  document.addEventListener('toggle',invalidate,true);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){cancelAnimationFrame(frame);frame=0;} else invalidate(); });
  document.fonts?.ready.then(invalidate);
  document.fonts?.addEventListener('loadingdone',invalidate);
  const observer = new ResizeObserver(invalidate);
  if(header) observer.observe(header);
  [...scenes,...photos].forEach(node=>observer.observe(node));
  [reduce,desktop,print].forEach(query=>query.addEventListener('change',sync));
  addEventListener('beforeprint',()=>{printing=true;sync();});
  addEventListener('afterprint',()=>{printing=false;sync();});
  addEventListener('pagehide',()=>{active=false;clear();});
  addEventListener('pageshow',sync);
  sync();
}
function clamp(value) { return Math.max(0,Math.min(1,value)); }
