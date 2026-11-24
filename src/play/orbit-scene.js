import * as THREE from './vendor/three.module.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const chapters=['work','demos','skills','about','contact'];
const labels=['Work','Demos','Skills','About','Contact'];
const TAU=Math.PI*2;
const nearest=(angle,reference)=>angle+Math.round((reference-angle)/TAU)*TAU;

function roundedShape(width,height,radius){
  const x=-width/2,y=-height/2,s=new THREE.Shape();
  s.moveTo(x+radius,y);s.lineTo(x+width-radius,y);s.quadraticCurveTo(x+width,y,x+width,y+radius);
  s.lineTo(x+width,y+height-radius);s.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
  s.lineTo(x+radius,y+height);s.quadraticCurveTo(x,y+height,x,y+height-radius);
  s.lineTo(x,y+radius);s.quadraticCurveTo(x,y,x+radius,y);s.closePath();return s;
}
function faceUV(geometry,width,height){
  const positions=geometry.attributes.position,uv=new Float32Array(positions.count*2);
  for(let i=0;i<positions.count;i++){uv[i*2]=(positions.getX(i)+width/2)/width;uv[i*2+1]=(positions.getY(i)+height/2)/height;}
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geometry;
}

// A designed portfolio badge, not an employment credential or human scan.
// The camera stays fixed. Both printed faces, the card body and clip rotate.
export async function createOrbitScene({canvas,stage,onSelect,onFrame,reducedMotion=false,layout='standalone'}){
  const heroLayout=layout==='hero';
  // Hero materials share the cool editorial palette; the standalone badge keeps
  // its original print colours. Geometry, interaction and physics are shared.
  const palette=heroLayout
    ?{paper:'#eef2f1',ink:'#243c39',muted:'#5c6e6b',photo:'#d3dfdb',back:'#314a46',line:'#76908b',accent:'#d78662',ribbon:'#8ea7a2',ribbonOther:'#435d59'}
    :{paper:'#f3ebdd',ink:'#013230',muted:'#38574e',photo:'#c8d5c1',back:'#8d4e34',line:'#c2987f',accent:'#ff6a1f',ribbon:'#c4b49b',ribbonOther:'#bc704c'};
  let renderer;const resources=[];const keep=resource=>(resources.push(resource),resource);
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setClearColor(0,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,60);
    camera.position.set(0,0,12);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff,heroLayout?0xafbabc:0xaeb7ad,2.3));
    const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-3,6,7);scene.add(key);
    const fill=new THREE.DirectionalLight(heroLayout?0xecf1f2:0xe9f1ed,2);fill.position.set(5,1,-3);scene.add(fill);
    const envCanvas=document.createElement('canvas');envCanvas.width=512;envCanvas.height=256;
    const env=envCanvas.getContext('2d'),gradient=env.createLinearGradient(0,0,0,256);
    gradient.addColorStop(0,heroLayout?'#f4f6f6':'#f6f4ee');gradient.addColorStop(.48,heroLayout?'#bac5c5':'#b7c2bd');gradient.addColorStop(1,heroLayout?'#3a4849':'#384640');
    env.fillStyle=gradient;env.fillRect(0,0,512,256);env.fillStyle='#fff';env.fillRect(70,10,65,180);env.fillRect(320,15,110,100);
    const environment=keep(new THREE.CanvasTexture(envCanvas));environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;scene.environment=environment;
    const cream=keep(new THREE.MeshPhysicalMaterial({color:palette.paper,metalness:.02,roughness:.55,clearcoat:.3}));
    const edge=keep(new THREE.MeshPhysicalMaterial({color:palette.accent,metalness:0,roughness:.55,clearcoat:.2}));
    const silver=keep(new THREE.MeshPhysicalMaterial({color:0xbfc8c8,metalness:.92,roughness:.33,envMapIntensity:.85}));
    const graphite=keep(new THREE.MeshStandardMaterial({color:heroLayout?0x253936:0x152c28,metalness:.03,roughness:.6}));
    const mesh=(geometry,material,parent=scene)=>{const object=new THREE.Mesh(keep(geometry),material);parent.add(object);return object;};
    const textureFrom=element=>{const texture=keep(new THREE.CanvasTexture(element));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;};
    await document.fonts.ready;
    const photograph=await new Promise((resolve,reject)=>new THREE.TextureLoader().load(new URL('../assets/vigo-portrait-cutout.webp',import.meta.url).href,resolve,undefined,()=>reject(new Error('Portrait texture unavailable'))));keep(photograph);
    const font=(weight,size)=>`${weight} ${size}px InterVariable, Arial, sans-serif`;
    const frontCanvas=document.createElement('canvas');frontCanvas.width=1080;frontCanvas.height=1560;
    const front=frontCanvas.getContext('2d');front.fillStyle=palette.paper;front.fillRect(0,0,1080,1560);
    front.fillStyle=palette.ink;front.fillRect(0,0,1080,130);
    front.fillStyle=palette.paper;front.font=font(650,28);front.fillText('PORTFOLIO ID',72,88);
    front.textAlign='right';front.font=font(450,22);front.fillText('BRISBANE, AU',1008,88);front.textAlign='left';
    front.fillStyle=palette.ink;front.font=font(850,132);front.fillText('VIGO DANG.',65,290);
    front.font=font(550,29);front.fillStyle=palette.muted;front.fillText('A person to build with.',75,345);
    front.fillStyle=palette.photo;front.fillRect(72,394,936,666);
    front.save();front.beginPath();front.rect(72,394,936,666);front.clip();front.drawImage(photograph.image,0,185,1122,1120,72,394,936,934);front.restore();
    front.fillStyle=palette.ink;front.font=font(750,66);front.fillText('DATA / CLOUD',72,1180);front.font=font(650,53);front.fillText('ENGINEERING',72,1246);
    front.fillStyle=palette.ink;front.fillRect(72,1300,14,14);front.font=font(650,27);front.fillText('OPEN TO INTERNSHIP / GRADUATE ROLES',105,1319);
    front.font=font(450,27);front.fillStyle=palette.muted;front.fillText('Brisbane · Data & Cloud',72,1385);
    front.fillStyle=palette.ink;front.fillRect(72,1424,936,2);front.font=font(550,23);front.fillText('LISTEN. ASK. IMPROVE.',72,1480);
    front.textAlign='right';front.fillText('TURN TO EXPLORE',1008,1480);front.textAlign='left';
    const backCanvas=document.createElement('canvas');backCanvas.width=1080;backCanvas.height=1560;
    const back=backCanvas.getContext('2d');back.fillStyle=palette.back;back.fillRect(0,0,1080,1560);
    back.fillStyle=palette.accent;back.fillRect(72,180,72,8);back.fillStyle=palette.paper;back.font=font(800,108);back.fillText('MEET VIGO.',66,335);
    back.font=font(450,30);back.fillText('The work. The tools. The person.',72,402);
    const rowY=[.7,.15,-.4,-.95,-1.5],cardHeight=4.35,cardWidth=3;
    chapters.forEach((id,index)=>{
      const y=(.5-rowY[index]/cardHeight)*1560;back.strokeStyle=palette.line;back.lineWidth=1;back.beginPath();back.moveTo(72,y-72);back.lineTo(1008,y-72);back.stroke();
      back.font=font(500,24);back.fillStyle=palette.paper;back.fillText(String(index+1).padStart(2,'0'),78,y+11);back.font=font(650,52);back.fillText(labels[index],185,y+18);
      back.fillStyle=palette.accent;back.fillRect(967,y-4,16,16);
    });
    back.font=font(450,24);back.fillStyle=palette.paper;back.fillText('PERSONAL PORTFOLIO / ALL CHAPTERS OPEN',72,1475);
    const badge=new THREE.Group();badge.name='portfolio-badge';scene.add(badge);
    const shape=roundedShape(cardWidth,cardHeight,.14),slot=roundedShape(.64,.13,.06);
    slot.curves.forEach(curve=>{for(const property of ['v0','v1','v2','v3'])if(curve[property])curve[property].y+=1.965;});shape.holes.push(slot);
    const bodyGeometry=new THREE.ExtrudeGeometry(shape,{depth:.14,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.035,bevelThickness:.035,curveSegments:10});bodyGeometry.translate(0,0,-.07);
    const body=mesh(bodyGeometry,[cream,edge],badge);body.name='badge-body';body.userData.action='flip';
    const frontFace=mesh(faceUV(new THREE.ShapeGeometry(shape,10),cardWidth,cardHeight),keep(new THREE.MeshBasicMaterial({map:textureFrom(frontCanvas),toneMapped:false})),badge);frontFace.position.z=.108;frontFace.name='badge-front';frontFace.userData.action='flip';
    const backFace=mesh(faceUV(new THREE.ShapeGeometry(shape,10),cardWidth,cardHeight),keep(new THREE.MeshBasicMaterial({map:textureFrom(backCanvas),toneMapped:false})),badge);backFace.position.z=-.108;backFace.rotation.y=Math.PI;backFace.name='badge-back';backFace.userData.action='flip';
    // Slotted card, swivel and rounded rectangular wire clip; no orbit ornaments.
    const loopShape=roundedShape(.48,.65,.09);loopShape.holes.push(roundedShape(.30,.46,.06));
    const loop=mesh(new THREE.ExtrudeGeometry(loopShape,{depth:.065,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1,curveSegments:8}),silver,badge);loop.position.set(0,2.30,-.035);loop.name='lanyard-clip';
    mesh(new THREE.BoxGeometry(.42,.09,.12),graphite,badge).position.set(0,1.965,.04);
    mesh(new THREE.CylinderGeometry(.065,.065,.23,16),silver,badge).position.set(0,2.73,0);
    mesh(new THREE.BoxGeometry(.34,.22,.17),graphite,badge).position.set(0,2.88,0);
    const attachment=new THREE.Object3D();attachment.position.set(0,2.99,0);badge.add(attachment);
    const interactables=[body,frontFace,backFace],nodes=[];
    chapters.forEach((id,index)=>{
      const material=keep(new THREE.MeshBasicMaterial({color:palette.accent,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));
      const row=mesh(new THREE.PlaneGeometry(2.62,.44),material,badge);row.position.set(0,rowY[index],-.122);row.rotation.y=Math.PI;row.userData.chapter=id;row.name=`chapter-${id}`;
      interactables.push(row);nodes.push({id,row,material});
    });
    function ribbonTexture(primary){
      const textile=document.createElement('canvas');textile.width=2048;textile.height=128;
      const ctx=textile.getContext('2d');ctx.fillStyle=primary?(heroLayout?palette.ribbon:palette.ink):palette.ribbonOther;ctx.fillRect(0,0,2048,128);
      ctx.fillStyle=primary?palette.back:palette.ink;ctx.fillRect(0,6,2048,3);ctx.fillRect(0,119,2048,3);
      ctx.fillStyle=heroLayout?(primary?palette.ink:palette.paper):(primary?palette.paper:palette.ink);ctx.font=font(650,42);ctx.textBaseline='middle';
      for(let x=30;x<2048;x+=850)ctx.fillText('VIGO DANG / DATA + CLOUD',x,66);
      ctx.fillStyle='#fff';ctx.globalAlpha=.055;for(let y=0;y<128;y+=4)ctx.fillRect(0,y,2048,1);ctx.globalAlpha=1;
      const texture=textureFrom(textile);texture.wrapS=THREE.RepeatWrapping;return texture;
    }
    const ribbons=[true,false].map(primary=>{
      const segments=80,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array((segments+1)*6),3));geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array((segments+1)*4),2));
      const indices=[];for(let i=0;i<segments;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}geometry.setIndex(indices);
      const object=mesh(geometry,keep(new THREE.MeshStandardMaterial({map:ribbonTexture(primary),roughness:.87,metalness:0,side:THREE.DoubleSide})));object.frustumCulled=false;object.name=primary?'forest-lanyard':'orange-lanyard';return{object,geometry,primary,segments};
    });
    let width=1,height=1,frame=0,lastTime=0,time=0,disposed=false,contextLost=false;
    let yaw=0,targetYaw=0,pitch=.015,targetPitch=.015,selected=null,swing=0,swingVelocity=0;
    let paused=false,reduced=reducedMotion,visible=!document.hidden,interacting=false,lastRender=0;
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
    const cardCorners=[];for(const x of [-1.54,1.54])for(const y of [-2.215,2.215])for(const z of [-.11,.11])cardCorners.push(new THREE.Vector3(x,y,z));
    const worldAt=(u,v,z)=>{const direction=new THREE.Vector3(u*2-1,1-v*2,.5).unproject(camera).sub(camera.position).normalize();return camera.position.clone().addScaledVector(direction,(z-camera.position.z)/direction.z);};
    const schedule=()=>{if(!disposed&&!contextLost&&!frame&&visible)frame=requestAnimationFrame(draw);};
    function updateRibbons(){
      const end=attachment.getWorldPosition(new THREE.Vector3());
      ribbons.forEach(({geometry,primary,segments})=>{
        // Leave the heading and hiring copy clear without opaque HTML masks.
        // Each strap makes one shallow bend into the clip, without looping back.
        const points=heroLayout
          ?width<=800
            ?primary?[worldAt(-.04,-.025,-.65),worldAt(.15,.025,-.5),end.clone().add(new THREE.Vector3(-.7,.16,-.12)),end.clone().add(new THREE.Vector3(-.07,0,0))]
              :[worldAt(1.02,-.045,-.9),worldAt(.82,.025,-.65),end.clone().add(new THREE.Vector3(.8,.2,-.1)),end.clone().add(new THREE.Vector3(.07,0,-.035))]
            :primary?[worldAt(.49,-.055,-.65),worldAt(.58,.065,-.5),end.clone().add(new THREE.Vector3(-.7,.16,-.12)),end.clone().add(new THREE.Vector3(-.07,0,0))]
              :[worldAt(1.015,-.04,-.9),worldAt(.89,.035,-.65),end.clone().add(new THREE.Vector3(.8,.2,-.1)),end.clone().add(new THREE.Vector3(.07,0,-.035))]
          :width<=800
          ?primary?[worldAt(-.08,-.10,-.65),worldAt(.48,.012,-.5),worldAt(.86,.012,-.4),worldAt(.99,.14,-.35),worldAt(.97,.34,-.2),end.clone().add(new THREE.Vector3(-.07,0,0))]
            :[worldAt(1.07,-.20,-.9),worldAt(1.03,.01,-.8),worldAt(1,.24,-.5),worldAt(.89,.35,-.2),end.clone().add(new THREE.Vector3(.07,0,-.035))]
          :primary?[worldAt(-.08,-.12,-.65),worldAt(.22,.012,-.5),worldAt(.48,.028,-.35),end.clone().add(new THREE.Vector3(-.07,0,0))]
            :[worldAt(1.07,-.20,-.9),worldAt(.92,.025,-.8),worldAt(.79,.15,-.5),end.clone().add(new THREE.Vector3(.07,0,-.035))];
        const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),positions=geometry.attributes.position,uv=geometry.attributes.uv;
        let previous=curve.getPoint(0),length=0;
        for(let i=0;i<=segments;i++){
          const t=i/segments,point=curve.getPoint(t),tangent=curve.getTangent(t).normalize();length+=point.distanceTo(previous);previous=point.clone();
          const side=new THREE.Vector3(tangent.y,-tangent.x,0).normalize(),wave=reduced?0:Math.sin(Math.PI*t),phase=primary?0:1.7;
          point.x+=Math.sin(t*7+time*1.2+phase)*.025*wave;point.y+=Math.sin(t*9-time*.95+phase)*.018*wave;
          point.z+=Math.sin(t*8+time*.85+phase)*.045*wave;
          side.applyAxisAngle(tangent,(primary?.2:-.35)+Math.sin(t*Math.PI)*.12+Math.sin(yaw)*.18*t*t);
          for(let j=0;j<2;j++){const vertex=point.clone().addScaledVector(side,(j?1:-1)*.15);positions.setXYZ(i*2+j,vertex.x,vertex.y,vertex.z);uv.setXY(i*2+j,(primary?1:-1)*length/5.6,primary?1-j:j);}
        }
        positions.needsUpdate=true;uv.needsUpdate=true;geometry.computeVertexNormals();
      });
      canvas.dataset.attachment=JSON.stringify(end.toArray().map(v=>Number(v.toFixed(3))));
    }
    function draw(stamp){
      frame=0;if(disposed||contextLost||!visible)return;
      if(!reduced&&!paused&&!interacting&&stamp-lastRender<(width<=800?29:14)){schedule();return;}
      lastRender=stamp;const dt=Math.min(.04,lastTime?(stamp-lastTime)/1000:0);lastTime=stamp;
      const auto=!paused&&!reduced;if(auto)time+=dt;
      const easing=reduced?1:1-Math.exp(-dt*8);yaw+=(targetYaw-yaw)*easing;pitch+=(targetPitch-pitch)*easing;
      // A damped pendulum follows wind and keeps a short recoil after dragging.
      if(auto){const wind=(Math.sin(time*1.12)*.14+Math.sin(time*1.93)*.024)*(interacting?.35:1);swingVelocity+=((wind-swing)*20-swingVelocity*4.2)*dt;swing=clamp(swing+swingVelocity*dt,-.20,.20);}
      const activeSwing=reduced?0:swing;
      badge.rotation.set(pitch+.035+(!reduced?Math.sin(time*.9)*.018:0),yaw+(!reduced?Math.sin(time*.8)*.09+activeSwing*.18:0),-.035+activeSwing);
      badge.position.x=activeSwing*1.15;badge.position.y=!reduced?Math.sin(time*.8)*.025-Math.abs(activeSwing)*.05:0;badge.updateMatrixWorld(true);
      nodes.forEach(node=>{node.material.opacity=node.id===selected ? .20 : 0;});
      updateRibbons();renderer.render(scene,camera);
      const normal=new THREE.Vector3(0,0,-1).transformDirection(badge.matrixWorld),facing=normal.dot(camera.position.clone().sub(badge.position).normalize())>.38;
      const projected=nodes.map(node=>{
        const position=node.row.getWorldPosition(new THREE.Vector3()).project(camera),x=(position.x*.5+.5)*width,y=(-position.y*.5+.5)*height;
        const inside=x>0&&x<width&&y>0&&y<height&&position.z>-1&&position.z<1;
        const corners=[[-1.31,-.22],[1.31,-.22],[-1.31,.22],[1.31,.22]].map(([cx,cy])=>node.row.localToWorld(new THREE.Vector3(cx,cy,0)).project(camera));
        const xs=corners.map(p=>(p.x*.5+.5)*width),ys=corners.map(p=>(-p.y*.5+.5)*height);
        return{id:node.id,x,y,width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys),visible:facing&&inside&&width>800,raycastVisible:facing&&inside};
      });
      onFrame?.({yaw,pitch,projected,selected});canvas.dataset.yaw=yaw.toFixed(3);canvas.dataset.pitch=pitch.toFixed(3);canvas.dataset.selected=selected||'';
      canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);canvas.dataset.face=facing?'back':'front';canvas.dataset.anchors=JSON.stringify(projected);
      const corners=cardCorners.map(point=>point.clone().applyMatrix4(badge.matrixWorld).project(camera));
      const xs=corners.map(point=>(point.x*.5+.5)*width),ys=corners.map(point=>(-.5*point.y+.5)*height);
      canvas.dataset.cardBounds=JSON.stringify({left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)});
      canvas.dataset.roll=badge.rotation.z.toFixed(4);canvas.dataset.sway=badge.position.x.toFixed(4);
      const moving=Math.abs(targetYaw-yaw)>.0003||Math.abs(targetPitch-pitch)>.0003;if(auto||moving||interacting)schedule();
    }
    const resize=()=>{
      const bounds=stage.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);const compact=width<=800,worldHeight=heroLayout?(compact?Math.max(6.5,4.65*height/width):(width<=1100?6.5:6.6)):(compact?12.4:8.3);
      const xOffset=heroLayout?(compact?0:-width*.22):(compact?0:-width*.12);
      const yOffset=heroLayout?-height*(compact?.035:.045):-height*(compact?.10:.02);
      camera.aspect=width/height;camera.fov=2*Math.atan(worldHeight/24)*180/Math.PI;camera.setViewOffset(width,height,xOffset,yOffset,width,height);camera.updateProjectionMatrix();renderer.setSize(width,height,false);schedule();
    };
    const observer=new ResizeObserver(resize);observer.observe(stage);let drag=null;const pointers=new Set();
    const down=event=>{
      if(event.button!==0)return;pointers.add(event.pointerId);
      if(pointers.size>1){const previous=drag;drag=null;interacting=false;stage.classList.remove('is-dragging');if(previous&&stage.hasPointerCapture?.(previous.id))stage.releasePointerCapture(previous.id);return;}
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,type:event.pointerType,started:false,rejected:false};
    };
    const move=event=>{
      if(!drag||drag.id!==event.pointerId||drag.rejected)return;const totalX=event.clientX-drag.x,totalY=event.clientY-drag.y;
      if(!drag.started){if(Math.hypot(totalX,totalY)<7)return;if(drag.type==='touch'&&Math.abs(totalY)>Math.abs(totalX)*1.15){drag.rejected=true;return;}drag.started=true;interacting=true;stage.classList.add('is-dragging');stage.setPointerCapture(event.pointerId);stage.focus({preventScroll:true});}
      const dx=event.clientX-drag.lastX;targetYaw+=dx*.007;if(drag.type!=='touch')targetPitch=clamp(targetPitch+(event.clientY-drag.lastY)*.0018,-.22,.25);
      if(!paused&&!reduced){swing=clamp(swing+dx*.00065,-.18,.18);swingVelocity=clamp(swingVelocity+dx*.018,-1.2,1.2);}
      drag.lastX=event.clientX;drag.lastY=event.clientY;event.preventDefault();schedule();
    };
    const finish=event=>{
      if(event.type==='lostpointercapture'&&event.target!==stage)return;pointers.delete(event.pointerId);if(!drag||drag.id!==event.pointerId)return;
      const click=!drag.started&&!drag.rejected;drag=null;interacting=false;stage.classList.remove('is-dragging');if(stage.hasPointerCapture?.(event.pointerId))stage.releasePointerCapture(event.pointerId);
      if(click&&event.type==='pointerup'){
        const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);
        const hit=raycaster.intersectObjects(interactables,false)[0];if(hit?.object.userData.chapter)onSelect?.(hit.object.userData.chapter);else if(hit?.object.userData.action==='flip'){targetYaw+=Math.PI;if(!paused&&!reduced)swingVelocity=clamp(swingVelocity+.5,-1.2,1.2);schedule();}
      }schedule();
    };
    const keydown=event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();
      if(event.key==='Home'){yaw=((yaw+Math.PI)%TAU+TAU)%TAU-Math.PI;targetYaw=0;targetPitch=.015;selected=null;}
      if(event.key==='ArrowLeft')targetYaw-=Math.PI/10;if(event.key==='ArrowRight')targetYaw+=Math.PI/10;
      if(event.key==='ArrowUp')targetPitch=clamp(targetPitch+.08,-.22,.25);if(event.key==='ArrowDown')targetPitch=clamp(targetPitch-.08,-.22,.25);schedule();
    };
    stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move,{passive:false});stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);stage.addEventListener('lostpointercapture',finish);stage.addEventListener('keydown',keydown);
    const visibility=()=>{visible=!document.hidden;lastTime=0;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();};document.addEventListener('visibilitychange',visibility);
    const lost=event=>{event.preventDefault();contextLost=true;if(frame)cancelAnimationFrame(frame);frame=0;stage.dispatchEvent(new CustomEvent('scene-unavailable',{bubbles:true}));};canvas.addEventListener('webglcontextlost',lost);
    resize();canvas.dataset.ready='true';canvas.dataset.scene='badge';
    return{
      focus(id){if(!chapters.includes(id))return;selected=id;targetYaw=nearest(Math.PI,targetYaw);targetPitch=.015;schedule();},
      reset(){yaw=((yaw+Math.PI)%TAU+TAU)%TAU-Math.PI;targetYaw=0;targetPitch=.015;selected=null;time=0;swing=0;swingVelocity=0;schedule();},
      turn(){targetYaw+=Math.PI/4;if(!paused&&!reduced)swingVelocity=clamp(swingVelocity+.35,-1.2,1.2);schedule();},setPaused(value){paused=value;if(value)swingVelocity=0;lastTime=0;schedule();},setReducedMotion(value){reduced=value;lastTime=0;if(value){yaw=targetYaw;pitch=targetPitch;swing=0;swingVelocity=0;}schedule();},
      dispose(){disposed=true;if(frame)cancelAnimationFrame(frame);observer.disconnect();stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',finish);stage.removeEventListener('pointercancel',finish);stage.removeEventListener('lostpointercapture',finish);stage.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);resources.forEach(resource=>resource.dispose?.());renderer.dispose();}
    };
  }catch(error){resources.forEach(resource=>resource.dispose?.());renderer?.dispose();throw error;}
}
