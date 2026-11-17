// Toy interaction state only. Recorded project evidence remains in content.js.
export const missionDefinitions = [
  { district: 'AI Alley', title: 'Reconnect the evidence', verb: 'Archive online', accent: 'mint' },
  { district: 'Cloud Kitchen', title: 'Manage the queue', verb: 'Kitchen online', accent: 'amber' },
  { district: 'Data Market', title: 'Explore the pipeline', verb: 'Data terminal online', accent: 'lavender' },
  { district: 'Agent Arcade', title: 'Trace an agent request', verb: 'Arcade online', accent: 'cyan' },
  { district: 'Parallel Works', title: 'Divide the workload', verb: 'Workshop online', accent: 'amber' },
  { district: 'Vision Street', title: 'Inspect the alignment', verb: 'Vision screen online', accent: 'magenta' }
];

export function createQueue() {
  return { dispatched: false, workers: 1, sawFour: false, returned: false,
    jobs: Array.from({ length: 12 }, (_, id) => ({ id, state: 'waiting', step: 0 })) };
}

export function dispatchQueue() {
  return { ...createQueue(), dispatched: true,
    jobs: Array.from({ length: 12 }, (_, id) => ({ id, state: 'queued', step: 0 })) };
}

export function scaleQueue(queue, workers) {
  const done = queue.jobs.every(job => job.state === 'done');
  if (!queue.dispatched || (workers !== 1 && workers !== 4)) return queue;
  if (workers === 4 && !done) return { ...queue, workers: 4, sawFour: true };
  if (workers === 1 && done && queue.sawFour) return { ...queue, workers: 1, returned: true };
  return queue;
}

export function advanceQueue(queue) {
  if (!queue.dispatched || queue.returned) return queue;
  const jobs = queue.jobs.map(job => {
    if (job.state !== 'running') return { ...job };
    const step = job.step + 1;
    return { ...job, step, state: step >= 3 ? 'done' : 'running' };
  });
  let available = queue.workers - jobs.filter(job => job.state === 'running').length;
  for (const job of jobs) {
    if (available > 0 && job.state === 'queued') {
      job.state = 'running';
      available -= 1;
    }
  }
  return { ...queue, jobs };
}

export function canRestoreQueue(queue) {
  return queue.dispatched && queue.sawFour && queue.returned && queue.workers === 1 &&
    queue.jobs.every(job => job.state === 'done');
}

// Output ownership is disjoint, regardless of the number of illustrative lanes.
export function distributeRecords(count, lanes) {
  return Array.from({ length: lanes }, (_, lane) =>
    Array.from({ length: count }, (_, id) => id).filter(id => id % lanes === lane));
}

export function inspectRange(visited, value) {
  return { low: visited.low || value <= 15, high: visited.high || value >= 85 };
}
