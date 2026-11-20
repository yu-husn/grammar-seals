import {test} from 'node:test';
import assert from 'node:assert/strict';
import {keepClearOfMechanisms,mechanismRadii} from '../src/worldCollision';
test('主角不能穿入四域機關，仍能在互動距離內解題',()=>{for(let r=0;r<4;r++){const p=keepClearOfMechanisms(r,-3,6,-3,8);assert.ok(Math.hypot(p.x+3,p.z-6)>=mechanismRadii[r]-.00001);assert.ok(Math.hypot(p.x+3,p.z-6)<2.5);assert.ok(p.z>6)}});
test('一般走道與碑石後的合法站位保持不變，碑石本體不能成為藏身重疊點',()=>{assert.deepEqual(keepClearOfMechanisms(0,0,10),{x:0,z:10});assert.deepEqual(keepClearOfMechanisms(4,0,-1.5),{x:0,z:-1.5});const p=keepClearOfMechanisms(4,0,-3,0,-1.5);assert.ok(Math.hypot(p.x,p.z+3)>=1.1-.00001)});
