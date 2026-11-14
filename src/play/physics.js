// Prototype acceleration, friction, gravity and one-way landing, extracted for
// meaningful collision checks. No hazards or content gates.
export function createHero(ground) {return {x:110,y:ground-48,w:32,h:48,vx:0,vy:0,onGround:true,facing:1,coyote:90,jumpBuffer:0};}
export function jumpHero(hero) {
  if(hero.onGround||hero.coyote>0){hero.vy=-11.5;hero.onGround=false;hero.coyote=0;hero.jumpBuffer=0;return true;}
  hero.jumpBuffer=110;return false;
}
export function stepHero(hero,input,platforms,ground,worldWidth,delta){
  const dt=Math.max(0,Math.min(34,delta)),step=dt/16.6667;
  hero.coyote=hero.onGround?90:Math.max(0,hero.coyote-dt);hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);
  if(input.left){hero.vx-=.65*step;hero.facing=-1;}if(input.right){hero.vx+=.65*step;hero.facing=1;}
  if(!input.left&&!input.right)hero.vx*=Math.pow(.78,step);
  hero.vx=Math.max(-5.6,Math.min(5.6,hero.vx));if(Math.abs(hero.vx)<.04)hero.vx=0;
  const previousBottom=hero.y+hero.h;hero.x=Math.max(16,Math.min(worldWidth-hero.w-16,hero.x+hero.vx*step));
  hero.vy=Math.min(14,hero.vy+.64*step);hero.y+=hero.vy*step;hero.onGround=false;
  if(hero.y+hero.h>=ground){hero.y=ground-hero.h;hero.vy=0;hero.onGround=true;}
  for(const p of platforms)if(hero.vy>=0&&previousBottom<=p.y+1&&hero.y+hero.h>=p.y&&hero.x+hero.w>p.x&&hero.x<p.x+p.w){hero.y=p.y-hero.h;hero.vy=0;hero.onGround=true;}
  if(hero.onGround&&hero.jumpBuffer>0)jumpHero(hero);
}
