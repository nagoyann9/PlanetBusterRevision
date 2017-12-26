/*

	Planet Buster
	2012/01/28

	This program is MIT lisence.

*/

//zIndex制御用
var LAYER_SYSTEM		= 200;	//システム
var LAYER_FOREGROUND	= 190;	//前景

var LAYER_EFFECT		= 180;	//特殊効果

var LAYER_OBJECT1		= 170;
var LAYER_OBJECT2		= 160;
var LAYER_OBJECT3		= 150;	//自機
var LAYER_OBJECT4		= 140;	//敵機、弾
var LAYER_OBJECT5		= 130;
var LAYER_OBJECT6		= 120;

var LAYER_GROUND1		= 115;	//地上物
var LAYER_GROUND2		= 110;	//地上物
var LAYER_BACKGROUND	= 100;	//背景

//敵弾種類
var BULLET_SMALL = 0;
var BULLET_MEDIUM1 = 1;	//NORMAL
var BULLET_MEDIUM2 = 2;	//RED
var BULLET_MEDIUM3 = 3;	//GREEN
var BULLET_MEDIUM4 = 4;	//BLUE
var BULLET_BIG = 5;

//敵種類
var ENEMY_SMALL = 0;
var ENEMY_MEDIUM = 1;
var ENEMY_BIG = 2;
var ENEMY_BOSS = 3;

//デバッグフラグ
var debug = false;		//デバッグ情報表示
var debugview = false;	//enchant.jsデバッグスタート
var nodamage = false;	//自機当たり判定無効

enchant();

