import {projects,profile} from './content.js';
import {icon} from './icons.js';
import {drawWorld} from './world-art.js';
import {createHero,jumpHero,stepHero} from './physics.js';
import {createPresentation,advancePresentation,activateStation,discoverStation} from './presentation.js';
import {populateBrief} from './briefing.js';

// Refinement of the prototype's Canvas loop: same walk/jump/one-way platforms,
// camera-follow city and portal discovery; DOM owns accessible content and HUD.
const $=id=>document.getElementById(id);
const canvas=$('game'),dialog=$('project-dialog');
const WORLD_W=4220,keys={left:false,right:false};
const visited=new Set(),collected=new Set();
const terminals=[{id:'about',x:110,icon:'about',label:'PROFILE'},{id:'contact',x:4050,icon:'contact',label:'CONTACT'}];
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion=motionQuery.matches,ambient=!reducedMotion,soundOn=false,audioCtx;
let width=1100,height=480,ground=414,hero=createHero(ground),camera=0,time=0,lastTime=0,frameId=0;
let ctx,playing=false,paused=false,sceneVisible=true,nearby=null,lastNearbyKey='',opener=null,completionAnnounced=false;
let platforms=[],collectibles=[],dust=[],tapLeft=0,tapRight=0,lastDataUpdate=0,lastZone=-1;
let presentation=createPresentation(),rain=false,pendingDiscovery=null;

const node=(tag,text,cls='')=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
function glyph(name){const span=document.createElement('span');span.innerHTML=icon(name);return span;}
function changeButton(id,name,label){const button=$(id);button.replaceChildren(glyph(name),node('span',label));}

