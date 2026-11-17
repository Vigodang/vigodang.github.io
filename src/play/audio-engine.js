import {SCORE, EVENT_COOLDOWNS} from './audio-content.js';

const midi = note => 440 * 2 ** ((note - 69) / 12);
const clamp = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : fallback;

/** A consent-gated, sample-free night-city score. Call enable() inside a click/key gesture. */
export function createAudioEngine() {
  let context = null, graph = null, noiseBuffer = null, timer = 0, suspendTimer = 0;
  let optedIn = false, disposed = false, paused = false, moving = false, raining = false;
  let masterLevel = .64, musicLevel = .58, sfxLevel = .72, district = 0;
  let tick = 0, nextTick = 0, foot = 0, request = 0, bloomUntil = 0;
  const voices = new Set(), cooldowns = new Map(), restored = new Set();
  const doc = globalThis.document;
  const stepLength = 60 / SCORE.bpm / 4;
  const hidden = () => Boolean(doc?.hidden);
  const mayRun = () => optedIn && !paused && !hidden() && !disposed;
  const time = () => context?.currentTime || 0;

  function glide(param, value, seconds = .06) {
    if (!context || !param) return;
    const at = time();
    param.cancelScheduledValues(at);
    param.setTargetAtTime(value, at, Math.max(.008, seconds / 3));
  }

  function panNode(value = 0) {
    if (context.createStereoPanner) {
      const pan = context.createStereoPanner();pan.pan.value = value;return pan;
    }
    return context.createGain(); // Older Safari: equally useful, mono-compatible mix.
  }

  function makeGraph() {
    const master = context.createGain(), compressor = context.createDynamicsCompressor();
    master.gain.value = 0;
    compressor.threshold.value = -15;compressor.knee.value = 15;
    compressor.ratio.value = 3;compressor.attack.value = .008;compressor.release.value = .25;
    master.connect(compressor);compressor.connect(context.destination);
    const buses = {};
    for (const name of ['music','ambience','sfx','interface']) {
      buses[name] = context.createGain();buses[name].connect(master);
    }
    buses.music.gain.value = musicLevel;buses.ambience.gain.value = .22;
    buses.sfx.gain.value = sfxLevel;buses.interface.gain.value = sfxLevel * .82;
    const musicFilter = context.createBiquadFilter();musicFilter.type = 'lowpass';
    musicFilter.frequency.value = SCORE.districts[district].cutoff;musicFilter.Q.value = .3;
    const musicPan = panNode(SCORE.districts[district].pan);
    musicFilter.connect(musicPan);musicPan.connect(buses.music);

    // A single reusable two-second noise buffer, deterministically generated.
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 2), context.sampleRate);
    const data = noiseBuffer.getChannelData(0);let seed = 196_703;
    for (let i = 0; i < data.length; i++) {seed = (Math.imul(seed,1664525)+1013904223) >>> 0;data[i] = (seed / 4294967296 * 2 - 1) * .65;}
    const air = context.createBufferSource();air.buffer = noiseBuffer;air.loop = true;
    const airFilter = context.createBiquadFilter();airFilter.type = 'lowpass';airFilter.Q.value = .2;
    airFilter.frequency.value = SCORE.districts[district].air;
    const airGain = context.createGain();airGain.gain.value = .14;
    air.connect(airFilter);airFilter.connect(airGain);airGain.connect(buses.ambience);air.start();
    const rain = context.createBufferSource();rain.buffer = noiseBuffer;rain.loop = true;
    const rainFilter = context.createBiquadFilter();rainFilter.type = 'highpass';rainFilter.frequency.value = 720;
    const rainSoftener = context.createBiquadFilter();rainSoftener.type = 'lowpass';rainSoftener.frequency.value = 3400;
    const rainGain = context.createGain();rainGain.gain.value = raining ? .13 : 0;
    rain.connect(rainFilter);rainFilter.connect(rainSoftener);rainSoftener.connect(rainGain);rainGain.connect(buses.ambience);rain.start();
    const hum = context.createOscillator();hum.type = 'sine';hum.frequency.value = SCORE.districts[district].hum;
    const humGain = context.createGain();humGain.gain.value = .024;
    hum.connect(humGain);humGain.connect(buses.ambience);hum.start();
    return {master,compressor,buses,musicFilter,musicPan,air,airFilter,airGain,rain,rainGain,rainFilter,rainSoftener,hum,humGain};
  }

  function cleanupVoice(voice) {
    if (!voices.delete(voice)) return;
    for (const node of voice.nodes) {try {node.disconnect();} catch { /* Already disconnected. */ }}
  }

  // Limits include scheduled voices, so long event bursts cannot hide future work.
  function voice({at = time(), duration = .2, amp = .05, bus = 'sfx', type = 'sine',
    frequency = 440, endFrequency, attack = .012, release = .08, pan = 0, noise = false,
    filter = 1800, filterType = 'lowpass', detune = 0, layer = 'base'}) {
    if (!mayRun() || context?.state !== 'running' || voices.size >= 36) return false;
    const kind = bus === 'music' ? 'music' : 'effect';
    let count = 0;for (const active of voices) if (active.kind === kind) count++;
    if (count >= (kind === 'music' ? 22 : 14)) return false;
    at = Math.max(time(), at);duration = Math.max(.035, Math.min(4.4,duration));
    const source = noise ? context.createBufferSource() : context.createOscillator();
    if (noise) {source.buffer = noiseBuffer;} else {
      source.type = type;source.frequency.setValueAtTime(frequency,at);
      source.detune.value = detune;
      if (endFrequency) source.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),at+duration*.82);
    }
    const gain = context.createGain(), panner = panNode(pan), tone = context.createBiquadFilter();
    tone.type = filterType;tone.frequency.value = filter;tone.Q.value = .35;
    const end = at + duration;
    gain.gain.setValueAtTime(0,at);
    gain.gain.linearRampToValueAtTime(amp,at+Math.min(attack,duration*.3));
    gain.gain.setTargetAtTime(Math.max(.0001,amp*.32),at+Math.min(attack+.015,duration*.4),duration*.15);
    gain.gain.setTargetAtTime(.00001,Math.max(at+attack,end-Math.min(release,duration*.6)),Math.max(.008,Math.min(release,duration*.6)/5));
    gain.gain.linearRampToValueAtTime(0,end);
    source.connect(tone);tone.connect(gain);gain.connect(panner);
    panner.connect(bus === 'music' ? graph.musicFilter : graph.buses[bus]);
    const active = {source,gain,kind,layer,nodes:[source,tone,gain,panner]};voices.add(active);
    source.onended = () => cleanupVoice(active);
    if (noise) source.start(at, ((tick * .137 + foot * .071) % 1.5));else source.start(at);
    source.stop(end+.01);return true;
  }

  const note = (m,at,duration,amp,bus='sfx',extra={}) => voice({frequency:midi(m),at,duration,amp,bus,...extra});
  const hiss = (at,duration,amp,filter=1800,extra={}) => voice({at,duration,amp,noise:true,filter,...extra});

  function scoreStep(index,at) {
    const bar = Math.floor(index / 16) % 8, position = index % 16;
    const chord = SCORE.chords[bar], zone = SCORE.districts[district];
    if (position === 0) {
      // Warm, staggered, four-note electric-piano pad. New bars overlap softly.
      chord.forEach((pitch,i) => note(pitch,at+i*.022,2.95,.024,'music',{
        type:i%2?'triangle':'sine',attack:.34,release:.8,pan:(i-1.5)*.14,detune:i%2?3:-3,filter:2100}));
    }
    if ([0,6,10].includes(position)) {
      const pitch = SCORE.bass[bar] + (position===10 ? 12 : 0);
      note(pitch,at,.36,.095,'music',{type:'triangle',attack:.015,release:.17,filter:500});
    }
    if (position === 0 || position === 8 || (bar%2===1 && position===14)) {
      voice({at,duration:.23,amp:.15,bus:'music',frequency:124,endFrequency:43,attack:.006,release:.16,filter:900});
    }
    if (position === 4 || position === 12) {
      hiss(at,.13,.085,1050,{bus:'music',filterType:'bandpass',attack:.004,pan:.09});
      note(45,at,.09,.035,'music',{type:'triangle',filter:600});
    }
    if (position%2===0 || (moving && position===15)) {
      hiss(at,.052,position%4===2?.022:.014,3600,{bus:'music',filterType:'highpass',attack:.005,pan:position%4===0?-.2:.2});
    }
    const pluckIndex = SCORE.pluckSteps.indexOf(position);
    if (pluckIndex >= 0 && (moving || bar%2===0 || pluckIndex<2)) {
      const degree = SCORE.pluckDegrees[(bar+pluckIndex)%8];
      note(chord[degree]+12,at,.65,(moving?.033:.019)+restored.size*.001,'music',{
        type:zone.texture===4?'triangle':'sine',attack:.008,release:.35,pan:pluckIndex%2?-.3:.3,filter:2600});
    }
    // Location textures share tempo/harmony; none restart the composition.
    if (position===6 && zone.texture===1) hiss(at,.12,.025,650,{bus:'ambience',filterType:'bandpass',pan:.25});
    if (position===14 && zone.texture===2) note(chord[2]+12,at,.16,.015,'music',{type:'triangle',pan:-.3});
    if (position===7 && zone.texture===3) note(chord[1]+24,at,.31,.009,'music',{pan:.3,filter:2400});
    if (position===14 && zone.texture===4) note(chord[0]+12,at,.18,.018,'music',{type:'triangle',pan:-.25});
    if (position===10 && zone.texture===5) hiss(at,.3,.016,400,{bus:'ambience',pan:-.2});
    if (at < bloomUntil && position%4===2) {
      note(chord[(Math.floor(position/4)+bar)%4]+24,at,.8,.022,'music',{
        attack:.025,release:.45,pan:position<8?-.3:.3,filter:2800,layer:'restoration'});
    }
  }

  function schedule() {
    if (!mayRun() || context?.state !== 'running') return;
    // Catch up after browser throttling without emitting missed notes in a burst.
    if (nextTick < time()-.1) nextTick = time()+.035;
    let scheduled = 0;
    while (nextTick < time()+.14 && scheduled++ < 3) {
      scoreStep(tick,nextTick);tick = (tick+1)%128;nextTick += stepLength;
    }
  }

  function stopScheduler() {if (timer) clearInterval(timer);timer = 0;}
  function fadeVoices(predicate = () => true) {
    const at = time();
    for (const active of voices) {
      if (!predicate(active)) continue;
      try {
        active.gain.gain.cancelScheduledValues(at);
        active.gain.gain.setTargetAtTime(0,at,.012);
        active.source.stop(at+.065);
      } catch {cleanupVoice(active);}
    }
  }

  async function synchronize() {
    if (!context || disposed) return false;
    const stamp = ++request;
    if (suspendTimer) {clearTimeout(suspendTimer);suspendTimer=0;}
    if (!mayRun()) {
      stopScheduler();glide(graph.master.gain,0,.075);fadeVoices();
      suspendTimer = setTimeout(() => {
        suspendTimer = 0;
        if (!mayRun() && context?.state==='running') context.suspend().catch(()=>{});
      },85);
      return true;
    }
    try {
      if (context.state!=='running') await context.resume();
      if (stamp!==request || !mayRun() || context.state!=='running') return false;
      glide(graph.master.gain,masterLevel,.14);
      if (!timer) {nextTick = time()+.035;schedule();timer=setInterval(schedule,40);}
      return true;
    } catch {stopScheduler();return false;}
  }

  async function enable() {
    if (disposed) return false;
    // Modern browsers expose transient activation; never consume a saved consent
    // preference as permission to start audio on page load.
    if (!optedIn && globalThis.navigator?.userActivation && !navigator.userActivation.isActive) return false;
    try {
      if (!context) {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContext) return false;
        context = new AudioContext({latencyHint:'interactive'});graph = makeGraph();
      }
      optedIn = true;
      const stamp = request+1, ok = await synchronize();
      // A rejected native resume must remain retryable. A stale request must
      // not overwrite a later user toggle's consent state.
      if (!ok && request===stamp) optedIn=false;
      return ok;
    } catch {optedIn=false;stopScheduler();return false;}
  }

  function disable() {optedIn=false;void synchronize();}
  function setVolume(value) {masterLevel=clamp(value,masterLevel);if (mayRun() && graph) glide(graph.master.gain,masterLevel);}
  function setMusic(value) {musicLevel=clamp(value,musicLevel);if (graph) glide(graph.buses.music.gain,musicLevel);}
  function setSfx(value) {sfxLevel=clamp(value,sfxLevel);if (graph) {glide(graph.buses.sfx.gain,sfxLevel);glide(graph.buses.interface.gain,sfxLevel*.82);}}
  function setPaused(value) {
    const changed=paused!==Boolean(value);paused=Boolean(value);
    return changed ? synchronize() : Promise.resolve(Boolean(context?.state==='running' && mayRun()));
  }
  function setRain(value) {raining=Boolean(value);if (graph) glide(graph.rainGain.gain,raining?.13:0,1.4);}
  function setDistrict(value) {
    const numeric = Number(value);
    const target = Number.isInteger(numeric) && numeric>=0 && numeric<6 ? numeric : SCORE.districts.findIndex(zone=>zone.name===value);
    if (target<0 || target===district) return;
    district=target;if (!graph) return;
    const zone=SCORE.districts[district];
    glide(graph.musicFilter.frequency,zone.cutoff,2.6);glide(graph.airFilter.frequency,zone.air,2.6);
    glide(graph.hum.frequency,zone.hum,2.6);if (graph.musicPan.pan) glide(graph.musicPan.pan,zone.pan,2.6);
  }
  function setMoving(value) {moving=Boolean(value);}
  function resetProgress() {
    restored.clear();bloomUntil=0;cooldowns.clear();
    if (context && graph) fadeVoices(active=>active.kind==='effect'||active.layer==='restoration');
  }

  function play(event) {
    if (!mayRun() || context?.state!=='running' || !Object.hasOwn(EVENT_COOLDOWNS,event)) return false;
    const at=time()+.008, previous=cooldowns.get(event)??-Infinity;
    if (at-previous < EVENT_COOLDOWNS[event]/1000) return false;
    cooldowns.set(event,at);
    switch (event) {
      case 'start':
        [50,57,62,65].forEach((pitch,i)=>note(pitch,at+i*.11,.55,.055,'interface',{type:'triangle',pan:(i-1.5)*.1}));break;
      case 'footstep':
        foot++;hiss(at,.065,.043,raining?1400:620,{pan:foot%2?.1:-.1,attack:.006});
        note(foot%2?36:38,at,.075,.045,'sfx',{filter:330});break;
      case 'jump':
        voice({at,duration:.24,amp:.058,type:'triangle',frequency:180,endFrequency:420,filter:1400});
        hiss(at,.16,.022,1700,{filterType:'bandpass'});break;
      case 'land':
        voice({at,duration:.16,amp:.10,frequency:105,endFrequency:48,filter:520});
        hiss(at,.1,.055,raining?1800:850);break;
      case 'pickup':
        [74,81].forEach((pitch,i)=>note(pitch,at+i*.058,.28,.055,'sfx',{pan:i?.16:-.16,filter:3000}));break;
      case 'approach':
        [62,69].forEach((pitch,i)=>note(pitch,at+i*.12,.45,.029,'interface',{attack:.05,pan:i?.12:-.12}));break;
      case 'interact':
        hiss(at,.055,.07,1100,{bus:'interface',filterType:'bandpass'});
        voice({at:at+.035,duration:.22,amp:.04,bus:'interface',type:'triangle',frequency:220,endFrequency:330,filter:1600});break;
      case 'machine':
        hiss(at,.055,.07,900,{filterType:'bandpass',pan:district%2?.2:-.2});
        note(50+district*2,at+.045,.18,.035,'sfx',{type:'triangle',filter:1500});break;
      case 'retry':
        [57,53].forEach((pitch,i)=>note(pitch,at+i*.13,.24,.045,'interface',{type:'triangle',filter:1300}));
        hiss(at,.15,.025,650,{bus:'interface'});break;
      case 'success':
      case 'restore':
        if(event==='restore')restored.add(district);
        bloomUntil=at+8.2;
        [62,65,69,72,77].forEach((pitch,i)=>note(pitch,at+i*.105,.75,i===4?.055:.045,'sfx',{attack:.02,release:.4,pan:(i-2)*.1}));
        hiss(at,.24,.025,1600,{filterType:'bandpass'});break;
      case 'evidence':
        [69,74,77].forEach((pitch,i)=>note(pitch,at+i*.08,.38,.035,'interface',{type:'triangle',filter:2300}));break;
      case 'nav':
        note(62,at,.07,.028,'interface',{type:'triangle',filter:1300,pan:-.15});break;
      case 'open':
        note(57,at,.22,.038,'interface',{type:'triangle',endFrequency:midi(69),filter:1800});
        hiss(at,.08,.025,1000,{bus:'interface',filterType:'bandpass'});break;
      case 'close':
        note(65,at,.16,.035,'interface',{type:'triangle',endFrequency:midi(57),filter:1400});break;
      case 'rain':
        hiss(at,.35,.026,2400,{filterType:'bandpass',pan:.3});break;
      case 'complete':
        restored.add(district);
        bloomUntil=at+13;
        [62,65,69,74,72,69,77,81].forEach((pitch,i)=>note(pitch,at+i*.15,i===7?1.65:.65,i===7?.055:.042,'sfx',{attack:.025,release:.5,pan:(i%3-1)*.22}));
        [50,57,60,65].forEach((pitch,i)=>note(pitch,at+1.08+i*.025,2.5,.04,'music',{attack:.2,release:.9,layer:'restoration'}));break;
    }
    return true;
  }

  function recover() {
    if (mayRun() && context?.state!=='running') void synchronize();
  }
  function visibility() {void synchronize();}
  doc?.addEventListener('visibilitychange',visibility);
  doc?.addEventListener('pointerdown',recover,{passive:true});
  doc?.addEventListener('keydown',recover,{passive:true});

  function destroy() {
    if (disposed) return;
    disposed=true;optedIn=false;request++;stopScheduler();
    if(suspendTimer)clearTimeout(suspendTimer);
    doc?.removeEventListener('visibilitychange',visibility);
    doc?.removeEventListener('pointerdown',recover);
    doc?.removeEventListener('keydown',recover);
    for(const active of [...voices]) {try{active.source.stop();}catch{/* Already stopped. */}cleanupVoice(active);}
    if(graph) {
      for(const source of [graph.air,graph.rain,graph.hum]) {try{source.stop();}catch{/* Already stopped. */}}
      for(const value of Object.values(graph)) {try{value.disconnect?.();}catch{/* Already disconnected. */}}
      for(const bus of Object.values(graph.buses))bus.disconnect();
    }
    noiseBuffer=null;graph=null;
    if(context?.state!=='closed')context?.close().catch(()=>{});
  }

  return {enable,disable,setVolume,setMusic,setSfx,setPaused,setRain,setDistrict,setMoving,resetProgress,play,destroy,
    get enabled(){return optedIn && !disposed;}};
}