window.onload = function() {
	game = new Game( 320, 320 );
	game.fps = 30;
	var userAgent = "PC";
	//スマートフォン系の場合はFPSを20にする
	if( (navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) ||
		 navigator.userAgent.indexOf('iPod') > 0 ||
		 navigator.userAgent.indexOf('Android') > 0){
		 game.fps = 20;
		 userAgent = "SmartPhone";
	}
	var vfps = game.fps;	//仮想フレームレート
	var spd = 60/ game.fps;	//ゲーム内速度

	var sec = function( time ){ return ~~(vfps * time); }
	var rand = function( max ){ return ~~(Math.random() * max); }

	game.preload(
		//Graphics
		'font.png', 'media/icon0.gif', 'media/bar.png', 'media/warning.gif', 'media/complete.gif', 'media/bombSwitch.png',
		'media/map_stage1_1.png', 'media/map_stage1_2.png', 'media/map_stage1_3.png', 'media/map_stage1_4.png',
		'media/cloud1.png', 'media/cloud2.png', 'media/cloud3.png', 'media/cloud4.png', 'media/cloud5.png', 'media/cloud6.png',
		'media/map_stage2_1.png', 'media/map_stage2_2.png', 'media/map_stage2_3.png',
		'media/effect1.png', 'media/effect2.png', 'media/effect3.png', 'media/effect4.png', 'media/stargate.png',
		'media/myship.png', 'media/shot1.png', 'media/shot2.png', 'media/bomb.png',
		'media/bullet1.png', 'media/bullet2.png', 'media/bullet2R.png', 'media/bullet2G.png', 'media/bullet2B.png', 'media/bullet3.png', 'media/missile.png',
		'media/enemy1.png', 'media/enemy2.png',	'media/enemy3.png', 'media/enemy4.png',
		'media/enemy5_1.png', 'media/enemy5_2.png', 'media/enemy6_1.png', 'media/enemy6_2.png',
		'media/boss1_body.png', 'media/boss1_L.png', 'media/boss1_R.png', 'media/boss1_cannon.png',
		'media/boss1_rotL.png', 'media/boss1_rotR.png', 'media/boss1_break.png', 'media/boss1_hatch.png',
		'media/boss2_body.png', 'media/boss2_engine.png', 'media/boss2_wingL.png', 'media/boss2_wingR.png', 'media/boss2_turret.png', 'media/boss2_break.png'
	);

	game.onload = function () {

		game.rootScene.backgroundColor = "#000000";

		//ステージデータと出現パターンテーブル
		/////////////////////////////////////////////////////////////////////////////
		var stageData;
		var patterns;

		//環境変数
		/////////////////////////////////////////////////////////////////////////////
		var touch = false;
		
		//キーバインド設定
		/////////////////////////////////////////////////////////////////////////////
		game.keybind( 90, 'a' );
		game.keybind(122, 'a' );

/////////////////////////////////////////////////////////////////////////////
//	ステージ管理
/////////////////////////////////////////////////////////////////////////////

		stage = new Scene();
//		stage = new CanvasGroup();
		stage.level = 1;			//難易度レベル
		stage.max = 2;				//最終ステージ
		stage.number = 1;			//現在ステージ
		stage.time = 0;				//ステージ経過フレーム
		stage.event = false;		//イベント
		stage.score = 0;			//スコア
		stage.life = 3;				//残機
		stage.nomiss = true;		//ノーミスフラグ（ステージ）
		stage.nomissAll = true;		//ノーミスフラグ（全部）
		stage.nobomb = true;		//ノーボムフラグ
		stage.bomb = 1;				//ボムストック数
		stage.bombMax = 1;			//ボムストック最大数
		stage.bombTime = 60;		//ボム効果持続フレーム数
		stage.advance = 0;			//ステージ進行状況
		stage.bossBattle = false;	//ボス戦フラグ
		stage.bossDefMax = 0;		//ボス最大耐久力
		stage.bossDef = 0;			//ボス残り耐久力
		stage.clear = false;		//ステージクリア
		stage.start = function( num ){
			this.time = 0;
			stage.number = num;
		}
		stage.end = function( flag ){
/*
			var rank = "Private";
			if( stage.score >  40000 )rank = "Cadet";
			if( stage.score >  80000 )rank = "Pilot officer";
			if( stage.score > 100000 )rank = "Flying officer";
			if( stage.score > 120000 )rank = "Flight Lieutenant";
			if( stage.score > 140000 )rank = "Ace Pilot";
			if( stage.score > 160000 )rank = "Top Ace Pilot";
			if( stage.score > 180000 )rank = "Captain";
			if( stage.score > 200000 )rank = "Commander";
			if( stage.score > 300000 )rank = "Marshal";
			if( stage.score > 320000 )rank = "Chief Marshal";
			if( stage.score > 400000 )rank = "MARSHAL OF FORCE PARAGON";
			var	msg = "SCORE:"+ stage.score+" Your rank is "+rank+"";
*/
			var msg = "";
			if( flag ){
				msg = "MISSION COMPLETE! SCORE:"+ stage.score;
			}else{
				if( stage.number == 1 ){
					msg = "MISSION FAILED! SCORE:"+ stage.score;
				}else{
					msg = "STAGE 1 CLEAR! SCORE:"+ stage.score;
				}
			}
			game.end( stage.score, msg );
		}
		stage.addEventListener( 'enterframe', function() {
			//ステージ初期化処理
			if( this.time == 0 ){
				player.visible = true;
				eventStartup( sec(1), 160 );
				if( this.number == 1 ){
					stageData = stageData1;
					patterns = patterns1;
				}
				if( this.number == 2 ){
					stageData = stageData2;
					patterns = patterns2;
				}
			}

			//ステージデータを読み込んで敵の出現パターンを作る
			if( this.time > ~~(120/spd) && this.time % ~~(120/spd) == 0  && !this.event && !this.bossBattle ){
				if( debug )advanceLabel.text = "advance " + (this.advance/5+1) + "/"  + (stageData.length/5+1) + " :";
				for( var i = 0; i < 5; i++ ){
					var ad = stageData.charAt( this.advance );
					if( ad == "E" ){
						this.event = true;
						if( this.number == 2 )eventStargate();
					}
					if( ad == "W" ){
						eventWarning();
					}
					if( ad == "B" ){
						this.bossBattle = true;
					}
					var pattern = patterns[ad];
					for( var j in pattern ){
						var obj = pattern[j];
						if( obj.type != 'nop' ){
							enterEnemy( obj.type, obj.x, obj.y, obj.offset );
						}
					}
					if( debug )advanceLabel.text += ad + ":";
					this.advance++;
				}
			}
			//特殊フラグ処理
			if( this.clear ){
				eventStageClear();
			}
			this.time++;
		});
		var touchX, touchY, moveX, moveY;
		stage.addEventListener('touchstart', function(e) {
			touch = true;
			touchX = e.x;
			touchY = e.y;

			if( touchX < 32 && touchY > 290 && !stage.event && !player.auto )enterBomb( player.x+16, player.y+16 );
		});
		stage.addEventListener('touchmove', function(e) {
			moveX = e.x - touchX;
			moveY = e.y - touchY;
			if( !stage.event && !player.auto ){
				player.x += moveX;
				player.y += moveY;
			}
			touchX = e.x;
			touchY = e.y;
		});
		stage.addEventListener('touchend', function(e) {
			if( stage.event )return;
			touch = false;
			moveX = e.x - touchX;
			moveY = e.y - touchY;
			if( !stage.event && !player.auto ){
				player.x += moveX;
				player.y += moveY;
			}
			touchX = e.x;
			touchY = e.y;
		});
//		game.rootScene.addChild( stage );
		game.pushScene( stage );
		
/////////////////////////////////////////////////////////////////////////////
//	canvas用レイヤー
/////////////////////////////////////////////////////////////////////////////
		var canvasLayer = new CanvasGroup();
		stage.addChild( canvasLayer );

/////////////////////////////////////////////////////////////////////////////
//	自機管理
/////////////////////////////////////////////////////////////////////////////

		//プレイヤキャラクタ
		/////////////////////////////////////////////////////////////////////////////
		var player = new Sprite( 32, 32 );
		player.image = game.assets['media/myship.png'];
		player.frame = 0;
		player.x = 144;
		player.y = 240;
		player.speed = 2;
		player.visible = false;
		player.auto = false;		//オート操作
		player.muteki = 0;			//無敵中時間カウンタ
		player.shotON = true;		//ショットトリガ
		player.autoBomb = false;	//オートボム
		player.power = 2;			//パワーアップ段階
		player.energy = 0;
		player.shotpower = 10;		//ショット威力
		player.shotspan = 6;		//ショット間隔
		player._element.style.zIndex = LAYER_OBJECT3;

		//当たり判定用
		player.col = new Sprite( 6, 6 );
//		stage.addChild( player.col );

		//被ダメージ処理
		player.damaged = function(){
			if( this.muteki > 0 || stage.event || nodamage )return;
			if( this.autoBomb && stage.bomb > 0 ){
				enterBomb( this.x+16, this.y+16 );
				return;
			}
			burnShip( this.x-8, this.y-8 );
			stage.life--;
			stage.nomiss = false;
			stage.nomissAll = false;
			dspLife.reflesh();
			stage.bomb = stage.bombMax;
			dspBomb.reflesh();
			this.muteki = ~~(210/spd);
			eventStartup( sec(1), 220 );
			if( stage.life < 0 ){
				stage.end( false );
			}
		};
		player.addEventListener( 'enterframe', function (){
			//無敵時間処理
			if( this.muteki > 0 ){
				this.muteki--;
				if( game.frame % ~~(3/spd) == 0 ){
					if( this.visible ){
						this.visible = false;
					}else{
						this.visible = true;
					}
				}
				if( this.muteki == 0 )this.visible = true;
			}

			//ショット
			if( game.frame % ~~(this.shotspan/spd) == 0 && this.shotON && !stage.event && !this.auto && this.age > 30 ){
				var pow = this.shotpower;
				if( touch ){
					pow = ~~( pow * 0.6 );	//タッチ操作中は威力６割
				}
				var vy1 = (-9/spd);
				var vx2 = ( 3/spd);
				var vy2 = (-6/spd);
				enterShot( 7, this.x+12, this.y,   0, vy1, pow );	//前
				enterShot( 7, this.x+20, this.y,   0, vy1, pow );
				enterShot( 7, this.x+ 4, this.y+4, 0, vy1, pow );
				enterShot( 7, this.x+28, this.y+4, 0, vy1, pow );
				enterShot( 6, this.x+ 4, this.y,  -vx2, vy2, pow );	//左
				enterShot( 6, this.x+ 1, this.y+7,-vx2, vy2, pow );
				enterShot( 8, this.x+28, this.y,   vx2, vy2, pow );	//右
				enterShot( 8, this.x+31, this.y+7, vx2, vy2, pow );
			}

			if( game.frame % ~~(6/spd) == 0 ){
				this.frame++;
				this.frame %= 2;
			}
			if( stage.event || this.auto )return;
			if( game.input.left  )this.x -= this.speed*spd;
			if( game.input.right )this.x += this.speed*spd;
			if( game.input.up    )this.y -= this.speed*spd;
			if( game.input.down  )this.y += this.speed*spd;
			if( game.input.a )enterBomb( this.x+16, this.y+16 );

			if( this.x < 0 )this.x = 0;
			if( this.x > game.width - this.width )this.x = game.width - this.width;
			if( this.y < 0 )this.y = 0;
			if( this.y > game.height - this.height )this.y = game.height - this.height;
			this.col.x = this.x + 13;
			this.col.y = this.y + 13;
		});
		stage.addChild( player );
//		canvasLayer.addChild( player );

/////////////////////////////////////////////////////////////////////////////
//	ゲーム進行管理
/////////////////////////////////////////////////////////////////////////////

		//バックグラウンド管理
		/////////////////////////////////////////////////////////////////////////////
		var BG = new Group();
//		var BG = new CanvasGroup();
		BG.time = 0;
		BG.pattern = 0;

		BG.back = new Sprite( game.width, game.height );
		BG.back.image = game.assets['media/map_stage1_1.png'];
		BG.back.x = 0;
		BG.back.y = -960;

		BG.back2 = new Sprite( game.width, game.height );
		BG.back2.image = game.assets['media/map_stage1_2.png'];
		BG.back2.x = 0;
		BG.back2.y = -960;

		BG.addChild( BG.back );
		BG.addChild( BG.back2 );

		//雲
		var cl = new Array(20);
		for( var i = 0; i <	20; i++ ){
			cl[i] = new Sprite(16,16);
			cl[i].using = false;
			cl[i].addEventListener('enterframe', function(){
				this.y += this.vy;
				if( this.y > 320 || stage.number != 1 ){
					this.using = false;
					this.visible = false;
					this.vy = 0;
					BG.removeChild( this );
				}
			});
//			BG.addChild( cl[i] );
		}

		BG.addEventListener('enterframe', function(){
			//ステージ１
			if( stage.number == 1 ){
				if( this.time == 0 ){
					//初期化
					var back = new Sprite( 320, 320 );
					this.back.image = game.assets['media/map_stage1_1.png'];
					this.back.width = 320;
					this.back.height = 320;
					this.back.visible = true;
					this.back.x = 0;
					this.back.y = 0;

					this.back2.image = game.assets['media/map_stage1_2.png'];
					this.back2.width = 320;
					this.back2.height = 320;
					this.back2.visible = true;
					this.back2.x = 0;
					this.back2.y = -319;

//					stage.backgroundColor = "#2C2F5D"; //44 47 93
//					stage.backgroundColor = "#0D2830";
					this.pattern = 0;
					this.vx = 0;
					this.vy = 2*spd;
					this.pattern = 0;
				}
				if( this.time % ~~(3/spd) == 0 ){
					this.back.y += 1;
					this.back2.y += 1;
					if( this.pattern == 0 ){
						if( this.back.y == 319 ){
							this.back.y = -319;
						}
						if( this.back2.y == 319 ){
							this.back2.y = -319;
						}
					}
				}
				if( this.time % ~~(30/spd) == 0 && !stage.bossBattle ){
					for( var i = 0; i < 20; i++ ){
						if( !cl[i].using )break;
					}
					if( i < 20 ){
						var dice = rand(6);
						switch( dice ){
							case 0:
								cl[i].image = game.assets['media/cloud1.png'];
								cl[i].width = 128;
								cl[i].height = 96;
								break;
							case 1:
								cl[i].image = game.assets['media/cloud2.png'];
								cl[i].width = 64;
								cl[i].height = 64;
								break;
							case 2:
								cl[i].image = game.assets['media/cloud3.png'];
								cl[i].width = 96;
								cl[i].height = 64;
								break;
							case 3:
								cl[i].image = game.assets['media/cloud4.png'];
								cl[i].width = 96;
								cl[i].height = 64;
								break;
							case 4:
								cl[i].image = game.assets['media/cloud5.png'];
								cl[i].width = 128;
								cl[i].height = 96;
								break;
							case 5:
								cl[i].image = game.assets['media/cloud6.png'];
								cl[i].width = 128;
								cl[i].height = 128;
								break;
						}
						cl[i].x = rand(game.width+cl[i].width*2)-cl[i].width;
						cl[i].y = -128;
						cl[i].vy = rand(6*spd) + spd;
						cl[i].using = true;
						cl[i].visible = true;
						cl[i]._element.style.zIndex = LAYER_OBJECT6+cl[i].vy;
						var op = 2 - ~~(cl[i].vy/spd)/10;//rand(5)/10+0.5;
						if( op > 0.8 ){
							cl[i].opacity = 0.8;
						}else{
							cl[i].opacity = op;
						}
//						cl[i].alphaBlending ="lighter";
						BG.addChild( cl[i] );
					}
				}
			}

			//ステージ２
			if( stage.number == 2 ){
				if( this.time == 0 ){
					//初期化
					this.back.image = game.assets['media/map_stage2_1.png'];
					this.back.width = 320;
					this.back.height = 320;
					this.back.x = 0;
					this.back.y = 0;
					this.back.visible = true;
					this.vx = 0;
					this.vy = 0;
					this.pattern = 0;
					stage.backgroundColor = "#000000";
					this.back2.visible = false;
					this.removeChild( this.back2 );
				}
				switch( this.pattern ){
					case 0:
						if( game.frame % ~~(6/spd) == 0 ){
							this.back.y += 1;
							if( this.back.y == 320 ){
								this.back.image = game.assets['media/map_stage2_2.png'];
								this.back.width = 320;
								this.back.height = 960;
								this.back.opacity = 0;

								this.pattern++;
								this.back.y = -640;
							}
						}
						break;
					case 1:
						if( game.frame % 2 == 0 ){
							if( this.back.opacity < 1 )this.back.opacity += 0.05;
						}
						if( game.frame % ~~(12/spd) == 0 )this.back.y += 1;
					case 2:
						if( this.back.opacity < 1 && game.frame % ~~(6/spd) == 0 )this.back.opacity += 0.1;
						if( game.frame % ~~(4/spd) == 0 && this.back.y < 0 ){
							this.back.y += 1;
						}
						break;
				}
			}
			this.time++;
		});
		stage.addChild( BG );
		
/////////////////////////////////////////////////////////////////////////////
//	システム表示管理
/////////////////////////////////////////////////////////////////////////////

		//スコア表示
		/////////////////////////////////////////////////////////////////////////////
		var scoreLabel = new Label( "SCORE : " + stage.score );
		scoreLabel.x = 5;
		scoreLabel.y = 5;
		scoreLabel.color = "#ffffff";
		scoreLabel.font = "bold";
		scoreLabel._element.style.zIndex = LAYER_SYSTEM;
		scoreLabel.addEventListener('enterframe', function(){
			this.text = "SCORE : " + stage.score;
		});
		stage.addChild( scoreLabel );

		//ライフ表示
		/////////////////////////////////////////////////////////////////////////////
		var dspLife = new Group();
		dspLife.count = new Array(5);
		for( var i = 0; i < 5; i++ ){
			dspLife.count[i] = new Sprite( 32, 32 );
			dspLife.count[i].image = game.assets['media/myship.png'];
			dspLife.count[i].scaleX = 0.5;
			dspLife.count[i].scaleY = 0.5;
			dspLife.count[i].x = i * 16 - 8;
			dspLife.count[i].y = 13;
			dspLife.count[i].visible = false;
			dspLife.count[i]._element.style.zIndex = LAYER_SYSTEM;
			stage.addChild( dspLife.count[i] );
		}
		dspLife.reflesh = function(){
			for( var i = 0; i < 5; i++ ){
				if( i < stage.life ){
					this.count[i].visible = true;				
				}else{
					this.count[i].visible = false;				
				}
			}
		};
		dspLife.reflesh();

		//ボムストック表示
		/////////////////////////////////////////////////////////////////////////////
		var dspBomb = new Group();
		dspBomb.count = new Array(5);
		for( var i = 0; i < 5; i++ ){
			dspBomb.count[i] = new Sprite( 96, 96 );
			dspBomb.count[i].image = game.assets['media/bomb.png'];
			dspBomb.count[i].scaleX = 0.10;
			dspBomb.count[i].scaleY = 0.10;
			dspBomb.count[i].x = i * 16 - 40;
			dspBomb.count[i].y = 0;
			dspBomb.count[i].visible = false;
			dspBomb.count[i]._element.style.zIndex = LAYER_SYSTEM;
			stage.addChild( dspBomb.count[i] );
		}
		dspBomb.reflesh = function(){
			for( var i = 0; i < 5; i++ ){
				if( i < stage.bomb ){
					this.count[i].visible = true;				
				}else{
					this.count[i].visible = false;				
				}
			}
		};
		dspBomb.reflesh();

		//ボム発動ボタン
		/////////////////////////////////////////////////////////////////////////////
		var bombSwitch = new Sprite( 32, 32 );
		bombSwitch.image = game.assets['media/bombSwitch.png'];
		bombSwitch.x = 0;
		bombSwitch.y = game.height-32;
		bombSwitch._element.style.zIndex = LAYER_SYSTEM;
		stage.addChild( bombSwitch );

		//ボス耐久力残量表示
		/////////////////////////////////////////////////////////////////////////////
		var Bmeter = new Sprite( 200, 13 );
		Bmeter.x = 100;
		Bmeter.y = 5;
		Bmeter.max = 1000;
		Bmeter.visible = false;
		var Brect = new Surface( 200, 13 );
		Brect.context.fillStyle = 'rgba( 0, 255, 0, 1.0 )';
		Brect.context.fillRect( 0, 0, 100, 13 );
		Bmeter.image = Brect;
		Bmeter._element.style.zIndex = LAYER_SYSTEM;
		Bmeter.setMax = function( val ){
			this.max = val;
		};
		Bmeter.setNum = function( val ){
			var num = val / this.max * 100;
			Erect.context.fillStyle = 'rgba( 0, 255, 0, 1.0 )';
			Erect.context.fillRect( 0, 0, num, 13 );
			Erect.context.fillStyle = 'rgba( 255, 0, 0, 1.0 )';
			Erect.context.fillRect( num + 1, 0, 100 - num, 13 );
		};
		stage.addChild( Bmeter );

		//ＦＰＳ表示＆制御
		/////////////////////////////////////////////////////////////////////////////
		var fpsLabel = new Label( "" );
		fpsLabel.color = "#ffffff";
		fpsLabel.font = "bold";
		fpsLabel.x = 270;
		fpsLabel.y = 5;
		fpsLabel.fps = 0;
		fpsLabel.ms = 0;
		fpsLabel.bs = 0;
		fpsLabel.fpms = 0;
		fpsLabel.bms = 0;
		fpsLabel.s = 0;
		fpsLabel.wait = false;
		fpsLabel._element.style.zIndex = LAYER_SYSTEM;
		fpsLabel.addEventListener('enterframe', function(){
			this.fps++;
			this.s = new Date().getSeconds();
			if( this.s != this.bs ){
				//実フレームレートによる仮想ＦＰＳと速度設定
				//実際のＦＰＳは制御しない
/*
				if( game.frame > 60 ){
					spd = 1;
					vfps = 60;
					if( this.fps < 35 ){
						spd = 2;
						vfps = 30;
					}else if( this.fps < 23 ){
						spd = 3;
						vfps = 20;
					}
				}
*/
				this.text = "FPS: " + this.fps;
				if( this.wait )this.text += "!";
				this.bs = this.s;
				this.fps = 0;
			}
		});
		stage.addChild( fpsLabel );

		//デバッグ用テキスト（ステージ進行チェック）
		/////////////////////////////////////////////////////////////////////////////
		var advanceLabel = new Label( "" );
		advanceLabel.color = "#ffffff";
		advanceLabel.font = "bold";
		advanceLabel.x = 5;
		advanceLabel.y = 60;
		advanceLabel._element.style.zIndex = LAYER_SYSTEM;
		stage.addChild( advanceLabel );

		if( debug ){
			//デバッグ用テキスト（弾使用量）
			/////////////////////////////////////////////////////////////////////////////
			var bulletLabel = new Label( "" );
			bulletLabel.color = "#ffffff";
			bulletLabel.font = "bold";
			bulletLabel.x = 5;
			bulletLabel.y = 80;
			bulletLabel.max = 0;
			bulletLabel._element.style.zIndex = LAYER_SYSTEM;
			bulletLabel.addEventListener('enterframe', function(){
				var num = 0;
				for( var i = 0; i < numBullets; i++ ){
					if( bullets[i].using )num++;
				}
				this.text = "Bullet use : "+num+"/"+this.max;
				if( this.max < num )this.max = num;
			});
			stage.addChild( bulletLabel );

			//デバッグ用テキスト（敵使用量）
			/////////////////////////////////////////////////////////////////////////////
			var enemyLabel = new Label( "" );
			enemyLabel.color = "#ffffff";
			enemyLabel.font = "bold";
			enemyLabel.x = 5;
			enemyLabel.y = 100;
			enemyLabel.max = 0;
			enemyLabel._element.style.zIndex = LAYER_SYSTEM;
			enemyLabel.addEventListener('enterframe', function(){
				var num = 0;
				for( var i = 0; i < numEnemies; i++ ){
					if( enemies[i].using )num++;
				}
				this.text = "Enemy use : "+num+"/"+this.max;
				if( this.max < num )this.max = num;
			});
			stage.addChild( enemyLabel );

			//デバッグ用テキスト（エフェクト使用量）
			/////////////////////////////////////////////////////////////////////////////
			var effectLabel = new Label( "" );
			effectLabel.color = "#ffffff";
			effectLabel.font = "bold";
			effectLabel.x = 5;
			effectLabel.y = 120;
			effectLabel.max = 0;
			effectLabel._element.style.zIndex = LAYER_SYSTEM;
			effectLabel.addEventListener('enterframe', function(){
				var num = 0;
				for( var i = 0; i < numEffects; i++ ){
					if( effects[i].using )num++;
				}
				this.text = "Effect use : "+num+"/"+this.max;
				if( this.max < num )this.max = num;
			});
			stage.addChild( effectLabel );

			//デバッグ用テキスト（ua）
			/////////////////////////////////////////////////////////////////////////////
			var uaLabel = new Label( "" );
			uaLabel.color = "#ffffff";
			uaLabel.font = "bold";
			uaLabel.x = 5;
			uaLabel.y = 140;
			uaLabel.max = 0;
			uaLabel._element.style.zIndex = LAYER_SYSTEM;
			uaLabel.text = VENDER_PREFIX+":"+userAgent;
			stage.addChild( uaLabel );
		}

		//デバッグ用テキスト（汎用）
		/////////////////////////////////////////////////////////////////////////////
		var debugLabel = new Label( "" );
		debugLabel.color = "#ffffff";
		debugLabel.font = "bold";
		debugLabel.x = 120;
		debugLabel.y = 35;
		debugLabel._element.style.zIndex = LAYER_SYSTEM;
		stage.addChild( debugLabel );


/////////////////////////////////////////////////////////////////////////////
//	敵管理
/////////////////////////////////////////////////////////////////////////////

		//通常破壊パターン
		/////////////////////////////////////////////////////////////////////////////
		var defaultDead = function(){
			if( this.burnType > 3 ){
				burnBig( this.x, this.y, this.width, this.height, this.burnType, this.vx/2+BG.vx/3, this.vy/2+BG.vy/3 );
			}else{
				burn( this.burnType, this.x, this.y, this.vx/2+BG.vx/3, this.vy/2+BG.vy/3 );
			}

			//中型機はタッチ状態時のみ弾消しが発生
			if( touch && this.type == ENEMY_MEDIUM ){
				eraseBullet( this );
			}

			//大型機は無条件
			if( this.type == ENEMY_BIG ){
				eraseBullet( this );
			}
			this.release();
		}

		//通常当たり判定チェックルーチン
		/////////////////////////////////////////////////////////////////////////////
		var defaultCollisionCheck = function( target ){
			if( !this.visible || this.time < 1 || !this.collision )return false;
			if( this.col.intersect( target ) ){
				return true;
			}
			return false;
		}

		//敵準備
		/////////////////////////////////////////////////////////////////////////////
		var numEnemies = 50;
		var enemies = new Array( numEnemies );
		for( var i = 0; i < numEnemies; i++ ){
			enemies[i] = new Sprite( 32, 32 );
			var type = 'media/enemy2.png';
			enemies[i].image = game.assets[type];
			enemies[i].index = i;
			enemies[i].x = -20;
			enemies[i].y = -20;
			enemies[i].vx = 0;
			enemies[i].vy = 0;
			enemies[i].startX = 0;
			enemies[i].startY = 0;	//Initial position
			enemies[i].fromX = 0;
			enemies[i].fromY = 0;
			enemies[i].toX = 0;
			enemies[i].toY = 0;
			enemies[i].frame = 0;
			enemies[i].parent = null;	//親
			enemies[i].child = null;	//子
			enemies[i].boss = false;
			enemies[i].visible = false;
			enemies[i].using = false;	//使用中フラグ
			enemies[i].def = 999;		//耐久力
			enemies[i].burnType = 0;	//爆発パターン
			enemies[i].time = 0;		//投入後経過時間
			enemies[i].point = 0;					//得点
			enemies[i].col = new Sprite( 32,32 );	//当たり判定用
			enemies[i].col.x = -20;
			enemies[i].col.y = -20;
			enemies[i].collision = true;	//当たり判定チェックフラグ
			enemies[i].algorithm = function(){};	//行動パターン
			enemies[i].run = function(){
				this.algorithm();
			};
			enemies[i].damaged = function( power ){		//被弾処理
				this.def -= power;
				if( this.def < 1 ){
					this.def = 0;
					this.dead();
					stage.score += this.point;
				}
			};

			enemies[i].collisionCheck = defaultCollisionCheck;	//当たり判定チェック
			enemies[i].dead = defaultDead;		//破壊パターンルーチン

			enemies[i].release = function(){	//使用終了処理
				this.visible = false;
				this.using = false;
				stage.removeChild( this );
			};

			enemies[i].addEventListener('enterframe', function(){
				//マイナス時間はディレイとする
				if( this.time < 0 ){
					this.time++;
					return;
				}
				if( this.time == 0 )this.visible = true;
				if( !this.visible )return;
				this.run();

				//当たり判定
				this.col.x = this.x + this.col.sx;
				this.col.y = this.y + this.col.sy;
				if( this.collisionCheck( player.col ) ){
					player.damaged();
				}

				//死にかけ
				var per = this.def / this.defMax;
				if( per < 0.3 ){
					var s = 1;
					if( per < 0.2 )s = 0.5;
					if( this.time % sec(s) == 0 )burn( 1, this.x+rand(this.width+16)-32, this.y+rand(this.height+16)-32, 0, 0 );
				}

				//画面範囲外（スプライトサイズ+64pix）に出たら自動で消す
				if( this.x < -this.width-64 || this.x > game.width+64 || this.y < -this.height-64 || this.y > game.height+64 ){
					if( !stage.bossBattle )this.release();
				}
				this.time++;
			});
		}

		//敵投入
		/////////////////////////////////////////////////////////////////////////////
		var enterEnemy = function( type, x, y, delay ){
			if( delay < 0 )delay *= -1;	//遅延は正数
			delay = ~~(delay/spd);
			for( var i = 0; i <  numEnemies; i++ ){
				if( !enemies[i].using ){
					//個別情報を配列より初期化
					var dat = enemydata[type];
					if( dat == null )return null;
					enemies[i].image = game.assets[dat.file];
					enemies[i].width = dat.w;
					enemies[i].height = dat.h;
					enemies[i].point = dat.point;
					enemies[i].def = dat.def;
					enemies[i].defMax = dat.def;
					enemies[i].col.x = x;
					enemies[i].col.y = y;
					enemies[i].col.sx = dat.colx;
					enemies[i].col.sy = dat.coly;
					enemies[i].col.width = dat.colw;
					enemies[i].col.height = dat.colh;
					enemies[i].burnType = dat.burn;
					enemies[i].type = dat.type;

					//基本情報初期化
					enemies[i].boss = false;
					enemies[i].visible = false;
					enemies[i].using = true;
					enemies[i].frame = 0;
					enemies[i].startX = x;
					enemies[i].startY = y;
					enemies[i].fromX = x;
					enemies[i].fromY = y;
					enemies[i].toX = x;
					enemies[i].toY = y;
					enemies[i].x = x;
					enemies[i].y = y;
					enemies[i].parent = null;
					enemies[i].child = null;
					enemies[i].time = -delay;
					enemies[i].rotation = 0;
					enemies[i]._element.style.zIndex = LAYER_OBJECT3;
					enemies[i].collision = true;
					enemies[i].collisionCheck = defaultCollisionCheck;
					enemies[i].dead =　defaultDead;
					if( enemyAlgorithm[type] != null ){
						enemies[i].algorithm = enemyAlgorithm[type];
					}else{
						enemies[i].algorithm = function(){};
					}
					stage.addChild( enemies[i] );
					return enemies[i];
				}
			}
			return null;
		}

		//敵投入（親子関係情報追加）
		/////////////////////////////////////////////////////////////////////////////
		var enterEnemyChild = function( parent, type, x, y, delay ){
			if( parent == null )return null;
			var obj = enterEnemy( type, parent.x + x, parent.y + y, delay );
			if( obj ){
				obj.parent = parent;
				obj.sx = x;
				obj.sy = y;
				parent.child = obj;
			}
			return obj;
		}

/////////////////////////////////////////////////////////////////////////////
//	弾管理
/////////////////////////////////////////////////////////////////////////////

		//弾準備
		/////////////////////////////////////////////////////////////////////////////
		var numBullets = 200;
		var bullets = new Array( numBullets );
		for( var i = 0; i < numBullets; i++ ){
			bullets[i] = new Sprite( 8, 8 );
			bullets[i].image = game.assets['media/bullet1.png'];
			bullets[i].frame = 0;
			bullets[i].x = 0;	bullets[i].y = 0;
			bullets[i].bx = 0;
			bullets[i].by = 0;
			bullets[i].vx = 0;
			bullets[i].vy = 0;
			bullets[i].accell = 0;	//加速度
			bullets[i].accMax = 0;	//最大加速度
			bullets[i].accMin = 0;	//最小加速度
			bullets[i].visible = false;
			bullets[i].using = false;
			bullets[i].mine = false;
			bullets[i].num = 0;
			bullets[i].type = 0;
			bullets[i]._element.style.zIndex = LAYER_OBJECT4;
			bullets[i].time = 0;
			bullets[i].parent = null;	//弾の発射元
			bullets[i].col = new Sprite( 4, 4 );	//当たり判定用
			bullets[i].col.x = -20;
			bullets[i].col.y = -20;
			bullets[i].w = bullets[i].width/2;	//判定を中心に持ってくる用
			bullets[i].h = bullets[i].height/2;
			bullets[i].addEventListener( 'enterframe', function (){
				if( this.time < 0 ){
					this.time++;
					this.visivle = false;
					return;
				}else{
					this.visible = true;
				}
				if( !this.visible || !this.using )return;
				this.bx = this.x;
				this.by = this.y;
				this.x += this.vx*spd;
				this.y += this.vy*spd;
				this.col.x = this.x + this.w - 2;//this.col.width/2;
				this.col.y = this.y + this.h - 2;//this.col.height/2;
				if( this.x < -this.width-32 || this.x > game.width+32 || this.y < -this.height-32 || this.y > game.height+32 || this.time > sec(10) ){
					this.visible = false;
					this.using = false;
					stage.removeChild( this );
				}
				if( this.type == BULLET_BIG && game.frame % ~~(5/spd) == 0 ){
					this.frame++;
					this.frame %= 8;
				}

				//当たり判定
				if( this.mine ){
					//自機弾の場合
					for( i = 0; i < numEnemies; i++ ){
						if( enemies[i].collisionCheck( this ) ){
							enemies[i].damaged( this.power );
							burnShot( this.x, this.y );
							this.visible = false;
							this.using = false;
							stage.removeChild( this );
						}
					}
				}else{
					//敵弾の場合
					if( this.col.intersect( player.col ) ){
						player.damaged();
					}
				}
				this.time++;
			});
		}

		//自機ショット投入
		/////////////////////////////////////////////////////////////////////////////
		var enterShot = function( type, x, y, vx, vy, power ){
			for( var i = 0;i < numBullets; i++ ){
				if( !bullets[i].using ){
					if( power < player.shotpower ){
						bullets[i].image = game.assets['media/shot1.png'];
						bullets[i].width = 8;
						bullets[i].height = 8;
						bullets[i].x = x - 4;//bullets[i].width/2;
						bullets[i].y = y - 4;//bullets[i].height/2;
					}else{
						bullets[i].image = game.assets['media/shot2.png'];
						bullets[i].width = 16;
						bullets[i].height = 16;
						bullets[i].x = x - 8;//bullets[i].width/2;
						bullets[i].y = y - 8;//bullets[i].height/2;
					}
					bullets[i].frame = type;
					bullets[i].vx = vx*spd;
					bullets[i].vy = vy*spd;
					bullets[i].scaleX = 1;
					bullets[i].scaleY = 1;
					bullets[i].visible = true;
					bullets[i].using = true;
					bullets[i].mine = true;
					bullets[i].type = 9;
					bullets[i].power = power;
					bullets[i].time = 0;
					bullets[i].parent = player;
					bullets[i]._element.style.zIndex = LAYER_OBJECT3;
					stage.addChild( bullets[i] );
					return bullets[i];
				}
			}
			return null;
		}

		//敵弾投入
		/////////////////////////////////////////////////////////////////////////////
		var enterBullet = function( parent, type, x, y, vx, vy, delay ){
			for( var i = 0; i < numBullets; i++ ){
				if( !bullets[i].using ){
					switch( type ){
						//小弾
						case BULLET_SMALL:
							bullets[i].image = game.assets['media/bullet1.png'];
							bullets[i].width = 8;
							bullets[i].height = 8;
							bullets[i].w = 4;//bullets[i].width/2;
							bullets[i].h = 4;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						//中弾（通常）
						case BULLET_MEDIUM1:
							bullets[i].image = game.assets['media/bullet2.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].w = 8;//bullets[i].width/2;
							bullets[i].h = 8;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						//中弾（赤）
						case BULLET_MEDIUM2:
							bullets[i].image = game.assets['media/bullet2R.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].w = 8;//bullets[i].width/2;
							bullets[i].h = 8;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						//中弾（緑）
						case BULLET_MEDIUM3:
							bullets[i].image = game.assets['media/bullet2G.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].w = 8;//bullets[i].width/2;
							bullets[i].h = 8;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						//中弾（青）
						case BULLET_MEDIUM4:
							bullets[i].image = game.assets['media/bullet2B.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].w = 8;//bullets[i].width/2;
							bullets[i].h = 8;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						//大弾
						case BULLET_BIG:
							bullets[i].image = game.assets['media/bullet3.png'];
							bullets[i].width = 24;
							bullets[i].height = 24;
							bullets[i].w = 12;//bullets[i].width/2;
							bullets[i].h = 12;//bullets[i].height/2;
							bullets[i].frame = 0;
							bullets[i].scaleX = 1;
							bullets[i].scaleY = 1;
							break;
						default:
							return;
					}
					bullets[i].type = type;
					bullets[i].x = x;
					bullets[i].y = y;
					bullets[i].vx = vx;
					bullets[i].vy = vy;
					bullets[i].accell = 0;
					bullets[i].accMax = 0;
					bullets[i].visible = true;
					bullets[i].using = true;
					bullets[i].mine = false;
					if( delay < 0 )delay *= -1;
					bullets[i].time = -delay;
					bullets[i].parent = parent;
					bullets[i]._element.style.zIndex = LAYER_OBJECT2;
					stage.addChild( bullets[i] );
					return bullets[i];
				}
			}
			return null;
		}
		
		//特定場所狙い
		/////////////////////////////////////////////////////////////////////////////
		var enterPlaceBullet = function( parent, type, x, y, tx, ty, speed, delay ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx = (tx-x) / d * speed;
			var vy = (ty-y) / d * speed;
			enterBullet( parent, type, x, y, vx, vy );
		}

		//自機狙い弾
		/////////////////////////////////////////////////////////////////////////////
		var enterSnipeBullet = function( parent, type, x, y, speed, delay ){
			var tx = player.col.x + player.col.width/2-3;
			var ty = player.col.y + player.col.height/2-3;
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx = (tx-x) / d * speed;
			var vy = (ty-y) / d * speed;
			enterBullet( parent, type, x, y, vx, vy, delay );
		}

		//nWay弾
		/////////////////////////////////////////////////////////////////////////////
		var enterNWayBullet = function( parent, type, x, y, tx, ty, theta, n, speed, delay ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx0 = (tx-x) / d * speed;
			var vy0 = (ty-y) / d * speed;

			var rad_step = Math.PI / 180 * theta;
			var rad = ~~(n/2) * rad_step;
			if( n % 2 == 0 ){
				rad -= rad_step/2;	//偶数弾処理
			}
			rad *= -1;
			for( var i = 0; i < n; i++, rad += rad_step ){
				var c = Math.cos(rad);
				var s = Math.sin(rad);
				var vx = vx0 * c - vy0 * s;
				var vy = vx0 * s + vy0 * c;
				enterBullet( parent, type, x, y, vx, vy, delay );
			}
		}

		//円形弾
		/////////////////////////////////////////////////////////////////////////////
		var enterCircleBullet = function( parent, type, x, y, tx, ty, n, speed, delay ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx0 = (tx-x) / d * speed;
			var vy0 = (ty-y) / d * speed;

			var theta = 360 / n;
			var rad_step = Math.PI / 180 * theta;
			var rad = ~~(n/2) * rad_step;
			if( n % 2 == 0 ){
				rad -= rad_step/2;	//偶数弾処理
			}
			rad *= -1;
			for( i = 0; i < n; i++, rad += rad_step ){
				var c = Math.cos(rad), s = Math.sin(rad);
				var vx = vx0 * c - vy0 * s;
				var vy = vx0 * s + vy0 * c;
				enterBullet( parent, type, x, y, vx, vy, delay );
			}
		}

		//弾の消去
		/////////////////////////////////////////////////////////////////////////////
		var eraseBullet = function( parent ){
			for( var i = 0; i < numBullets; i++ ){
				if( bullets[i].using && !bullets[i].mine ){
					if( parent == null || bullets[i].parent == parent ){
						burnBullet( bullets[i].type, bullets[i].x, bullets[i].y, bullets[i].vx, bullets[i].vy );
						bullets[i].visible = false;
						bullets[i].using = false;
						stage.removeChild( bullets[i] );
					}
				}
			}
		}

/////////////////////////////////////////////////////////////////////////////
//	特殊効果管理
/////////////////////////////////////////////////////////////////////////////

		//特殊効果ストック
		var numEffects = 150;
		var effects = new Array( numEffects );
		for( var i = 0; i < numEffects; i++ ){
			effects[i] = new Sprite( 8, 8 );
			effects[i].using = false;
		}
		//払い出し
		var getEffect = function(){
			for( var i = 0; i < numEffects; i++ ){
				if( !effects[i].using ){
					effects[i].using = true;
					effects[i].visible = true;
					return effects[i];
				}
			}
			return null;
		}

		//イベントリスナ		
		var funcBomb = function(){
				if( game.frame % ~~(6/spd) == 0 )this.frame++;
				if( this.frame > this.frameMax ){
					stage.removeChild( this );
					this.removeEventListener('enterframe', funcBomb );
					this.using = false;
					this.visible = false;
				}
				this.x += this.vx;
				this.y += this.vy;
		}
		var funcShot = function() {
			this.frame++;
			if( this.frame > 7 ){
				stage.removeChild( this );
				this.removeEventListener('enterframe', funcShot );
				this.using = false;
				this.visible = false;
			}
		}
		var funcBullet = function() {
			this.x += this.vx;
			this.y += this.vy;
			if( game.frame % ~~(3/spd) == 0 )this.frame++;
			if( this.frame > 7 ){
				stage.removeChild( this );
				this.removeEventListener('enterframe', funcBullet );
				this.using = false;
				this.visible = false;
			}
		}

		//爆発エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burn = function( type, x, y, vx, vy ){
			var bomb = getEffect();
			if( !bomb )return;
			switch( type ){
				case 0:
					bomb.image = game.assets['media/effect1.png'];
					bomb.width = 32;
					bomb.height = 32;
					bomb.frame = 0;
					bomb.frameMax = 7;
					break;
				case 1:
					bomb.image = game.assets['media/effect3.png'];
					bomb.width = 48;
					bomb.height = 48;
					bomb.frame = 0;
					bomb.frameMax = 6;
					break;
				default:
					return;
			}
			bomb.x = x;
			bomb.y = y;
			bomb.vx = vx;
			bomb.vy = vy;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', funcBomb );
			stage.addChild( bomb );
		}

		//大爆発
		/////////////////////////////////////////////////////////////////////////////
		var burnBig =  function( x, y, width, height, num, vx, vy ){
			for( i = 0; i < num; i++ ){
				burn( 1, x+rand(width+16)-8, y+rand(height+16)-8, vx, vy );
			}
		}

		//着弾エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burnShot = function( x, y ){
			var bomb = getEffect();
			if( !bomb )return;
			bomb.width = 16;
			bomb.height = 16;
			bomb.image = game.assets['media/effect2.png'];
			bomb.frame = 0;
			bomb.x = x;
			bomb.y = y;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', funcShot );
			stage.addChild( bomb );
		}

		//弾消滅エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burnBullet = function( type, x, y, vx, vy ){
			var bomb = getEffect();
			if( !bomb )return;
			switch( type ){
				case BULLET_SMALL:
					bomb.image = game.assets['media/bullet1.png'];
					bomb.width = 8;
					bomb.height = 8;
					bomb.frame = 0;
					break;
				case BULLET_MEDIUM1:
					bomb.image = game.assets['media/bullet2.png'];
					bomb.width = 16;
					bomb.height = 16;
					bomb.frame = 0;
					break;
				case BULLET_MEDIUM2:
					bomb.image = game.assets['media/bullet2R.png'];
					bomb.width = 16;
					bomb.height = 16;
					bomb.frame = 0;
					break;
				case BULLET_MEDIUM3:
					bomb.image = game.assets['media/bullet2G.png'];
					bomb.width = 16;
					bomb.height = 16;
					bomb.frame = 0;
					break;
				case BULLET_MEDIUM4:
					bomb.image = game.assets['media/bullet2B.png'];
					bomb.width = 16;
					bomb.height = 16;
					bomb.frame = 0;
					break;
				case BULLET_BIG:
					bomb.image = game.assets['media/bullet2R.png'];
					bomb.width = 16;
					bomb.height = 16;
					bomb.frame = 0;
					break;
				default:
					bomb.using = false;
					bomb.visible = false;
					return;
			}
			bomb.x = x;
			bomb.y = y;
			bomb.vx = vx;
			bomb.vy = vy;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', funcBullet );
			stage.addChild( bomb );
		}

		//自機消滅エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burnShip = function( x, y ){
			var bomb = new Sprite( 48, 48 );
			bomb.image = game.assets['media/effect4.png'];
			bomb.frame = 0;
			bomb.x = x;	bomb.y = y;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', function() {
				if( game.frame % ~~(4/spd) == 0 )this.frame++;
				if( this.frame > 7 ){
					stage.removeChild( this );
				}
			});
			stage.addChild( bomb );
		}

		//ボムエフェクト
		/////////////////////////////////////////////////////////////////////////////
		var enterBomb = function( x, y ){
			if( stage.bomb < 1 )return;
			if( player.muteki > 0 )return;
			stage.bomb--;
			stage.nobomb = false;
			dspBomb.reflesh();
			player.muteki = 10;

			var bomb = new Sprite( 96, 96 );
			bomb.image = game.assets['media/bomb.png'];
			bomb.frame = 0;
			bomb.x = x-48;
			bomb.y = y-48;
			bomb.scaleX = 4;
			bomb.scaleY = 4;
			bomb.opacity = 0.8;
			bomb.time = ~~(stage.bombTime/spd);
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', function() {
				if( game.frame % ~~(6/spd) == 0 && this.frame < 15 )this.frame++;
				if( this.time < 0 ){
					stage.removeChild( this );
				}
				if( game.frame % ~~(3/spd) == 0 )eraseBullet( null );
				this.time--;
			});
			stage.addChild( bomb );

			//敵消去
			var col = new Sprite( 320, 320 );
			col.x = 0;
			col.y = 0;
			var i;
			for( i = 0; i < numEnemies; i++ ){
				if( enemies[i].using ){
					if( enemies[i].intersect( col ) )enemies[i].damaged( 1000 );
				}
			}
			delete col;
			
		}


