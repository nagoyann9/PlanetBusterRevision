/*

	Planet Buster Stage 1 Data
	2012/01/28

*/

//                --1-- --2-- --3-- --4-- --5-- --6-- --7-- --8-- --9-- --10-
var stageData1 = "_____ 1____ 2____ _____ 3____ _____ 4____ _____ 5____ 6____ "+
				 "1____ 3____ 4____ P____ 2____ 8____ _____ 1____ _____ 7____ "+
				 "_____ 4____ _5___ _____ 1____ 5____ 6____ 8____ I____ 4____ "+
				 "W____ _____ _____ B____";
stageData1 = stageData1.replace(/ /g, "");	//空白を削除

//name		敵名称
//x,y		出現位置
//offset	出現フレームオフセット

var patterns1 = {
_: [{name: 'nop'}],

P: [{name: 'CarrierP',x:160, y:-128, offset: 0}],
I: [{name: 'CarrierB',x:100, y:-128, offset: 0}],

1: [{name: 'SkyFish', x:  0, y: -32, offset:  0},
	{name: 'SkyFish', x: 60, y: -40, offset: 20},
	{name: 'SkyFish', x:100, y: -60, offset: 40},
	{name: 'SkyFish', x: 50, y: -10, offset: 60},
	{name: 'SkyFish', x:120, y: -20, offset: 80},
	{name: 'SkyFish', x: 90, y: -30, offset:100},
	{name: 'SkyFish', x: 20, y: -30, offset:120},
	{name: 'SkyFish', x:140, y: -50, offset:140}],

2: [{name: 'SkyFish', x:300, y: -32, offset:  0},
	{name: 'SkyFish', x:130, y: -40, offset: 20},
	{name: 'SkyFish', x:230, y: -60, offset: 40},
	{name: 'SkyFish', x:110, y: -10, offset: 60},
	{name: 'SkyFish', x:260, y: -20, offset: 80},
	{name: 'SkyFish', x:120, y: -30, offset:100},
	{name: 'SkyFish', x:200, y: -30, offset:120},
	{name: 'SkyFish', x:150, y: -50, offset:140}],

3: [{name: 'SkyFish2', x:  0, y: -32, offset:  0},
	{name: 'SkyFish2', x: 60, y: -40, offset: 20},
	{name: 'SkyFish2', x:100, y: -60, offset: 40},
	{name: 'SkyFish2', x: 50, y: -10, offset: 60},
	{name: 'SkyFish2', x:120, y: -20, offset: 80},
	{name: 'SkyFish2', x: 90, y: -30, offset:100},
	{name: 'SkyFish2', x: 20, y: -30, offset:120},
	{name: 'SkyFish2', x:140, y: -50, offset:140}],

4: [{name: 'SkyFish2', x:300, y: -32, offset:  0},
	{name: 'SkyFish2', x:130, y: -40, offset: 20},
	{name: 'SkyFish2', x:230, y: -60, offset: 40},
	{name: 'SkyFish2', x:110, y: -10, offset: 60},
	{name: 'SkyFish2', x:260, y: -20, offset: 80},
	{name: 'SkyFish2', x:120, y: -30, offset:100},
	{name: 'SkyFish2', x:200, y: -30, offset:120},
	{name: 'SkyFish2', x:150, y: -50, offset:140}],

5: [{name: 'SkyBox', x:-104, y: 10, offset: 0}],

6: [{name: 'SkyBox', x: 330, y: 40, offset: 0}],

7: [{name: 'SkyBox', x:-104, y: 70, offset: 0},
	{name: 'SkyBox', x: 330, y: 90, offset:60}],

8: [{name: 'SkyBlade', x:  20, y: -128, offset: 0},
	{name: 'SkyBlade', x: 250, y: -128, offset: 0}],

B: [{name: 'SkyBreaker',x: 70, y:-200, offset: 0}],
}
