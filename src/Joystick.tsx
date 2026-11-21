import {useEffect,useRef,useState,type PointerEvent} from 'react';

export default function Joystick({onMove}:{onMove:(x:number,z:number)=>void}){
 const [knob,setKnob]=useState([0,0]),owner=useRef<number|null>(null),moveRef=useRef(onMove);moveRef.current=onMove;
 useEffect(()=>()=>{moveRef.current(0,0)},[]);
 const reset=()=>{owner.current=null;moveRef.current(0,0);setKnob([0,0])};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/38,z=(e.clientY-r.top-r.height/2)/38;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length}moveRef.current(x,z);setKnob([x*32,z*32])};
 return <div className="joystick" role="group" aria-label="觸控移動搖桿"
  onPointerDown={e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();e.stopPropagation();if(owner.current!==null)return;owner.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e)}}
  onPointerMove={e=>{if(owner.current!==e.pointerId||!e.currentTarget.hasPointerCapture(e.pointerId))return;e.preventDefault();e.stopPropagation();move(e)}}
  onPointerUp={e=>{if(owner.current!==e.pointerId)return;e.preventDefault();e.stopPropagation();reset();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}
  onPointerCancel={e=>{if(owner.current===e.pointerId)reset()}}
  onLostPointerCapture={e=>{if(owner.current===e.pointerId)reset()}}
  onContextMenu={e=>e.preventDefault()} onDragStart={e=>e.preventDefault()}
  onClick={e=>{e.preventDefault();e.stopPropagation()}}>
  <span style={{transform:`translate(${knob[0]}px,${knob[1]}px)`}}/><b>移動</b>
 </div>;
}
