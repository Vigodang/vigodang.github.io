import assert from 'node:assert/strict';
import test from 'node:test';
import {createAudioEngine} from '../src/play/audio-engine.js';
import {EVENT_COOLDOWNS,SCORE} from '../src/play/audio-content.js';

// Dependency-free native-node lifecycle simulation. No audio is played.
// The mock advances the Web Audio clock deterministically, including source
// completion, so five minutes of spam and pause/resume can run in under a second.
test('original audio: consent, musical progress, voice bounds and lifecycle', async () => {
  const names = ['setTimeout','setInterval','clearTimeout','clearInterval','navigator','document','AudioContext'];
  const originals = new Map(names.map(name => [name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  try {
let now=0,sequence=0,created=0;const timers=new Map(),contexts=[];
globalThis.setTimeout=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,at:now+ms});return id;};
globalThis.setInterval=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,at:now+ms,repeat:ms});return id;};
globalThis.clearTimeout=globalThis.clearInterval=id=>timers.delete(id);
Object.defineProperty(globalThis,'navigator',{value:{userActivation:{isActive:false}},configurable:true});
globalThis.document=new EventTarget();document.hidden=false;
class Param {constructor(){this.value=0;this.peak=0;}cancelScheduledValues(){}setValueAtTime(v,t){assert(Number.isFinite(v)&&Number.isFinite(t));this.value=v;this.peak=Math.max(this.peak,v);}setTargetAtTime(v,t,k){assert(Number.isFinite(v)&&Number.isFinite(t)&&k>0);this.value=v;}linearRampToValueAtTime(v,t){this.setValueAtTime(v,t);}exponentialRampToValueAtTime(v,t){assert(v>0);this.setValueAtTime(v,t);}}
class AudioNode {
  constructor(ctx,source=false){this.ctx=ctx;this.source=source;this.frequency=new Param();this.detune=new Param();this.gain=new Param();this.pan=new Param();this.Q=new Param();this.threshold=new Param();this.knee=new Param();this.ratio=new Param();this.attack=new Param();this.release=new Param();this.end=Infinity;this.started=false;}
  connect(target){this.target=target;}disconnect(){}start(at=0){this.started=true;this.startAt=at;this.ctx.starts++;this.ctx.maxActive=Math.max(this.ctx.maxActive,this.ctx.nodes.filter(n=>n.started&&!n.ended).length);}stop(at=this.ctx.currentTime){this.end=at;}
}
class Context {
  constructor(){created++;this.currentTime=0;this.state='suspended';this.sampleRate=48000;this.destination={};this.nodes=[];this.allNodes=[];this.starts=0;this.maxActive=0;contexts.push(this);}
  node(source=false){const node=new AudioNode(this,source);this.allNodes.push(node);if(source)this.nodes.push(node);return node;}
  createGain(){return this.node();}createDynamicsCompressor(){return this.node();}createStereoPanner(){return this.node();}createBiquadFilter(){return this.node();}createOscillator(){return this.node(true);}createBufferSource(){return this.node(true);}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}
  async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}
}
globalThis.AudioContext=Context;
async function advance(ms){for(let spent=0;spent<ms;spent+=20){now+=20;for(const ctx of contexts){if(ctx.state==='running')ctx.currentTime+=.02;for(const source of ctx.nodes){if(!source.ended&&source.started&&source.end<=ctx.currentTime){source.ended=true;source.onended?.();}}}for(const[id,item]of [...timers])if(item.at<=now){if(item.repeat)item.at+=item.repeat;else timers.delete(id);item.fn();}await Promise.resolve();}}
assert.deepEqual(SCORE.districts.map(d=>d.name),['AI Alley','Cloud Kitchen','Data Market','Agent Arcade','Parallel Works','Vision Street']);
assert.deepEqual(SCORE.districts.map(d=>d.texture),[0,1,2,4,5,3]);
const engine=createAudioEngine();engine.resetProgress();
engine.setRain(true);engine.setDistrict(3);engine.setMoving(true);engine.setVolume(.5);engine.setMusic(.4);engine.setSfx(.3);
assert.equal(created,0);assert.equal(engine.play('start'),false);assert.equal(await engine.enable(),false);assert.equal(created,0);
navigator.userActivation.isActive=true;assert.equal(await engine.enable(),true);assert.equal(created,1);assert.equal(engine.enabled,true);
const ctx=contexts[0];
for(let district=0;district<6;district++){engine.setDistrict(district);assert(ctx.allNodes.some(n=>n.type==='lowpass'&&n.frequency.value===SCORE.districts[district].cutoff));}
assert.equal(engine.play('pickup'),true);assert.equal(engine.play('pickup'),false);assert.equal(engine.play('unknown'),false);
engine.setMoving(false);const restoreStart=ctx.nodes.length;assert.equal(engine.play('restore'),true);const restoreSources=ctx.nodes.slice(restoreStart);assert.equal(restoreSources.length,6);
await advance(1500);assert(ctx.nodes.slice(restoreStart).some(n=>Math.abs((n.target?.target?.gain?.peak??0)-.020)<1e-8),'restored progress lifts pluck');
engine.resetProgress();assert(restoreSources.every(n=>n.end<=ctx.currentTime+.066));
const resetStart=ctx.nodes.length;await advance(1000);assert(ctx.nodes.slice(resetStart).some(n=>Math.abs((n.target?.target?.gain?.peak??0)-.019)<1e-8),'reset removes pluck lift');
assert.equal(engine.play('complete'),true);const completionStart=ctx.nodes.length;await advance(1000);assert(ctx.nodes.slice(completionStart).some(n=>Math.abs((n.target?.target?.gain?.peak??0)-.020)<1e-8),'complete records last restored district');
engine.resetProgress();assert.equal(engine.play('complete'),true,'reset clears outcome cooldown');engine.resetProgress();await advance(100);engine.setMoving(true);
for(let minute=0;minute<5;minute++){for(let block=0;block<30;block++){engine.setDistrict(block%6);for(const event of Object.keys(EVENT_COOLDOWNS))engine.play(event);for(let spam=0;spam<300;spam++)engine.play('machine');await advance(2000);}}
assert(ctx.maxActive<=39,`max sources ${ctx.maxActive}`);
assert(ctx.nodes.filter(n=>n.started&&!n.ended).length<=39);
engine.setPaused(true);await advance(200);assert.equal(ctx.state,'suspended');assert.equal(engine.play('jump'),false);
const pausedStarts=ctx.starts;await advance(2000);assert.equal(ctx.starts,pausedStarts);
assert.equal(await engine.setPaused(false),true);assert.equal(await engine.setPaused(false),true);await advance(100);assert.equal(ctx.state,'running');
document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));await advance(200);assert.equal(ctx.state,'suspended');
document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));await Promise.resolve();await advance(100);assert.equal(ctx.state,'running');
engine.disable();await advance(200);assert.equal(engine.enabled,false);assert.equal(ctx.state,'suspended');
document.dispatchEvent(new Event('pointerdown'));await Promise.resolve();assert.equal(ctx.state,'suspended');
navigator.userActivation.isActive=true;assert.equal(await engine.enable(),true);assert.equal(created,1);
engine.setVolume(NaN);engine.setMusic(-10);engine.setSfx(100);engine.setDistrict('invalid');
engine.destroy();await Promise.resolve();assert.equal(ctx.state,'closed');assert.equal(engine.enabled,false);assert.equal(await engine.enable(),false);assert.equal(timers.size,0);
class RejectResume extends Context {async resume(){throw Error('Native audio device unavailable');}}
globalThis.AudioContext=RejectResume;const retryEngine=createAudioEngine();assert.equal(await retryEngine.enable(),false);assert.equal(retryEngine.enabled,false);const retryContext=contexts.at(-1);retryContext.resume=Context.prototype.resume;assert.equal(await retryEngine.enable(),true);assert.equal(retryEngine.enabled,true);assert.equal(created,2,'resume retry reuses failed context');retryEngine.destroy();await Promise.resolve();assert.equal(timers.size,0);
delete globalThis.AudioContext;const unsupported=createAudioEngine();assert.equal(await unsupported.enable(),false);unsupported.destroy();
console.log(JSON.stringify({passed:true,simulatedStressSeconds:300,contextInstancesForMainEngine:1,additionalRejectedResumeTestContexts:1,maxTotalSources:ctx.maxActive,sourceStarts:ctx.starts,remainingTimers:timers.size,checks:['gesture gate',`all ${Object.keys(EVENT_COOLDOWNS).length} events`,'district ID and texture mapping','restoration lift and reset','reset fades existing outcome voices','completion records last district','reset clears cooldowns','rejected native resume resets consent and remains retryable','cooldowns','36 voice limit plus 3 ambient sources','5 minute stress','awaitable pause/resume','visibility','mute','single context reuse','invalid settings','destroy','unsupported API']},null,2));

  } finally {
    for (const [name,descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis,name,descriptor);
      else delete globalThis[name];
    }
  }
});
