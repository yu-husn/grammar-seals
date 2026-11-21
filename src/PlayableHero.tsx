import {memo,useEffect,useMemo,useRef,type MutableRefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useGame} from './store';
import {heroes} from './heroes';
type V3=[number,number,number];
const hair='#202b39',gold='#b6a186',ivory='#c7d5dd';
function Orb({at=[0,0,0],scale=[1,1,1],radius=1,color,metal=0}:{at?:V3;scale?:V3;radius?:number;color:string;metal?:number}){return <mesh position={at} scale={scale} castShadow><sphereGeometry args={[radius,20,14]}/><meshStandardMaterial color={color} roughness={metal?.36:.68} metalness={metal}/></mesh>}
function Box({at,scale,color,rotation=[0,0,0],metal=0}:{at:V3;scale:V3;color:string;rotation?:V3;metal?:number}){return <mesh position={at} scale={scale} rotation={rotation} castShadow><boxGeometry/><meshStandardMaterial color={color} roughness={metal?.4:.75} metalness={metal}/></mesh>}
function Rod({at=[0,0,0],top,bottom,height,color,rotation=[0,0,0],scale=[1,1,1],metal=0}:{at?:V3;top:number;bottom:number;height:number;color:string;rotation?:V3;scale?:V3;metal?:number}){return <mesh position={at} rotation={rotation} scale={scale} castShadow><cylinderGeometry args={[top,bottom,height,20]}/><meshStandardMaterial color={color} roughness={metal?.4:.75} metalness={metal}/></mesh>}
function Stroke({points,color,radius=.008,metal=0}:{points:V3[];color:string;radius?:number;metal?:number}){const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);return <mesh><tubeGeometry args={[curve,Math.max(8,points.length*4),radius,5,false]}/><meshStandardMaterial color={color} metalness={metal} roughness={.55}/></mesh>}
function Turned({profile,color,at=[0,0,0],scale=[1,1,1],map}:{profile:[number,number][];color:string;at?:V3;scale?:V3;map?:THREE.Texture}){const points=useMemo(()=>new THREE.SplineCurve(profile.map(p=>new THREE.Vector2(...p))).getPoints(36).map(p=>new THREE.Vector2(Math.max(0,p.x),p.y)),[profile]);return <mesh position={at} scale={scale} castShadow><latheGeometry args={[points,36]}/><meshStandardMaterial color={color} map={map} roughness={.66}/></mesh>}
function Ribbon({points,width,color}:{points:V3[];width:number;color:string}){const geometry=useMemo(()=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),vertices:number[]=[],indices:number[]=[],norm=new THREE.Vector3(0,0,1);for(let i=0;i<=20;i++){const t=i/20,p=curve.getPoint(t),side=curve.getTangent(t).cross(norm).normalize().multiplyScalar(width/2*(1-.25*t));vertices.push(...p.clone().add(side).toArray(),...p.clone().sub(side).toArray());if(i<20){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g},[points,width]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} roughness={.7} side={THREE.DoubleSide}/></mesh>}
function PleatedDress({color,map}:{color:string;map:THREE.Texture}){const geometry=useMemo(()=>{const v:number[]=[],uv:number[]=[],indices:number[]=[];const rings=12,sides=64;for(let y=0;y<=rings;y++){const t=y/rings,r=.53-(.53-.22)*Math.pow(t,.78);for(let s=0;s<=sides;s++){const a=s/sides*Math.PI*2,fold=.012*Math.cos(a*14+t*.5)*(1-t*.6);v.push(Math.sin(a)*(r+fold),.16+t*1.12+Math.cos(a*3)*.005*(1-t),Math.cos(a)*(r+fold)*.72);uv.push(s/sides,t);if(y<rings&&s<sides){const j=y*(sides+1)+s;indices.push(j,j+1,j+sides+1,j+1,j+sides+2,j+sides+1)}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g},[]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} map={map} side={THREE.DoubleSide} roughness={.76}/></mesh>}
function Lantern(){return <group position={[0,-.57,.03]}><Stroke color={gold} radius={.012} points={[[-.10,.02,0],[-.10,.17,0],[0,.23,0],[.10,.17,0],[.10,.02,0]]}/><Rod at={[0,-.16,0]} top={.14} bottom={.16} height={.31} color="#e7bd78"/><Rod at={[0,.01,0]} top={.18} bottom={.18} height={.035} color="#614c38" metal={.35}/><Rod at={[0,-.33,0]} top={.19} bottom={.18} height={.04} color="#614c38"/>{Array.from({length:6},(_,i)=>{const a=i/6*Math.PI*2;return <Rod key={i} at={[Math.sin(a)*.155,-.16,Math.cos(a)*.155]} top={.008} bottom={.008} height={.32} color={gold}/>})}<Stroke color="#ab5d50" radius={.012} points={[[0,-.35,0],[0,-.48,0],[.025,-.53,0]]}/><pointLight color="#ffcd94" intensity={1.8} distance={4}/></group>}
function HairCap({female}:{female:boolean}){
 const geometry=useMemo(()=>{
  const positions:number[]=[],indices:number[]=[],sides=48,rings=18;
  for(let r=0;r<=rings;r++)for(let s=0;s<=sides;s++){
   const angle=s/sides*Math.PI*2,back=(1-Math.cos(angle))/2;
   // A high forehead edge, fuller temples, and a continuous low back hairline.
   const theta=r/rings*(1.16+1.24*back),radius=Math.sin(theta);
   positions.push(Math.sin(angle)*radius*(female?.219:.238),.02+Math.cos(theta)*.315,Math.cos(angle)*radius*.225-.012);
   if(r<rings&&s<sides){const i=r*(sides+1)+s;indices.push(i,i+1,i+sides+1,i+1,i+sides+2,i+sides+1)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[female]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh name="dense-hair-cap" geometry={geometry} castShadow><meshStandardMaterial color={hair} roughness={.43} side={THREE.DoubleSide}/></mesh>;
}
function Face({female}:{female:boolean}){const skin=female?'#edc7aa':'#dfb28f';return <group name={female?'秀雅瓜子臉':'稜角書生臉'}>
<Turned profile={female?[[0,-.25],[.05,-.235],[.112,-.18],[.164,-.09],[.188,.015],[.183,.14],[.145,.235],[.07,.273],[0,.278]]:[[0,-.25],[.09,-.235],[.157,-.18],[.193,-.08],[.207,.03],[.20,.16],[.155,.25],[.07,.285],[0,.29]]} color={skin} scale={[1,1,.86]}/>
{[-1,1].map(side=><group key={side}>
<Orb at={[side*(female?.18:.20),-.005,-.005]} scale={[.52,1,.65]} radius={.053} color={skin}/>
<Orb at={[side*.078,.030,.181]} radius={1} scale={[female?.050:.047,female?.028:.026,.014]} color="#f3ede6"/>
<Orb at={[side*.077,.029,.194]} radius={1} scale={[.022,.025,.009]} color={female?'#5d514c':'#495559'}/>
<Orb at={[side*.077,.029,.201]} radius={1} scale={[.011,.017,.005]} color="#252d34"/>
<Orb at={[side*.070,.039,.207]} radius={.006} color="#fff7eb"/>
<Stroke points={[[side*.030,.036,.188],[side*.075,female?.058:.053,.195],[side*.126,.033,.173]]} radius={female?.005:.006} color={hair}/>
<Stroke points={[[side*.033,.100,.174],[side*.075,female?.115:.110,.184],[side*.133,.103,.165]]} radius={female?.006:.008} color="#4a3c38"/>
{female&&<><Orb at={[side*.119,-.044,.144]} scale={[.034,.011,.003]} color="#d79a91"/><Rod at={[side*.194,-.11,.025]} top={.008} bottom={.008} height={.12} color={gold} metal={.6}/><Orb at={[side*.194,-.179,.025]} scale={[.016,.033,.014]} color="#9cd5c3" metal={.3}/></>}
</group>)}
<Orb at={[0,-.018,.193]} scale={[female?.018:.022,.043,.031]} color={skin}/>
<Stroke points={[[-.039,-.119,.163],[-.014,-.121,.180],[0,-.117,.184],[.014,-.121,.180],[.039,-.119,.163]]} color={female?'#b5767b':'#aa7970'} radius={.005}/>
<Orb at={[0,-.131,.172]} scale={[.028,.008,.006]} color={female?'#c28a8d':'#b98a7e'}/>
{/* A hair cap and swept fringe cover the forehead from every camera angle. */}
<HairCap female={female}/>
{female?<>
<Turned at={[0,-.10,-.16]} scale={[1,1,.65]} profile={[[0,-.96],[.16,-.89],[.25,-.65],[.267,-.25],[.232,.11],[.15,.25],[0,.29]]} color={hair}/>
{[-2,-1,0,1,2].map(i=><Stroke key={i} color={i%2?'#293747':hair} radius={.035} points={[[i*.065,.15,-.19],[i*.095,-.20,-.32],[i*.09,-.60,-.30],[i*.068,-.94,-.22]]}/>)}
{[-1,1].map(side=><group key={side}>
<Stroke color={hair} radius={.049} points={[[0,.285,.11],[side*.11,.239,.17],[side*.185,.10,.13],[side*.195,-.20,.06]]}/>
<Stroke color={hair} radius={.038} points={[[side*.18,.14,-.02],[side*.22,-.18,-.045],[side*.23,-.48,-.06],[side*.20,-.72,-.10]]}/>
<Orb at={[side*.17,.23,-.13]} scale={[1,.75,.95]} radius={.077} color={hair}/>
{side<0&&<Rod at={[-.15,.24,-.08]} rotation={[0,0,Math.PI/2]} top={.007} bottom={.007} height={.22} color="#c1cbd1" metal={.45}/>}
<Stroke color="#31434b" radius={.012} points={[[side*.19,.04,-.18],[side*.23,-.35,-.20],[side*.19,-.78,-.15]]}/>
<Ribbon color="#85c4bc" width={.035} points={[[side*.22,.20,-.14],[side*.25,-.13,-.18],[side*.30,-.48,-.14],[side*.27,-.66,-.12]]}/>
</group>)}
{Array.from({length:5},(_,i)=>{const a=i/5*Math.PI*2;return <Orb key={i} at={[-.217+Math.cos(a)*.037,.245+Math.sin(a)*.037,.037]} radius={.024} scale={[1,.65,.45]} color="#c5e3d1"/>})}<Orb at={[-.217,.245,.05]} radius={.017} color={gold} metal={.6}/>
</>:<>
<Orb at={[0,.36,-.085]} scale={[.98,1.15,.98]} radius={.115} color={hair}/><Rod at={[0,.31,-.08]} top={.112} bottom={.112} height={.035} color="#839b9e" metal={.35}/><Rod at={[0,.35,-.08]} rotation={[0,0,Math.PI/2]} top={.009} bottom={.009} height={.34} color="#adb7b4" metal={.45}/>
{[-2,-1,0,1,2].map(i=><Stroke key={i} color={i===0?'#334554':hair} radius={.043} points={[[i*.035,.27,-.18],[i*.045,-.12,-.25],[i*.047,-.48,-.22],[i*.035,-.72,-.16]]}/>)}
{[-1,1].map(side=><Stroke key={side} color={hair} radius={.036} points={[[side*.17,.21,-.06],[side*.207,.03,-.04],[side*.19,-.18,-.13],[side*.12,-.31,-.22]]}/>)}
{[0,1,2].map(i=><Stroke key={i} color={i===1?'#31414a':hair} radius={i===1?.010:.031} points={[[-.14+i*.027,.235,.08],[-.08+i*.035,.21,.17],[.08+i*.027,.12,.17],[.157+i*.01,.015,.10]]}/>)}
<Ribbon color="#417d86" width={.06} points={[[0,.25,-.18],[-.06,-.08,-.21],[-.03,-.45,-.18]]}/>
</>}
</group>}
function PlayerModel({female=false,motion}:{female?:boolean;motion?:MutableRefObject<number>}){
const root=useRef<THREE.Group>(null!),arms=useRef<(THREE.Group|null)[]>([]),legs=useRef<(THREE.Group|null)[]>([]),hem=useRef<THREE.Group>(null!),pendant=useRef<THREE.Group>(null!),time=useRef(0),eyes=useRef<THREE.Group>(null!);
const hero=female?heroes.suying:heroes.shenmo,robe=hero.robe,trim=hero.trim,skin=female?'#edc7aa':'#dfb28f';
const cloth=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#e9e7df';ctx.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){ctx.strokeStyle=i%8?'#dfded7':'#f3f1e9';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke()}const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);texture.colorSpace=THREE.SRGBColorSpace;return texture},[]);useEffect(()=>()=>cloth.dispose(),[cloth]);
useFrame((_,delta)=>{const g=useGame.getState();if(g.question||['pause','realmClear','teacher','lose','win'].includes(g.phase))return;const t=time.current+=Math.min(delta,.1),m=Math.min(1,motion?.current??0),stride=Math.sin(t*8);root.current.position.y=Math.sin(t*1.8)*.008+Math.abs(stride)*.018*m;for(let i=0;i<2;i++){if(legs.current[i])legs.current[i]!.rotation.x=Math.sin(t*8+i*Math.PI)*m*(female?.29:.42);if(arms.current[i])arms.current[i]!.rotation.x=-Math.sin(t*8+i*Math.PI)*m*(female?.17:.24)+Math.sin(t*1.4+i)*.012;}if(hem.current){hem.current.rotation.z=Math.sin(t*4)*m*.018;hem.current.rotation.x=Math.sin(t*2)*.008*m}if(pendant.current)pendant.current.rotation.z=Math.sin(t*5)*(.025+m*.08);if(eyes.current)eyes.current.rotation.y=Math.sin(t*.45)*.025;});
const shoulder=female?.305:.395;
return <group ref={root} name={hero.name} userData={{heroVariant:hero.variant,modelRevision:'refined-v4-hair',gender:female?'female':'male',silhouette:female?'long-hair-pleated-hanfu':'topknot-split-robe-boots'}}>
{/* Different silhouettes: ankle-length pleats versus a split coat and visible boots. */}
<group ref={hem}>
{female?<><Turned color="#c9d7e3" map={cloth} profile={[[.485,.12],[.44,.26],[.36,.48],[.285,.72],[.235,1.0],[.20,1.28]]} scale={[1,1,.72]}/><PleatedDress color={robe} map={cloth}/>{[-1,1].map(side=><Ribbon key={side} color="#92b9ce" width={.045} points={[[side*.08,1.24,.18],[side*.16,.85,.31],[side*.27,.44,.35],[side*.30,.27,.36]]}/>)}</>:<>{[-1,1].map(side=><group key={side}><Ribbon color={robe} width={.35} points={[[side*.18,1.25,.16],[side*.20,.95,.24],[side*.24,.52,.23]]}/><Ribbon color="#23495b" width={.34} points={[[side*.18,1.25,-.15],[side*.20,.94,-.24],[side*.25,.49,-.23]]}/><Stroke radius={.005} color="#8099a8" points={[[side*.34,1.22,.18],[side*.37,.90,.25],[side*.39,.54,.24]]}/></group>)}</>}
</group>
{[-1,1].map((side,i)=><group key={side} ref={g=>{legs.current[i]=g}} position={[side*(female?.13:.17),1.02,0]}><Rod at={[0,-.40,0]} top={.085} bottom={.075} height={.75} color={female?'#d5c8b6':'#283d4c'}/><Rod at={[0,-.73,0]} top={.093} bottom={.10} height={female?.25:.39} color={female?robe:'#152e3a'}/><Orb at={[0,-.93,.07]} scale={[female?.10:.12,.075,female?.16:.20]} color={female?robe:'#172c36'}/><Stroke color={female?trim:gold} radius={.008} points={[[-.08,-.925,.10],[0,-.91,female?.215:.25],[.08,-.925,.10]]}/></group>)}
<Turned profile={female?[[.22,1.22],[.225,1.39],[.26,1.65],[.29,1.82],[.18,1.91]]:[[.29,1.20],[.30,1.47],[.34,1.74],[.36,1.85],[.19,1.96]]} color={robe} map={cloth} scale={[1,1,.69]}/>
<Rod at={[0,1.25,0]} top={female?.235:.305} bottom={female?.242:.31} height={female?.12:.105} scale={[1,1,.73]} color={female?'#dbc49e':'#26343d'}/>
<Box at={[0,1.25,female?.187:.235]} scale={[female?.15:.16,.085,.035]} color={gold} metal={.6}/><Orb at={[0,1.25,female?.213:.260]} scale={[.038,.029,.012]} color="#8ac4b3" metal={.25}/>
<Ribbon points={female?[[-.19,1.83,.12],[-.04,1.63,.192],[.07,1.45,.18]]:[[-.24,1.90,.13],[-.055,1.65,.245],[.15,1.36,.225]]} width={female?.078:.10} color={ivory}/>
<Ribbon points={female?[[.19,1.83,.12],[.10,1.71,.173],[0,1.56,.20]]:[[.24,1.90,.13],[.13,1.76,.225],[.025,1.54,.254]]} width={female?.078:.10} color={ivory}/>
<Ribbon points={female?[[-.185,1.84,.14],[-.04,1.63,.205],[.07,1.45,.195]]:[[-.24,1.90,.15],[-.055,1.65,.26],[.15,1.36,.241]]} width={.025} color={trim}/>
{/* Cloud embroidery and jade ornaments are visible in the character preview. */}
<Stroke color={female?'#cde2c8':gold} radius={.007} points={female?[[.10,1.48,.185],[.155,1.52,.16],[.18,1.49,.145],[.16,1.46,.16],[.13,1.48,.18]]:[[-.21,1.51,.20],[-.17,1.55,.22],[-.10,1.53,.24],[-.12,1.49,.24],[-.17,1.49,.22],[-.18,1.45,.22]]}/>
{female&&<><Ribbon color="#8ac4b5" width={.10} points={[[-.17,1.77,-.11],[-.28,1.71,.06],[-.25,1.47,.14],[-.24,1.08,.21]]}/><Ribbon color="#8ac4b5" width={.10} points={[[.17,1.77,-.11],[.28,1.71,.06],[.25,1.47,.14],[.24,1.08,.21]]}/></>}
<group ref={pendant} position={[female?0:.22,1.19,female?.22:.25]}><Stroke radius={.008} color={gold} points={[[0,0,0],[.01,-.12,.015],[0,-.17,.02]]}/><Orb at={[0,-.20,.02]} scale={[.04,.055,.015]} color="#88c9b7" metal={.3}/>{[-.02,0,.02].map(x=><Stroke key={x} radius={.006} color={female?'#b9dfcb':'#c9b381'} points={[[x,-.25,.02],[x,-.37,.02],[x+.015,-.40,.025]]}/>)}</group>
{[-1,1].map((side,i)=><group key={side} ref={g=>{arms.current[i]=g}} position={[side*shoulder,female?1.80:1.85,0]} rotation={[0,0,side*.10]}>
<Turned profile={[[female?.14:.12,-.46],[female?.15:.145,-.30],[female?.13:.16,-.10],[.085,.025],[0,.06]]} color={robe}/><Orb at={[0,-.45,.01]} radius={female?.12:.125} color={robe}/><group position={[0,-.45,.02]} rotation={[-.34,side*.06,-side*.08]}>
<Rod at={[0,-.17,.015]} top={female?.14:.13} bottom={female?.17:.11} height={.34} color={robe}/><Rod at={[0,-.32,.015]} top={female?.17:.115} bottom={female?.17:.115} height={.024} color={trim}/><Rod at={[0,-.35,.015]} top={.085} bottom={.08} height={.04} color={robe}/><Orb at={[0,-.45,.025]} scale={[.072,.10,.057]} color={skin}/><Orb at={[-side*.063,-.435,.045]} scale={[.027,.05,.032]} color={skin}/>
{i===0?<Lantern/>:female?<group position={[0,-.45,.10]} rotation={[-.15,0,.08]}><Box at={[0,0,0]} scale={[.23,.33,.035]} color="#e6d5af"/>{[-.18,.18].map(y=><Rod key={y} at={[0,y,0]} top={.035} bottom={.035} height={.29} rotation={[0,0,Math.PI/2]} color={gold} metal={.4}/>)}{[-.09,-.03,.03,.09].map(y=><Box key={y} at={[0,y,.023]} scale={[.13,.009,.008]} color="#8c6151"/>)}</group>:<group position={[0,-.45,.10]} rotation={[-.22,0,.2]}><Rod top={.023} bottom={.023} height={.65} color="#5b4430"/><Rod at={[0,-.18,0]} top={.028} bottom={.028} height={.06} color={gold} metal={.6}/><mesh position={[0,-.40,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[.04,.17,10]}/><meshStandardMaterial color="#eee6cd"/></mesh></group>}
</group></group>)}
<Rod at={[0,female?1.95:2.0,0]} top={female?.073:.087} bottom={female?.08:.10} height={.18} color={skin}/>
<group ref={eyes} position={[0,female?2.25:2.31,0]} scale={[.78,.78,.78]}><Face female={female}/></group>
</group>}
export const PlayableHero=memo(PlayerModel);


