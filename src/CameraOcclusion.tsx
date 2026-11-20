import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Material,Mesh,Object3D,Vector3} from 'three';
import {useGame} from './store';
import {cameraBlockers,type CameraSubject} from './cameraSightlines';
type Entry={mesh:Mesh;original:Material|Material[];materials:Material[];copy:Material[]|null;shadow:boolean;amount:number;actor?:Object3D};
export default function CameraOcclusion(){const {scene,gl}=useThree(),realm=useGame(s=>s.realm),entries=useRef<Entry[]>([]),subjects=useRef<CameraSubject[]>([]),blockers=useRef(new Set<Mesh>()),elapsed=useRef(1);
 useEffect(()=>{const found:Entry[]=[],actors:CameraSubject[]=[];
  function visit(object:Object3D,scoped=false,actor?:Object3D){if(object.userData.cameraSubject){actors.push({object,height:Number(object.userData.cameraSubjectHeight)||2.5});if(!object.userData.cameraHeroOccluder)return;actor=object;scoped=true}const eligible=scoped||object.userData.cameraOccluder===true;
   if(eligible&&object instanceof Mesh&&!('isInstancedMesh' in object)){const material=object.material as Material|Material[],materials=Array.isArray(material)?material:[material];if(materials.every(m=>m.opacity>=.75))found.push({mesh:object,original:material,materials,copy:null,shadow:object.castShadow,amount:1,actor})}
   for(const child of object.children)visit(child,eligible,actor);
  }visit(scene);entries.current=found;subjects.current=actors;elapsed.current=1;
  return()=>{for(const entry of found){entry.mesh.material=entry.original;entry.mesh.castShadow=entry.shadow;entry.copy?.forEach(m=>m.dispose())}entries.current=[];subjects.current=[];blockers.current.clear()};
 },[scene,realm]);
 useFrame(({camera},dt)=>{elapsed.current+=dt;if(elapsed.current>=.08){elapsed.current=0;scene.updateMatrixWorld(true);camera.updateMatrixWorld();const player=subjects.current.find(s=>s.object.name==='player-avatar'),p=player?.object.getWorldPosition(new Vector3()),near=subjects.current.filter(s=>s===player||p&&s.object.getWorldPosition(new Vector3()).distanceTo(p)<17),marker=scene.getObjectByName('active-mechanism-marker');if(marker)near.push({object:marker,height:1.4,offsetY:-.7});blockers.current=cameraBlockers(camera,entries.current.filter(e=>!e.actor).map(e=>e.mesh),near);
   // Actors must never test against themselves: only fade the boss when it hides the hero.
   const actorEntries=entries.current.filter(e=>e.actor),actorHits=cameraBlockers(camera,actorEntries.map(e=>e.mesh),player?[player]:[]),hiddenActors=new Set(actorEntries.filter(e=>actorHits.has(e.mesh)).map(e=>e.actor));for(const entry of actorEntries)if(hiddenActors.has(entry.actor))blockers.current.add(entry.mesh);
  }
  let faded=0,bossFaded=0;const detail:string[]=[];for(const entry of entries.current){const hidden=blockers.current.has(entry.mesh),target=hidden?(entry.actor ? .12 : .08):1;entry.amount+=(target-entry.amount)*(1-Math.exp(-Math.min(dt,.1)*25));
   if(!hidden&&entry.amount>.995){entry.amount=1;entry.mesh.material=entry.original;entry.mesh.castShadow=entry.shadow;continue}
   if(!entry.copy){entry.copy=entry.materials.map(m=>{const copy=m.clone();copy.transparent=true;copy.depthWrite=false;copy.needsUpdate=true;return copy})}entry.mesh.material=Array.isArray(entry.original)?entry.copy:entry.copy[0];entry.mesh.castShadow=false;entry.copy.forEach((m,i)=>{m.opacity=entry.materials[i].opacity*entry.amount});faded++;if(entry.actor)bossFaded++;if(hidden)detail.push(entry.mesh.name||entry.mesh.geometry.type);
  }gl.domElement.dataset.cameraFadedCount=String(faded);gl.domElement.dataset.bossFadedMeshes=String(bossFaded);gl.domElement.dataset.cameraOccluders=JSON.stringify(detail);gl.domElement.dataset.cameraSubjectCount=String(subjects.current.length);gl.domElement.dataset.cameraFadeMinOpacity=String(Math.min(1,...entries.current.flatMap(e=>e.mesh.material===e.original?[]:e.copy?.map(m=>m.opacity)??[])));
 });return null;
}
