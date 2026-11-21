import {useRef,type ButtonHTMLAttributes} from 'react';

type Props=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'|'onPointerDown'> & {onActivate:()=>void};

/** Secondary fingers do not reliably synthesize click while the joystick is held. */
export default function ActionButton({onActivate,...props}:Props){
 const lastTouch=useRef(-Infinity);
 return <button {...props} onPointerDown={event=>{
  if(event.pointerType==='mouse')return;
  event.preventDefault();
  event.stopPropagation();
  lastTouch.current=Date.now();
  onActivate();
 }} onClick={event=>{
  // Keep mouse/keyboard activation, without using an item again on a touch click.
  if(event.detail===0||Date.now()-lastTouch.current>800)onActivate();
 }}/>;
}
