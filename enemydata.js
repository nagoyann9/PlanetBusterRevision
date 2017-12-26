/*

	Planet Buster enemy data
	2012/01/28

*/

//file			画像ファイル
//width,heigh	画像サイズ
//colx,coly		当たり判定位置
//colw,colh		画像サイズ
//point			得点
//def			耐久力
//burn			破壊パターン	0:小 1:中 2以上:大（爆発エフェクト数）
//type			敵タイプ		0:小型 1:中型 2:大型 3:ボス 5:アイテム
//				アイテムの場合  0:power 1:bomb 2:1up

var enemydata = {
//Item
'CarrierP':		{file: 'media/enemy8.png',	w: 56, h:128, colx:  0, coly:  0, colw: 56, colh:128, point: 1000, def:  300, burn:10, type: 0 },
'CarrierB':		{file: 'media/enemy8.png',	w: 56, h:128, colx:  0, coly:  0, colw: 56, colh:128, point: 1000, def:  300, burn:10, type: 1 },
'CarrierE':		{file: 'media/enemy8.png',	w: 56, h:128, colx:  0, coly:  0, colw: 56, colh:128, point: 1000, def:  300, burn:10, type: 2 },
'Power':		{file: 'media/item.png',	w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  200, def:10000, burn: 0, type: 0 },
'Bomb':			{file: 'media/item.png',	w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  200, def:10000, burn: 0, type: 1 },
'Extend':		{file: 'media/item.png',	w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  200, def:10000, burn: 0, type: 2 },

//Stage1
'SkyFish':		{file: 'media/enemy5_1.png',	w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  200, def:   50, burn: 0, type: 0 },
'SkyFish2':		{file: 'media/enemy5_1.png',	w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  200, def:   50, burn: 0, type: 0 },
'SkyBox':		{file: 'media/enemy6_1.png',	w:104, h: 64, colx:  0, coly:  0, colw:104, colh: 60, point: 1200, def:  500, burn:10, type: 1 },
'SkyBlade':		{file: 'media/enemy7_1.png',	w: 48, h:104, colx:  0, coly:  0, colw: 48, colh:104, point: 1500, def:  300, burn:10, type: 1 },

//Stage2
'Attacker':		{file: 'media/enemy1.png',		w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  300, def:  100, burn: 0, type: 0 },
'Attacker2':	{file: 'media/enemy1.png',		w: 32, h: 32, colx:  0, coly:  0, colw: 32, colh: 32, point:  300, def:  100, burn: 0, type: 0 },
'BigWing':		{file: 'media/enemy2.png',		w:128, h: 47, colx:  0, coly: 27, colw:128, colh: 20, point: 1500, def:  700, burn:10, type: 1 },
'Delta':		{file: 'media/enemy3.png',		w: 64, h: 48, colx: 12, coly:  8, colw: 40, colh: 40, point:  800, def:  200, burn: 1, type: 1 },
'Trident':		{file: 'media/enemy4.png',		w:120, h: 80, colx: 34, coly:  0, colw: 60, colh: 80, point: 1000, def:  400, burn: 3, type: 1 },
'Missile':		{file: 'media/missile.png',		w: 32, h:128, colx:  0, coly:  0, colw: 32, colh:128, point:  500, def:  200, burn: 3, type: 1 },

//Stage1 Boss
'SkyBreaker':	{file: 'media/boss1_body.png',	w:168, h:112, colx:  0, coly:  0, colw:168, colh:102, point:50000, def:18000, burn: 3, type: 3 },
'SkyBreaker_L':	{file: 'media/boss1_L.png',		w: 56, h: 64, colx:  0, coly:  0, colw: 56, colh: 64, point:20000, def: 3000, burn:10, type: 3 },
'SkyBreaker_R':	{file: 'media/boss1_R.png',		w: 56, h: 64, colx:  0, coly:  0, colw: 56, colh: 64, point:20000, def: 3000, burn:10, type: 3 },
'SkyBreaker_C':	{file: 'media/boss1_cannon.png',w: 16, h: 32, colx:  0, coly:  0, colw: 16, colh: 32, point:10000, def: 1500, burn: 1, type: 3 },

//Stage2 Boss
'Goriate':		{file: 'media/boss2_body.png',	w: 64, h: 80, colx:  0, coly:  0, colw: 64, colh: 80, point:50000, def: 7500, burn: 0, type: 3 },
'Goriate_L':	{file: 'media/boss2_engine.png',w: 56, h:200, colx:  0, coly:  0, colw: 56, colh:200, point:20000, def: 5000, burn: 0, type: 3 },
'Goriate_R':	{file: 'media/boss2_engine.png',w: 56, h:200, colx:  0, coly:  0, colw: 56, colh:200, point:20000, def: 5000, burn: 0, type: 3 },
'Goriate_T':	{file: 'media/boss2_turret.png',w: 24, h: 24, colx:  0, coly:  0, colw: 24, colh: 24, point: 5000, def:  300, burn: 0, type: 3 },
'Goriate_WL':	{file: 'media/boss2_wingL.png',	w: 16, h:112, colx:  0, coly:  0, colw: 16, colh:112, point:10000, def:  800, burn:10, type: 3 },
'Goriate_WR':	{file: 'media/boss2_wingR.png',	w: 16, h:112, colx:  0, coly:  0, colw: 16, colh:112, point:10000, def:  800, burn:10, type: 3 },

}