/////////////////////////////////////////////////////////////////////////////
//	イベント管理
/////////////////////////////////////////////////////////////////////////////

		//スタートアップイベント
		/////////////////////////////////////////////////////////////////////////////
		var eventStartup = function( wait, step ){
			player.auto = true;
			player.x = 144;
			player.y = 320;
			player.visible = true;

			//eventController
			var ec = new Group();
			ec.time = 0;
			ec.flag = true;
			ec.step = step;
			ec.wait = wait;
			ec.addEventListener('enterframe', function() {
				if( this.wait < this.time ){
					if( player.y > this.step && this.flag ){
						player.y = ~~( (this.step - player.y ) / (10/spd) + player.y );
						if( player.y == this.step ){
							this.flag = false;
						}
					}
					if( player.y < 250 && this.flag == false ){
						player.y += spd;
						if( player.y > 240 ){
							player.auto = false;
							stage.removeChild( this );
						}
					}
				}
				this.time++;
			});
			stage.addChild( ec );
		}

		//スターゲートイベント
		/////////////////////////////////////////////////////////////////////////////
		var eventStargate = function(){
			stage.event = true;

			//eventController
			var ec = new Group();
			ec.time = 0;
			ec.addEventListener('enterframe', function() {
				if( this.time < sec(3) ){
					if( player.x > 144 )player.x -= spd;
					if( player.x < 144 )player.x += spd;
					if( player.y > 144 )player.y -= spd;
					if( player.y < 144 )player.y += spd;
				}
				if( this.time == sec(3) ){
					var gate = new Sprite( 256, 64 );
					gate.image = game.assets['media/stargate.png'];
					gate.frame = 6;
					gate.opacity = 0;
					gate.al = 0.02;
					gate.x = 32;
					gate.y = 128;
					gate.time = 0;
					gate.count = 0;
					gate._element.style.zIndex = LAYER_EFFECT;
					gate.addEventListener('enterframe', function() {
						//ワープ開始
						if( this.time < sec(2) ){
							if( game.frame % ~~(3/spd) == 0 ){
								if( this.time > ~~(10/spd) && this.time < ~~(60/spd) ){
									this.frame--;
									if( this.frame < 0 )this.frame = 0;
								}
								if( this.time > ~~(60/spd) ){
									player.visible = false;
									this.al = -0.02*spd;
									this.frame++;
									if( this.frame > 6 )this.frame = 6;
									this.scaleX -= 0.05;
									this.scaleY += 0.05;
								}
							}
							this.opacity += this.al;
							if( this.opacity > 1 )this.opacity = 1;
						}
						//ステージ切り替え
						if( sec(2) < this.time && this.time < sec(3) ){
							if( this.time % ~~(3/spd) == 0 && BG.back.opacity > 0 && this.time < ~~(150/spd) )BG.back.opacity -= 0.1*spd;
							if( this.time == ~~(165/spd) ){
								this.frame = 6;
								this.opacity = 1;
								this.al = 0.02*spd;
								this.scaleX = 1;
								this.scaleY = 1;

								player.y = 240;
								this.y = player.y - 16;

								//敵の全消去
								for( i = 0; i < numEnemies; i++ ){
									if( enemies[i].using )enemies[i].release();
								}

								//背景変更
								BG.back.image = game.assets['media/map_stage2_3.png'];
								BG.back.y = -320;
								BG.pattern = 2;
							}
						}
						//ワープ終了
						if( sec(3) < this.time && this.time < sec(5) ){
							if( game.frame % ~~(3/spd) == 0 ){
								if( this.time > ~~(174/spd) && this.time < ~~(210/spd) ){
									this.frame--;
									if( this.frame < 0 )this.frame = 0;
								}
								if( this.time > sec(3.5) ){
									player.visible = true;
									this.al = -0.02*spd;
									this.frame++;
									if( this.frame > 6 )this.frame = 6;
									this.scaleX -= 0.05;
									this.scaleY += 0.05;
								}
							}
							this.opacity += this.al;
							if( this.opacity > 1 )this.opacity = 1;
						}
						if( this.time > sec(5) ){
							stage.removeChild( this );
							stage.event = false;
						}
						this.time++;
					});	//gate
					stage.addChild( gate );
					stage.removeChild( this );
				}
				this.time++;
			});	//ec
			stage.addChild( ec );
		}

		//ステージクリアイベント
		/////////////////////////////////////////////////////////////////////////////
		var eventStageClear = function(){
			stage.event = true;
			stage.bossBattle = false;
			stage.clear = false;

			var ec = new Group();
			ec.time = 0;
			ec.stime = 0;
			ec.accell = 0.1;
			ec.disp = 0;
			if( stage.number == stage.max ){
				ec.msg1 = new Text( 25, 110, "MISSION COMPLETE!" );
				ec.msg2 = new Text( 20, 150, "CLEAR BONUS +20000" );
				ec.bonus1 = 20000;
				if( stage.nomissAll ){
					ec.msg3 = new Text( 40, 190, "PERFECT! +40000" );
					ec.bonus2 = 40000;
				}else{
					ec.msg3 = new Text( 10, 190, "NOMISS BONUS +20000" );
					ec.bonus2 = 20000;
				}
			}else{
				ec.msg1 = new Text( 55, 110, "STAGE"+stage.number+" CLEAR!" );
				ec.msg2 = new Text( 20, 150, "CLEAR BONUS +10000" );
				ec.msg3 = new Text( 10, 190, "NOMISS BONUS +20000" );
				ec.bonus1 = 10000;
				ec.bonus2 = 20000;
			}
			ec.addEventListener('enterframe', function() {
				if( this.disp == 0 && this.time > sec(2) ){
					player.y -= 2*spd+this.accell;
					this.accell+=0.1*spd;
					if( player.y < -32 ){
						this.disp++;
						this.stime = this.time;
						this.sec = 1;
					}
				}
				//結果表示中
				if( this.disp == 1 ){
					if( this.time == this.stime + sec(1) ){
						stage.addChild( this.msg1 );
					}
					if( this.time == this.stime + sec(2) ){
						stage.addChild( this.msg2 );
						stage.score+=this.bonus1;
					}
					if( this.time == this.stime + sec(3) && stage.nomiss ){
						stage.addChild( this.msg3 );
						stage.score+=this.bonus2;
					}
					if( this.time == this.stime + sec(5) )this.disp++;
				}
				//次ステージへ移行
				if( this.disp == 2 ){
					//最終ステージクリアの場合はゲーム終了
					if( stage.number == stage.max ){
						stage.end( true );
						stage.removeChild( this );
					}else{
						player.visiblae = false;
						stage.nomiss = true;
						stage.nobomb = true;
						stage.event = false;
						stage.number++;
						stage.advance = 0;
						stage.time = -1;
						BG.time = -1;
						stage.removeChild( this.msg1 );
						stage.removeChild( this.msg2 );
						stage.removeChild( this.msg3 );
						stage.removeChild( this );
					}
				}
				this.time++;
			});
			stage.addChild( ec );
		}

		//ワーニング表示
		/////////////////////////////////////////////////////////////////////////////
		var eventWarning = function(){
			var warning = new Sprite( 320, 50 );
			warning.image = game.assets['media/warning.gif'];
			warning.x = 0;
			warning.y = 135;
			warning.count = 0;
			warning.visible = true;
			warning._element.style.zIndex = LAYER_SYSTEM;
			warning.addEventListener( 'enterframe', function() {
				this.count++;
				if( this.count % sec(0.5) == 0){
					if( this.visible )
						this.visible = false;
					else
						this.visible = true;
				}
				if( this.count > sec(6)-1 ){
					stage.removeChild( this );
				}
			});
			stage.addChild( warning );
		}

