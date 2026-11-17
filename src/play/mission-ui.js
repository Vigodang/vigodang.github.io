import { missionDefinitions, createQueue, dispatchQueue, scaleQueue, advanceQueue,
  canRestoreQueue, distributeRecords, inspectRange } from './missions.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

/** Inline, keyboard-native workstations. These never call a project service. */
export function createMissionUI({ host, projects, onRestore = () => {}, onSound = () => {},
  onDossier = () => {}, onClose = () => {}, isPaused = () => false }) {
  const timers = new Set();
  let activeId = null;
  let completed = false;
  let workstation = null;
  let status = null;
  const sound = event => onSound(event);
  const schedule = (callback, delay = 450) => {
    const timer = setTimeout(() => { timers.delete(timer); if (isPaused()) schedule(callback, 120); else callback(); }, delay);
    timers.add(timer);
  };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
  const announce = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('mission-status-error', isError);
  };
  const button = (label, callback, className = '') => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `mission-button ${className}`;
    element.textContent = label;
    element.addEventListener('click', () => { if (isPaused() && !className.includes('mission-close')) { announce('Resume the night shift to continue this illustration.'); return; } callback(); });
    return element;
  };
  const select = selector => workstation.querySelector(selector);
  const complete = message => {
    if (completed || activeId === null) return;
    completed = true;
    clearTimers();
    workstation.classList.add('mission-is-complete');
    select('.mission-progress-label').textContent = missionDefinitions[activeId].verb;
    announce(message);
    const result = select('.mission-completion');
    result.hidden = false;
    result.innerHTML = `<span class="mission-completion-mark" aria-hidden="true">✓</span><div><h3>System restored</h3><p>${escapeHTML(message)}</p><p class="mission-fineprint">Fictional city progress. The project evidence below has its own scope and limitations.</p></div>`;
    result.append(button('Replay illustration', () => open(activeId), 'mission-button-secondary'));
    onRestore(activeId);
  };
  const trace = (items, callback, delay = 480) => {
    const container = select('.mission-trace');
    container.innerHTML = items.map((item, index) => `<li data-trace="${index}"><span class="mission-step-number">${index + 1}</span><span>${escapeHTML(item)}</span></li>`).join('');
    let index = 0;
    const next = () => {
      const item = container.children[index];
      item.classList.add('mission-step-done');
      item.querySelector('.mission-step-number').textContent = '✓';
      sound('machine');
      index += 1;
      if (index < items.length) schedule(next, delay);
      else callback();
    };
    next();
  };

  function evidenceMission(stage) {
    stage.innerHTML = `<div class="mission-scene-kicker">Fictional archive · no partner material</div>
      <h3>Which fragment supports this claim?</h3>
      <blockquote class="mission-claim">“The market lanterns switch on after dusk.”</blockquote>
      <fieldset class="mission-options"><legend>Select a supporting source</legend>
      <label class="mission-option"><input type="radio" name="archive-source" value="inspection"><span><strong>Note A · inspection schedule</strong><small>“A technician checks the lantern wiring at noon.”</small></span></label>
      <label class="mission-option"><input type="radio" name="archive-source" value="supported"><span><strong>Note B · opening procedure</strong><small>“After sunset, the market lanterns are switched on.”</small></span></label>
      <label class="mission-option"><input type="radio" name="archive-source" value="awning"><span><strong>Note C · maintenance record</strong><small>“The storefront awnings were replaced in winter.”</small></span></label>
      </fieldset><div class="mission-actions"></div><ol class="mission-trace" aria-label="Source-linked synthesis pipeline"></ol>`;
    const connect = button('Connect the evidence', () => {
      const choice = select('input[name="archive-source"]:checked');
      if (!choice || choice.value !== 'supported') {
        sound('retry');
        announce(choice ? 'That note does not establish when the lanterns switch on. Look for the passage that directly supports the claim.' : 'Choose a source fragment first.', true);
        return;
      }
      connect.disabled = true;
      stage.querySelectorAll('input').forEach(input => { input.disabled = true; });
      announce('Note B supports the claim and retains its source. Reconnecting the illustrative pipeline…');
      trace(['Document · fictional Note B', 'Retrieval · task-relevant passage', 'Evidence check · direct support', 'Synthesis · answer linked to Note B'],
        () => complete('The source link is restored. A relevant document alone is not enough; its passage must support the answer.'));
    });
    select('.mission-actions').append(connect);
    announce('Read the three fictional fragments, then connect the one that supports the claim.');
  }

  function queueMission(stage) {
    let queue = createQueue();
    let loopRunning = false;
    stage.innerHTML = `<div class="mission-scene-kicker">12 toy jobs · no AWS calls or timings</div>
      <h3>Orders in. Workers out. Queue drained.</h3>
      <p>Dispatch a batch, scale from one worker to four, then return to one idle worker.</p>
      <div class="mission-worker-bank" aria-label="Illustrative worker count"></div>
      <div class="mission-queue-metrics"><span><strong data-queued>0</strong> queued</span><span><strong data-running>0</strong> working</span><span><strong data-done>0</strong> complete</span></div>
      <div class="mission-job-grid" aria-label="Twelve simulated jobs"></div>
      <div class="mission-progress" role="progressbar" aria-label="Simulated jobs completed" aria-valuemin="0" aria-valuemax="12" aria-valuenow="0"><span></span></div>
      <div class="mission-actions"></div><p class="mission-fineprint">Authored animation pace; this is an architectural illustration, not a cloud benchmark. Workers here are controlled manually.</p>`;
    const dispatch = button('Dispatch 12 demo jobs', () => {
      queue = advanceQueue(dispatchQueue());
      sound('machine');
      announce('Batch queued. One worker is running. Scale to four to share the waiting work.');
      render();
      if (!loopRunning) { loopRunning = true; schedule(tick, 420); }
    });
    const scale = button('Scale to 4 workers', () => {
      queue = scaleQueue(queue, 4);
      sound('machine');
      announce('Four workers share the queued jobs. Watch the completed count, then return to one idle worker.');
      render();
    }, 'mission-button-secondary');
    const idle = button('Return to 1 idle worker', () => {
      queue = scaleQueue(queue, 1);
      render();
      if (canRestoreQueue(queue)) complete('All 12 demo jobs finished, and the worker pool returned to one. The kitchen is ready for the next batch.');
    }, 'mission-button-secondary');
    select('.mission-actions').append(dispatch, scale, idle);
    function render() {
      const counts = ['queued', 'running', 'done'].map(state => queue.jobs.filter(job => job.state === state).length);
      ['queued', 'running', 'done'].forEach((key, index) => { select(`[data-${key}]`).textContent = counts[index]; });
      select('.mission-job-grid').innerHTML = queue.jobs.map(job => `<span class="mission-job mission-job-${job.state}"><b>${String(job.id + 1).padStart(2, '0')}</b><small>${({ waiting: 'Ready', queued: 'Queued', running: 'Working', done: 'Done' })[job.state]}</small></span>`).join('');
      select('.mission-worker-bank').innerHTML = Array.from({ length: 4 }, (_, index) => `<span class="mission-worker ${index < queue.workers ? 'mission-worker-on' : ''}" aria-hidden="true"><i></i><b>${index + 1}</b></span>`).join('') + `<span class="mission-worker-caption">${queue.workers} ${queue.workers === 1 ? 'worker' : 'workers'} ${counts[1] ? 'online' : 'idle'}</span>`;
      select('.mission-worker-bank').setAttribute('aria-label', `${queue.workers} illustrative ${queue.workers === 1 ? 'worker' : 'workers'}`);
      select('.mission-progress').setAttribute('aria-valuenow', counts[2]);
      select('.mission-progress > span').style.width = `${counts[2] / 12 * 100}%`;
      const done = counts[2] === 12;
      dispatch.disabled = queue.dispatched && !(done && !queue.sawFour);
      dispatch.textContent = done && !queue.sawFour ? 'Retry a fresh demo batch' : 'Dispatch 12 demo jobs';
      scale.disabled = !queue.dispatched || queue.sawFour || done;
      idle.disabled = !done || !queue.sawFour || queue.returned;
    }
    function tick() {
      queue = advanceQueue(queue);
      render();
      if (queue.jobs.every(job => job.state === 'done')) {
        loopRunning = false;
        sound('ui');
        announce(queue.sawFour ? 'All 12 jobs are complete. Return to one idle worker to finish the illustration.' : 'The batch drained with one worker. Try a fresh batch and scale while work is queued to inspect the second path.');
      } else schedule(tick, 420);
    }
    render();
    announce('Dispatch 12 demo jobs to start the kitchen.');
  }

  function dataMission(stage) {
    let step = 0;
    stage.innerHTML = `<div class="mission-scene-kicker">Demo inputs · no inference or lending decision</div>
      <h3>Follow the application, not just an algorithm.</h3>
      <div class="mission-data-controls"><label class="mission-select-label">Illustrative input profile<select id="mission-profile"><option value="">Choose demo inputs</option><option value="a">Demo A · complete example row</option><option value="b">Demo B · one missing field</option></select></label>
      <fieldset class="mission-options mission-model-options"><legend>Choose an implemented model family</legend>
      <label class="mission-option"><input type="radio" name="demo-model" value="Calibrated Logistic Regression"><span>Logistic Regression<small>Calibrated implementation</small></span></label>
      <label class="mission-option"><input type="radio" name="demo-model" value="XGBoost"><span>XGBoost<small>Boosted trees</small></span></label>
      <label class="mission-option"><input type="radio" name="demo-model" value="LightGBM"><span>LightGBM<small>Boosted trees</small></span></label></fieldset></div>
      <ol class="mission-trace"><li><span class="mission-step-number">1</span><span>Demo inputs + preparation</span></li><li><span class="mission-step-number">2</span><span>Selected model + context</span></li><li><span class="mission-step-number">3</span><span>History + report workflow</span></li></ol>
      <div class="mission-output"><span class="mission-output-label">Inspection terminal</span><p>No score generated. Choose inputs and a model to inspect the workflow.</p></div><div class="mission-actions"></div>`;
    const inspect = button('Inspect demo inputs', () => {
      const profile = select('#mission-profile').value;
      const model = select('input[name="demo-model"]:checked');
      if (!profile || !model) {
        sound('retry'); announce('Choose a demo input profile and a model family first.', true); return;
      }
      const output = select('.mission-output p');
      sound('machine');
      if (step === 0) {
        select('#mission-profile').disabled = true;
        stage.querySelectorAll('input').forEach(input => { input.disabled = true; });
        output.textContent = profile === 'a' ? 'Demo A is an invented complete row. In an application workflow, inputs must be prepared before reaching a model. This terminal does not run the original preprocessing.' : 'Demo B is an invented row with a missing field. Input validation and preparation belong before inference. This illustration flags the gap without inventing a project-specific imputation rule.';
        inspect.textContent = 'Inspect model context';
        announce('Input preparation inspected. Continue to the selected model context.');
      } else if (step === 1) {
        output.textContent = `${model.value} is implemented in the public project. An inspectable prediction should carry its model context. No model is loaded here, and no probability, approval, accuracy or feature importance is calculated.`;
        inspect.textContent = 'Connect history and reporting';
        announce('Model context inspected. Connect the final application step.');
      } else {
        output.textContent = 'Application path: prepared input → selected model and context → prediction history → report. The original application uses PyQt6 and MySQL. This educational trace neither stores a record nor issues a credit decision.';
        inspect.disabled = true;
      }
      const item = select('.mission-trace').children[step];
      item.classList.add('mission-step-done');
      item.querySelector('.mission-step-number').textContent = '✓';
      step += 1;
      if (step === 3) complete('You connected inputs, model context, history and reporting: the complete application workflow.');
    });
    select('.mission-actions').append(inspect);
    announce('Choose invented demo inputs and one documented model family. No scoring service is connected.');
  }

  function agentMission(stage) {
    stage.innerHTML = `<div class="mission-scene-kicker">Simulated request · no live agent endpoint</div>
      <h3>Give the agent a task, then a boundary.</h3>
      <label class="mission-select-label">Example task<select id="mission-task"><option value="">Choose a task</option><option value="find">Find a detail in my uploaded notes</option><option value="summarise">Summarise my uploaded document</option></select></label>
      <fieldset class="mission-options"><legend>Authorize the appropriate conceptual tool scope</legend>
      <label class="mission-option"><input type="radio" name="agent-scope" value="scoped"><span><strong>Read-only retrieval</strong><small>Only documents belonging to the configured demo identity; scope enforced by the server.</small></span></label>
      <label class="mission-option"><input type="radio" name="agent-scope" value="all"><span><strong>Search across every identity</strong><small>Outside the permitted user scope.</small></span></label>
      <label class="mission-option"><input type="radio" name="agent-scope" value="write"><span><strong>Change or delete a record</strong><small>Outside the read-only tool boundary.</small></span></label></fieldset>
      <div class="mission-actions"></div><ol class="mission-trace" aria-label="Illustrative request trace"></ol>`;
    const authorize = button('Authorize and trace', () => {
      const task = select('#mission-task').value;
      const scope = select('input[name="agent-scope"]:checked');
      if (!task || !scope || scope.value !== 'scoped') {
        sound('retry');
        announce(!task ? 'Choose an example task first.' : !scope ? 'Choose a tool scope first.' : 'That scope exceeds this read-only, user-scoped task. The server must enforce identity boundaries.', true);
        return;
      }
      authorize.disabled = true;
      select('#mission-task').disabled = true;
      stage.querySelectorAll('input').forEach(input => { input.disabled = true; });
      announce('Scope approved for this fictional trace. No external tool is being called.');
      trace(['Application input → agent orchestration / ACP', 'Server supplies configured demo identity', 'MCP boundary → read-only, scoped retrieval', 'Illustrative response path → retrieved context'],
        () => complete('The request stayed inside its read-only identity boundary. No live response or security guarantee is implied.'), 620);
    });
    select('.mission-actions').append(authorize);
    announce('Choose a task, then authorize only the access that task needs.');
  }

  function parallelMission(stage) {
    let sequentialDone = false;
    const records = distributeRecords(8, 8);
    stage.innerHTML = `<div class="mission-scene-kicker">8 toy records · authored animation, no measured runtime</div>
      <h3>Give each worker its own output slice.</h3><p>Inspect one lane first. Then split the same eight toy records across eight lanes.</p>
      <div class="mission-compute-stage"><div class="mission-lane-title"><span>One lane</span><small>sequential illustration</small></div><div class="mission-sequential">${Array.from({ length: 8 }, (_, index) => `<span data-record="${index}">${String(index + 1).padStart(2, '0')}</span>`).join('')}</div>
      <div class="mission-lane-title"><span>Eight lanes</span><small>disjoint record ownership</small></div><div class="mission-lanes">${records.map((ids, index) => `<div class="mission-lane"><span>Lane ${index + 1}</span><i><b></b></i><small>Record ${String(ids[0] + 1).padStart(2, '0')}</small></div>`).join('')}</div></div>
      <div class="mission-actions"></div><p class="mission-fineprint">Animation durations explain the concept only. The real 3.25× result below comes from a separate archived workload, with an optimized sequential baseline.</p>`;
    const sequential = button('Run one lane', () => {
      sequential.disabled = true;
      sound('machine');
      announce('One lane owns and completes one toy record after another.');
      let index = 0;
      const next = () => {
        select(`[data-record="${index}"]`).classList.add('mission-record-done');
        index += 1;
        if (index < 8) schedule(next, 300);
        else {
          sequentialDone = true;
          parallel.disabled = false;
          sound('ui');
          announce('The single lane finished. Now split those records across eight independent lanes.');
        }
      };
      next();
    });
    const parallel = button('Split across 8 lanes', () => {
      if (!sequentialDone) return;
      parallel.disabled = true;
      sound('machine');
      announce('Each lane owns a different record and output position. Read-only lookup avoids a shared write path.');
      let progress = 0;
      const next = () => {
        progress += 1;
        stage.querySelectorAll('.mission-lane i b').forEach(bar => { bar.style.width = `${progress * 25}%`; });
        if (progress < 4) schedule(next, 340);
        else {
          stage.querySelectorAll('.mission-lane').forEach(lane => lane.classList.add('mission-lane-done'));
          complete('Eight independent slices rejoin in the original record order. These toy lanes illustrate ownership, not a reproduced benchmark.');
        }
      };
      next();
    }, 'mission-button-secondary');
    parallel.disabled = true;
    select('.mission-actions').append(sequential, parallel);
    announce('Start with one lane to inspect sequential record ownership.');
  }

  function visionMission(stage) {
    let visited = { low: false, high: false };
    const scene = mask => `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="600" height="300" fill="${mask ? '#172c35' : '#233e47'}"/><path d="M-20 205 230 65 620 185M210 330 320 120 380-20" stroke="${mask ? '#a6b0c1' : '#617079'}" stroke-width="43" fill="none"/><path d="M10 5 160 8 190 66 70 133 0 105ZM410 206 595 220 598 295 375 295Z" fill="${mask ? '#60d9a1' : '#366d60'}"/><g fill="${mask ? '#ce96ee' : '#b08b6c'}" stroke="${mask ? '#e5b5fa' : '#d1af8a'}" stroke-width="3"><path d="m210 13 66 10-18 56-64-12Z"/><path d="m355 35 81 27-23 65-76-23Z"/><path d="m64 172 65-36 43 73-66 36Z"/><path d="m383 150 95 27-20 62-91-29Z"/><path d="m164 229 66-42 30 57-65 40Z"/><path d="m495 30 72 8-9 74-76-11Z"/></g>${mask ? '' : '<g fill="#e5be86"><path d="m217 27 28 5-9 23-28-6Z"/><path d="m366 53 43 15-10 28-42-14Z"/><path d="m395 167 48 13-9 26-46-13Z"/></g><path d="M42 20 108 29 144 65 76 105 13 86" stroke="#558573" stroke-width="13" fill="none"/>'}</svg>`;
    stage.innerHTML = `<div class="mission-scene-kicker">Synthetic illustration · not model output</div>
      <h3>Inputs and labels must stay aligned.</h3><p>Reveal the hand-drawn region labels over this invented aerial scene. Inspect both ends of the slider, then confirm the alignment.</p>
      <div class="mission-vision-scene"><div class="mission-vision-base">${scene(false)}</div><div class="mission-vision-mask">${scene(true)}</div><span class="mission-vision-divider" aria-hidden="true"></span><span class="mission-image-label">Synthetic scene</span><span class="mission-mask-label">Illustrative labels</span></div>
      <label class="mission-slider-label" for="mission-vision-slider">Label overlay <output id="mission-vision-value">50%</output></label><input id="mission-vision-slider" class="mission-slider" type="range" min="0" max="100" step="1" value="50" aria-describedby="mission-vision-help">
      <p id="mission-vision-help" class="mission-fineprint">Use the slider or arrow keys. Home and End inspect the two extremes. No retained actual prediction image, checkpoint or original metric output was found.</p>
      <div class="mission-legend"><span><i class="mission-swatch-roof"></i>Illustrative roofs</span><span><i class="mission-swatch-green"></i>Illustrative vegetation</span><span><i class="mission-swatch-street"></i>Illustrative streets</span></div>
      <div class="mission-range-checks"><span data-low>○ Scene end</span><span data-high>○ Labels end</span></div><div class="mission-actions"></div>`;
    const confirm = button('Confirm alignment inspected', () => {
      if (visited.low && visited.high) {
        confirm.disabled = true;
        complete('You inspected the synthetic scene and its aligned labels. The real source implements RGB + DSM inputs and tiled reconstruction; no actual prediction is displayed here.');
      }
    });
    confirm.disabled = true;
    select('.mission-actions').append(confirm);
    const slider = select('#mission-vision-slider');
    slider.addEventListener('input', () => {
      const value = Number(slider.value);
      const before = visited.low && visited.high;
      visited = inspectRange(visited, value);
      select('.mission-vision-mask').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      select('.mission-vision-divider').style.left = `${value}%`;
      select('#mission-vision-value').textContent = `${value}%`;
      slider.setAttribute('aria-valuetext', `${value} percent illustrative labels revealed`);
      select('[data-low]').textContent = `${visited.low ? '✓' : '○'} Scene end`;
      select('[data-high]').textContent = `${visited.high ? '✓' : '○'} Labels end`;
      confirm.disabled = !(visited.low && visited.high) || completed;
      if (!before && visited.low && visited.high) {
        sound('ui');
        announce('Both ends inspected. Confirm the alignment to restore the screen.');
      }
    });
    announce('Inspect the scene end at 0–15% and the labels end at 85–100%. The picture is entirely synthetic.');
  }

  function open(id) {
    const project = projects.find(item => item.id === id || item.slug === id || String(item.id) === String(id));
    if (!project || !missionDefinitions[project.id]) return false;
    clearTimers();
    activeId = project.id;
    completed = false;
    const definition = missionDefinitions[activeId];
    host.hidden = false;
    host.classList.add('mission-dock');
    host.setAttribute('aria-labelledby', 'workstation-title');
    host.innerHTML = `<div class="mission-workstation" data-accent="${definition.accent}">
      <header class="mission-header"><div><p class="mission-eyebrow">Station ${String(activeId + 1).padStart(2, '0')} / ${escapeHTML(definition.district)}</p><h2 id="workstation-title" tabindex="-1">${escapeHTML(definition.title)}</h2><p class="mission-project-name">${escapeHTML(project.title)}</p></div><div class="mission-close-slot"></div></header>
      <div class="mission-meta"><span class="mission-illustration-label">Educational illustration, not original application</span><span class="mission-progress-label">Awaiting activation</span></div>
      <div class="mission-body"><div class="mission-interaction"><div class="mission-stage"></div><p class="mission-status" role="status" aria-live="polite" aria-atomic="true"></p></div>
      <aside class="mission-evidence" aria-label="Actual project evidence"><p class="mission-eyebrow">Real project / recorded evidence</p><h3>${escapeHTML(project.evidence.label)}</h3><p>${escapeHTML(project.evidence.summary)}</p><details><summary>Scope and limitations</summary><p>${escapeHTML(project.evidenceLimit)}</p><p><strong>${escapeHTML(project.contributionLabel || 'My contribution')}:</strong> ${escapeHTML(project.contribution)}</p></details><div class="mission-evidence-actions"></div></aside></div>
      <div class="mission-completion" hidden></div><footer class="mission-footer"><span>Evidence and career links are available throughout the game.</span><span>Esc closes this workstation.</span></footer></div>`;
    workstation = host.firstElementChild;
    status = select('.mission-status');
    select('.mission-close-slot').append(button('Back to city', close, 'mission-button-secondary mission-close'));
    select('.mission-evidence-actions').append(button('Open full project dossier', () => { sound('ui'); onDossier(activeId); }, 'mission-button-secondary'));
    const study = project.links.find(link => link.kind === 'case-study') || project.links[0];
    if (study) {
      const link = document.createElement('a');
      link.className = 'mission-source-link';
      link.href = study.href;
      link.textContent = study.label;
      select('.mission-evidence-actions').append(link);
    }
    workstation.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    });
    [evidenceMission, queueMission, dataMission, agentMission, parallelMission, visionMission][activeId](select('.mission-stage'));
    sound('ui');
    select('#workstation-title').focus({ preventScroll: true });
    host.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    return true;
  }

  function close() {
    if (activeId === null) return;
    const previous = activeId;
    clearTimers();
    activeId = null;
    completed = false;
    host.hidden = true;
    host.replaceChildren();
    workstation = null;
    status = null;
    onClose(previous);
  }

  return { open, close, reset: close, get active() { return activeId; } };
}
