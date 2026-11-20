import {sectionGrade,type GradeBook} from './grading';
export const stages=[
  {id:'realm0',name:'行跡迷城',short:'行跡',stamp:'narrative',glyph:'敘'},
  {id:'gems',name:'靈印寶石陣',short:'寶石',stamp:'gems',glyph:'晶'},
  {id:'realm1',name:'幻象迷宮',short:'幻象',stamp:'attribute',glyph:'表'},
  {id:'realm2',name:'真假審判',short:'審判',stamp:'judgment',glyph:'判'},
  {id:'blast',name:'句型石轟擊',short:'轟擊',stamp:'blast',glyph:'轟'},
  {id:'realm3',name:'虛實禁域',short:'虛實',stamp:'existence',glyph:'有'},
] as const;
export type StageId=typeof stages[number]['id']|'boss';
export function addStage(passed:StageId[],id:StageId){return passed.includes(id)?passed:[...passed,id]}
export function migratePassedStages(raw:unknown,unlocked:number,grades:GradeBook):StageId[]{const valid:string[]=[...stages.map(s=>s.id),'boss'];let result:StageId[]=Array.isArray(raw)?[...new Set(raw.filter(s=>valid.includes(s)))]:[];for(let i=0;i<4;i++)if(unlocked>i)result=addStage(result,`realm${i}` as StageId);for(const id of ['gems','blast'] as const)if(sectionGrade(grades,id).completed===7)result=addStage(result,id);return result}
