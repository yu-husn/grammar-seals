import {Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import OpeningScene from './OpeningScene';
import type {CharacterVariant} from './Characters';
import {openingShots,openingDuration,openingFrame,openingStart} from './openingStory';
import {itemInfo,itemOrder} from './grading';
import {sound} from './audio';
import {openingMusicTrack} from './musicCatalog';
import './opening.css';

const guardians=['巡夜影衛','鏡面仕女','喪屍判官','虛藏守將'];
const timeLabel=(n:number)=>`0:${String(Math.floor(n)).padStart(2,'0')}`;
export default function OpeningCinematic({hero,name,onComplete,audioAllowed,volume,low}:{hero:CharacterVariant;name:string;onComplete:()=>void;audioAllowed:boolean;volume:number;low:boolean}){
 const [shot,setShot]=useState(0),[elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(true),[audio,setAudio]=useState(true),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const clock=useRef(0),playingRef=useRef(playing),finished=useRef(false),musicStarted=useRef(false),complete=useRef(onComplete),root=useRef<HTMLElement>(null),skip=useRef<HTMLButtonElement>(null);playingRef.current=playing;complete.current=onComplete;
 const finish=useCallback(()=>{if(finished.current)return;finished.current=true;sound(false);complete.current()},[]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 useEffect(()=>{skip.current?.focus();let last=performance.now();const timer=setInterval(()=>{const now=performance.now(),delta=Math.min(.25,(now-last)/1000);last=now;if(!playingRef.current||document.hidden||finished.current)return;clock.current=Math.min(openingDuration,clock.current+delta);setElapsed(clock.current);setShot(openingFrame(clock.current).index);if(clock.current>=openingDuration)finish()},80);const visibility=()=>{if(document.hidden)setPlaying(false)};document.addEventListener('visibilitychange',visibility);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);sound(false)}},[finish]);
 useEffect(()=>{const on=audio&&audioAllowed&&playing;sound(on,openingMusicTrack,false,volume,on&&!musicStarted.current);if(on)musicStarted.current=true},[audio,audioAllowed,playing,volume]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();finish()}if(e.key!=='Tab')return;const buttons=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[finish]);
 const seek=(index:number)=>{clock.current=openingStart(index)+.01;setElapsed(clock.current);setShot(index)};
 const current=openingShots[shot];
 return <section ref={root} className={`opening-cinematic ${reduced?'opening-reduced':''}`} role="dialog" aria-modal="true" aria-labelledby="opening-heading" data-opening-shot={current.id} data-opening-playing={playing}>
  <header className="opening-header"><span className="opening-brand">語法禁域 · 序章</span><div className="opening-actions"><button onClick={()=>setPlaying(p=>!p)} aria-label={playing?'暫停開場動畫':'繼續開場動畫'}>{playing?'暫停':'繼續'}</button><button disabled={!audioAllowed} aria-pressed={audio&&audioAllowed} onClick={()=>setAudio(a=>!a)}>{!audioAllowed?'音效已關閉':audio?'關閉音效':'開啟音效'}</button><button ref={skip} onClick={finish}>跳過動畫</button></div></header>
  <div className="opening-stage" data-scene={current.id}><Suspense fallback={<div className="opening-scene-loading">語法大地正在甦醒……</div>}><Canvas dpr={low?1:[1,1.5]} frameloop={playing&&!reduced?'always':'demand'} camera={{position:[10,9,24],fov:44}} fallback={<p className="opening-scene-loading">請隨下方劇情，進入語法大地。</p>}><OpeningScene shot={shot} clock={clock} hero={hero} playing={playing} reduced={reduced}/></Canvas></Suspense><span className="opening-shot-number">第 {shot+1} 幕 / {openingShots.length}</span>{shot>=2&&<span className="opening-hero-name">辨句使者 · {name}</span>}{shot===1&&<div className="opening-army" aria-label="無言君率領的四大關主">{guardians.map(n=><span key={n}>{n}</span>)}</div>}{shot===2&&!reduced&&<div className="opening-speed-lines" aria-hidden="true"/>}</div>
  <footer className="opening-footer"><div key={current.id} className="opening-caption" aria-live="polite" aria-atomic="true"><h1 id="opening-heading">{current.title}</h1><p>{current.caption}</p></div>{shot===4&&<div className="opening-item-strip" aria-label="六種冒險道具">{itemOrder.map((id,i)=><div key={id}><img src={itemInfo[id].image} alt="" width="36" height="36"/><span>{i+1} {itemInfo[id].name}</span></div>)}</div>}<div className="opening-progress"><progress aria-label="開場動畫進度" max={openingDuration} value={elapsed}/><span>{timeLabel(elapsed)} / {timeLabel(openingDuration)}</span></div><nav className="opening-chapters" aria-label="開場動畫章節">{openingShots.map((s,i)=><button key={s.id} onClick={()=>seek(i)} aria-label={`第${i+1}幕：${s.title}`} aria-current={i===shot?'step':undefined}>{i+1}</button>)}{shot===5&&<button className="opening-enter" onClick={finish}>進入主畫面</button>}</nav></footer>
 </section>;
}
