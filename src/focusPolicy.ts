/** Mobile browser chrome can briefly blur a visible page during touch input. */
export function shouldPauseOnWindowBlur(hidden:boolean,coarsePointer:boolean){return hidden||!coarsePointer}
