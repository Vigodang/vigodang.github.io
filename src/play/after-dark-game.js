import {projects as sourceProjects} from './content.js';
import {icon} from './icons.js';
import {drawWorld,preloadArt} from './after-dark-world.js';
import {createHero,jumpHero,stepHero} from './physics.js';
import {createPresentation,advancePresentation,activateStation} from './presentation.js';
import {populateBrief} from './briefing.js';
import {createMissionUI} from './mission-ui.js';
import {createAudioEngine} from './audio-engine.js';
import {renderEvidence} from './evidence.js';

const $=id=>document.getElementById(id);
const districtNames=['AI Alley','Cloud Kitchen','Data Market','Agent Arcade','Parallel Works','Vision Street'];
const projects=sourceProjects.map((p,i)=>({...p,short:districtNames[i]}));
const canvas=$('game'),dialog=$('project-dialog'),WORLD_W=4220;
const keys={left:false,right:false},restored=new Set(),collected=new Set();
const audio=createAudioEngine(),motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion=motionQuery.matches,ambient=!reducedMotion,rain=!reducedMotion;
let width=1100,height=480,ground=414,hero=createHero(ground),camera=0,time=0,lastTime=0,frameId=0;
let ctx,playing=false,paused=false,sceneVisible=true,nearby=null,lastNearbyKey='',opener=null;
let platforms=[],collectibles=[],dust=[],tapLeft=0,tapRight=0,lastZone=-1,lastStep=0;
let presentation=createPresentation(),celebrateUntil=0,toastTimer=0,dialogAudioTimer=0;
const node=(tag,text,cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
function glyph(name){const el=node('span','');el.innerHTML=icon(name);return el;}
function buttonLabel(id,name,text){$(id).replaceChildren(glyph(name),node('span',text));}
function clearInput(){keys.left=false;keys.right=false;tapLeft=tapRight=0;hero.vx=0;audio.setMoving(false);}
function syncAudio(){return audio.setPaused(paused||document.hidden||(!sceneVisible&&missionUI.active==null)||dialog.open);}
const missionUI=createMissionUI({host:$('mission-dock'),projects,isPaused:()=>paused||document.hidden||dialog.open,
  onSound:event=>audio.play(event==='ui'?'interact':event),
  onRestore:id=>{
    const first=!restored.has(id);restored.add(id);activateStation(presentation,id,true,ambient&&!reducedMotion);celebrateUntil=performance.now()+1300;
    audio.play(first?(restored.size===6?'complete':'restore'):'success');
    $('restoration-toast').textContent=`${districtNames[id]} online. ${restored.size} / 6 systems restored.`;$('restoration-toast').hidden=false;
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('restoration-toast').hidden=true,4200);
    const reveal=renderEvidence(projects[id]),artifact=reveal.querySelector('figure');
    if(artifact){const display=node('div','','evidence-panel mission-revealed-artifact');display.append(node('p','EVIDENCE RECOVERED','mission-eyebrow'),artifact);$('mission-dock').querySelector('.mission-evidence').append(display);}
    updateProgress();render();schedule();
  },onDossier:id=>showProject(id),onClose:()=>{clearInput();canvas.focus({preventScroll:true});document.querySelector('.game-console').scrollIntoView({block:'start',behavior:'instant'});syncAudio();schedule();}
});
function resetHero(){hero=createHero(ground);hero.x=projects[1].x-72;camera=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));}
function buildWorld(){platforms=projects.slice(1).map(p=>({x:p.x-280,y:ground-94,w:112,h:14}));collectibles=projects.flatMap((p,i)=>[{id:'ground-'+i,x:p.x-145,y:ground-30},...(i?[{id:'roof-'+i,x:p.x-224,y:ground-125}]:[])]);}
function resize(){if(!ctx)return;const rect=canvas.getBoundingClientRect(),old=ground;width=Math.max(240,Math.round(rect.width));height=Math.max(180,Math.round(rect.height));ground=height-61;
  const ratio=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);hero.y+=ground-old;buildWorld();camera=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));render();schedule();}