function beep(freq=500,duration=.08){
  if(!soundOn)return;
  try{audioCtx ||= new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.025,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}catch{soundOn=false;$('toggle-sound').setAttribute('aria-pressed','false');changeButton('toggle-sound','muted','Sound unavailable');}
}
function clearInput(){keys.left=false;keys.right=false;tapLeft=0;tapRight=0;hero.vx=0;}
function buildWorld(){
  platforms=projects.slice(1).map(p=>({x:p.x-280,y:ground-94,w:112,h:14}));
  collectibles=projects.flatMap((p,i)=>[{id:'ground-'+i,x:p.x-145,y:ground-30},...(i?[{id:'roof-'+i,x:p.x-224,y:ground-125}]:[])]);
}
function resize(){
  const rect=canvas.getBoundingClientRect(),oldGround=ground;
  width=Math.max(240,Math.round(rect.width));height=Math.max(300,Math.round(rect.height));ground=height-66;
  const ratio=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  hero.y+=ground-oldGround;buildWorld();camera=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));
  render();schedule();
}
function render(){
  drawWorld(ctx,{width,height,ground,camera,time,hero,...presentation,rain,stations:projects,platforms,collectibles,collected,visited,nearbyId:nearby?.id??null,reducedMotion,ambient,dust,terminals});
}
function schedule(){if(!frameId&&ctx&&sceneVisible&&!document.hidden&&!dialog.open&&!paused)frameId=requestAnimationFrame(frame);}
function stop(){if(frameId)cancelAnimationFrame(frameId);frameId=0;lastTime=0;clearInput();}
function begin(focus=true){if(!playing||paused){playing=true;paused=false;$('launch-card').hidden=true;$('pause-game').setAttribute('aria-pressed','false');changeButton('pause-game','pause','Pause');lastTime=0;}if(focus){canvas.focus({preventScroll:true});if(window.innerWidth<800)document.querySelector('.game-console').scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});}schedule();}
function travel(id){const p=projects[id];if(!p)return;begin(false);hero.x=p.x-72;hero.y=ground-hero.h;hero.vx=0;hero.vy=0;hero.onGround=true;presentation.heroPose='idle';presentation.poseAge=0;clearInput();camera=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));findNearby();render();canvas.focus({preventScroll:true});(window.innerWidth<800?document.querySelector('.game-console'):canvas).scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:window.innerWidth<800?'start':'center'});}
function findNearby(){
  const centre=hero.x+hero.w/2;
  nearby=[...projects,...terminals].find(p=>Math.abs(p.x-centre)<103)||null;
  const key=nearby?String(nearby.id):'none';
  if(key!==lastNearbyKey){
    lastNearbyKey=key;
    const label=nearby?.short||nearby?.label;
    $('nearby-hint').textContent=nearby?`${label} is in range. Open the terminal.`:'Follow the lit path, or use the city map.';
    $('open-nearby').disabled=!nearby;$('interact-touch').disabled=!nearby;
    $('open-nearby-label').textContent=nearby?'Open '+label:'Open station';
    if(typeof nearby?.id==='number')activateStation(presentation,nearby.id,false,ambient&&!reducedMotion);
  }
  const zone=projects.reduce((best,p)=>Math.abs(p.x-centre)<Math.abs(best.x-centre)?p:best,projects[0]);
  if(zone.id!==lastZone){lastZone=zone.id;$('mission-title').textContent=visited.size===6?'All six systems connected.':zone.short+' / '+(visited.has(zone.id)?'brief opened':'follow the path');document.querySelectorAll('#station-map button').forEach((b,i)=>{if(i===zone.id)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});}
}
function frame(now){
  frameId=0;if(document.hidden||!sceneVisible||paused||dialog.open){lastTime=0;return;}
  const dt=lastTime?Math.min(34,now-lastTime):16.667;lastTime=now;
  if(ambient&&!reducedMotion)time+=dt;
  const wasGrounded=hero.onGround;
  if(playing){
    stepHero(hero,{left:keys.left||now<tapLeft,right:keys.right||now<tapRight},platforms,ground,WORLD_W,dt);
    if(!wasGrounded&&hero.onGround&&ambient&&!reducedMotion)dust.push({x:hero.x+hero.w/2,y:hero.y+hero.h,age:0});
    dust=dust.map(p=>({...p,age:p.age+dt})).filter(p=>p.age<330);
    for(const item of collectibles)if(!collected.has(item.id)&&Math.hypot(hero.x+hero.w/2-item.x,hero.y+hero.h/2-item.y)<31){collected.add(item.id);$('chip-count').textContent=`${collected.size} / 11 data chips`;beep(620);}
    const target=Math.max(0,Math.min(WORLD_W-width,hero.x-width*.32));camera=reducedMotion?target:camera+(target-camera)*Math.min(1,.12*dt/16.667);
    findNearby();
  }
  advancePresentation(presentation,hero,wasGrounded,dt);
  render();
  if(now-lastDataUpdate>100){canvas.dataset.playerX=hero.x.toFixed(1);canvas.dataset.playerY=hero.y.toFixed(1);canvas.dataset.grounded=String(hero.onGround);canvas.dataset.playing=String(playing);canvas.dataset.ambient=String(ambient&&!reducedMotion);canvas.dataset.pose=presentation.heroPose;canvas.dataset.poseAge=presentation.poseAge.toFixed(0);canvas.dataset.worldTime=time.toFixed(0);canvas.dataset.rain=String(rain&&ambient&&!reducedMotion);lastDataUpdate=now;}
  if(playing||(ambient&&!reducedMotion))schedule();
}

