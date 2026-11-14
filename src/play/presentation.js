// Presentation state follows the existing physics; it never changes collisions.
export const LANDING_MS=180;
export function createPresentation(){return {heroPose:'idle',poseAge:0,walkTime:0,activation:null};}
export function advancePresentation(state,hero,wasGrounded,delta){
  const dt=Math.max(0,Math.min(34,delta));if(!dt)return;
  let pose;
  if(!hero.onGround)pose=hero.vy<-.4?'rise':'fall';
  else if(!wasGrounded||(state.heroPose==='land'&&state.poseAge+dt<LANDING_MS))pose='land';
  else pose=Math.abs(hero.vx)>.2?'walk':'idle';
  state.poseAge=pose===state.heroPose?state.poseAge+dt:0;
  state.heroPose=pose;if(pose==='walk')state.walkTime+=dt;
  if(state.activation){state.activation.age+=dt;if(state.activation.age>=state.activation.duration)state.activation=null;}
}
export function activateStation(state,id,first,effects){
  state.activation=effects?{id,age:0,duration:first?720:420,first:Boolean(first)}:null;
}
export function discoverStation(visited,id){
  if(!Number.isInteger(id)||id<0||id>5)return {first:false,count:visited.size};
  const first=!visited.has(id);visited.add(id);return {first,count:visited.size};
}
