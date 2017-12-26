/*

	Planet Buster Stage 3 Data
	2012/01/28

*/

//                --1-- --2-- --3-- --4-- --5-- --6-- --7-- --8-- --9-- --10-
var stageData3 = "____ 1a___ 2____ I___ 12I__ 12___ ____ 5____ _____ 6____"+
				 "_____ 15___ _____ 26___ 7P___ _____ 8____ 128__ 15___ _____"+
				 "18___ a____ b____ _____ 1a___ 5c___ 10____ 5____ ___ _____"+
				 "W____ _____ _____ Bdf_";
stageData3 = stageData3.replace(/ /g, "");	//空白を削除

//name		敵タイプ
//x,y		出現位置
//offset	出現フレームオフセット

var patterns3 = {
_: [{name: 'nop'}],

P: [{name: 'CarrierP',x:160, y:-128, offset: 0}],
I: [{name: 'CarrierB',x:120, y:-128, offset: 0}],

1: [{name: 'Attacker', x: -60, y: 0, offset: 0},
	{name: 'Attacker', x: -60, y: 0, offset: 30},
	{name: 'Attacker', x: -60, y: 0, offset: 60},
	{name: 'Attackerr', x:-60, y: 0, offset: 90}],

2: [{name: 'Attacker', x: 360, y: 0, offset:  0},
	{name: 'Attacker', x: 360, y: 0, offset: 30},
	{name: 'Attacker', x: 360, y: 0, offset: 60},
	{name: 'Attacker', x: 360, y: 0, offset: 90}],

3: [{name: 'Attacker2',	x: -60, y: 0, offset:  0},
	{name: 'Attacker2',	x: -60, y: 0, offset: 30},
	{name: 'Attacker2',	x: -60, y: 0, offset: 60},
	{name: 'Attacker2',	x: -60, y: 0, offset: 90}],

4: [{name: 'Attacker2',	x: 360, y: 0, offset:  0},
	{name: 'Attacker2',	x: 360, y: 0, offset: 30},
	{name: 'Attacker2',	x: 360, y: 0, offset: 60},
	{name: 'Attacker2',	x: 360, y: 0, offset: 90}],

5: [{name: 'BigWing', x: 120, y: -60, offset: 0}],
6: [{name: 'BigWing', x:  10, y: -60, offset: 0}],
7: [{name: 'BigWing', x: 230, y: -60, offset:50},
	{name: 'BigWing', x:  20, y: -60, offset:60}],

8: [{name: 'Delta',	x:  20, y: -60, offset: 0},
	{name: 'Delta', x: 250, y: -60, offset: 0}],

9: [{name: 'Delta',	x:  10, y: 330, offset: 0},
	{name: 'Delta', x: 300, y: 330, offset: 0}],

0: [{name: 'Delta',	x:  20, y: -60, offset: 0},
	{name: 'Delta', x: 250, y: -60, offset: 0},
	{name: 'Delta',	x:  20, y: -60, offset:60},
	{name: 'Delta', x: 250, y: -60, offset:60}],

a: [{name: 'Trident',	x:  20, y: -120, offset: 0}],
b: [{name: 'Trident',	x: 200, y: -120, offset: 0}],
c: [{name: 'Trident',	x:  20, y: -120, offset: 0},
	{name: 'Trident',	x: 130, y: -120, offset:90}],
	
d: [{name: 'BigWing', x: 120, y: -500, offset: 0}],
e: [{name: 'BigWing', x:  10, y: -600, offset: 0}],

f: [{name: 'Delta',	x:  20, y: -700, offset: 0},
	{name: 'Delta', x: 250, y: -700, offset: 0}],


B: [{name: 'Goriate',	x: 128, y: -150, offset: 0}],
}
