import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bossStones,bossStoneOrder,bossTargetStone,bossWalkRadius,bossThroneBounds} from '../src/bossArena';
import {currentTarget,isNearTarget,targetName,interactionRadius} from '../src/campaign';
import {keepClearOfMechanisms} from '../src/worldCollision';
import {useGame,migrateSave} from '../src/store';
import {buildBossVolley,bossProjectileLifetime} from '../src/bossAttacks';
test('十六題啟動中央及七座周邊石碑，相鄰題的互動範圍不重疊，不能站中央連答',()=>{
 assert.equal(bossStoneOrder.length,16);assert.equal(new Set(bossStoneOrder).size,8);assert.equal(bossStoneOrder[0],0);assert.equal(bossStoneOrder[15],0);
 for(let step=0;step<16;step++){const s=bossTargetStone(step);assert.deepEqual(currentTarget(4,step),[s.x,s.z]);assert.ok(targetName(4,step).includes(s.name));assert.ok(isNearTarget(4,step,s.x,s.z));if(step){const previous=bossTargetStone(step-1);assert.ok(Math.hypot(s.x-previous.x,s.z-previous.z)>interactionRadius*2);for(let i=0;i<16;i++){const angle=i*Math.PI/8;assert.equal(isNearTarget(4,step,previous.x+Math.cos(angle)*2.49,previous.z+Math.sin(angle)*2.49),false)}}}
 assert.deepEqual(currentTarget(4,16),[0,-3]);assert.equal(isNearTarget(4,1,0,-1.6),false);
});

test('王座後沒有題目柱，第九題改到入口側，保留其他石碑編號與十六題進度',()=>{
 assert.equal(bossStones.length,8);assert.equal(bossStones.some(stone=>stone.index===5||stone.z<=-11||stone.name.includes('王座後')),false);
 assert.equal(bossTargetStone(8).index,1);assert.equal(bossTargetStone(8).name,'入口側石碑');
 for(const index of bossStoneOrder)assert.ok(bossStones.some(stone=>stone.index===index));
 assert.equal(bossTargetStone(7).index,6);assert.equal(bossTargetStone(9).index,2);assert.equal(bossTargetStone(14).index,6);
 const behind=keepClearOfMechanisms(4,0,-14,0,-14.4);assert.deepEqual(behind,{x:0,z:-14});
});
test('外圍石碑與王座有碰撞，所有目標都能沿祭壇內合法路徑到達',()=>{
 const routes:[number,number][][]=[[[0,-1.6]],[[-6.3,3.8]],[[6.3,3.8]],[[0,6.4]],[[4.5,0],[9.3,-3]],[[4.5,0],[-4.5,0],[-9.3,-3]],[[-4.5,-6],[4.5,-6],[6.3,-9.5]],[[4.5,-7],[-4.5,-7],[-6.3,-9.5]],[[-6.3,-3],[-4.5,3],[0,6.4]],[[6.3,3.8]],[[4.5,0],[-4.5,0],[-6.3,3.8]],[[0,0],[4.5,0],[9.3,-3]],[[4.5,0],[-4.5,0],[-9.3,-3]],[[-4.5,-6],[4.5,-6],[6.3,-9.5]],[[4.5,-7],[-4.5,-7],[-6.3,-9.5]],[[-4.5,-7],[-4.5,0],[0,-1.6]]];
 let p={x:0,z:6},length=0;
 for(let step=0;step<16;step++){for(const [x,z] of routes[step]){let n=0;while(Math.hypot(x-p.x,z-p.z)>.18&&n++<500){const d=Math.hypot(x-p.x,z-p.z),next=keepClearOfMechanisms(4,p.x+(x-p.x)/d*.12,p.z+(z-p.z)/d*.12,p.x,p.z);length+=Math.hypot(next.x-p.x,next.z-p.z);p=next;assert.ok(Math.hypot(p.x,p.z+3)<=bossWalkRadius+.0001);const b=bossThroneBounds;assert.ok(!(p.x>b.left&&p.x<b.right&&p.z>b.back&&p.z<b.front))}assert.ok(n<500,`第${step+1}題路徑可達`)}assert.ok(isNearTarget(4,step,p.x,p.z),`第${step+1}題可在碑外解讀`)}
 assert.ok(length/4.5<180,'不含讀題的行走距離可在240秒內完成');for(const s of bossStones){const p=keepClearOfMechanisms(4,s.x,s.z,s.x,s.z+1.8);assert.ok(Math.hypot(p.x-s.x,p.z-s.z)>=(s.index===0?1.1:.8)-.0001)}
});
test('第13版進行中魔王存檔只補一次40秒，其他關卡不加時，合法逆時珠上限250',async()=>{
 const previous=useGame.getState();try{const raw={settings:{seconds:200},unlocked:4,journeyCleared:['realm0','gems','realm1','realm2','blast','realm3'],grades:{},timeUsed:[],save:{version:4,realm:4,step:5,seals:[0,1,2,3],hp:70,seconds:150,mistakes:1,combo:0,cleared:false}};
 const migrated=await useGame.persist.getOptions().migrate!(raw,13);assert.equal(migrated.save!.seconds,190);useGame.setState({...migrated,phase:'menu'});await useGame.persist.rehydrate();assert.equal(useGame.getState().save!.seconds,190);useGame.getState().start(true);assert.equal(useGame.getState().seconds,190);
 const older=await useGame.persist.getOptions().migrate!({...raw,settings:{seconds:240}},12);assert.equal(older.save!.seconds,150);const normal=await useGame.persist.getOptions().migrate!({...raw,save:{...raw.save,realm:0}},13);assert.equal(normal.save!.seconds,150);assert.equal(migrateSave({...raw.save,seconds:249},10)!.seconds,249);assert.equal(migrateSave({...raw.save,seconds:300},10)!.seconds,250);
 }finally{useGame.setState(previous)}
});
test('保留的邊碑也會被四種彈幕瞄準，並位於既有炮彈有效射程內',()=>{
 for(const target of bossStones)for(let pattern=0;pattern<4;pattern++){const volley=buildBossVolley(0,pattern,target);for(const origin of volley.origins){const shot=volley.shots.find(s=>s.x===origin.x&&s.z===origin.z)!;const dx=target.x-shot.x,dz=target.z-shot.z;assert.ok(Math.abs(dx*shot.vz-dz*shot.vx)<.0000001);assert.ok(dx*shot.vx+dz*shot.vz>0);assert.ok(Math.hypot(dx,dz)/Math.hypot(shot.vx,shot.vz)<bossProjectileLifetime)}}
});
