import type {Question} from './questions';

const answerDisclosure=/敘事|表態|判斷句|有無(?:句|結構)|(?:答案|正解|應選|應填|選項)\s*[：:為是]?\s*[A-DＡ-Ｄ一二三四1234]/u;

/** Keep verified reasoning clauses; never display the bank's classification conclusion. */
export function reasoningOnly(text:string){
 const clauses:string[]=[];let current='',quoted=0;
 for(const char of text){
  if(char==='「'||char==='『')quoted++;
  current+=char;
  if(char==='」'||char==='』')quoted=Math.max(0,quoted-1);
  if(!quoted&&/[，。；！？\n]/u.test(char)){clauses.push(current);current=''}
 }
 if(current)clauses.push(current);
 return clauses.filter(clause=>!answerDisclosure.test(clause)).join('').trim().replace(/[，；、：:\s]+$/u,'').replace(/[^。！？]$/u,last=>last+'。');
}

const generalMethod='先找出全句主要談論的對象和主要述語，再確認兩者的關係：是在敘述動作、描寫性質或狀態、界定身分類別，還是表示存在或領有？把時間、程度與頻率等修飾語分開，不只看「有、無、是、非」等單一字詞。';

function isComponentTask(q:Question){
 // Old saved questions may label an anatomy task as identification.
 const classificationOptions=q.options.every(option=>/^(敘事|有無|判斷|表態)句$/u.test(option));
 return q.kind==='解剖'||!classificationOptions&&/主語|述語|表語|繫詞|繫語|斷語|賓語|中心語|句子成分/u.test(q.stem);
}

export function studentHint(q:Question){
 if(isComponentTask(q)){
  if(/主語/u.test(q.stem))return /中心語/u.test(q.stem)?'先找主要述語，再問「誰／什麼」是被陳述的對象。將修飾這個對象的詞語暫時拿開，找出主語中最核心的詞。':'先找主要述語，再問「誰／什麼」是被陳述的對象。完整主語應保留修飾這個對象的詞語；遇到倒裝或省略時，先還原一般語序。';
  if(/賓語/u.test(q.stem))return '先找主要動詞，再問動作涉及「誰／什麼」。遇到文言倒裝，先還原一般語序，再比對動詞和受事對象的位置。';
  if(/繫詞/u.test(q.stem))return '找出連結主語與後面身分、類別說明的成分；確認它在全句中的連結作用，而非只看字面。';
  if(/斷語/u.test(q.stem))return '先找出主語與連結成分，再找後面用來界定主語身分、類別或內容的部分；不要只選其中的修飾語。';
  if(/表語/u.test(q.stem))return '先找句子主要談論的對象，再找直接描述其性質、特徵或狀態的成分；分清它和修飾動作的詞語。';
  return '先把時間、程度、頻率等修飾語分開，再找句子主要陳述的動作或關係；必要時先還原省略、倒裝的語序。';
 }
 if(q.kind==='證詞')return '先確認題幹要支持的推論，再逐一分析各份證詞的主要述謂關係；分清動作、狀態、身分類別與存在領有，找出能直接支持推論的證據。';
 const reasoning=reasoningOnly(q.explanation);
 return reasoning?`${reasoning} 請依這些成分的關係，比對各選項的定義後作答。`:generalMethod;
}

export function studentCommonError(q:Question){
 if(isComponentTask(q))return '比較各選項在句中的作用，注意完整成分與中心語的差別；若有省略或倒裝，先還原語序，再自行選擇。';
 return reasoningOnly(q.commonError)||'先釐清主要述謂關係，不只依單一字詞作答。';
}
