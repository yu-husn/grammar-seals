import {useEffect,useRef} from 'react';
import {realmInfo} from './campaign';
import {gateSteps,monsterCountForRealm} from './realmDesign';
import {bossPlayerDamage,bossRescueHP} from './bossRules';
import './game-guide.css';

const explorationTasks=[
 ['探索荒城，找到六處行跡機關，辨認動作與主語。','完成六處機關、取得敘事靈印，從北城出口離開。'],
 ['探索碎鏡迴廊，找到六處機關，辨認句型與主語。','取得表態靈印，找出真正的出口。'],
 ['分析六份證詞，辨認句型、身分與句子成分。','取得判斷靈印，穿過正名之門。'],
 ['探索寶庫，辨別存在、領有與否定動作，破解六處寶匣機關。','取得有無靈印，帶著四枚靈印挑戰無言君。'],
];

export default function GameGuide({onClose}:{onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus()}},[onClose]);
 return <div className="overlay"><section className="panel game-guide" role="dialog" aria-modal="true" aria-labelledby="game-guide-heading"><header className="section-head"><h2 id="game-guide-heading">遊玩指引</h2><button ref={close} onClick={onClose} aria-label="關閉遊玩指引">關閉</button></header>
 <h3>操作方式</h3><p>電腦：WASD／方向鍵移動，拖曳轉向，靠近機關按 E；空白鍵閃避。手機／平板：使用搖桿、互動與閃避按鈕。道具按數字鍵1–6或點選圖片使用。</p>
 <h3>關卡任務</h3><p>四大禁域均混合四大句型，關卡名稱不代表答案。</p>
 {explorationTasks.map(([first,last],realm)=>{const info=realmInfo[realm],gates=gateSteps[realm];const tasks=[first,`完成第${gates.join('、')}處機關，依序開啟${['兩','三','四','五'][realm]}道${['側滑閘門','幻鏡閘門','判門','閘門'][realm]}。`,`避開${['一','兩','三','四'][monsterCountForRealm(realm)-1]}名${info.guardian}；被碰到每次扣10點生命，金鐘罩生效時免傷。`,last];return <details className="guide-mission" key={realm} open={realm===0}><summary>{info.title}</summary><ol>{tasks.map((task,i)=><li key={task}><span aria-hidden="true">{i+1}</span><p>{task}</p></li>)}</ol></details>})}
 <details className="guide-mission"><summary>無言君決戰</summary><ol>{['追蹤發光目標，在中央與周邊石碑之間移動，走近後按 E 辨句。','完成十六次辨句，依序破解混合句型、字面陷阱與句子成分。','觀察蓄力提示，持續移動，躲避來自不同方向的咒彈。','擊敗無言君後，回到中央完成最終封印。'].map((task,i)=><li key={task}><span aria-hidden="true">{i+1}</span><p>{task}</p></li>)}</ol></details>
 <h3>計分與補給</h3><p>四域各6題、魔王16題，共40題，每題2.5分，滿分100分；完成40題並達70分才能通關。行跡迷城後進入靈印寶石陣，真假審判後進入句型石轟擊；每站限玩一次、最多100點，合計最多200點換道具，不計學科成績。</p>
 <p>四大禁域起始200秒，魔王關240秒。答題、解析與暫停時停止倒數及攻擊。魔王關每次受擊扣{bossPlayerDamage}點生命；生命耗盡回復至{bossRescueHP}點並保留作答進度。</p>
 </section></div>;
}
