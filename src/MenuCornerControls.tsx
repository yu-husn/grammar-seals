import {useLayoutEffect,useRef,type ReactNode} from 'react';

export function MenuCornerControls({children}:{children:ReactNode}){
 const element=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const node=element.current,parent=node?.parentElement;if(!node||!parent)return;const measure=()=>parent.style.setProperty('--menu-corner-bottom',`${node.offsetTop+node.offsetHeight}px`);measure();const observer=new ResizeObserver(measure);observer.observe(node);window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);parent.style.removeProperty('--menu-corner-bottom')}},[]);
 return <div ref={element} className="menu-corner-controls">{children}</div>;
}