function updateProgress(){
  lastZone=-1;
  $('discovery-count').textContent=`${visited.size} of 6 opened`;
  document.querySelectorAll('#progress-segments i').forEach((el,i)=>el.classList.toggle('active',visited.has(i)));
  document.querySelectorAll('#station-map button').forEach((el,i)=>{el.classList.toggle('visited',visited.has(i));el.setAttribute('aria-label',`Travel to ${projects[i].short}, ${projects[i].name}${visited.has(i)?', brief opened':''}`);});
  if(visited.size===6){$('completion-panel').hidden=false;$('mission-title').textContent='All six systems connected.';if(!completionAnnounced){$('nearby-hint').textContent='All six project briefs opened. Contact and résumé are always available.';completionAnnounced=true;}}
}
function terminalData(id){
  if(id==='about')return {id,short:'Profile',icon:'about',name:'Hi, I’m Vigo.',context:'QUT Data Science undergraduate · Brisbane',what:profile.intro,tools:['Python / SQL','AWS','Machine learning','Deep Learning','Software engineering'],contributionLabel:'Education',contribution:'Bachelor of Data Science at QUT, with an Advanced Computing for Data Science minor. Expected graduation: July 2027.',whyLabel:'Opportunities',evidenceTitle:'Technical focus',limitTitle:'Explore the work',why:profile.opportunity,evidence:{label:'Software, data and source-linked AI',summary:'My projects span desktop prediction, asynchronous cloud processing, retrieval systems and performance engineering.'},evidenceLimit:'Each project brief explains my contribution, implementation choices and the evidence available. The Vision station covers a TensorFlow/Keras segmentation implementation; my wider Deep Learning skills also include PyTorch.',links:[{label:'About me',href:'/about.html'},{label:'Download résumé',href:'/assets/Vigo_Dang_Resume_2026_Redesigned.pdf',download:true}]};
  return {id,short:'Contact',icon:'contact',name:'Let’s build useful systems.',context:'Brisbane, Australia · Open to opportunities',what:profile.opportunity,tools:['Data & analytics','Software','Cloud engineering'],whyLabel:'Conversation topics',evidenceTitle:'Education',limitTitle:'Project context',contributionLabel:'Get in touch',contribution:'n11721138@qut.edu.au',why:'I’d be glad to walk through a project, explain an implementation decision or discuss an internship opportunity.',evidence:{label:'Expected graduation: July 2027',summary:'Bachelor of Data Science, QUT · Advanced Computing for Data Science minor.'},evidenceLimit:'Portfolio projects are academic or independent work. No professional employment or production deployment is implied by the game’s fictional city.',links:[{label:'Email Vigo',href:'mailto:n11721138@qut.edu.au'},{label:'Download résumé',href:'/assets/Vigo_Dang_Resume_2026_Redesigned.pdf',download:true},{label:'GitHub',href:'https://github.com/Vigodang'},{label:'LinkedIn',href:'https://linkedin.com/in/vigodang'}]};
}
function showProject(id){
  const p=typeof id==='number'?projects[id]:terminalData(id);if(!p)return;
  if(typeof dialog.showModal!=='function'){location.href=p.links[0].href;return;}
  opener=document.activeElement;clearInput();stop();pendingDiscovery=null;
  let firstVisit=false;
  if(typeof id==='number'){
    const discovery=discoverStation(visited,id);firstVisit=discovery.first;
    if(firstVisit){activateStation(presentation,id,true,ambient&&!reducedMotion);pendingDiscovery={id,label:p.short,count:discovery.count};beep(720,.12);}
    updateProgress();
  }
  populateBrief(p,{firstVisit,reducedMotion:reducedMotion||!ambient});render();
  document.body.classList.add('dialog-open');dialog.showModal();dialog.scrollTop=0;
}
function closeProject(){dialog.close();}
function interact(){if(dialog.open)return;if(nearby)showProject(nearby.id);}
dialog.addEventListener('close',()=>{
  document.body.classList.remove('dialog-open');clearInput();
  if(pendingDiscovery){$('nearby-hint').textContent=`${pendingDiscovery.label} discovered. ${pendingDiscovery.count} of 6 project briefs opened.`;pendingDiscovery=null;}
  if(opener?.isConnected)opener.focus({preventScroll:true});lastTime=0;schedule();
});
$('close-project').addEventListener('click',closeProject);$('keep-exploring').addEventListener('click',closeProject);
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeProject();});
document.querySelectorAll('[data-open-project]').forEach(button=>{button.hidden=false;button.addEventListener('click',()=>showProject(Number(button.dataset.openProject)));});

