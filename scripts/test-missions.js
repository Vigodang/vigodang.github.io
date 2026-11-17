import test from 'node:test';
import assert from 'node:assert/strict';
import { createQueue, dispatchQueue, scaleQueue, advanceQueue, canRestoreQueue,
  distributeRecords, inspectRange } from '../src/play/missions.js';

test('a queue restores only after dispatch, actual drainage, scaling and return to idle', () => {
  assert.equal(canRestoreQueue(createQueue()), false);
  let queue = dispatchQueue();
  for (let tick = 0; tick < 3; tick += 1) queue = advanceQueue(queue);
  assert.equal(canRestoreQueue(queue), false);
  queue = scaleQueue(queue, 4);
  assert.equal(canRestoreQueue(queue), false);
  for (let tick = 0; tick < 100 && queue.jobs.some(job => job.state !== 'done'); tick += 1) {
    queue = advanceQueue(queue);
    assert.ok(queue.jobs.filter(job => job.state === 'running').length <= queue.workers);
    assert.equal(queue.jobs.length, 12);
    assert.equal(new Set(queue.jobs.map(job => job.id)).size, 12);
  }
  assert.ok(queue.jobs.every(job => job.state === 'done'));
  assert.equal(canRestoreQueue(queue), false, 'a drained queue still needs scale-down');
  queue = scaleQueue(queue, 1);
  assert.equal(canRestoreQueue(queue), true);
  assert.deepEqual(advanceQueue(queue), queue, 'an idle completed queue starts no work');
});

test('single-worker drainage and invalid scaling cannot bypass the mission', () => {
  let queue = dispatchQueue();
  assert.equal(scaleQueue(queue, 8), queue);
  assert.equal(scaleQueue(queue, 1), queue, 'cannot return to idle with pending jobs');
  for (let tick = 0; tick < 100; tick += 1) queue = advanceQueue(queue);
  assert.ok(queue.jobs.every(job => job.state === 'done'));
  assert.equal(canRestoreQueue(queue), false);
  assert.equal(scaleQueue(queue, 4), queue, 'scaling after all work is done does not count');
  assert.equal(canRestoreQueue(scaleQueue(queue, 1)), false);
});

test('eight lanes own disjoint output slices and retain every record', () => {
  for (const recordCount of [8, 17, 200]) {
    const lanes = distributeRecords(recordCount, 8);
    const result = lanes.flat();
    assert.equal(lanes.length, 8);
    assert.equal(new Set(result).size, recordCount);
    assert.deepEqual(result.sort((a, b) => a - b), Array.from({ length: recordCount }, (_, id) => id));
    assert.ok(lanes.every(lane => lane.every((id, index) => index === 0 || id > lane[index - 1])));
  }
});

test('vision requires inspection of both extremes, in either order', () => {
  let visited = inspectRange({ low: false, high: false }, 50);
  assert.deepEqual(visited, { low: false, high: false });
  visited = inspectRange(visited, 100);
  assert.deepEqual(visited, { low: false, high: true });
  visited = inspectRange(visited, 15);
  assert.deepEqual(visited, { low: true, high: true });
  assert.deepEqual(inspectRange(inspectRange({ low: false, high: false }, 0), 85), visited);
});
