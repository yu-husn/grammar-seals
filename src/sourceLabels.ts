/** Display names are separate from persisted source keys and review status. */
export function sourceLabel(source:string):string {
  if(source==='教師審核題')return '教師輸入';
  if(source==='原創練習題')return 'AI編寫';
  return source;
}
