import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBoard,matchCells,possibleMove,swap,resolveBoard,connectedGroup,blastCells,groupHint} from '../src/gemEngine';
function random(seed=123){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
test('起始棋盤無自動消除，且能合法交換及找到同色群組',()=>{for(let i=0;i<40;i++){const b=createBoard(random(i));assert.equal(matchCells(b).length,0);assert.ok(possibleMove(b));assert.ok(groupHint(b).length>=2)}});
test('只有相鄰交換且確實連三才成立，原棋盤不被改動',()=>{const b=createBoard(random()),copy=JSON.stringify(b),move=possibleMove(b)!;assert.ok(swap(b,...move));assert.equal(swap(b,{r:0,c:0},{r:5,c:5}),null);assert.equal(swap(b,{r:0,c:0},{r:-1,c:0}),null);assert.equal(JSON.stringify(b),copy)});
test('群組只連上下左右同色，爆破十字共有11顆且不重複',()=>{const b=createBoard(random());b[0][0]=1;b[0][1]=1;b[1][0]=1;b[1][1]=2;const group=connectedGroup(b,{r:0,c:0});assert.ok(group.length>=3);assert.ok(!group.some(p=>p.r===1&&p.c===1));const hits=blastCells({r:2,c:3});assert.equal(hits.length,11);assert.equal(new Set(hits.map(c=>`${c.r},${c.c}`)).size,11)});
test('答對後的消除補位收斂，保持可玩；強制群組和爆破都能處理',()=>{const b=createBoard(random());const next=swap(b,...possibleMove(b)!)!;const r=resolveBoard(next,random(12));assert.ok(r.cleared>=3);assert.equal(matchCells(r.board).length,0);assert.ok(possibleMove(r.board));const forced=resolveBoard(b,random(22),blastCells({r:3,c:2}));assert.ok(forced.cleared>=11);assert.equal(matchCells(forced.board).length,0)});
