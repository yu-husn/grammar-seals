import {memo,useRef,type MutableRefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Humanoid,type CharacterVariant} from './Characters';
import {Rune} from './Atmosphere';
import {openingFrame,openingChasePositions,openingGrammarPosition} from './openingStory';

type Props={shot:number;clock:MutableRefObject<number>;hero:CharacterVariant;reduced:boolean;playing:boolean};
const guardianVariants:CharacterVariant[]=['shadow','mirror','judge','vault'];
const housePositions=[[-8,-1],[8,-2],[-8,-9],[8,-10],[-8,-17],[8,-18]];
function OpeningScene({shot,clock,hero,reduced,playing}:Props){
 const land=useRef<THREE.Mesh>(null!),river=useRef<THREE.Mesh>(null!),boss=useRef<THREE.Group>(null!),heroRef=useRef<THREE.Group>(null!),army=useRef<(THREE.Group|null)[]>([]),leaves=useRef<(THREE.Group|null)[]>([]),flowers=useRef<(THREE.Mesh|null)[]>([]),seals=useRef<(THREE.Group|null)[]>([]),aegis=useRef<THREE.Group>(null!),purge=useRef<THREE.Mesh>(null!),bindings=useRef<(THREE.Mesh|null)[]>([]),heroMotion=useRef(0),guardMotion=useRef(0),previousShot=useRef(-1),previousAspect=useRef(0);
 const cameraTarget=useRef(new THREE.Vector3()),look=useRef(new THREE.Vector3());
 useFrame(({camera,gl,scene},dt)=>{
  const {progress:raw}=openingFrame(clock.current),p=reduced?.65:raw,t=clock.current,dark=shot>=1&&shot<=4,growth=shot===0?1:shot===5?(reduced?1:THREE.MathUtils.smoothstep(p,0,.85)):.025;
  const floor=land.current.material as THREE.MeshStandardMaterial;floor.color.set('#34464c').lerp(new THREE.Color('#547e66'),growth);(river.current.material as THREE.MeshStandardMaterial).color.set('#352d44').lerp(new THREE.Color('#66b6bc'),growth);
  leaves.current.forEach((g,i)=>g?.scale.setScalar(Math.max(.015,growth*(.9+Math.sin(i)*.1))));flowers.current.forEach((f,i)=>{if(f){f.visible=growth>.15;f.scale.setScalar(growth*(.85+Math.sin(t+i)*.08))}});
  heroRef.current.visible=shot>=2;boss.current.visible=shot===1;army.current.forEach(g=>{if(g)g.visible=shot===1||shot===2||shot===4});
  if(shot===1){boss.current.position.set(0,0,-2+Math.sin(p*Math.PI)*.35);army.current.forEach((g,i)=>{if(g){g.position.set([-5.3,-1.9,1.9,5.3][i],0,[.5,1.6,1.6,.5][i]+p*.65);g.rotation.y=0}})}
  const pursuit=openingChasePositions(p);
  if(shot===2){heroRef.current.position.set(pursuit.hero.x,0,pursuit.hero.z);heroRef.current.lookAt(pursuit.hero.x,0,pursuit.hero.z+8);army.current.forEach((g,i)=>{if(g){const at=pursuit.guards[i];g.position.set(at.x,at.y,at.z);g.lookAt(heroRef.current.position)}})}
  else if(shot>=3){const entry=openingGrammarPosition(p);heroRef.current.position.set(shot===3?entry.x:0,0,shot===3?entry.z:shot===5?3:1.5);heroRef.current.lookAt(shot===3?new THREE.Vector3(1.4,0,entry.walking?1:-.4):shot===5?new THREE.Vector3(0,0,-12):new THREE.Vector3(0,0,12));army.current.forEach((g,i)=>{if(g){g.position.set([-3.9,-1.3,1.3,3.9][i],0,i===1||i===2?-3:-1.4);g.lookAt(heroRef.current.position)}})}
  if(shot===3)heroMotion.current=playing&&!reduced&&openingGrammarPosition(p).walking?1:0;
  else if(playing&&!reduced)heroMotion.current+=dt*(shot===2?8:shot===5?1.1:.5);
  if(playing&&!reduced)guardMotion.current+=dt*(shot===2?7:shot===4?1:shot===1?2:.3);
  aegis.current.visible=shot===4;aegis.current.position.copy(heroRef.current.position);aegis.current.rotation.y=reduced?0:t*.6;
  purge.current.visible=shot===4&&p>.35;purge.current.position.set(0,.12,1.5);purge.current.scale.setScalar(1+(reduced?.7:(p*.9)%1)*5);(purge.current.material as THREE.MeshBasicMaterial).opacity=.75*(1-(p*.9)%1);
  bindings.current.forEach((ring,i)=>{if(ring){ring.visible=shot===4;ring.position.copy(army.current[i]!.position).y=1.1;ring.rotation.z=reduced?0:t*.5}});
  seals.current.forEach((s,i)=>{if(s){s.visible=shot===3||shot===5;const angle=i*Math.PI/2+(shot===3?Math.PI/4:0);s.position.set(1.4+Math.cos(angle)*2,2.1+(reduced?0:Math.sin(t*1.3+i)*.13),-.4+Math.sin(angle)*2);s.rotation.y=reduced?0:Math.sin(t*.9+i)*.12}});
  const aspect=(camera as THREE.PerspectiveCamera).aspect,portrait=aspect<1.05,scale=portrait?Math.max(1.05,1/aspect):1;
  const positions=shot===0||shot===5?[12,10,19]:shot===1?[4.5,5.8,16]:shot===2?[5,4.6,12]:[5,4.6,11];
  const travel=shot===2?pursuit.cameraTravel:0;
  cameraTarget.current.set(positions[0]*(portrait?.35:1),positions[1]*(portrait?1.12:1),positions[2]*(portrait?Math.max(scale,1.65):1)+(reduced?0:Math.sin(p*Math.PI)*1.2)+travel);look.current.set(0,shot===0||shot===5?1.2:2,shot===0||shot===5?-4:travel);
  if(previousShot.current!==shot||reduced||!playing||Math.abs(previousAspect.current-aspect)>.01)camera.position.copy(cameraTarget.current);else camera.position.lerp(cameraTarget.current,1-Math.exp(-dt*2));camera.lookAt(look.current);previousShot.current=shot;previousAspect.current=aspect;
  scene.background=new THREE.Color(dark?'#172536':shot===5?'#79a997':'#759a9f');if(scene.fog instanceof THREE.Fog)scene.fog.color.copy(scene.background);
  gl.domElement.dataset.openingShot=String(shot);gl.domElement.dataset.openingClock=t.toFixed(2);gl.domElement.dataset.greenery=growth.toFixed(2);gl.domElement.dataset.openingActors=shot===1?'boss,shadow,mirror,judge,vault':shot===2?`${hero},shadow,mirror,judge,vault`:shot>=2?hero:'';
  gl.domElement.dataset.openingHeroPosition=JSON.stringify(heroRef.current.position.toArray());
  gl.domElement.dataset.openingChasers=JSON.stringify(army.current.map((g,i)=>({variant:guardianVariants[i],visible:g?.visible??false,position:g?.position.toArray()})));
 });
 return <>
 <fog attach="fog" args={['#172536',30,85]}/><ambientLight intensity={.85}/><hemisphereLight args={[shot===0||shot===5?'#d8f1df':'#b2c5df','#403344',1.5]}/><directionalLight position={[8,16,12]} intensity={3} color={shot===0||shot===5?'#fff0c2':'#c7ddff'}/><pointLight position={[0,5,0]} intensity={shot===1?35:12} color={shot===1?'#e17293':'#84eee2'} distance={24}/>
 <mesh ref={land} position={[0,-.3,-6]} receiveShadow><boxGeometry args={[60,.6,70]}/><meshStandardMaterial color="#547e66"/></mesh><mesh position={[0,.02,-6]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5,50]}/><meshStandardMaterial color={shot===0||shot===5?'#b5ae8c':'#65717a'}/></mesh>
 <mesh ref={river} position={[-14,.04,-6]} rotation={[-Math.PI/2,0,.1]}><planeGeometry args={[4,60]}/><meshStandardMaterial color="#66b6bc" roughness={.3} metalness={.25}/></mesh>
 {housePositions.map(([x,z],i)=><group key={i} position={[x,0,z]}><mesh position={[0,1.4,0]}><boxGeometry args={[4,2.8,4]}/><meshStandardMaterial color={i%2?'#606c69':'#6e6e64'}/></mesh><mesh position={[0,3.2,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[3.55,1.2,4]}/><meshStandardMaterial color="#263d49"/></mesh><mesh position={[0,1,2.02]}><boxGeometry args={[1.2,2,.1]}/><meshStandardMaterial color="#342c32"/></mesh><mesh position={[1.5,2.1,2.1]} scale={[1,1.4,1]}><sphereGeometry args={[.25,10,8]}/><meshStandardMaterial color="#b8643c" emissive="#c56535" emissiveIntensity={.6}/></mesh></group>)}
 <group position={[0,0,-23]}>{[-3,3].map(x=><mesh key={x} position={[x,2.5,0]}><boxGeometry args={[.5,5,.5]}/><meshStandardMaterial color="#59443d"/></mesh>)}<mesh position={[0,5,0]}><boxGeometry args={[8,.7,1]}/><meshStandardMaterial color="#49424a"/></mesh><mesh position={[0,5.8,0]} rotation={[0,Math.PI/4,0]} scale={[1.5,1,.6]}><coneGeometry args={[4.1,1.4,4]}/><meshStandardMaterial color="#253b47"/></mesh><Rune glyph="語" position={[0,3.8,.6]} size={1.1}/></group>
 {Array.from({length:22},(_,i)=>{const x=(i%2?-1:1)*(11+(i%3)*4),z=12-Math.floor(i/2)*4;return <group key={i} position={[x,0,z]}><mesh position={[0,1.3,0]}><cylinderGeometry args={[.12,.23,2.6,6]}/><meshStandardMaterial color="#50483d"/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*.35,2,0]} rotation={[0,0,side*-.75]}><cylinderGeometry args={[.05,.075,.95,5]}/><meshStandardMaterial color="#50483d"/></mesh>)}<group ref={g=>{leaves.current[i]=g}}><mesh position={[0,2.6,0]}><coneGeometry args={[1.25,2.9,7]}/><meshStandardMaterial color={i%2?'#51895b':'#6b9e69'}/></mesh><mesh position={[0,3.8,0]}><coneGeometry args={[.8,2,7]}/><meshStandardMaterial color="#7dad79"/></mesh></group></group>})}
 {Array.from({length:24},(_,i)=><mesh key={i} ref={r=>{flowers.current[i]=r}} position={[(i%2?-1:1)*(3.4+i%4),.18,10-Math.floor(i/2)*2.3]}><icosahedronGeometry args={[.16,0]}/><meshStandardMaterial color={i%3?'#e9c982':'#e8b3ca'} emissive="#a89b5f" emissiveIntensity={.25}/></mesh>)}
 <mesh visible={shot===1} position={[0,.08,-1]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[4.1,4.2,48]}/><meshBasicMaterial color="#b76b85"/></mesh><group ref={boss} scale={1.08}><Humanoid variant="boss"/></group>{guardianVariants.map((variant,i)=><group ref={g=>{army.current[i]=g}} key={variant} scale={.86}><Humanoid variant={variant} motion={guardMotion}/></group>)}<group ref={heroRef}><Humanoid variant={hero} motion={heroMotion}/></group>
 <group visible={shot===3} position={[1.4,0,-.4]}><mesh position={[0,.8,0]}><boxGeometry args={[1,1.6,.6]}/><meshStandardMaterial color="#596d74"/></mesh><Rune glyph="辨" position={[0,1,.34]} size={.65}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.09,0]}><ringGeometry args={[2.5,2.6,40]}/><meshBasicMaterial color="#a7ead2"/></mesh></group>
 {['敘','表','判','有'].map((glyph,i)=><group key={glyph} ref={g=>{seals.current[i]=g}}><mesh><boxGeometry args={[.8,.8,.15]}/><meshStandardMaterial color="#764343" emissive="#8b4434" emissiveIntensity={.4}/></mesh><Rune glyph={glyph} position={[0,0,.1]} size={.65} color="#ffe2a0"/></group>)}
 <group ref={aegis}><mesh position={[0,1.3,0]}><capsuleGeometry args={[.78,1.7,6,20]}/><meshBasicMaterial color="#ffe49d" transparent opacity={.16} depthWrite={false}/></mesh>{[.4,1.4,2.4].map(y=><mesh key={y} position={[0,y,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.84,.025,6,32]}/><meshBasicMaterial color="#ffe5a0"/></mesh>)}</group>
 <mesh ref={purge} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.9,1,40]}/><meshBasicMaterial color="#9ef3e8" transparent opacity={.6} depthWrite={false}/></mesh>{[0,1,2,3].map(i=><mesh key={i} ref={r=>{bindings.current[i]=r}} rotation={[Math.PI/2,.2,0]}><torusGeometry args={[.9,.05,6,32]}/><meshBasicMaterial color="#d1b1f1"/></mesh>)}
 </>;
}
export default memo(OpeningScene);
