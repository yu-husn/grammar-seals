import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bossDefeatPose,bossDefeatDuration,reducedBossDefeatDuration} from '../src/bossDefeat';
import {useGame} from '../src/store';

test('無言君先完整倒下才淡出，最後完全消失；一般與減少動畫均有限時完成',()=>{
 for(const reduced of [false,true]){const duration=reduced?reducedBossDefeatDuration:bossDefeatDuration;let previousAngle=0,previousOpacity=1,sawFall=false,sawFade=false;
  for(let t=0;t<duration;t+=.01){const p=bossDefeatPose(t,reduced);assert.ok(Number.isFinite(p.angle)&&Number.isFinite(p.opacity));assert.ok(p.angle>=previousAngle-.00001&&p.angle<=Math.PI/2);assert.ok(p.opacity<=previousOpacity+.00001&&p.opacity>=0&&p.opacity<=1);if(p.stage==='falling'){sawFall=true;assert.equal(p.opacity,1)}if(p.opacity<1){sawFade=true;assert.ok(p.angle>1.4,'身體倒下後才能淡出')}if(reduced)assert.equal(p.particles,false);previousAngle=p.angle;previousOpacity=p.opacity;}
  assert.ok(sawFall&&sawFade);assert.equal(bossDefeatPose(duration,reduced).stage,'gone');assert.equal(bossDefeatPose(duration,reduced).opacity,0);assert.equal(bossDefeatPose(duration+10,reduced).gone,true);
 }
});

test('觀看魔王倒下或等待最終封印時不扣時間，也不再受攻擊，未擊敗前仍正常受擊倒數',()=>{
 const previous=useGame.getState();try{useGame.setState({phase:'play',realm:4,step:16,bossHP:0,question:null,hp:35,seconds:.5,settings:{...previous.settings,countdown:true},hitEvent:{id:9,text:'保留',kind:''}});const g=useGame.getState();g.tick(20);g.hit('spell');assert.equal(useGame.getState().phase,'play');assert.equal(useGame.getState().seconds,.5);assert.equal(useGame.getState().hp,35);assert.equal(useGame.getState().hitEvent.id,9);useGame.setState({bossHP:10,step:15,seconds:10});g.tick(1);g.hit('spell');assert.equal(useGame.getState().seconds,9);assert.equal(useGame.getState().hp,25);}finally{useGame.setState(previous)}
});