/////////////////////////////////////////////////////////////////////////////
//	敵機アルゴリズム
/////////////////////////////////////////////////////////////////////////////

		//イベントリスナ		
		var funcRotor = function(){
				if( game.frame % ~~(6/spd) == 0 )this.frame++;
				if( this.frame > this.frameMax ){
					stage.removeChild( this );
					this.removeEventListener('enterframe', funcBomb );
					this.using = false;
					this.visible = false;
				}
				this.x += this.vx;
				this.y += this.vy;
		}

		var enemyAlgorithm = {
			'Attacker':function(){
				//初期化処理
				if( this.time == 0 ){
					this.count = 3;
					if( this.x < 160 ){
						this.movTable = {	//移動パターンテーブル
							0: {time:  0, x:   0, y:   0},
							1: {time: 20, x:  60, y:  20},
							2: {time: 40, x: 100, y:  50},
							3: {time: 60, x: 130, y:  90},
							4: {time: 80, x: 200, y:  80},
							5: {time:100, x: 260, y:  60},
							6: {time:120, x: 400, y:  20},
						};
					}else{
						this.movTable = {	//移動パターンテーブル
							0: {time:  0, x:   0, y:   0},
							1: {time: 20, x: -60, y:  20},
							2: {time: 40, x:-100, y:  50},
							3: {time: 60, x:-130, y:  90},
							4: {time: 80, x:-200, y:  80},
							5: {time:100, x:-260, y:  60},
							6: {time:120, x:-400, y:  20},
						};
					}
					this.movTableMax = 6;
					this.movTableNow = 0;	//現在テーブル
					this.nextTime = 0;
					for( var i = 0; i < this.movTableMax+1; i++ ){
						this.movTable[i].time = ~~( this.movTable[i].time/spd);
					}
				}
				//テーブルに従って移動
				var position = this.movTable[this.movTableNow];
				if( position.time == this.time && this.movTableNow < this.movTableMax){
					this.movTableNow++;
					var position = this.movTable[this.movTableNow];
					this.fromX = this.x;
					this.fromY = this.y;
					this.toX = position.x + this.startX;
					this.toY = position.y + this.startY;

					var tx = this.toX, ty = this.toY;
					this.vx = (this.toX-this.x) / (position.time - this.time);
					this.vy = (this.toY-this.y) / (position.time - this.time);
				}
				this.x += this.vx;
				this.y += this.vy;
				if( this.time > ~~(60/spd) && this.time % ~~(6/spd) == 0 && this.count > 0 ){
					enterSnipeBullet( this, BULLET_SMALL, this.x + 16, this.y + 20, 3, 0 );
//					enterNWayBullet( this,  BULLET_SMALL, this.x + 16, this.y + 20, player.x+16, player.y+16 , 20, 3, 1, 0 );
					//x, y, tx, ty, theta, num, speed 
 					this.count--;
				}
			},

			'Attacker2':function(){
				//初期化処理
				if( this.time == 0 ){
					this.count = 2;
					if( this.x > 160 ){
						this.movTable = {	//移動パターンテーブル
							0: {time:  0, x:   0, y:   0},
							1: {time: 20, x: -20, y:  20},
							2: {time: 40, x:-100, y:  50},
							3: {time: 60, x:-130, y: 100},
							4: {time: 80, x:-200, y:  80},
							5: {time:100, x:-260, y:  60},
							6: {time:120, x:-400, y:  20},
						};
					}else{
						this.movTable = {	//移動パターンテーブル
							0: {time:  0, x:   0, y:   0},
							1: {time: 20, x:  20, y:  20},
							2: {time: 40, x: 100, y:  50},
							3: {time: 60, x: 130, y: 100},
							4: {time: 80, x: 200, y:  80},
							5: {time:100, x: 260, y:  60},
							6: {time:120, x: 400, y:  20},
						};
					}
					this.movTableMax = 6;
					this.movTableNow = 0;	//現在テーブル
					this.nextTime = 0;
					for( var i = 0; i < this.movTableMax+1; i++ ){
						this.movTable[i].time = ~~( this.movTable[i].time/spd);
					}
				}
				//テーブルに従って移動
				var position = this.movTable[this.movTableNow];
				if( position.time == this.time && this.movTableNow < this.movTableMax ){
					this.movTableNow++;
					var position = this.movTable[this.movTableNow];
					this.fromX = this.x;
					this.fromY = this.y;
					this.toX = position.x + this.startX;
					this.toY = position.y + this.startY;

					var tx = this.toX, ty = this.toY;
					this.vx = (this.toX-this.x) / (~~(position.time/spd) - this.time);
					this.vy = (this.toY-this.y) / (~~(position.time/spd) - this.time);
				}
				this.x += this.vx;
				this.y += this.vy;

				if( this.time > ~~(40/spd) && this.time % ~~(10/spd) == 0 && this.count > 0 ){
					enterNWayBullet( this, BULLET_SMALL, this.x + 16, this.y + 20, player.x+16, player.y+16 , 20, 3, 3, 0 );
					this.count--;
				}
			},

			'BigWing':function(){	//BigWing
				//初期化処理
				if( this.time == 0 ){
					this.dead = function(){
						for( i = 0; i < 20; i++ ){
							x = rand( 128 );
							y = rand( 47 );
							burn( 1, this.x + x, this.y + y, BG.vx+this.vx/2, BG.vy+this.vy/2 );
							if( touch )eraseBullet( this );
						}
						this.release();
					};
					this.vx = 0;
					this.vy = 0;
				}
				if( game.frame % ~~(4/spd) == 0 ){
					this.frame++;
					this.frame %= 2;
				}
				if( this.time < ~~(240/spd) ){
					if( game.frame % ~~(3/spd) == 0 )this.y += 1;
				}else{
					if( game.frame % ~~(3/spd) == 0 ){
						if( this.startX < 160 )this.x += 1;else this.x -= 1;
					}
				}
				if( this.time % ~~(33/spd) == 0 ){
					enterNWayBullet( this, BULLET_MEDIUM1, this.x + 64, this.y + 30, this.x + 64, this.y+100 , 10, 4, 2, 0 );
//					enterBullet( this, BULLET_SMALL, this.x + 32, this.y + 20, -1, 3, 0 );
//					enterBullet( this, BULLET_SMALL, this.x + 96, this.y + 20,  1, 3, 0 );

				}
				if( this.time % ~~(65/spd) == 0 ){
					enterNWayBullet( this, BULLET_MEDIUM2, this.x + 32, this.y + 30, this.x + 32, this.y+100 , 10, 3, 2, 0 );
					enterNWayBullet( this, BULLET_MEDIUM2, this.x + 96, this.y + 30, this.x + 96, this.y+100 , 10, 3, 2, 0 );
				}
			},

			'Delta':function(){
				//初期化処理
				if( this.time == 0 ){
					this.vx = 0;
					this.burnType = 1;
					if( this.y > 0 ){
						this.vy = -1;
					}else{
						this.vy = 1;
						this.rotation = 180;
					}
					this.count = 0;
				}
				if( game.frame % ~~(4/spd) == 0 ){
					this.frame++;
					this.frame %= 2;
				}
				if( this.time % ~~(30/spd) == 0 ){
					if( this.count % 2 )
						enterCircleBullet( this, BULLET_MEDIUM1, this.x+32, this.y+24, this.x+16, this.y+100, 8, 2, 0 );
					else
						enterCircleBullet( this, BULLET_MEDIUM1, this.x+32, this.y+24, this.x+16, this.y+100, 9, 2, 0 );
					this.count++;
				}
				this.y += this.vy;
			},

			'Trident':function(){	//MissleCarrier
				//初期化処理
				if( this.time == 0 ){
					this.burnType = 1;
					this.vx = 0;
					this.vy = 1;
					this.mis1 = enterEnemy( 'Missile', this.x +  5, this.y - 20, 0 );
					this.mis2 = enterEnemy( 'Missile', this.x + 83, this.y - 20, 0 );
					this.mis1.vx = -1;
					this.mis2.vx =  1;
					this.dead = function(){
						for( i = 0; i < 10; i++ ){
							x = rand( 120 );
							y = rand( 80 );
							burn( 1, this.x + x, this.y + y, 0, BG.vy );
						}
						this.release();
					};
					this.count = 10;
					this.interval = ~~(180/spd);
				}
				if( this.time % ~~(6/spd) == 0 && this. count > 0 && this.interval == 0 ){
					this.count--;
					if( this.count == 0 ){
						this.interval = ~~(120/spd);
						this.count = 10;
					}
				}else{
					this.interval--; 
				}
				if( this.time % ~~(3/spd) == 0 )this.y += this.vy;
			},
			'Missile':function(){
				if( this.time == 0 ){
					this.burnType = 1;
					this.vx = 0;
					this.vy = 1;
					this._element.style.zIndex = LAYER_OBJECT5;
					this.dead = function(){
						for( i = 0; i < 10; i++ ){
							burn( 0, this.x+rand(20)-10, this.y + 100 - i * 16, 0, this.vy/2+BG.vy );
						}
						this.release();
					};
				}
				if( this.time % ~~(3/spd) == 0 ){
					this.y += this.vy;
					if( this.time > ~~(60/spd) && this.time < ~~(120/spd) ){
						this.x += this.vx;
						this.vy = 3;
					}
					if( this.time > ~~(120/spd) ){
						this.vy = 5;
					}
				}
				if( this.def < 40 && this.frame == 0 ||	this.def < 30 && this.frame == 1 ){
					this.frame++;
				}
			},

			'SkyFish':function(){
				if( this.time == 0 ){
					this.tx = this.x;
					this.ty = this.y + 130;
					this.pattern = 0;
					this.count = 3;
					this.defRelease = this.release;
					this.release = function(){
						this.rt = null;
						this.defRelease();
						this.release = this.defRelease;
					};

					//Add roter
					this.rt = new Sprite( 32, 32 );
					this.rt.image = game.assets['media/enemy5_2.png'];
					this.rt.x = this.x;
					this.rt.y = this.y;
					this.rt.body = this;
					this.rt.frame = 0;
					this.rt._element.style.zIndex = LAYER_OBJECT3;
					this.rt.addEventListener('enterframe', function() {
						if( this.age % ~~(3/spd) == 0 )this.frame++;
						this.frame %= 4;
						if( this.body.def < 1 || !this.body.using ){
							stage.removeChild( this );
						}
					});
					stage.addChild( this.rt );					
				}

				//自機の方向を向く
				var ax = this.x - player.x;
				var ay = this.y - player.y;
				var rad = Math.atan2( ay, ax );
				var deg = ~~( rad * 180 / 3.14159);
				this.rotation = deg+90;

				switch( this.pattern ){
					case 0:
						if( this.y < this.ty ){
							var by = this.y;
							this.y = ~~( (this.ty - this.y ) / ~~(30/spd) + this.y );
							if( this.y == by )this.pattern++;
						}
						break;
					case 1:
						if( this.time % ~~(15/spd) == 0 ){
							enterSnipeBullet( this, BULLET_SMALL, this.x + 16, this.y + 20, 2, 0 );
							this.count--;
							if( this.count == 0 )this.pattern++;
						}
						break;
					case 2:
						this.y -= 2;
						break;
				}
				this.rt.x = this.x;
				this.rt.y = this.y;
			},
			'SkyFish2':function(){
				if( this.time == 0 ){
					this.tx = player.col.x + player.col.width/2-3;
					this.ty = player.col.y + player.col.height/2-3;
					var d = Math.sqrt((this.tx-this.x)*(this.tx-this.x) + (this.ty-this.y)*(this.ty-this.y));
					this.vx = (this.tx-this.x)/d*2;
					this.vy = (this.ty-this.y)/d*2;
					this.pattern = 0;
					this.defRelease = this.release;
					this.release = function(){
						this.rt = null;
						this.defRelease();
						this.release = this.defRelease;
					};

					//Add roter
					this.rt = new Sprite( 32, 32 );
					this.rt.image = game.assets['media/enemy5_2.png'];
					this.rt.x = this.x;
					this.rt.y = this.y;
					this.rt.body = this;
					this.rt.frame = 0;
					this.rt._element.style.zIndex = LAYER_OBJECT3;
					this.rt.addEventListener('enterframe', function() {
						if( this.age % ~~(3/spd) == 0 )this.frame++;
						this.frame %= 4;
						if( this.body.def < 1 || !this.body.using ){
							stage.removeChild( this );
						}
					});
					stage.addChild( this.rt );					
				}

				//自機の方向を向く
				var ax = this.x - player.x;
				var ay = this.y - player.y;
				var rad = Math.atan2( ay, ax );
				var deg = ~~( rad * 180 / 3.14159);
				this.rotation = deg+90;
				
				if( this.time % 40 == 0 && this.y < player.y ){
					enterSnipeBullet( this, BULLET_SMALL, this.x + 16, this.y + 20, 3, 0 );
				}
				this.x += this.vx*spd;
				this.y += this.vy*spd;
				this.rt.x = this.x;
				this.rt.y = this.y;
			},
			'SkyBox':function(){
				if( this.time == 0 ){
					if( this.x < 160 ){
						this.vx = 1;
						this.tx = this.x+120+rand(150);
					}else{
						this.vx = -1;
						this.tx = this.x-120-rand(150);
					}
					this.vy = 0;
					this.ty = this.y;
					this.pattern = 0;

					//Add roter
					this.rt = new Sprite( 112, 48 );
					this.rt.image = game.assets['media/enemy6_2.png'];
					this.rt.sx = -4;
					this.rt.sy = 8;
					this.rt.x = this.x + this.rt.sx;
					this.rt.y = this.y + this.rt.sy;
					this.rt.body = this;
					this.rt.frame = 0;
					this.rt._element.style.zIndex = LAYER_OBJECT3;
					this.rt.addEventListener('enterframe', function() {
						if( this.age % ~~(3/spd) == 0 )this.frame++;
						this.frame %= 4;
						if( this.body.def < 1 || !this.body.using ){
							stage.removeChild( this );
						}
					});
					stage.addChild( this.rt );					
				}
				if( this.time % ~~(4/spd) == 0 ){
					this.frame++;
					this.frame %= 2;
				}
				if( this.time % ~~(40/spd) == 0 ){
					enterNWayBullet( this, BULLET_MEDIUM4, this.x+16, this.y+20, this.x+16, this.y+100, 20, 3, 3, 0 );
					enterNWayBullet( this, BULLET_MEDIUM4, this.x+80, this.y+20, this.x+80, this.y+100, 20, 3, 3, 0 );
				}
				switch( this.pattern ){
					case 0:
						this.x = ~~( (this.tx - this.x ) / ~~(30/spd) + this.x );
						this.y = ~~( (this.ty - this.y ) / ~~(30/spd) + this.y );
						if( this.time > ~~(90/spd) )this.pattern++;
						break;
					case 1:
						this.x += this.vx*spd;
						this.y -= spd;
						break;
				}
				this.rt.x = this.x + this.rt.sx;
				this.rt.y = this.y + this.rt.sy;
			},

			//ボス１
			/////////////////////////////////////////////////////////////
			'SkyBreaker':function(){
				if( this.time == 0 ){
					//メインボディの設定
					this.vx = 0;
					this.vy = 1;
					this.pattern = 0;
					this.cycle = 0;
					this.defRelease = this.release;
					this.release = function(){
						this.R = null;
						this.L = null;
						this.rtL = null;
						this.rtR = null;
						this.hatch = null;
						this.bb = null;
						this.defRelease();
						this.release = this.defRelease;
					};
					this.dead = function(){
						for( i = 0; i < 20; i++ ){
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16, 0, BG.vy );
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16, 0, BG.vy );
						}
						if( this.L )this.L.dead();
						if( this.R )this.R.dead();
						stage.removeChild( this.hatch );
						eraseBullet( null );
						this.release();
					};

					this.L = enterEnemyChild( this, 'SkyBreaker_L', -55, 10, 0 );
					this.R = enterEnemyChild( this, 'SkyBreaker_R', 170, 10, 0 );

					//Add brooken body
					this.bb = new Sprite( 280, 112 );
					this.bb.image = game.assets['media/boss1_break.png'];
					this.bb.x = this.x - 50;
					this.bb.y = this.y - 0;
					this.bb.sx = -55;
					this.bb.sy = 0;
					this.bb.vx = 0;
					this.bb.time = 0;
					this.bb.body = this;
					this.bb._element.style.zIndex = LAYER_OBJECT5;
					this.bb.addEventListener('enterframe', function(){
						if( this.body.def < 1 ){
							if( this.time % 5 == 0 ){
								this.y+=2;
								this.x+=this.vx;
								this.vx *= -1;
								burn( 1, this.x+rand(this.width), this.y + rand(this.height), 0, -1 );
								burn( 1, this.x+rand(this.width), this.y + rand(this.height), 0, -1 );
							}
							if( this.time == 120 ){
								for( i = 0; i < 100; i++ ){
									burn( 1, this.x+rand(this.width)-16, this.y+rand(this.height)-16, 0, 0 );
								}
								stage.removeChild( this );
								stage.clear = true;
							}
							this.time++;
						}
					});
					stage.addChild( this.bb );

					//Add roter
					this.rtL = new Sprite( 80, 80 );
					this.rtL.image = game.assets['media/boss1_rotL.png'];
					this.rtL.sx = -24;
					this.rtL.sy = 15;
					this.rtL.x = this.x + this.rtL.sx;
					this.rtL.y = this.y + this.rtL.sy;
					this.rtL.body = this;
					this.rtL.frame = 0;
					this.rtL._element.style.zIndex = LAYER_OBJECT3;
					this.rtL.addEventListener('enterframe', function() {
						if( this.age % ~~(3/spd) == 0 )this.frame++;
						this.frame %= 4;
						if( this.body.def < 1 || !this.body.using ){
							stage.removeChild( this );
						}
					});
					stage.addChild( this.rtL );					
					this.rtR = new Sprite( 80, 80 );
					this.rtR.image = game.assets['media/boss1_rotR.png'];
					this.rtR.sx = 112;
					this.rtR.sy = 15;
					this.rtR.x = this.x + this.rtR.sx;
					this.rtR.y = this.y + this.rtR.sy;
					this.rtR.body = this;
					this.rtR.frame = 0;
					this.rtR._element.style.zIndex = LAYER_OBJECT3;
					this.rtR.addEventListener('enterframe', function() {
						if( this.age % ~~(3/spd) == 0 )this.frame++;
						this.frame %= 4;
						if( this.body.def < 1 || !this.body.using ){
							stage.removeChild( this );
						}
					});
					stage.addChild( this.rtR );					

					//ハッチ
					this.hatch = new Sprite( 32, 32 );
					this.hatch.image = game.assets['media/boss1_hatch.png'];
					this.hatch.sx = 68;
					this.hatch.sy = 30;
					this.hatch.frame = 0;
					this.hatch.open = false;	//現在の状態
					this.hatch._element.style.zIndex = LAYER_OBJECT3;
					stage.addChild( this.hatch );

					this.pattern = 0;	//行動パターン
					this.rad = 0;
					this.rad2 = 0;
					this.step = Math.PI / 360;	//0.5
					this.count = 0;
					this.time2 = 0;
				}

				//登場パターン
				if( this.pattern == 0 ){
					this.x += this.vx*spd;
					this.y += this.vy*spd;
					if( this.y > 40 )this.pattern++;
				}
				//回転
				if( this.pattern == 1 && this.time-this.time2 > ~~(90/spd) ){
					if( this.time % ~(60/spd) == 0 ){
						if( this.count % 2 ){
							enterCircleBullet( this, BULLET_MEDIUM2, this.x+  7, this.y+47, this.x+  7, this.y+100 , 10, 2, 0 );
							enterCircleBullet( this, BULLET_MEDIUM2, this.x+145, this.y+47, this.x+145, this.y+100 , 10, 2, 0 );
						}else{
							enterCircleBullet( this, BULLET_MEDIUM3, this.x+  7, this.y+47, this.x+  7, this.y+100 , 11, 2, 0 );
							enterCircleBullet( this, BULLET_MEDIUM3, this.x+145, this.y+47, this.x+145, this.y+100 , 11, 2, 0 );
						}
//						enterNWayBullet( this, BULLET_MEDIUM1, this.x+24, this.y+60, this.x+24, this.y+100 , 20, 4, 2, 0 );
					}
					this.x = Math.sin( this.rad )*50+70;
					this.y = Math.cos( this.rad )*20+20;
					this.rad += this.step*2*spd;
					//１週したら別パターンへ移行
					if( this.rad > Math.PI * 2 ){
						this.pattern++;
						this.cycle++;
						this.cycle%=2;
						this.rad2 = 0;
						this.time2 = this.time;	//パターン移行時間
						this.hatch.open = true;
					}
				}
				//螺旋撒き
				if( this.pattern == 2 && this.cycle == 1 && this.time-this.time2 > ~~(90/spd) ){
					if( this.time % ~~(10/spd) == 0 ){
						var rad = this.rad2;
						var tx = this.x + 76 + Math.sin( rad )*320;
						var ty = this.y + 60 + Math.cos( rad )*320;
						enterPlaceBullet( this, BULLET_MEDIUM2, this.x+76, this.y+40, tx, ty, 3, 0 );
						rad+=1.57;
						var tx = this.x + 76 + Math.sin( rad )*320;
						var ty = this.y + 60 + Math.cos( rad )*320;
						enterPlaceBullet( this, BULLET_MEDIUM3, this.x+76, this.y+40, tx, ty, 3, 0 );
						rad+=1.57;
						var tx = this.x + 76 + Math.sin( rad )*320;
						var ty = this.y + 60 + Math.cos( rad )*320;
						enterPlaceBullet( this, BULLET_MEDIUM2, this.x+76, this.y+40, tx, ty, 3, 0 );
						rad+=1.57;
						var tx = this.x + 76 + Math.sin( rad )*320;
						var ty = this.y + 60 + Math.cos( rad )*320;
						enterPlaceBullet( this, BULLET_MEDIUM3, this.x+76, this.y+40, tx, ty, 3, 0 );
						if( this.rad2 < Math.PI ){
							this.rad2 += this.step * 40;
						}else{
							this.rad2 += this.step * 20;
						}
						if( this.rad2 > Math.PI * 1.5 ){
							this.pattern--;
							this.rad = 0;
							this.rad2 = 0;
							this.time2 = this.time;	//パターン移行時間
							this.hatch.open = false;
						}
					}
				}
				//5WAY弾*3
				if( this.pattern == 2 && this.cycle == 0 && this.time-this.time2 > 90 ){
					if( this.rad2 == 0 ){
						this.tx = player.x+12;
						this.ty = player.y+12;
					}
					if( this.time % ~~(6/spd) == 0 ){
						enterNWayBullet( this, BULLET_MEDIUM4, this.x+  7, this.y+47, this.tx, this.ty, 30, 4, 3, 0 );
						enterNWayBullet( this, BULLET_MEDIUM2, this.x+ 76, this.y+40, this.tx, this.ty, 30, 5, 3, 0 );
						enterNWayBullet( this, BULLET_MEDIUM4, this.x+145, this.y+47, this.tx, this.ty, 30, 4, 3, 0 );
						this.rad2+=1;
					}
					if( this.rad2 > 5 ){
						this.pattern--;
						this.rad = 0;
						this.rad2 = 0;
						this.time2 = this.time;	//パターン移行時間
						this.hatch.open = false;
					}
				}
				
				//ハッチの開閉
				if( this.time != this.time2 ){
					if( this.time % ~~(6/spd) == 0 ){
						if( this.hatch.open ){
							this.hatch.frame++;
							if( this.hatch.frame > 3 )this.hatch.frame = 3;
						}else{
							this.hatch.frame--;
							if( this.hatch.frame < 0 )this.hatch.frame = 0;
						}
					}
				}

				//付属物の追従処理
				this.bb.x = this.x + this.bb.sx;
				this.bb.y = this.y + this.bb.sy;
				if( this.L ){
					var arm = this.L;
					arm.x = this.x + arm.sx;
					arm.y = this.y + arm.sy;
				}
				if( this.R ){
					var arm = this.R;
					arm.x = this.x + arm.sx;
					arm.y = this.y + arm.sy;
				}
				this.rtL.x = this.x + this.rtL.sx;
				this.rtL.y = this.y + this.rtL.sy;
				this.rtR.x = this.x + this.rtR.sx;
				this.rtR.y = this.y + this.rtR.sy;
				this.hatch.x = this.x + this.hatch.sx;
				this.hatch.y = this.y + this.hatch.sy;
			},
			'SkyBreaker_L':function(){
				if( this.time == 0 ){
					this.dead = function(){
						burnBig( this.x-16, this.y-16,this.width, this.height, 20, BG.vx, BG.vy );
						eraseBullet( this );
						if( this.cannon && this.cannon.using )this.cannon.dead();
						this.parent.L = null;
						this.release();
					};
					this.cannon = enterEnemyChild( this, 'SkyBreaker_C', 14, 57, 0 );

				}
				if( this.cannon ){
					this.cannon.x = this.x + this.cannon.sx;
					this.cannon.y = this.y + this.cannon.sy;
				}
			},
			'SkyBreaker_R':function(){
				if( this.time == 0 ){
					this.dead = function(){
						burnBig( this.x-16, this.y-16,this.width, this.height, 20, BG.vx, BG.vy );
						eraseBullet( this );
						if( this.cannon && this.cannon.using )this.cannon.dead();
						this.parent.R = null;
						this.release();
					};
					this.cannon = enterEnemyChild( this, 'SkyBreaker_C', 28, 57, 0 );

				}
				if( this.cannon ){
					this.cannon.x = this.x + this.cannon.sx;
					this.cannon.y = this.y + this.cannon.sy;
				}
			},
			'SkyBreaker_C':function(){
				if( this.time == 0 ){
					this.interval = 0;
					this.count = 3;
				}
				if( this.time % ~~(4/spd) == 0 ){
					this.frame++;
					this.frame%=3;
				}
				if( this.time % ~~(15/spd) == 0 && this.count > 0 ){
//					enterBullet( this, BULLET_SMALL, this.x + 4, this.y + 32, 0, 2, 0 );
					enterNWayBullet( this, BULLET_MEDIUM1, this.x, this.y+28, this.x, this.y+100, 30, 3, 3, 0 );
					this.count--;
					if( this.count == 0 ){
						this.interval = sec(3);
					}
				}
				if( this.interval > 0 ){
					this.interval--;
					if( this.interval == 0 )this.count = 3;
				}
			},

			//ボス２
			/////////////////////////////////////////////////////////////
			'Goriate':function(){
				if( this.time == 0 ){
					//メインボディの設定
					this.vx = 0;
					this.vy = 1;
					this.defRelease = this.release;
					this.release = function(){
						this.armL = null;
						this.armR = null;
						this.bb = null;
						this.defRelease();
						this.release = this.defRelease;
					};
					this.dead = function(){
						for( i = 0; i < 20; i++ ){
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16, 0, 0 );
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16, 0, 0 );
						}
						if( this.armL )this.armL.dead();
						if( this.armR )this.armR.dead();
						stage.removeChild( this.hatch );
						eraseBullet( this );
						this.release();
					};

					//Add both arm
					this.armL = enterEnemyChild( this, 'Goriate_L', -48, -35, 0 );
					this.armR = enterEnemyChild( this, 'Goriate_R',  55, -35, 0 );

					//Add brooken body
					this.bb = new Sprite( 184, 184 );
					this.bb.image = game.assets['media/boss2_break.png'];
					this.bb.x = this.x - 60;
					this.bb.y = this.y - 40;
					this.bb.sx = -60;
					this.bb.sy = -40;
					this.bb.vx = 2;
					this.bb.time = 0;
					this.bb.body = this;
					this.bb._element.style.zIndex = LAYER_OBJECT5;
					this.bb.addEventListener('enterframe', function() {
						if( this.body.def < 1 ){
							if( this.time % ~~(6/spd) == 0 ){
								this.y+=1;
								this.x += this.vx;
								this.vx *= -1;
								burn( 1, this.x+rand(this.width), this.y + rand(this.height), 0, -1 );
								burn( 1, this.x+rand(this.width), this.y + rand(this.height), 0, -1 );
							}
							if( this.time == sec(2) ){
								for( i = 0; i < 100; i++ ){
									burn( 1, this.x+rand(this.width)-16, this.y+rand(this.height)-16, 0, 0 );
								}
								stage.removeChild( this );
								stage.clear = true;
							}
							this.time++;
						}
					});
					stage.addChild( this.bb );
					
					this.pattern = 0;	//行動パターン
					this.count = 0;
					this.flag = false;
					this.tx = 0;
					this.ty = 0;
					
					this.count2 = 0;
				}
				if( this.pattern == 0 ){
					if( this.time % ~~(3/spd) == 0 ){
						this.x += this.vx;
						this.y += this.vy;
					}
					if( this.y > 20 ){
						this.pattern++;
						this.vx = 1;
						this.vy = 0;
						this.count = 10;
						this.interval = ~~(180/spd);
						this.bTime = this.time;
					}
				}
				if( this.pattern == 1 || this.pattern == 2 ){
					//移動
					if(this.time % ~(6/spd) == 0 ){
						if( this.flag ){
							this.x += 1;
							if( this.x > 200 )this.flag = false;
						}else{
							this.x -= 1;
							if( this.x < 80 )this.flag = true;
						}
					}

					//攻撃
					if( this.time % ~~(3/spd) == 0 && this.count > 0 ){
						if( this.count == 10 ){
							this.tx = player.x + 16;
							this.ty = player.y + 16;
						}
						if( this.pattern == 1 )enterNWayBullet( this, BULLET_MEDIUM1, this.x+24, this.y+60, this.x+24, this.y+100 , 30*this.count, 4, 2, 0 );
						if( this.pattern == 2 )enterNWayBullet( this, BULLET_MEDIUM1, this.x+24, this.y+60, this.tx, this.ty, 50-this.count*4, 5, 2, 0 );
						this.count--;
						if( this.count == 0 ){
							this.bTime = this.time;
						}
					}
					if( this.pattern == 2 && this.time % ~~(30/spd) == 0 ){
						if( this.count2 % 2 )enterCircleBullet( this, BULLET_MEDIUM1, this.x+24, this.y+60, this.x+24, this.y+100 , 12, 2, 0 );
						else enterCircleBullet( this, BULLET_MEDIUM1, this.x+24, this.y+60, this.x+24, this.y+100 , 11, 3 );
						this.count2++;
					}

					if( this.time - this.bTime == this.interval ){
						this.count = 10;
					}
				}
				if( this.pattern == 1 && this.armL == null && this.armR == null ){
					this.pattern = 2;
				}

				//付属物の追従処理
				this.bb.x = this.x + this.bb.sx;
				this.bb.y = this.y + this.bb.sy;
				if( this.armL ){
					var arm = this.armL;
					arm.x = this.x + arm.sx;
					arm.y = this.y + arm.sy;
				}
				if( this.armR ){
					var arm = this.armR;
					arm.x = this.x + arm.sx;
					arm.y = this.y + arm.sy;
				}
			},
			//左腕
			'Goriate_L':function(){
				if( this.time == 0 ){
					this.dead = function(){
						for( i = 0; i < 30; i++ ){
							burn( 1, this.x+rand(96)-40, this.y + rand(220)-10, 0, 0 );
						}
						eraseBullet( this );
						if( this.wing && this.wing.using )this.wing.dead();
						if( this.turret )this.turret.dead();
						this.parent.armL = null;
						this.release();
					};
					this.count = 5;
					this.interval = 120;
					this.bTime = this.time;

					//ウィングの追加
					this.wing = enterEnemyChild( this, 'Goriate_WL', -11, 43, 0 );

					//砲台の追加
					this.turret = enterEnemyChild( this, 'Goriate_T', 15, 45, 0 );
				}
				if( this.time % ~(6/spd) == 0 && this.count > 0 ){
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110, -1, 2, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110,  1, 2, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110, -1, 3, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110,  1, 3, 0 );
					this.count--;
					if( this.count == 0 ){
						this.bTime = this.time;
					}
				}
				if( this.time - this.bTime == ~~(this.interval/spd) ){
					this.count = 5;
				}
				if( this.wing ){
					this.wing.x = this.x + this.wing.sx;
					this.wing.y = this.y + this.wing.sy;
				}
				if( this.turret ){
					this.turret.x = this.x + this.turret.sx;
					this.turret.y = this.y + this.turret.sy;
				}
			},
			//右腕
			'Goriate_R':function(){
				if( this.time == 0 ){
					this.dead = function(){
						for( i = 0; i < 30; i++ ){
							burn( 1, this.x+rand(96)-40, this.y + rand(220)-10, 0, 0 );
						}
						if( this.wing && this.wing.using )this.wing.dead();
						if( this.turret )this.turret.dead();
						eraseBullet( this );
						this.parent.armR = null;
						this.release();
					};
					this.count = 5;
					this.interval = 120;
					this.bTime = this.time;

					//ウィングの追加
					this.wing = enterEnemyChild( this, 'Goriate_WR', 50, 43, 0, 0 );
					//砲台の追加
					this.turret = enterEnemyChild( this, 'Goriate_T', 15, 45, 0, 0 );
				}
				if( this.time % ~~(6/spd) == 0 && this.count > 0 ){
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110, -1, 2, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110,  1, 2, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110, -1, 3, 0 );
					enterBullet( this, BULLET_MEDIUM1, this.x + 20, this.y + 110,  1, 3, 0 );
					this.count--;
					if( this.count == 0 ){
						this.bTime = this.time;
					}
				}
				if( this.time - this.bTime == ~~(this.interval/spd) ){
					this.count = 5;
				}
				if( this.wing ){
					this.wing.x = this.x + this.wing.sx;
					this.wing.y = this.y + this.wing.sy;
				}
				if( this.turret ){
					this.turret.x = this.x + this.turret.sx;
					this.turret.y = this.y + this.turret.sy;
				}
			},
			//砲台
			'Goriate_T':function(){
				if( this.time == 0 ){
					this._element.style.zIndex = LAYER_OBJECT3;
					this.count = 5;
					this.interval = 240;
					this.bTime = this.time;
				}
				//自機の方向を向く
				var ax = this.x - player.x;
				var ay = this.y - player.y;
				var rad = Math.atan2( ay, ax );
				var deg = ~~( rad * 180 / 3.14159);
				this.rotation = deg+90;

				if( this.time % ~~(3/spd) == 0 && this.count > 0 ){
					if( this.count == 5 ){
						this.tx = player.x + 16;
						this.ty = player.y + 16;
					}
					enterPlaceBullet( this, BULLET_SMALL, this.x + 4, this.y + 16, this.tx, this.ty, 3, 0 );
					enterPlaceBullet( this, BULLET_SMALL, this.x +12, this.y + 16, this.tx, this.ty, 3, 0 );
					this.count--;
					if( this.count == 0 ){
						this.bTime = this.time;
					}
				}
				if( this.time - this.bTime == this.interval ){
					this.count = 5;
				}
			},
		};
	}
	if( !debugview )game.start();
	else game.debug();
};
