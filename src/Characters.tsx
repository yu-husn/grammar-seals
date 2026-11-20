import {useRef,type MutableRefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useGame} from './store';
import {PlayableHero} from './PlayableHero';
import {HauntingGuardian} from './HauntingGuardian';
import {isGuardianVariant,guardianDesigns} from './guardianDesigns';
export type CharacterVariant='player'|'playerAlt'|'shadow'|'mirror'|'judge'|'vault'|'boss';
export const characterProfiles=[
{name:'沈墨',title:'男辨句使者',description:'修長青年男書生，墨藍長袍、自然眉眼與高束長髮，提燈執筆。'},
{name:'巡夜影衛',title:'行跡迷城關主',description:guardianDesigns[0].description},
{name:'鏡面仕女',title:'幻象迷宮關主',description:guardianDesigns[1].description},
{name:'喪屍判官',title:'真假審判關主',description:guardianDesigns[2].description},
{name:'虛藏守將',title:'虛實禁域關主',description:guardianDesigns[3].description},
{name:'無言君',title:'四句審判殿之主',description:'玄紅龍紋袍、金冠與裂面，背負無字光輪。三重護盾分別混淆句型、字面與文脈。'},
{name:'蘇映',title:'女辨句使者',description:'修長青年女辨句使者，霜青層疊長裙、自然眉眼、柔順垂髮與玉簪，攜燈持卷。'}
];
function Shape({position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],color,kind='box',args=[1,1,1],metal=0}:{position?:[number,number,number];scale?:[number,number,number];rotation?:[number,number,number];color:string;kind?:'box'|'sphere'|'cylinder'|'cone'|'torus';args?:number[];metal?:number}){return <mesh position={position} scale={scale} rotation={rotation} castShadow><>{kind==='box'?<boxGeometry args={args as [number,number,number]}/>:kind==='sphere'?<sphereGeometry args={[args[0]??1,12,10]}/>:kind==='cylinder'?<cylinderGeometry args={[args[0],args[1],args[2],10]}/>:kind==='cone'?<coneGeometry args={[args[0],args[1],8]}/>:<torusGeometry args={[args[0],args[1],6,20]}/>}</><meshStandardMaterial color={color} metalness={metal} roughness={metal?.4:.8}/></mesh>}
function GuardianModel({variant='player',motion,attack,rank=0}:{variant?:CharacterVariant;motion?:MutableRefObject<number>;attack?:MutableRefObject<number>;rank?:number}){
const root=useRef<THREE.Group>(null!),arms=useRef<(THREE.Group|null)[]>([]),legs=useRef<(THREE.Group|null)[]>([]),clock=useRef(0);
const alt=variant==='playerAlt',player=variant==='player'||alt,boss=variant==='boss',judge=variant==='judge',mirror=variant==='mirror',vault=variant==='vault';
const robe=alt?'#93465f':player?'#397b86':boss?'#3d152c':mirror?'#77709c':judge?'#852f32':vault?'#315457':'#262838';
const trim=alt?'#b5e4dc':player?'#dfbd7b':mirror?'#c7e5f2':'#c39b52',skin=player?'#d9b48e':mirror?'#d1c8cf':boss?'#bba1a4':variant==='shadow'?'#202839':'#8a979a';
useFrame((_,delta)=>{const g=useGame.getState();if(g.question||['pause','realmClear','teacher','lose','win'].includes(g.phase))return;clock.current+=Math.min(delta,.1);const t=clock.current,m=Math.min(1,motion?.current??0),a=attack?.current??0;root.current.position.y=Math.sin(t*8)*.035*m+Math.sin(t*1.7)*.012;for(let i=0;i<2;i++){const swing=Math.sin(t*8+(i?Math.PI:0))*m;const arm=arms.current[i],leg=legs.current[i];if(arm)arm.rotation.x=swing*.42-a*1.3;if(leg)leg.rotation.x=-swing*.5;}root.current.rotation.z=boss?Math.sin(t*.7)*.012:0;});
return <group ref={root} name={alt?'蘇映':player?'沈墨':variant} userData={{heroVariant:player?variant:undefined}} scale={boss?[1.7,1.7,1.7]:vault?[1.13,1.1,1.13]:[1,1,1]}>
<Shape position={[0,1.37,0]} kind="cylinder" args={[.36,.43,.88]} scale={[1,1,.65]} color={robe}/>
<Shape position={[0,1.02,0]} args={[.83,.15,.43]} color="#322c2b"/><Shape position={[0,1.03,.235]} args={[.17,.16,.045]} color={trim} metal={.6}/>
{[-1,1].map((side,i)=><group key={side}>
<Shape position={[side*.23,.77,0]} rotation={[0,0,side*.05]} args={[.41,.55,.32]} color={robe}/><Shape position={[side*.42,.76,.18]} args={[.035,.63,.035]} color={trim}/>
<group ref={v=>{legs.current[i]=v}} position={[side*.18,.85,0]}><Shape position={[0,-.29,0]} kind="cylinder" args={[.115,.105,.57]} color="#263b44"/><Shape position={[0,-.65,.07]} args={[.24,.25,.43]} color="#182630"/><Shape position={[0,-.78,.07]} args={[.25,.04,.45]} color="#5c5951"/></group>
<group ref={v=>{arms.current[i]=v}} position={[side*.44,1.72,0]} rotation={[0,0,side*.12]}>
<Shape position={[0,-.22,0]} kind="cylinder" args={[.16,.12,.46]} color={robe}/><Shape position={[0,-.46,.035]} kind="sphere" args={[.12]} color={robe}/>
<group position={[0,-.46,.035]} rotation={[-.25,0,0]}><Shape position={[0,-.18,0]} kind="cylinder" args={[.125,.095,.36]} color={robe}/><Shape position={[0,-.36,0]} args={[.22,.08,.24]} color={trim}/><Shape position={[0,-.46,.025]} scale={[.85,1,.8]} kind="sphere" args={[.12]} color={skin}/>
{player&&i===0&&<group position={[0,-.78,.03]}><Shape position={[0,.13,0]} kind="torus" args={[.13,.018]} color="#c5aa71"/><Shape position={[0,-.12,0]} kind="cylinder" args={[.16,.17,.34]} color="#e9bb75"/><Shape position={[0,-.3,0]} args={[.4,.05,.38]} color="#553a30"/><pointLight color="#ffc379" intensity={1.8} distance={4}/></group>}
{player&&i===1&&(alt?<group position={[0,-.34,.13]} rotation={[-.18,0,.12]}><Shape args={[.26,.42,.06]} color="#d8cc9b"/>{[-.22,.22].map(y=><Shape key={y} position={[0,y,0]} kind="cylinder" args={[.055,.055,.34]} rotation={[0,0,Math.PI/2]} color={trim}/>)}{[-.09,0,.09].map(y=><Shape key={y} position={[0,y,.035]} args={[.16,.015,.008]} color={robe}/>)}</group>:<group position={[0,-.43,.08]} rotation={[-.5,0,0]}><Shape kind="cylinder" args={[.035,.035,.65]} color="#4b3728"/><Shape position={[0,-.34,0]} kind="cone" args={[.06,.18]} rotation={[0,0,Math.PI]} color="#e6ded0"/></group>)}
{judge&&i===1&&<Shape position={[0,-.4,.13]} args={[.19,.65,.06]} color="#b5d0ae"/>}
{vault&&i===0&&<group position={[0,-.62,0]}>{[-.09,0,.09].map(x=><group key={x} position={[x,0,0]}><Shape kind="torus" args={[.09,.025]} color={trim} metal={.7}/><Shape position={[0,-.16,0]} args={[.04,.22,.04]} color={trim}/></group>)}</group>}
{mirror&&i===1&&<group position={[0,-.42,.12]}><Shape kind="cylinder" args={[.17,.03,.35]} scale={[1,1,.12]} rotation={[0,0,Math.PI]} color="#b5bbdc"/><Shape position={[0,-.27,0]} args={[.04,.3,.04]} color={trim}/></group>}
{variant==='shadow'&&i===1&&<group position={[.1,-.25,0]}><Shape kind="cylinder" args={[.025,.03,2.1]} color="#6a604e"/><Shape position={[0,1.16,0]} kind="cone" args={[.11,.36]} color="#8fa6aa" metal={.7}/></group>}
</group></group></group>)}
{!player&&<>{[-1,1].map(side=><mesh key={side} position={[side*.094,2.12,.246]}><boxGeometry args={[.045,.018,.022]}/><meshBasicMaterial color={mirror?'#d8beff':judge?'#f1a56d':vault?'#97f2ce':'#9bcfe2'}/></mesh>)}{Array.from({length:rank+1},(_,i)=><Shape key={i} position={[-.18+i*.11,1.52,.3]} kind="sphere" args={[.03]} color={trim}/>)}</>}{/* 交領、肩甲與衣襟 */}
<Shape position={[-.12,1.56,.255]} rotation={[0,0,-.42]} args={[.11,.58,.045]} color={trim}/><Shape position={[.13,1.47,.255]} rotation={[0,0,.4]} args={[.1,.7,.04]} color={trim}/>
{!player&&[-1,1].map(side=><Shape key={side} position={[side*.46,1.76,0]} kind="sphere" args={[.23]} scale={[1,.5,1.1]} color={vault||boss?'#9b804e':robe} metal={vault||boss?.6:0}/>)}
<Shape position={[0,1.84,0]} kind="cylinder" args={[.105,.12,.18]} color={skin}/>
<group position={[0,2.08,0]}>
<Shape kind="sphere" args={[.27]} scale={[.88,1.13,.9]} color={skin}/>
<Shape position={[0,.035,-.11]} kind="sphere" args={[.275]} scale={[1,1.15,.65]} color="#171f2b"/>
{[-1,1].map(side=><group key={side}><Shape position={[side*.245,0,0]} kind="sphere" args={[.065]} scale={[.7,1,.6]} color={skin}/><Shape position={[side*.095,.04,.221]} args={[.09,.035,.025]} color="#151b24"/><Shape position={[side*.095,.102,.215]} rotation={[0,0,side*-.13]} args={[.105,.022,.025]} color="#20212b"/></group>)}
<Shape position={[0,-.02,.247]} kind="sphere" args={[.055]} scale={[.55,1,1]} color={skin}/><Shape position={[0,-.13,.225]} args={[.1,.018,.018]} color="#875f5d"/>
{((player&&!alt)||mirror)&&<><Shape position={[0,.29,-.08]} kind="sphere" args={[.15]} scale={[.9,1,.9]} color="#17202a"/><Shape position={[0,.28,-.08]} args={[.51,.035,.04]} color={trim}/></>}
{(mirror||alt)&&[-1,1].map(side=><group key={side}><Shape position={[side*.25,.2,-.08]} kind="sphere" args={[.12]} color="#293047"/>{alt&&<><Shape position={[side*.25,.22,-.08]} args={[.32,.025,.035]} color={trim}/><Shape position={[side*.28,-.12,-.15]} rotation={[0,0,side*.13]} args={[.045,.55,.035]} color={trim}/></>}</group>)}
{judge&&<><Shape position={[0,.28,-.01]} args={[.62,.2,.46]} color="#152128"/><Shape position={[0,.34,-.01]} args={[1.2,.065,.12]} color="#152128"/><Shape position={[0,-.22,.16]} kind="cone" args={[.11,.33]} rotation={[0,0,Math.PI]} color="#26313a"/><Shape position={[-.14,-.02,.24]} args={[.16,.3,.04]} color="#bd9f5c" metal={.7}/></>}
{vault&&<><Shape position={[0,.2,-.01]} kind="sphere" args={[.31]} scale={[1,.7,1]} color="#8c8c68" metal={.6}/><Shape position={[0,.13,.28]} args={[.07,.26,.05]} color={trim}/></>}
{boss&&<><Shape position={[0,.3,-.03]} kind="cylinder" args={[.28,.29,.14]} color={trim} metal={.8}/>{[-.2,-.1,0,.1,.2].map((x,i)=><Shape key={i} position={[x,.47+(.2-Math.abs(x))*.7,-.03]} kind="cone" args={[.045,.32]} color={trim} metal={.8}/>)}<Shape position={[.13,0,.245]} args={[.2,.36,.035]} color="#c0a268" metal={.6}/><Shape position={[0,-.12,.24]} args={[.23,.055,.04]} color={trim}/></>}
</group>
{alt&&<><Shape position={[0,1.71,-.22]} args={[.75,.22,.12]} color="#5d9e9e"/>{[-1,1].map(side=><Shape key={side} position={[side*.32,1.48,-.24]} rotation={[0,0,-side*.13]} args={[.22,.56,.08]} color="#5d9e9e"/>)}</>}
{!player&&<Shape position={[0,1.2,-.26]} args={[.85,1.3,.05]} rotation={[-.12,0,0]} color={boss?'#601d35':'#202634'}/>}
{boss&&<><Shape position={[0,1.8,-.4]} kind="torus" args={[1,.035]} color="#b28d62" metal={.7}/>{[0,1,2,3].map(i=><group key={i} rotation={[0,0,i*Math.PI/2]} position={[0,1.8,-.4]}><Shape position={[0,1.12,0]} args={[.12,.26,.04]} color={trim}/></group>)}<Shape position={[0,1.4,.27]} kind="torus" args={[.15,.025]} color={trim}/></>}
</group>;
}
export function Humanoid(props:{variant?:CharacterVariant;motion?:MutableRefObject<number>;attack?:MutableRefObject<number>;rank?:number}){return !props.variant||props.variant==='player'||props.variant==='playerAlt'?<PlayableHero female={props.variant==='playerAlt'} motion={props.motion}/>:isGuardianVariant(props.variant)?<HauntingGuardian variant={props.variant} motion={props.motion} rank={props.rank}/>:<GuardianModel {...props}/>}

