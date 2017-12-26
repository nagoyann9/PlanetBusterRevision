/*

	Planet Buster Stage 2 Data
	2012/01/28

*/

//                --1-- --2-- --3-- --4-- --5-- --6-- --7-- --8-- --9-- --10-
var stageData2 = "_____ 1____ _____ 1____ 2____ _____ 12___ 34___ _____ 5____"+
				 "_____ 6____ P____ 15___ _____ 26___ 7____ _____ 8____ 12___"+
				 "15___ _____ 18___ a____ b____ _____ 1c___ 34I__ _____ _____"+
				 "_____ E____ _____ W____ _____ _____ B____";
stageData2 = stageData2.replace(/ /g, "");	//空白を削除

//name		敵タイプ
//x,y		出現位置
//offset	出現フレームオフセット

var patterns2 = {
_: [{name: 'nop'}],

P: [{name: 'CarrierP',x:160, y:-128, offset: 0}],
I: [{name: 'CarrierB',x:120, y:-128, offset: 0}],

1: [{name: 'Attacker', x: -60, y: 0, offset:  0},
	{name: 'Attacker', x: -60, y: 0, offset: 30},
	{name: 'Attacker', x: -60, y: 0, offset: 60},
	{name: 'Attacker', x: -60, y: 0, offset: 90}],

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
c: [{name: 'Trident',	x:  80, y: -120, offset: 0},
	{name: 'Trident',	x: 130, y: -120, offset:60}],

B: [{name: 'Goriate',	x: 128, y:-200, offset: 0}],
}
