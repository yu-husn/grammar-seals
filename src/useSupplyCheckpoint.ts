import {useEffect} from 'react';
import {useGame} from './store';
import type {SupplyId,SupplySnapshot} from './supply';
export function useSupplyCheckpoint(section:SupplyId,snapshot:SupplySnapshot,busy=false){
 const serialized=JSON.stringify(snapshot);
 useEffect(()=>{if(!busy)useGame.getState().saveSupplyAttempt(section,JSON.parse(serialized));},[section,serialized,busy]);
}
