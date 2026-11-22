import {useEffect,useMemo,type MutableRefObject} from 'react';
import {Edges} from '@react-three/drei';
import * as THREE from 'three';

type GroupRef=MutableRefObject<THREE.Group|null>;
const bronze='#80633f',dark='#3b4037',gold='#b89b50',outline='#ddba59';
function Rim(){return <Edges threshold={30} color={outline}/>}
function Tube({x,length,radius,color=bronze,open=false}:{x:number;length:number;radius:number;color?:string;open?:boolean}){return <mesh position={[x,0,0]} rotation={[0,0,-Math.PI/2]}><cylinderGeometry args={[radius,radius,length,16,1,open]}/><meshStandardMaterial color={color} metalness={.72} roughness={.48}/><Rim/></mesh>}

export default function BronzeCannon({rootRef,turretRef,barrelRef,muzzleRef,flashRef,scale,low}:{rootRef:GroupRef;turretRef:GroupRef;barrelRef:GroupRef;muzzleRef:GroupRef;flashRef:GroupRef;scale:number;low:boolean}){
 const tower=useMemo(()=>{const shape=new THREE.Shape();shape.moveTo(-25,-43);shape.lineTo(-20,32);shape.lineTo(-7,43);shape.lineTo(12,35);shape.lineTo(22,-43);shape.closePath();const aperture=new THREE.Path();aperture.moveTo(-7,-9);aperture.lineTo(7,-9);aperture.lineTo(7,13);aperture.quadraticCurveTo(0,24,-7,13);aperture.closePath();shape.holes.push(aperture);return new THREE.ExtrudeGeometry(shape,{depth:34,bevelEnabled:true,bevelSize:2,bevelThickness:2,bevelSegments:low?1:2,steps:1})},[low]);useEffect(()=>()=>tower.dispose(),[tower]);
 return <group ref={rootRef} name="bronze-cannon" rotation={[.28,-.28,0]} scale={scale} userData={{cannonModel:'bronze-single-barrel',barrelCount:1}}>
  <mesh position={[0,-64,-5]} scale={[1,.3,1]}><circleGeometry args={[57,24]}/><meshBasicMaterial color="#090e10" transparent opacity={.35} depthWrite={false}/></mesh>
  <mesh position={[0,-57,0]}><cylinderGeometry args={[46,52,13,8]}/><meshStandardMaterial color={dark} metalness={.65} roughness={.65}/><Rim/></mesh>
  <mesh position={[0,-47,0]}><cylinderGeometry args={[40,46,8,8]}/><meshStandardMaterial color={bronze} metalness={.72} roughness={.54}/><Rim/></mesh>
  <mesh position={[0,-42,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[37,1.5,5,32]}/><meshStandardMaterial color={gold} metalness={.8} roughness={.4}/></mesh>
  <mesh geometry={tower} position={[0,0,-17]}><meshStandardMaterial color={bronze} metalness={.65} roughness={.58}/><Rim/></mesh>
  <mesh position={[0,-27,19]}><boxGeometry args={[22,15,3]}/><meshStandardMaterial color={dark} metalness={.65} roughness={.7}/><Rim/></mesh>
  {[-1,1].map(side=><group key={side}>{[-34,-18].map(y=><mesh key={y} position={[side*12,y,23]}><sphereGeometry args={[2,6,5]}/><meshStandardMaterial color={gold} metalness={.85} roughness={.4}/></mesh>)}<mesh position={[side*23,-34,0]} rotation={[0,0,-side*.22]}><boxGeometry args={[7,20,38]}/><meshStandardMaterial color={dark} metalness={.65} roughness={.6}/><Rim/></mesh></group>)}
  <group ref={turretRef} position={[0,40,0]} rotation={[0,0,.18]} name="cannon-trunnion">
   <group ref={barrelRef} name="single-cannon-barrel"><Tube x={-13} length={24} radius={17} color={dark}/><Tube x={39} length={84} radius={10.5}/>{[7,39,69].map(x=><Tube key={x} x={x} length={5} radius={12.5} color={gold}/>)}<Tube x={87} length={18} radius={14} color={dark} open/>
    <mesh position={[97,0,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[12.5,1.7,6,20]}/><meshStandardMaterial color={gold} metalness={.8} roughness={.4}/></mesh><mesh position={[95.5,0,0]} rotation={[0,Math.PI/2,0]}><circleGeometry args={[10.8,18]}/><meshBasicMaterial color="#080c0b"/></mesh>
    <mesh position={[38,10.2,0]}><boxGeometry args={[62,1.3,3]}/><meshStandardMaterial color={gold} metalness={.8} roughness={.35}/></mesh>
    <group ref={muzzleRef} position={[101,0,0]} name="single-cannon-muzzle"><group ref={flashRef} visible={false} name="cannon-muzzle-flash"><mesh position={[15,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[14,34,7]}/><meshBasicMaterial color="#ffc46b" transparent opacity={.75} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh><mesh position={[10,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[7,26,6]}/><meshBasicMaterial color="#fff5c7" transparent opacity={.9} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh></group></group>
   </group>
   {[-1,1].map(side=><group key={side} position={[0,0,side*21]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[18,18,7,12]}/><meshStandardMaterial color={bronze} metalness={.75} roughness={.45}/><Rim/></mesh><mesh position={[0,0,side*4]}><torusGeometry args={[14,1.5,6,20]}/><meshStandardMaterial color={gold} metalness={.85} roughness={.38}/></mesh><mesh position={[0,0,side*5]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[5,5,3,6]}/><meshStandardMaterial color={dark} metalness={.75} roughness={.4}/></mesh></group>)}
  </group>
 </group>;
}
