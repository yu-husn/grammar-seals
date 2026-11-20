export const MISSION_LENGTH=6;
export const categories = ['敘事句','表態句','判斷句','有無句'] as const;
export type Category = typeof categories[number];
export const answerChoices:Category[]=['敘事句','有無句','判斷句','表態句'];
export interface Question {id:string;stem:string;sentence:string;options:string[];answer:number;category:Category;components:{text:string;role:string}[];explanation:string;commonError:string;difficulty:number;level:string;sourceType:'原創練習題'|'真實考題'|'教師審核題'|'歷屆選項改編';sourceUrl:string;examYear:string|null;examNumber:string|null;reviewStatus:'原創已檢核'|'待教師審核'|'教師已核准'|'改編已檢核';originalOption?:string;sourceNote?:string;kind:'辨識'|'解剖'|'陷阱'|'證詞'|'連擊'}
const rows = [
`小鳥|飛翔
弟弟|閱讀|小說
學生|走進|教室
他|沒有完成|作業
守衛|推開|城門
旅人|點燃|燈籠
船夫|划動|船槳
老師|批改|作業
妹妹|整理|書包
工匠|修補|屋頂
信差|送來|書信
孩子|撿起|石子
村民|種植|稻米
獵人|追蹤|腳印
商人|收拾|貨物
書生|抄寫|文章
母親|烹煮|晚餐
父親|修理|桌子
僧人|敲響|古鐘
士兵|守護|城池
小貓|追逐|蝴蝶
漁夫|撒下|漁網
園丁|修剪|樹枝
少年|攀登|山峰
女孩|打開|窗戶
詩人|吟誦|詩篇
弟弟|沒有帶來|雨傘
村長|宣布|消息
客人|放下|行李
樂師|吹奏|笛子`,
`天氣|寒冷
山色|青翠
他的態度|十分誠懇
古城|寂靜
夜色|深沉
石階|濕滑
燈光|微弱
天空|晴朗
湖水|清澈
花朵|鮮豔
道路|寬闊
城牆|高大
房間|整潔
茶水|滾燙
風聲|尖銳
月光|柔和
香氣|濃郁
笑容|燦爛
腳步聲|急促
竹林|茂密
山路|崎嶇
泉水|冰涼
歌聲|悠揚
神情|嚴肅
空氣|潮濕
庭院|幽靜
石碑|古老
視線|模糊
衣服|乾淨
晚霞|絢麗`,
`孔子|思想家
臺灣|海島
李白|詩人
鯨魚|哺乳類動物
竹子|植物
故宮|博物館
他|守門人
這本書|字典
王老師|國文教師
這座建築|圖書館
這張紙|通行證
這幅畫|山水畫
這把鑰匙|寶庫的鑰匙
那位老人|村長
這件物品|古董
這座橋|石橋
這個地方|驛站
這個容器|茶壺
這枚印章|敘事靈印
這個房間|書房
那個人|船夫
這件衣服|雨衣
這首作品|民謠
這種動物|候鳥
這座島嶼|火山島
這條河|淡水河
這位客人|醫師
這個字|象形字
這項活動|比賽
這個故事|寓言`,
`桌上|有|一本書
他|有|三本小說
教室裡|沒有|學生
寶庫裡|有|一枚靈印
城外|有|一座橋
袋子裡|沒有|金幣
牆上|有|一道裂縫
井裡|沒有|水
村中|有|一位醫師
這間屋子|沒有|窗戶
書架上|有|五本書
地上|有|一串腳印
山上|有|一座古寺
箱子裡|沒有|鑰匙
天空中|有|幾顆星星
她|有|一把雨傘
我|沒有|零用錢
門口|有|兩盞燈籠
這裡|沒有|出口
河裡|有|魚
庭院裡|有|一棵梅樹
房內|無|旁人
此地|無|銀三百兩
村裡|沒有|學校
他|有|一間書房
桌下|有|一隻小貓
城中|無|糧食
山谷裡|沒有|人煙
船上|有|乘客
盒內|無|寶物`
];
export const bank:Question[] = rows.flatMap((block,c)=>block.split('\n').map((row,i)=>{
const [subject,predicate,object] = row.split('|');const category=categories[c];
const sentence=c===2?`${subject}是${predicate}。`:`${subject}${predicate}${object??''}。`;
const components=c===2?[{text:subject,role:'主語'},{text:'是',role:'繫詞'},{text:predicate,role:'斷語'}]:[{text:subject,role:'主語'},{text:predicate,role:c===1?'表語':'述語'},...(object?[{text:object,role:'賓語'}]:[])];
const why=[`「${predicate}」敘述動作；分析「${subject}」做了什麼。${predicate.startsWith('沒有')?'「沒有」否定後面的動作，不是表示事物不存在。':''}`,`「${predicate}」描述「${subject}」的性質或狀態，是主要表語。`,`「${subject}」的身分類別被判定為「${predicate}」；「是」連結主語與斷語。`,`「${predicate}」表示「${object}」的存在、領有或欠缺，是主要述語。`][c];
return {id:`original-${c}-${i}`,stem:'這道封印上的句子屬於哪一種句型？',sentence,options:[...answerChoices],answer:answerChoices.indexOf(category),category,components,explanation:why,commonError:'應檢查主要述謂關係，不能只看單一關鍵字。',difficulty:predicate.startsWith('沒有')?2:1,level:'行跡迷城',sourceType:'原創練習題',sourceUrl:'',examYear:null,examNumber:null,reviewStatus:'原創已檢核',kind:'辨識'};
}));
export function validateQuestion(q:Question):string[]{const e:string[]=[];if(!q.id||!q.stem||!q.sentence)e.push('缺少識別資料或題幹');if(!categories.includes(q.category))e.push('句型不合法');if(!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)e.push('選項或答案無效');if(!q.explanation||!q.commonError||!q.components?.length)e.push('缺少解析或成分');if(!['辨識','解剖','陷阱','證詞','連擊'].includes(q.kind))e.push('題型無效');if(!['原創練習題','真實考題','教師審核題','歷屆選項改編'].includes(q.sourceType))e.push('來源類型無效');if(q.sourceType==='真實考題'&&!q.sourceUrl)e.push('真實題缺少來源');return e;}
