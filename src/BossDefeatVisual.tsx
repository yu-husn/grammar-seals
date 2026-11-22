import {useEffect,useLayoutEffect,useMemo,useRef,type ReactNode} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useGame} from './store';
import {bossDefeatPose} from './bossDefeat';

type Surface={material:THREE.Material;opacity:number;transparent:boolean;depthWrite:boolean};
export default function BossDefeatVisual({defeated,onComplete,children}:{defeated:boolean;onComplete?:()=>void;children:ReactNode}){
 const root=useRef<THREE.Group>(null!),body=useRef<THREE.Group>(null!),motes=useRef<THREE.Points>(null!),surfaces=useRef<Surface[]>([]);
 const started=useRef(defeated),elapsed=useRef(0),done=useRef(defeated),alpha=useRef(1),complete=useRef(onComplete),reduced=useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
 complete.current=onComplete;const {gl}=useThree();
 const positions=useMemo(()=>new Float32Array(24*3),[]);
 function opacity(value:number){if(value===alpha.current)return;alpha.current=value;for(const s of surfaces.current){s.material.opacity=s.opacity*value;const transparent=value<1||s.transparent,depthWrite=value<1?false:s.depthWrite;if(s.material.transparent!==transparent||s.material.depthWrite!==depthWrite){s.material.transparent=transparent;s.material.depthWrite=depthWrite;s.material.needsUpdate=true}}}
 useLayoutEffect(()=>{const materials=new Set<THREE.Material>();body.current.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)});surfaces.current=[...materials].map(material=>({material,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite}));return()=>{for(const s of surfaces.current){s.material.opacity=s.opacity;s.material.transparent=s.transparent;s.material.depthWrite=s.depthWrite;s.material.needsUpdate=true}}},[]);
 useEffect(()=>{if(!defeated){started.current=false;done.current=false;elapsed.current=0;root.current.visible=true;body.current.rotation.set(0,0,0);body.current.position.y=0;opacity(1)}else if(!started.current){started.current=true;done.current=false;elapsed.current=0}else if(done.current){root.current.visible=false;complete.current?.()}},[defeated]);
 useFrame((_,delta)=>{const g=useGame.getState();if(!defeated){gl.domElement.dataset.bossDefeatStage='alive';gl.domElement.dataset.bossFallAngle='0';gl.domElement.dataset.bossOpacity='1';gl.domElement.dataset.bossBodyVisible=String(root.current.visible);motes.current.visible=false;return;}
  if(!done.current&&['play','win','notPassed'].includes(g.phase)&&!g.question&&!document.hidden)elapsed.current+=Math.min(delta,.25);
  const pose=done.current?{...bossDefeatPose(99,reduced.current)}:bossDefeatPose(elapsed.current,reduced.current);
  body.current.rotation.set(pose.angle,0,pose.lean);body.current.position.y=pose.lift;if(!done.current||elapsed.current>0)opacity(pose.opacity);root.current.visible=!pose.gone;motes.current.visible=pose.particles;
  if(pose.particles){const attribute=motes.current.geometry.getAttribute('position') as THREE.BufferAttribute;for(let i=0;i<24;i++){const angle=i*2.39996+pose.progress*.6,radius=.3+(i%5)*.12+pose.progress*.8;attribute.setXYZ(i,Math.cos(angle)*radius,.45+(i%7)*.1+pose.progress*1.7,1.3+Math.sin(angle)*radius)}attribute.needsUpdate=true;(motes.current.material as THREE.PointsMaterial).opacity=.8*(1-pose.progress)}
  gl.domElement.dataset.bossDefeatStage=pose.stage;gl.domElement.dataset.bossDefeatElapsed=elapsed.current.toFixed(3);gl.domElement.dataset.bossFallAngle=pose.angle.toFixed(3);gl.domElement.dataset.bossOpacity=pose.opacity.toFixed(3);gl.domElement.dataset.bossBodyVisible=String(root.current.visible);
  if(pose.gone&&!done.current){done.current=true;complete.current?.()}
 });
 return <group ref={root} name="boss-defeat-visual"><group ref={body}>{children}</group><points ref={motes} visible={false} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} usage={THREE.DynamicDrawUsage}/></bufferGeometry><pointsMaterial size={.14} color="#f1c8ff" transparent opacity={.8} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></points></group>;
}