function render(){if(ctx)drawWorld(ctx,{width,height,ground,camera,time,hero,...presentation,rain,stations:projects,platforms,collectibles,collected,restored,nearbyId:nearby?.id??null,reducedMotion,ambient,dust});}
function schedule(){if(!frameId&&ctx&&sceneVisible&&!document.hidden&&!dialog.open&&!paused)frameId=requestAnimationFrame(frame);}
function stop(){if(frameId)cancelAnimationFrame(frameId);frameId=0;lastTime=0;clearInput();}
function begin(focus=true){const first=!playing;playing=true;paused=false;$('launch-card').hidden=true;document.querySelector('.game-console').dataset.playing='true';$('pause-game').setAttribute('aria-pressed','false');buttonLabel('pause-game','pause','Pause');syncAudio();if(focus)canvas.focus({preventScroll:true});if(first){audio.play('start');if(innerWidth<800||matchMedia('(pointer:coarse)').matches)document.querySelector('.game-console').scrollIntoView({block:'start',behavior:'instant'});}findNearby();schedule();}
function travel(id){if(!projects[id])return;missionUI.close();begin(false);hero.x=projects[id].x-72;hero.y=ground-hero.h;hero.vy=0;hero.onGround=true;clearInput();camera=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));lastZone=-1;audio.play('nav');findNearby();render();canvas.focus({preventScroll:true});document.querySelector('.game-console').scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});}
function findNearby(){const centre=hero.x+hero.w/2;nearby=projects.find(p=>Math.abs(p.x-centre)<115)||null;const key=nearby?String(nearby.id):'none';
  if(key!==lastNearbyKey){lastNearbyKey=key;$('nearby-hint').textContent=nearby?`${nearby.short} · ${restored.has(nearby.id)?'System online. Replay or inspect its evidence.':'Connect the system to bring this shop online.'}`:'Follow the light fragments, or select a district below.';
    $('open-nearby').disabled=!nearby;$('interact-touch').disabled=!nearby;$('open-nearby-label').textContent=nearby?restored.has(nearby.id)?'Replay system':'Connect system':'Find a system';if(nearby&&playing)audio.play('approach');}
  const zone=projects.reduce((a,p)=>Math.abs(p.x-centre)<Math.abs(a.x-centre)?p:a,projects[0]);if(zone.id!==lastZone){lastZone=zone.id;audio.setDistrict(zone.id);$('mission-title').textContent=restored.size===6?'All six systems online. The market is alive.':`${zone.short} / ${restored.has(zone.id)?'restored':'awaiting connection'}`;document.querySelectorAll('#station-map button').forEach((b,i)=>{if(i===zone.id)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});}}
function frame(now){frameId=0;if(document.hidden||!sceneVisible||paused||dialog.open){lastTime=0;return;}const dt=lastTime?Math.min(34,now-lastTime):16.667;lastTime=now;if(ambient&&!reducedMotion)time+=dt;const wasGrounded=hero.onGround;
  if(playing&&missionUI.active==null){stepHero(hero,{left:keys.left||now<tapLeft,right:keys.right||now<tapRight},platforms,ground,WORLD_W,dt);const moving=hero.onGround&&Math.abs(hero.vx)>.5;audio.setMoving(moving);if(moving&&now-lastStep>210){audio.play('footstep');lastStep=now;}
    if(!wasGrounded&&hero.onGround){audio.play('land');if(ambient&&!reducedMotion)dust.push({x:hero.x+hero.w/2,y:hero.y+hero.h,age:0});}
    for(const item of collectibles)if(!collected.has(item.id)&&Math.hypot(hero.x+hero.w/2-item.x,hero.y+hero.h/2-item.y)<31){collected.add(item.id);$('chip-count').textContent=`${collected.size} / 11 optional light fragments`;audio.play('pickup');}
    const target=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));camera=reducedMotion?target:camera+(target-camera)*Math.min(1,.12*dt/16.667);findNearby();}else audio.setMoving(false);
  dust=dust.map(p=>({...p,age:p.age+dt})).filter(p=>p.age<330);advancePresentation(presentation,hero,wasGrounded,dt);if(celebrateUntil>now)presentation.heroPose='celebrate';else if(missionUI.active!=null)presentation.heroPose='interact';render();
  Object.assign(canvas.dataset,{playerX:hero.x.toFixed(1),playerY:hero.y.toFixed(1),grounded:String(hero.onGround),playing:String(playing),ambient:String(ambient&&!reducedMotion),pose:presentation.heroPose,worldTime:time.toFixed(0),rain:String(rain&&ambient&&!reducedMotion),restored:String(restored.size)});if(playing||(ambient&&!reducedMotion))schedule();}