function init(){
  try{ctx=canvas.getContext('2d',{alpha:false});}catch{ctx=null;}
  if(!ctx){$('game-fallback').firstElementChild.textContent='This browser cannot display the interactive city. Every project is available below.';return;}
  $('game-fallback').hidden=true;$('launch-card').hidden=false;$('game-actions').hidden=false;document.querySelector('.mobile-controls').hidden=false;$('station-map').hidden=false;
  $('station-map').replaceChildren(...projects.map(p=>{const b=document.createElement('button');b.type='button';b.append(glyph(p.icon));const text=node('span',p.short);text.prepend(node('small',String(p.id+1).padStart(2,'0')));b.append(text);b.setAttribute('aria-label','Travel to '+p.short+', '+p.name);b.addEventListener('click',()=>travel(p.id));return b;}));
  $('start-game').addEventListener('click',()=>begin());
  $('open-nearby').addEventListener('click',interact);$('interact-touch').addEventListener('click',interact);
  $('reset-game').addEventListener('click',()=>{stop();hero=createHero(ground);presentation=createPresentation();pendingDiscovery=null;collected.clear();$('chip-count').textContent='0 / 11 data chips';camera=0;nearby=null;lastNearbyKey='';dust=[];begin();findNearby();});
  $('pause-game').addEventListener('click',()=>{paused=!paused;$('pause-game').setAttribute('aria-pressed',String(paused));changeButton('pause-game',paused?'play':'pause',paused?'Resume walk':'Pause');if(paused){stop();$('nearby-hint').textContent='Walk paused. Project briefs and navigation stay open.';}else{lastNearbyKey='';findNearby();schedule();}});
  $('toggle-sound').addEventListener('click',()=>{soundOn=!soundOn;$('toggle-sound').setAttribute('aria-pressed',String(soundOn));changeButton('toggle-sound',soundOn?'sound':'muted',soundOn?'Sound on':'Sound off');if(soundOn)beep();});
  function motionControls(){
    const effects=ambient&&!reducedMotion,button=$('toggle-atmosphere');button.disabled=reducedMotion;button.setAttribute('aria-pressed',String(effects));changeButton('toggle-atmosphere','progress',reducedMotion?'Reduced motion':ambient?'Atmosphere on':'Atmosphere off');
    if(!effects){rain=false;presentation.activation=null;dust=[];}
    const weather=$('toggle-weather');weather.disabled=!effects;weather.setAttribute('aria-pressed',String(rain));weather.querySelector('span:last-child').textContent=rain?'Light rain on':'Light rain off';
    document.querySelector('.game-console').dataset.effects=effects?'on':'off';
  }
  $('toggle-weather').addEventListener('click',()=>{if(reducedMotion||!ambient)return;rain=!rain;motionControls();render();schedule();});
  $('toggle-atmosphere').addEventListener('click',()=>{ambient=!ambient;motionControls();render();schedule();});
  motionQuery.addEventListener('change',event=>{reducedMotion=event.matches;ambient=!reducedMotion;dust=[];motionControls();render();schedule();});motionControls();
  function jump(){if(paused||dialog.open)return;begin(false);if(jumpHero(hero))beep(360);schedule();}
  $('jump-touch').addEventListener('pointerdown',event=>{event.preventDefault();jump();});$('jump-touch').addEventListener('click',event=>{if(event.detail===0)jump();});
  function wireTouch(id,key){const b=$(id);b.addEventListener('pointerdown',event=>{if(paused)return;event.preventDefault();b.setPointerCapture(event.pointerId);begin(false);keys[key]=true;});const up=()=>{keys[key]=false;};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('click',event=>{if(event.detail===0&&!paused){begin(false);if(key==='left')tapLeft=performance.now()+140;else tapRight=performance.now()+140;schedule();}});}
  wireTouch('left-touch','left');wireTouch('right-touch','right');
  document.addEventListener('keydown',event=>{
    if(document.activeElement!==canvas||dialog.open||event.ctrlKey||event.metaKey||event.altKey)return;
    const key=event.key.toLowerCase();if(['arrowleft','arrowright','arrowup','a','d','w',' ','e','enter','r'].includes(key))event.preventDefault();
    if(key==='r'&&!event.repeat){$('reset-game').click();return;}if(paused)return;
    if(key==='arrowleft'||key==='a'){begin(false);keys.left=true;tapLeft=performance.now()+75;}
    if(key==='arrowright'||key==='d'){begin(false);keys.right=true;tapRight=performance.now()+75;}
    if(['arrowup','w',' '].includes(key)&&!event.repeat)jump();if(['e','enter'].includes(key)&&!event.repeat)interact();
  });
  document.addEventListener('keyup',event=>{if(['arrowleft','a'].includes(event.key.toLowerCase()))keys.left=false;if(['arrowright','d'].includes(event.key.toLowerCase()))keys.right=false;});
  canvas.addEventListener('pointerdown',()=>{canvas.focus({preventScroll:true});if(!paused)begin(false);});
  canvas.addEventListener('blur',clearInput);window.addEventListener('blur',()=>{stop();});window.addEventListener('focus',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;if(sceneVisible)schedule();else stop();},{threshold:0}).observe(canvas);
  resize();updateProgress();schedule();
}
init();
