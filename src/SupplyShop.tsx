import {useGame} from './store';
import {itemInfo,itemOrder} from './grading';
import {supplyCosts,type SupplyId} from './supply';
export default function SupplyShop({section}:{section:SupplyId}){
 const g=useGame(),bank=g.supplyBanks[section],balance=bank.earned-bank.spent;
 return <section className="supply-shop" aria-label="道具補給兌換"><h3>道具補給兌換</h3><p>本站積分 <b data-supply-earned={section}>{bank.earned}</b>／100 · 兩站累計 {g.supplyBanks.gems.earned+g.supplyBanks.blast.earned}／200 · 可用 <b data-supply-balance={section}>{balance}</b> 點</p><p className="supply-note">每份成績卷每站限玩一次、最多100點，兩站合計最多200點。兌換不會恢復積分額度；結束後只可兌換，不能重玩。兌換後可帶往後續禁域與魔王戰。</p>{itemOrder.map(id=>{const item=itemInfo[id],lacking=balance<supplyCosts[id];return <article key={id}><img src={item.image} alt="" width="48" height="48"/><div><h4>{item.name} · {supplyCosts[id]}點</h4><p>{item.description}</p><small>攜帶 {g.items[id]}{item.unit}</small></div><button disabled={lacking} onClick={()=>g.buySupplyItem(section,id)} aria-label={`兌換${item.name}`}>{lacking?'積分不足':'兌換'}</button></article>})}{g.rewardNotice&&<p role="status">{g.rewardNotice}</p>}</section>;
}
