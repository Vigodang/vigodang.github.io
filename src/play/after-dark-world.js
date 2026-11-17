import {drawRobot} from './world-art.js';
import {drawIcon} from './icons.js';

const palette=['#87f5c2','#f6bc70','#54e8df','#ae8bff','#87f5c2','#ef92ce'];
const names=['AI ALLEY','CLOUD KITCHEN','DATA MARKET','AGENT ARCADE','PARALLEL WORKS','VISION STREET'];
const subtitles=['SOURCE-LINKED SYNTHESIS','ASYNC ORDERS / WARM SERVERS','MODELS / HISTORY / REPORTS','SCOPED TOOLS / CONNECTED IDEAS','EIGHT CORES / ONE RESULT','RGB + ELEVATION / PIXEL BY PIXEL'];
const images={};
export function preloadArt(onLoad=()=>{}) {
  for(const [key,file] of Object.entries({city:'city-panorama.webp',shops:'district-atlas.webp'})) {
    const img=new Image();img.onload=()=>{
      if(key==='shops'){const dim=document.createElement('canvas');dim.width=img.naturalWidth;dim.height=img.naturalHeight;const buffer=dim.getContext('2d');if(buffer){buffer.filter='brightness(.62) saturate(.7)';buffer.drawImage(img,0,0);images.shopsOffline=dim;}}
      onLoad();
    };img.src=new URL(`./assets/after-dark/${file}`,import.meta.url).href;images[key]=img;
  }
}
function glow(ctx,x,y,r,color,alpha=.18){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
function label(ctx,text,x,y,color,size=12){ctx.font=`600 ${size}px 'Segoe UI',sans-serif`;ctx.fillStyle=color;ctx.fillText(text,x,y);}
function panel(ctx,x,y,w,h,fill,stroke){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,w,h,5);ctx.fill();ctx.stroke();}
function district(ctx,p,s,effects){
  const x=p.x-s.camera,y=s.ground,online=s.restored?.has(p.id),near=s.nearbyId===p.id,color=palette[p.id];
  if(x < -250 || x > s.width+250)return;
  const tall=Math.min(324,Math.max(170,s.ground-70)),w=tall*.78;
  if(images.shops?.complete&&images.shops.naturalWidth){
    const img=images.shops,sw=img.naturalWidth/3,sh=img.naturalHeight/2;
    ctx.drawImage(online?img:images.shopsOffline||img,(p.id%3)*sw,Math.floor(p.id/3)*sh,sw,sh,x-w*.65,y-tall,w*1.3,tall);
  }else{
    panel(ctx,x-110,y-245,220,245,'#112b36','#3d7b78');
    panel(ctx,x-97,y-215,194,112,'#0e1b28',color);drawIcon(ctx,p.icon,x-28,y-186,56,color);
  }
  // The signs, powered conduits and architectural readouts are real-time layers.
  glow(ctx,x,y-130,155,color,online?.21:.06);
  ctx.save();ctx.shadowColor=color;ctx.shadowBlur=online?15:5;
  panel(ctx,x-113,y-94,226,36,online?'#102e30':'#102029',online?color:'#426268');
  ctx.textAlign='center';label(ctx,names[p.id],x,y-71,online?color:'#d9e9e4',15);ctx.restore();
  ctx.textAlign='center';label(ctx,subtitles[p.id],x,y-44,'#b4d4cf',8);
  label(ctx,online?'● SYSTEM RESTORED':near?'[ E ] CONNECT SYSTEM':'○ AWAITING CONNECTION',x,y-22,online?color:near?'#f6bc70':'#b0c4c2',10);
  ctx.textAlign='left';
  ctx.strokeStyle=online?color:'#31545a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-115,y+5);ctx.lineTo(x+115,y+5);ctx.stroke();
  if(online){
    const wave=effects?Math.sin(s.time*.002+p.id)*.05+.14:.13;
    glow(ctx,x,y+15,120,color,wave);
    // A concise proof point is part of the lit shop window, independent of dossiers.
    const proof=['PROVENANCE RETAINED','40/40 · RECORDED 12 OCT 2026','3 IMPLEMENTED MODEL FAMILIES','229 LOCAL TESTS · 14 NOV 2026','3.25× vs OPT. SEQ. · 8 THREADS','PINNED IMPLEMENTATION SOURCE'][p.id];
    const proofY=Math.max(6,y-143);panel(ctx,x-110,proofY,220,29,'#09242b',color);ctx.textAlign='center';label(ctx,proof,x,proofY+19,color,10);ctx.textAlign='left';
  }
  if(s.activation?.id===p.id&&effects){
    const a=s.activation.age/s.activation.duration;ctx.globalAlpha=(1-a)*.5;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-15,20+a*140,10+a*65,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }
}
export function drawWorld(ctx,s){
  const {width:w,height:h,ground:g,camera:c,time:t}=s,effects=s.ambient&&!s.reducedMotion;
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.fillStyle='#091521';ctx.fillRect(0,0,w,h);
  if(images.city?.complete&&images.city.naturalWidth){
    const img=images.city,ih=h,iw=ih*img.naturalWidth/img.naturalHeight,offset=-(c*.3)%iw;
    for(let x=offset-iw;x<w;x+=iw)ctx.drawImage(img,x,0,iw,ih);
  }
  if(s.restored?.size)glow(ctx,w*.5,g*.25,w*.65,'#87f5c2',s.restored.size*.012);
  // Dark glass at street level separates playable silhouettes from the illustration.
  const shade=ctx.createLinearGradient(0,g*.28,0,g);shade.addColorStop(0,'#09152100');shade.addColorStop(.75,'#09152142');shade.addColorStop(1,'#091521c7');ctx.fillStyle=shade;ctx.fillRect(0,0,w,g);
  ctx.fillStyle='#102a3270';ctx.fillRect(0,g,w,h-g);ctx.fillStyle='#528179';ctx.fillRect(0,g,w,2);
  for(let i=0;i<Math.ceil(w/100)+1;i++){const x=i*100-c%100;ctx.strokeStyle='#29434c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,g+8);ctx.lineTo(x-38,h);ctx.stroke();}
  for(const p of s.stations)district(ctx,p,s,effects);
  // Elevated service paths share the exact collision coordinates.
  for(const p of s.platforms){const x=p.x-c;if(x<-p.w||x>w)continue;ctx.fillStyle='#152f3b';ctx.fillRect(x,p.y,p.w,p.h);ctx.fillStyle='#80b8a5';ctx.fillRect(x,p.y,p.w,3);ctx.strokeStyle='#345c62';ctx.beginPath();ctx.moveTo(x+5,p.y+p.h);ctx.lineTo(x+5,g);ctx.moveTo(x+p.w-5,p.y+p.h);ctx.lineTo(x+p.w-5,g);ctx.stroke();}
  for(const item of s.collectibles){if(s.collected.has(item.id))continue;const x=item.x-c;if(x<-20||x>w+20)continue;const y=item.y+(effects?Math.sin(t*.003+item.x)*3:0);glow(ctx,x,y,14,'#f6bc70',.14);ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillStyle='#f6bc70';ctx.fillRect(-4,-4,8,8);ctx.fillStyle='#102832';ctx.fillRect(-2,-2,4,4);ctx.restore();}
  for(const d of s.dust||[]){if(!effects)break;ctx.globalAlpha=Math.max(0,1-d.age/330);ctx.fillStyle='#87f5c2';ctx.fillRect(d.x-c+d.age*.025,d.y-d.age*.025,3,3);}ctx.globalAlpha=1;
  // Small legible robot, original pose geometry and unchanged collision box.
  ctx.save();ctx.shadowColor='#87f5c2';ctx.shadowBlur=8;drawRobot(ctx,s,effects);ctx.restore();
  if(s.rain&&effects){ctx.lineWidth=.8;ctx.strokeStyle='#98e1e7';ctx.globalAlpha=.18;ctx.beginPath();for(let i=0;i<65;i++){const x=(i*79.7+t*.055-c*.08)%(w+80)-40,y=(i*113+t*.38)%(h+80)-40;ctx.moveTo(x,y);ctx.lineTo(x-4,y+14);}ctx.stroke();ctx.globalAlpha=1;}
  if(effects){
    const x=((t*.022-c*.15)%(w+250)+w+250)%(w+250)-100,y=58+Math.sin(t*.0009)*8;ctx.fillStyle='#88b8b3';ctx.fillRect(x,y,22,6);ctx.fillStyle='#f6bc70';ctx.fillRect(x+17,y+2,3,2);ctx.strokeStyle='#76aaa4';ctx.beginPath();ctx.moveTo(x-5,y-3);ctx.lineTo(x+7,y-3);ctx.moveTo(x+16,y-3);ctx.lineTo(x+28,y-3);ctx.stroke();
  }
  // Cable and hanging signal lamps form a close foreground plane.
  ctx.strokeStyle='#08121c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,12);ctx.quadraticCurveTo(w*.5,65,w+20,10);ctx.stroke();
  for(let i=0;i<4;i++){const x=i*310+160-c*.12%310;ctx.fillStyle='#a97a4a';ctx.fillRect(x,30,2,22);glow(ctx,x,59,35,'#f6bc70',.1);panel(ctx,x-6,50,14,19,'#b88f59','#e7bc81');}
  ctx.restore();
}
