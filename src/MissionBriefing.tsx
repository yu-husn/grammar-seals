import {passingScore} from './grading';
import {bossLearningHelp} from './bossRules';
import {maxGuardHealth} from './guardHealth';
import {StartingItems} from './ItemGuide';
import {useEffect,useRef} from 'react';
import {realmInfo} from './campaign';
import HeroPicker from './HeroPicker';

export const missionTasks=[
  ['探索荒城，找到六處行跡機關，辨認動作與主語。','完成第3、第6處機關，依序開啟兩道側滑閘門。','避開一名巡夜影衛；被碰到每次扣10點生命，金鐘罩生效時免傷。','完成六處機關、取得敘事靈印，從北城出口離開。'],
  ['探索碎鏡迴廊，辨認表語、狀態與倒裝句主語。','完成第2、4、6處機關，開啟三道幻鏡閘門。','避開兩名鏡面仕女；她們比上一關更快，會持續追擊主角。','取得表態靈印，找出真正的出口。'],
  ['分析六份證詞，辨認身分、繫詞、斷語與文言判斷。','完成第2、3、5、6處機關，開啟四道判門。','避開三名喪屍判官；追擊速度再次提高。','取得判斷靈印，穿過正名之門。'],
  ['辨別存在、領有與否定動作，破解六處寶匣機關。','完成第1、2、4、5、6處機關，開啟五道閘門。','避開四名虛藏守將與虛假通道；這裡的守衛速度最快。','取得有無靈印，帶著四枚靈印與補給道具挑戰無言君。'],
  ['追蹤發光目標，在中央與七座周邊石碑之間移動，走近後按E辨句。','依序完成混合句型、字面陷阱、句子成分與文言挑戰。','觀察較慢的多方向咒彈，利用加長的蓄力提示移動；後段彈量仍會逐步增加。','240秒內以十六次正確辨句擊敗無言君，最後回中央完成封印；閱讀時停表。'],
];

export function MissionChecklist({realm}:{realm:number}){
  return <ol className="mission-tasks">{missionTasks[realm].map((task,i)=><li key={task}><span aria-hidden="true">{i+1}</span><p>{task}</p></li>)}</ol>;
}

export default function MissionBriefing({realm,onBegin,onClose}:{realm:number;onBegin:()=>void;onClose:()=>void}){
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus({preventScroll:true})},[]);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose]);
  const info=realmInfo[realm];
  return <div className="overlay mission-intro"><section className="panel mission-briefing" role="dialog" aria-modal="true" aria-labelledby="mission-heading">
    <span className="eyebrow">{info.theme} · {realm===4?'最終決戰':'四大禁域主線'}</span>
    <h2 id="mission-heading" ref={heading} tabIndex={-1}>{info.title} · 任務說明</h2>
    <p className="mission-goal">本卷題目已隨機安排，四域、兩個補給站與魔王之間不重複；續玩與補救保留原題。四大禁域每關六題均混合四大句型，不能依關卡名稱猜答案；另保留句子成分分析。四域各6題，加上魔王16題，共40題計分，每題2.5分、滿分100分，完成40題且達{passingScore}分才能通關。魔王關起始240秒，其他關卡200秒。行跡後是寶石補給站，審判後是轟擊補給站；各7次補給辨句，每站最多100點換道具，不計學科成績。</p>
    <StartingItems/><p className="mission-safe">{realm<4?`本域守衛生命${maxGuardHealth(realm)}點，誅邪彈傷害20點；擊倒後不再追擊。`:'無言君生命值160點，每次正確辨句削減10點。'}道具持有數量不限。</p>{realm===4&&<p className="mission-safe">{bossLearningHelp}</p>}<HeroPicker/><MissionChecklist realm={realm}/>
    <div className="mission-controls"><h3>操作方式</h3><ul><li>電腦：WASD／方向鍵移動，靠近機關按 E，空白鍵閃避；1 疾風靴、2 縛魔索、3 逆時珠、4 誅邪彈、5 金鐘罩、6 延命丹。</li><li>手機／平板：左下搖桿移動，右下按鈕解讀機關與閃避，點道具圖片施放。</li><li>答題與解析時，倒數、怪物與魔王炮彈一起暫停。</li></ul></div>
    <p className="mission-safe" role="status">任務說明期間不計時、不受攻擊。</p>
    <div className="mission-actions"><button className="primary" onClick={onBegin}>開始任務</button><button onClick={onClose}>返回主選單</button></div>
  </section></div>;
}
