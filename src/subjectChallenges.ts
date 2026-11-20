import type {Question} from './questions';
export type SubjectChallenge=Question & {target:'完整主語'|'主語中心語'|'省略主語'|'倒裝主語'};
const base={category:'敘事句' as const,commonError:'先找主要述語，再問「誰／什麼」發出動作；不要把修飾語或賓語當成主語。',difficulty:1,level:'尋主定印',sourceType:'原創練習題' as const,sourceUrl:'',examYear:null,examNumber:null,reviewStatus:'原創已檢核' as const,kind:'解剖' as const};
export const subjectChallenges:SubjectChallenge[]=[
{...base,id:'subject-full-01',target:'完整主語',stem:'選出完整主語，點亮尋主石碑。',sentence:'提著燈籠的少年推開古城的門。',options:['提著燈籠的少年','少年','燈籠','古城的門'],answer:0,components:[{text:'提著燈籠的少年',role:'主語'},{text:'推開',role:'述語'},{text:'古城的門',role:'賓語'}],explanation:'先找主要動詞「推開」；誰推開？「提著燈籠的少年」。完整主語包含修飾語「提著燈籠的」，中心語才是「少年」。'},
{...base,id:'subject-attribute-01',target:'完整主語',stem:'選出全句的完整主語。',sentence:'屋頂上的雨水滴落下來。',options:['屋頂','屋頂上的雨水','滴落','下來'],answer:1,components:[{text:'屋頂上的雨水',role:'主語'},{text:'滴落下來',role:'述語'}],explanation:'什麼滴落下來？「屋頂上的雨水」。「屋頂上的」修飾「雨水」，單獨的「屋頂」不是主語。'},
{...base,id:'subject-omitted-01',target:'省略主語',stem:'判斷主語是否出現；若未出現，選出合理補入的主語。',sentence:'請推開城門。',options:['城門','請','主語省略，可補入「你／你們」','推開'],answer:2,components:[{text:'（你／你們）',role:'省略主語'},{text:'推開',role:'述語'},{text:'城門',role:'賓語'}],explanation:'這是請求對方行動的句子，主語「你／你們」省略。「城門」是被推開的對象，作賓語。'},
{...base,id:'subject-inverted-01',target:'倒裝主語',difficulty:2,stem:'先還原正常語序，再找主語。',sentence:'出現了，那位守門人。',options:['出現','那位守門人','了','主語省略'],answer:1,components:[{text:'出現了',role:'述語'},{text:'那位守門人',role:'後置主語'}],explanation:'正常語序為「那位守門人出現了」。出現的是「那位守門人」，所以它是後置的主語。'}
];
