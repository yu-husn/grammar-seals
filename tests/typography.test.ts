import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFontScale} from '../src/typography';
import {useGame} from '../src/store';
test('教師指定全遊戲固定標準字體，舊放大值也統一為100%',()=>{for(const x of [undefined,NaN,'oops',Infinity,-1,9,1.25,1.5])assert.equal(normalizeFontScale(x),1)});
test('固定標準字體不重設題庫成績角色及存檔',()=>{const g=useGame.getState(),before={grades:g.grades,hero:g.hero,save:g.save,review:g.review};g.configure({fontScale:1.25});assert.equal(useGame.getState().settings.fontScale,1);const stored=JSON.parse(localStorage.getItem('grammar-seals-v1')!);assert.equal(stored.state.settings.fontScale,1);for(const [k,v] of Object.entries(before))assert.deepEqual(useGame.getState()[k as keyof typeof before],v)});
