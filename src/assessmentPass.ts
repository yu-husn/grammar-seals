import {assessmentResult,type GradeBook,type SectionId} from './grading';
import type {StageId} from './stageProgress';

/** Revoke an old current-round victory that does not meet the new pass threshold. */
export function reconcileAssessmentPass(journeyCleared:SectionId[],passedStages:StageId[],grades:GradeBook){
 if(!journeyCleared.includes('realm4')||assessmentResult(grades).passed)return {journeyCleared,passedStages};
 return {journeyCleared:journeyCleared.filter(id=>id!=='realm4'),passedStages:passedStages.filter(id=>id!=='boss')};
}
