import {journeySections,sectionGrade,type GradeBook,type SectionId} from './grading';
import type {StageId} from './stageProgress';

export const journeyOrder=journeySections.map(s=>s.id);
export function canEnterSection(cleared:readonly SectionId[],id:SectionId){
 const index=journeyOrder.indexOf(id);
 return index>=0&&journeyOrder.slice(0,index).every(previous=>cleared.includes(previous));
}
export function nextJourneySection(cleared:readonly SectionId[]){return journeyOrder.find(id=>!cleared.includes(id))??null}
export function migrateJourney(raw:unknown,grades:GradeBook,passed:StageId[],unlocked:number):SectionId[]{
 const known=Array.isArray(raw)?raw.filter((id):id is SectionId=>journeyOrder.includes(id)):null;
 const cleared=known??journeyOrder.filter(id=>{
  const section=sectionGrade(grades,id);
  if(section.completed!==section.count)return false;
  if(id==='gems'||id==='blast')return true;
  if(id==='realm4')return passed.includes('boss');
  return passed.includes(id as StageId)||unlocked>Number(id.slice(-1));
 });
 // Earlier versions allowed the boss before the two trials. Keep achievements,
 // but require both trials before the new campaign's final battle.
 return journeyOrder.filter(id=>cleared.includes(id)&&(id!=='realm4'||canEnterSection(cleared,'realm4')&&sectionGrade(grades,'realm4').completed===16));
}
