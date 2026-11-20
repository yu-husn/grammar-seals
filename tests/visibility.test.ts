import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {normalizeBrightness} from '../src/visibility';
test('教師指定固定140%亮度，舊設定或無效值不再影響畫面',()=>{for(const n of [undefined,null,'',NaN,Infinity,'錯誤',-1,9,1.8])assert.equal(normalizeBrightness(n),1.4)});
test('固定亮度不改成績、六關章、角色與當前作答',()=>{const before=useGame.getState(),keys=['grades','passedStages','hero','save','question','step','seconds','hp','records'] as const;before.configure({brightness:1.8});const after=useGame.getState();for(const key of keys)assert.deepEqual(after[key],before[key]);assert.equal(after.settings.brightness,1.4);assert.equal(JSON.parse(localStorage.getItem('grammar-seals-v1')!).state.settings.brightness,1.4)});
test('第六版舊放大及高亮設定遷移為標準100%與140%，保留通關和分數',async()=>{const old={settings:{fontScale:1.5,brightness:1.8},passedStages:['realm0'],unlocked:1,grades:{'realm0:0':{questionId:'one',wrong:false,credit:1}}};const next=await useGame.persist.getOptions().migrate!(old,6);assert.equal(next.settings?.fontScale,1);assert.equal(next.settings?.brightness,1.4);assert.deepEqual(next.grades,old.grades);assert.deepEqual(next.passedStages,old.passedStages)});
