import test from 'node:test';
import assert from 'node:assert/strict';
import {createHero,jumpHero,stepHero} from '../src/play/physics.js';
import {createPresentation,advancePresentation,activateStation,discoverStation} from '../src/play/presentation.js';

test('the existing jump trajectory produces rise, fall, landing and idle poses without changing physics',()=>{
  const hero=createHero(279),control=createHero(279),state=createPresentation(),poses=new Set();
  jumpHero(hero);jumpHero(control);
  for(let i=0;i<100;i++){
    const wasGrounded=hero.onGround;stepHero(hero,{},[],279,4220,16.667);stepHero(control,{},[],279,4220,16.667);
    advancePresentation(state,hero,wasGrounded,16.667);poses.add(state.heroPose);assert.deepEqual(hero,control);
  }
  for(const pose of ['rise','fall','land','idle'])assert(poses.has(pose),pose);
});
test('walking phases advance only while walking, and zero elapsed time leaves all presentation clocks frozen',()=>{
  const state=createPresentation(),hero={onGround:true,vx:3,vy:0};
  advancePresentation(state,hero,true,16);assert.equal(state.heroPose,'walk');assert.equal(state.walkTime,16);
  activateStation(state,1,true,true);const frozen=structuredClone(state);advancePresentation(state,hero,true,0);assert.deepEqual(state,frozen);
  hero.vx=0;advancePresentation(state,hero,true,16);assert.equal(state.heroPose,'idle');assert.equal(state.walkTime,16);
});
test('feedback is bounded, replaceable and absent when decorative motion is disabled',()=>{
  const state=createPresentation(),hero={onGround:true,vx:0,vy:0};
  activateStation(state,0,true,true);assert.equal(state.activation.duration,720);
  activateStation(state,3,false,true);assert.equal(state.activation.id,3);assert.equal(state.activation.duration,420);
  for(let i=0;i<15;i++)advancePresentation(state,hero,true,34);assert.equal(state.activation,null);
  activateStation(state,2,true,false);assert.equal(state.activation,null);
});
test('reopening a station never adds progress or a second first-discovery reward',()=>{
  const visited=new Set();assert.deepEqual(discoverStation(visited,0),{first:true,count:1});
  assert.deepEqual(discoverStation(visited,0),{first:false,count:1});
  for(let i=1;i<6;i++)discoverStation(visited,i);assert.equal(visited.size,6);
  assert.deepEqual(discoverStation(visited,'about'),{first:false,count:6});assert.equal(visited.size,6);
});
