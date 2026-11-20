import {useGame} from './store';
import {itemOrder,itemInfo} from './grading';
export default function SupplyInventory(){const items=useGame(s=>s.items);return <section className="supply-inventory" aria-label="隨身道具"><h3>補給背包 · 可帶入探索與決戰</h3><div>{itemOrder.map(id=><article key={id}><img src={itemInfo[id].image} width="40" height="40" alt=""/><b>{itemInfo[id].name}</b><span>{items[id]}{itemInfo[id].unit}</span></article>)}</div><p>誅邪彈、金鐘罩與延命丹開卷各獲得1件；另外三種道具由探索與決戰每累計3題首答正確輪流取得。補給站用積分兌換，持有數量不限。道具會帶往後續禁域與魔王戰，與學科成績分開。</p></section>}
