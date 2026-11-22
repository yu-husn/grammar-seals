import {itemInfo,itemOrder} from './grading';
import {useEffect,useRef} from 'react';
export function ItemIntroduction({onClose}:{onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus()}},[onClose]);
 return <div className="overlay"><section className="panel item-introduction" role="dialog" aria-modal="true" aria-labelledby="item-introduction-heading"><div className="section-head"><h2 id="item-introduction-heading">道具介紹</h2><button ref={close} onClick={onClose} aria-label="關閉道具介紹">關閉</button></div><p>六種探索道具，可帶往後續禁域與魔王戰。探索時按數字鍵1–6，或點選道具圖片使用；持有數量不限。</p><h3 className="item-detail-heading">道具詳細說明</h3><div className="item-introduction-grid">{itemOrder.map((id,i)=>{const item=itemInfo[id];return <article key={id}><img src={item.image} alt={`${item.name}圖片`} width="72" height="72"/><div><h3><kbd>{i+1}</kbd> {item.name}</h3><p>{item.description}</p></div></article>})}</div></section></div>;
}
export const bonusItems=[{name:'靈印爆破寶石',image:'/items/blast-gem.svg',description:'寶石陣專用。點擊可消除同列與同欄，帶出連鎖；消除四顆以上或三次連鎖有機會取得。'}];
export default function ItemGuide(){const items=[...itemOrder.map(id=>itemInfo[id]),...bonusItems];return <details className="item-guide"><summary>道具圖片與效果</summary><div>{items.map(item=><article key={item.name}><img src={item.image} alt={`${item.name}圖片`} width="64" height="64"/><div><h3>{item.name}</h3><p>{item.description}</p></div></article>)}</div></details>}
