import type {Category} from './questions';
import type {SectionId} from './grading';
export const grammarReview=[
 {category:'敘事句',question:'誰做了什麼？',structure:'主語 ＋ 述語（動詞）＋（賓語）',sentence:'老師批改作業。',segments:[{text:'老師',role:'主語'},{text:'批改',role:'述語'},{text:'作業',role:'賓語'}],explanation:'主要述語「批改」敘述老師的動作；「作業」是批改的對象。',reminder:'主要動詞不一定帶賓語，例如「山巒靜靜地睡了」仍是敘事句。',trap:'「他沒有完成作業」仍是敘事句；「沒有」否定「完成」這個動作。'},
 {category:'表態句',question:'主語怎麼樣？',structure:'主語 ＋ 表語（性質、狀態）',sentence:'山色青翠。',segments:[{text:'山色',role:'主語'},{text:'青翠',role:'表語'}],explanation:'「青翠」描述山色的性質，主要表語不是動作。',reminder:'找出描述性質或狀態的成分，程度副詞不改變主要句型。',trap:'遇到倒裝句，先還原正常語序，再找主語與表語。'},
 {category:'判斷句',question:'主語是什麼？',structure:'主語 ＋（繫詞）＋ 斷語',sentence:'臺灣是海島。',segments:[{text:'臺灣',role:'主語'},{text:'是',role:'繫詞'},{text:'海島',role:'斷語'}],explanation:'「海島」判定臺灣的類別，「是」連接主語與斷語。',reminder:'繫詞常見「是、為、乃」；文言判斷句可以省略繫詞，如「菊，花之隱逸者也」。',trap:'不能只看到「是」就選判斷句；要確認主要關係是否判定身分、類別或歸屬。'},
 {category:'有無句',question:'有什麼？沒有什麼？',structure:'主語 ＋ 述語（有／無等）＋ 賓語',sentence:'他有三本小說。',segments:[{text:'他',role:'主語'},{text:'有',role:'述語'},{text:'三本小說',role:'賓語'}],explanation:'「有」作為主要述語，表示他領有三本小說。',reminder:'「有、無、沒有」須表示存在、領有或欠缺，才是有無句的主要述語。',trap:'「賈人搬有運無」的主要動作是「搬、運」，屬於敘事句。'},
] satisfies {category:Category;question:string;structure:string;sentence:string;segments:{text:string;role:string}[];explanation:string;reminder:string;trap:string}[];
export function reviewFocus(section:SectionId):Category|null{return ({realm0:'敘事句',realm1:'表態句',realm2:'判斷句',realm3:'有無句'} as Partial<Record<SectionId,Category>>)[section]??null}