function updateProgress(){lastZone=-1;lastNearbyKey='';$('discovery-count').textContent=`${restored.size} / 6 systems online`;document.querySelectorAll('#progress-segments i').forEach((el,i)=>el.classList.toggle('active',restored.has(i)));document.querySelectorAll('#station-map button').forEach((el,i)=>{el.classList.toggle('visited',restored.has(i));el.setAttribute('aria-label',`Travel to ${projects[i].short}, ${restored.has(i)?'restored':'offline'}`);});$('completion-panel').hidden=restored.size!==6;findNearby();}
function showProject(id){const p=projects[id];if(!p)return;if(typeof dialog.showModal!=='function'){location.href=p.links[0].href;return;}opener=document.activeElement;stop();populateBrief(p,{reducedMotion:reducedMotion||!ambient});$('project-evidence').replaceChildren(renderEvidence(p));audio.play('evidence');dialog.showModal();document.body.classList.add('dialog-open');dialog.scrollTop=0;clearTimeout(dialogAudioTimer);dialogAudioTimer=setTimeout(syncAudio,420);}
function interact(){if(dialog.open||paused||!nearby)return;begin(false);clearInput();audio.play('interact');missionUI.open(nearby.id);syncAudio();$('mission-dock').scrollIntoView({block:'nearest',behavior:reducedMotion?'instant':'smooth'});}
function jump(){if(paused||dialog.open||missionUI.active!=null)return;begin(false);if(jumpHero(hero))audio.play('jump');schedule();}
async function toggleSound(){if($('toggle-sound').disabled)return;$('toggle-sound').disabled=true;$('enable-sound').disabled=true;const enable=!audio.enabled;if(enable){await audio.enable();const enabled=audio.enabled;buttonLabel('toggle-sound',enabled?'sound':'muted',enabled?'Sound on':'Sound unavailable');$('enable-sound').textContent=enabled?'Soundscape enabled':'Sound unavailable in this browser';}else{audio.disable();buttonLabel('toggle-sound','muted','Enable sound');$('enable-sound').replaceChildren(glyph('sound'),node('span','Enable the city soundscape'));}$('toggle-sound').setAttribute('aria-pressed',String(audio.enabled));syncAudio();audio.setRain(rain&&ambient&&!reducedMotion);$('toggle-sound').disabled=false;$('enable-sound').disabled=false;}
function motionControls(){const effects=ambient&&!reducedMotion;$('toggle-atmosphere').disabled=reducedMotion;$('toggle-atmosphere').setAttribute('aria-pressed',String(effects));buttonLabel('toggle-atmosphere','progress',reducedMotion?'Reduced motion':ambient?'Atmosphere on':'Atmosphere off');$('toggle-weather').disabled=!effects;$('toggle-weather').setAttribute('aria-pressed',String(rain&&effects));buttonLabel('toggle-weather','cloud',rain&&effects?'Rain on':'Rain off');document.querySelector('.game-console').dataset.effects=effects?'on':'off';audio.setRain(rain&&effects);if(!effects)dust=[];}
dialog.addEventListener('close',async()=>{clearTimeout(dialogAudioTimer);document.body.classList.remove('dialog-open');clearInput();if(opener?.isConnected)opener.focus({preventScroll:true});await syncAudio();audio.play('close');schedule();});
$('close-project').addEventListener('click',()=>dialog.close());$('keep-exploring').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
document.querySelectorAll('[data-open-project]').forEach(b=>{b.hidden=false;b.addEventListener('click',()=>showProject(Number(b.dataset.openProject)));});
function init(){try{ctx=canvas.getContext('2d',{alpha:false});}catch{ctx=null;}if(!ctx){$('game-fallback').firstElementChild.textContent='This browser cannot display the city. Every project and its evidence is available below.';return;}
  $('game-fallback').hidden=true;$('launch-card').hidden=false;$('game-actions').hidden=false;document.querySelector('.mobile-controls').hidden=false;$('station-map').hidden=false;
  $('station-map').replaceChildren(...projects.map(p=>{const b=node('button','');b.type='button';b.append(glyph(p.icon));const text=node('span',p.short);text.prepend(node('small',String(p.id+1).padStart(2,'0')));b.append(text);b.addEventListener('click',()=>travel(p.id));return b;}));
  $('start-game').addEventListener('click',()=>begin());$('open-nearby').addEventListener('click',interact);$('interact-touch').addEventListener('click',interact);
  $('reset-game').addEventListener('click',()=>{stop();missionUI.reset();restored.clear();collected.clear();audio.resetProgress();presentation=createPresentation();celebrateUntil=0;clearTimeout(toastTimer);$('restoration-toast').hidden=true;$('chip-count').textContent='0 / 11 optional light fragments';resetHero();updateProgress();begin();render();});
  $('pause-game').addEventListener('click',()=>{paused=!paused;$('pause-game').setAttribute('aria-pressed',String(paused));buttonLabel('pause-game',paused?'play':'pause',paused?'Resume':'Pause');if(paused){stop();$('nearby-hint').textContent='Night shift paused. Evidence and navigation stay available.';}else{lastNearbyKey='';findNearby();schedule();}syncAudio();});
  $('toggle-sound').addEventListener('click',toggleSound);$('enable-sound').addEventListener('click',toggleSound);
  for(const [id,method] of [['master-volume','setVolume'],['music-volume','setMusic'],['sfx-volume','setSfx']]){$(id).addEventListener('input',e=>audio[method](Number(e.target.value)));audio[method](Number($(id).value));}
  $('toggle-weather').addEventListener('click',()=>{rain=!rain;audio.play('rain');motionControls();render();schedule();});$('toggle-atmosphere').addEventListener('click',()=>{ambient=!ambient;motionControls();render();schedule();});motionQuery.addEventListener('change',e=>{reducedMotion=e.matches;ambient=!reducedMotion;motionControls();render();schedule();});motionControls();
  $('jump-touch').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('jump-touch').addEventListener('click',e=>{if(e.detail===0)jump();});
  function touch(id,key){const b=$(id);b.addEventListener('pointerdown',e=>{if(paused||missionUI.active!=null)return;e.preventDefault();b.setPointerCapture(e.pointerId);begin(false);keys[key]=true;});const up=()=>keys[key]=false;b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('click',e=>{if(e.detail===0&&!paused&&missionUI.active==null){begin(false);if(key==='left')tapLeft=performance.now()+150;else tapRight=performance.now()+150;}});}
  touch('left-touch','left');touch('right-touch','right');
  document.addEventListener('keydown',e=>{if(document.activeElement!==canvas||dialog.open||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','a','d','w',' ','e','enter','r'].includes(k))e.preventDefault();if(k==='r'&&!e.repeat){$('reset-game').click();return;}if(paused||missionUI.active!=null)return;if(k==='arrowleft'||k==='a'){begin(false);keys.left=true;}if(k==='arrowright'||k==='d'){begin(false);keys.right=true;}if(['arrowup','w',' '].includes(k)&&!e.repeat)jump();if(['e','enter'].includes(k)&&!e.repeat)interact();});
  document.addEventListener('keyup',e=>{if(['arrowleft','a'].includes(e.key.toLowerCase()))keys.left=false;if(['arrowright','d'].includes(e.key.toLowerCase()))keys.right=false;});canvas.addEventListener('pointerdown',()=>{canvas.focus({preventScroll:true});if(!paused&&missionUI.active==null)begin(false);});canvas.addEventListener('blur',clearInput);window.addEventListener('blur',clearInput);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();syncAudio();});if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);if('IntersectionObserver'in window)new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;if(sceneVisible)schedule();else stop();syncAudio();},{threshold:0}).observe(canvas);
  resetHero();resize();updateProgress();preloadArt(()=>{render();schedule();});schedule();
}
init();
