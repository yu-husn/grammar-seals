import {useEffect,useState} from 'react';
import {loadTraffic,type TrafficResult} from './traffic';

export default function TrafficCounter(){
 const [result,setResult]=useState<TrafficResult|null>(null);
 useEffect(()=>{let active=true;void loadTraffic(window.location).then(data=>{if(active)setResult(data)});return()=>{active=false}},[]);
 const format=(n:number)=>new Intl.NumberFormat('zh-TW').format(n);
 return <section className="traffic-counter" aria-label="網站到訪人數" role="status" aria-live="polite" aria-atomic="true" title="連上本遊戲網頁即可計入，不需開始遊戲或作答；由不蒜子去重估算訪客，並非精確學生人數。">
  {result?.status==='ready'?<div><span>到訪人數</span><strong>{format(result.visitors)}<small className="traffic-unit">人</small></strong></div>:<><div><span>到訪人數</span><strong>—</strong></div><div className="traffic-note">{!result?'讀取中…':result.status==='preview'?'正式網站累計':'統計暫時無法連線'}</div></>}
 </section>;
}
