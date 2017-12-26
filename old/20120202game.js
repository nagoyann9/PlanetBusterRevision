/*

	Planet Buster
	2012/01/28

*/

//zIndex制御用
LAYER_SYSTEM		= 200;	//システム
LAYER_FOREGROUND	= 190;	//前景
LAYER_EFFECT		= 180;	//特殊効果
LAYER_OBJECT1		= 170;
LAYER_OBJECT2		= 160;
LAYER_OBJECT3		= 150;	//自機,
LAYER_OBJECT4		= 140;	//敵機、弾
LAYER_OBJECT5		= 130;
LAYER_OBJECT6		= 120;
LAYER_BACKGROUND	= 10;	//背景

enchant();

window.onload = function() {
	var game = new Game( 320, 320 );
	game.fps = 60;
	var sec = function( time ){ return game.fps * time; }
	var rand = function( max ){ return Math.floor(Math.random() * max); }

	game.preload(
		'font.png',			'media/icon0.gif',	 'media/bar.png', 'media/warning.gif', 'media/complete.gif',
		'media/earth.png',	'media/space1.png',	 'media/space2.png',
		'media/effect.gif', 'media/effect1.png', 'media/effect2.png', 'media/effect3.png',  'media/effect4.png', 'media/stargate.png',
		'media/myship.png', 'media/bullet1.png', 'media/bullet2.png', 'media/missile.png',
		'media/enemy1.png', 'media/enemy2.png',	 'media/enemy3.png',  'media/enemy4.png',
		'media/boss1_body.png', 'media/boss1_engine.png', 'media/boss1_wing_L.png', 'media/boss1_wing_R.png', 'media/boss1_turret.png',  'media/boss1_break.png'
	);

	game.onload = function () {
		//環境変数
		/////////////////////////////////////////////////////////////////////////////
		var touch = false;

		//ステージ準備
		/////////////////////////////////////////////////////////////////////////////
		stage = new Group();
		stage.number = 1;		//現在ステージ
		stage.time = 0;			//ステージ経過フレーム
		stage.event = false;	//イベント
		stage.life = 3;			//残機
		stage.score = 0;		//スコア
		stage.advance = 0;		//ステージ進行状況
		stage.boss = false;		//ボス戦中フラグ
		stage.bossDead = false;	//ボス破壊フラグ
		game.rootScene.addChild( stage );
		game.rootScene.backgroundColor = "#000000";

		//バックグラウンド
		/////////////////////////////////////////////////////////////////////////////
		back = new Sprite( game.width, game.height * 2 );
		back.image = game.assets['media/earth.png'];
		back.pattern = 0;
//		back._element.style.zIndex = LAYER_BACKGROUND;
		back.addEventListener('enterframe', function(){
			if( stage.number == 1 ){
				switch( this.pattern ){
					case 0:
						if( game.frame % 5 == 0 ){
							this.y += 1;
							if( this.y == 320 ){
								this.pattern++;
								this.y = -320;
								this.image = game.assets['media/space1.png'];
								this.opacity = 0;
							}
						}
						break;
					case 1:
						if( game.frame % 5 == 0 ){
							if( this.opacity < 1 )this.opacity += 0.05;
						}
						if( game.frame % 12 == 0 )this.y += 1;
					case 2:
						if( this.opacity < 1 && game.frame % 5 == 0 )this.opacity += 0.1;
						if( game.frame % 4 == 0 && this.y < 0 ){
							this.y += 1;
						}
						break;
				}
			}
		});
		stage.addChild( back );

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
		game.rootScene.addChild( scoreLabel );

		//ライフ表示
		/////////////////////////////////////////////////////////////////////////////
		var dspLife = new Group();
		dspLife.life = new Array(5);
		for( var i = 0; i < 5; i++ ){
			dspLife.life[i] = new Sprite( 32, 32 );
			dspLife.life[i].image = game.assets['media/myship.png'];
			dspLife.life[i].scaleX = 0.5;
			dspLife.life[i].scaleY = 0.5;
			dspLife.life[i].x = i * 16 - 8;
			dspLife.life[i].y = 13;
			dspLife.life[i].visible = false;
			dspLife.life[i]._element.style.zIndex = LAYER_SYSTEM;
			game.rootScene.addChild( dspLife.life[i] );
		}
		dspLife.reflesh = function(){
			for( var i = 0; i < 5; i++ ){
				if( i < stage.life ){
					this.life[i].visible = true;				
				}else{
					this.life[i].visible = false;				
				}
			}
		};
		dspLife.reflesh();

		//デバッグ用テキスト（ステージ進行チェック）
		/////////////////////////////////////////////////////////////////////////////
		var advanceLabel = new Label( "" );
		advanceLabel.color = "#ffffff";
		advanceLabel.font = "bold";
		advanceLabel.x = 180;
		advanceLabel.y = 5;
		advanceLabel._element.style.zIndex = LAYER_SYSTEM;
		game.rootScene.addChild( advanceLabel );

		//デバッグ用テキスト
		/////////////////////////////////////////////////////////////////////////////
		var debugLabel = new Label( "" );
		debugLabel.color = "#ffffff";
		debugLabel.font = "bold";
		debugLabel.x = 120;
		debugLabel.y = 35;
		debugLabel._element.style.zIndex = LAYER_SYSTEM;
		game.rootScene.addChild( debugLabel );

		//ステージ進行
		/////////////////////////////////////////////////////////////////////////////
		stage.addEventListener( 'enterframe', function() {
//			debugLabel.text = "level : " + level;
			if( stage.time == 0 ){
				player.visible = true;
				eventStartup( 0, 160 );
			}

			//ステージデータを読み込んで敵の出現パターンを作る
			if( this.time % 120 == 0  && !this.event && !this.boss ){
				advanceLabel.text = "advance " + (this.advance/5+1) + "/"  + (stageData.length/5+1) + " :";
				for( var i = 0; i < 5; i++ ){
					var ad = stageData.charAt( this.advance );
					if( ad == "E" ){
						this.event = true;
						eventStargate();
					}
					if( ad == "W" ){
						eventWarning();
					}
					if( ad == "B" ){
						this.boss = true;
					}
					var pattern = patterns[ad];
					for( var j in pattern ){
						var obj = pattern[j];
						if( obj.type != 'nop' ){
							enterEnemy( obj.type, obj.x, obj.y, obj.offset );
						}
					}
					advanceLabel.text += ad + ":";
					this.advance++;
				}
			}
			//特殊フラグ処理
			if( this.bossDead ){
				eventStageClear();
				this.bossDead = false;
			}
			this.time++;
		});

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
		player.auto = false;
		player.muteki = false;	//無敵中フラグ
		player.shotON = true;	//ショットトリガ
		player.power = 3;		//パワーアップ段階
		player.energy = 0;
		player.shotpower = 10;	//ショット威力
		player.shotspan = 5;	//間隔
		player._element.style.zIndex = LAYER_OBJECT3;

		//被ダメージ処理
		player.damaged = function(){
			if( this.muteki > 0 )return;
			burnShip( this.x - 8, this.y - 8 );
			stage.life--;
			dspLife.reflesh();
			this.muteki = 180;
			eventStartup( 60, 220 );
			if( stage.life < 0 ){
				var msg = "MISSION FAILED. SCORE:" + stage.score;
				game.end( stage.score, msg );
			}
		};
		player.addEventListener( 'enterframe', function (){
			//無敵時間処理
			if( this.muteki > 0 ){
				this.muteki--;
				if( game.frame % 3 == 0 ){
					if( this.visible ){
						this.visible = false;
					}else{
						this.visible = true;
					}
				}
				if( this.muteki == 0 )this.visible = true;
			}
		
			//ショット
			if( game.frame % this.shotspan == 0 && this.shotON && !stage.event && !this.auto ){
				var pow = this.shotpower;
				if( touch )pow = Math.floor( pow * 0.6 );	//タッチ操作中は威力６割
				enterShot( 7, this.x +  8, this.y,  0, -8, pow );
				enterShot( 7, this.x + 16, this.y,  0, -8, pow );
				if( this.power > 0 ){
					enterShot( 6, this.x+ 0, this.y, -3, -6, pow );
					enterShot( 8, this.x+24, this.y,  3, -6, pow );
				}
				if( this.power > 1 ){
					enterShot( 7, this.x+ 0, this.y+4,  0, -8, pow );
					enterShot( 7, this.x+24, this.y+4,  0, -8, pow );
				}
				if( this.power > 2 ){
					enterShot( 6, this.x- 3, this.y+7, -3, -6, pow );
					enterShot( 8, this.x+27, this.y+7,  3, -6, pow );
				}
			}
			if( game.frame % 6 == 0 ){
				this.frame++;
				this.frame %= 2;
			}
			if( stage.event || this.auto )return;
			if( game.input.left  )this.x -= this.speed;
			if( game.input.right )this.x += this.speed;
			if( game.input.up    )this.y -= this.speed;
			if( game.input.down  )this.y += this.speed;
			if( this.x < 0 )this.x = 0;
			if( this.x > game.width - this.width )this.x = game.width - this.width;
			if( this.y < 0 )this.y = 0;
			if( this.y > game.height - this.height )this.y = game.height - this.height;
		});
        stage.addChild( player );

		//通常当たり判定チェックルーチン
		/////////////////////////////////////////////////////////////////////////////
		var defaultCollision = function( target ){
			if( target.intersect( this ) ){
				return true;
			}
			return false;
		}

		//通常爆発パターン
		/////////////////////////////////////////////////////////////////////////////
		var defaultDead = function( point ){
			burn( this.burnType, this.x, this.y );
			this.visible = false;
			this.using = false;
			stage.removeChild( this );
			stage.score += point;
		}

/////////////////////////////////////////////////////////////////////////////
//	敵管理
/////////////////////////////////////////////////////////////////////////////

		//敵準備
		/////////////////////////////////////////////////////////////////////////////
		var numEnemies = 50;
		var enemies = new Array( numEnemies );
		for( var i = 0; i < numEnemies; i++ ){
			enemies[i] = new Sprite( 32, 32 );
			enemies[i].image = game.assets['media/enemy1.png'];
			enemies[i].x = -20;		enemies[i].y = -20;
			enemies[i].vx = 0;		enemies[i].vy = 0;
			enemies[i].startX = 0;	enemies[i].startY = 0;	//Initial position
			enemies[i].fromX = 0;	enemies[i].fromY = 0;
			enemies[i].toX = 0;		enemies[i].toY = 0;
			enemies[i].frame = 0;
			enemies[i].parent = null;	//親
			enemies[i].child = null;		//子
			enemies[i].visible = false;
			enemies[i].using = false;	//使用中フラグ
			enemies[i].def = 999;		//耐久力
			enemies[i].burnType = 0;	//爆発パターン
			enemies[i].time = 0;		//投入後経過時間
			enemies[i].point = 0;						//得点
			enemies[i].flag = 0;						//行動パターン分岐フラグ
			enemies[i].algorithm = function( flag ){};	//行動パターン
			enemies[i].damaged = function( power ){		//被弾処理
				this.def -= power;
				if( this.def < 1 ){
					this.dead( this.point );
				}
			};
			enemies[i].collision = defaultCollision;	//当たり判定チェック
			enemies[i].dead = defaultDead;				//破壊パターンルーチン

			enemies[i].addEventListener('enterframe', function(){
				if( this.time < 0 ){
					this.time++;
					return;
				}
				if( !this.visible )return;
				this.algorithm();

				//画面範囲外（スプライトサイズ+64pix）に出たら自動で消す
				if( this.x < -this.width-64 || this.x > game.width+64 || this.y < -this.height-64 || this.y > game.height+64 ){
					if( !stage.boss ){
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
					}
				}
				this.time++;
			});
			
			enemies[i].colli
		}

		//敵投入
		/////////////////////////////////////////////////////////////////////////////
		var enterEnemy = function( type, x, y, offset ){
			for( var i = 0; i <  numEnemies; i++ ){
				if( !enemies[i].using ){
					//基本情報は初期化を行う
					enemies[i].visible = true;
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
					enemies[i].time = -offset;
					enemies[i].rotation = 0;
					enemies[i].burnType = 0;
					enemies[i].collision = defaultCollision;
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
		var enterEnemyChild = function( parent, type, x, y, offset ){
			var obj = enterEnemy( type, parent.x + x, parent.y + y, offset );
			obj.parent = parent;
			parent.child = obj;
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
			bullets[i].bx = 0;	bullets[i].by = 0;
			bullets[i].vx = 0;	bullets[i].vy = 0;
			bullets[i].visible = false;
			bullets[i].using = false;
			bullets[i].mine = false;
			bullets[i].num = 0;
			bullets[i].type = 0;
			bullets[i]._element.style.zIndex = LAYER_OBJECT4;
			bullets[i].addEventListener( 'enterframe', function (){
				if( !this.visible )return;
				this.bx = this.x;	this.by = this.y;
				this.x += this.vx;	this.y += this.vy;
				if( this.x < -this.width-32 || this.x > game.width+32 || this.y < -this.height-32 || this.y > game.height+32 ){
					this.visible = false;
					this.using = false;
					stage.removeChild( this );
				}
				if( this.type == 3 && game.frame % 5 == 0 ){
					this.frame++;
					this.frame %= 8;
				}

				//当たり判定
				if( this.mine ){
					//自機弾の場合
					for( i = 0; i < numEnemies; i++ ){
						if( !enemies[i].visible || enemies[i].time < 1 )continue;
						if( enemies[i].collision( this ) ){
							enemies[i].damaged( this.power );
							burnShot( this.x, this.y );
							this.visible = false;
							this.using = false;
							stage.removeChild( this );
						}
					}
				}else{
					//敵弾の場合
					if( player.within( this, 5 ) ){
						player.damaged();
					}
				}
			});
		}

		//自機ショット投入
		/////////////////////////////////////////////////////////////////////////////
		var enterShot = function( type, x, y, vx, vy, power ){
			for( var i = 0;i < numBullets; i++ ){
				if( !bullets[i].using ){
					bullets[i].image = game.assets['media/bullet1.png'];
					bullets[i].width = 8;
					bullets[i].height = 8;
					bullets[i].frame = type;
					bullets[i].x = x;
					bullets[i].y = y;
					bullets[i].vx = vx;
					bullets[i].vy = vy;
					bullets[i].visible = true;
					bullets[i].using = true;
					bullets[i].mine = true;
					bullets[i].type = 9;
					bullets[i].power = power;
					bullets[i]._element.style.zIndex = LAYER_OBJECT3;
					stage.addChild( bullets[i] );
					return bullets[i];
				}
			}
			return null;
		}

		//敵弾投入
		/////////////////////////////////////////////////////////////////////////////
		var enterBullet = function( type, x, y, vx, vy ){
			for( var i = 0; i < numBullets; i++ ){
				if( !bullets[i].using ){
					switch( type ){
						//小弾
						case 0:
							bullets[i].image = game.assets['media/bullet1.png'];
							bullets[i].width = 8;
							bullets[i].height = 8;
							bullets[i].frame = 0;
							break;
						//中弾（赤）
						case 1:
							bullets[i].image = game.assets['media/bullet2.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].frame = 0;
							break;
						//中弾（青）
						case 2:
							bullets[i].image = game.assets['media/bullet2.png'];
							bullets[i].width = 16;
							bullets[i].height = 16;
							bullets[i].frame = 1;
							break;
						//大弾
						case 3:
							bullets[i].image = game.assets['media/bullet3.png'];
							bullets[i].width = 24;
							bullets[i].height = 24;
							bullets[i].frame = 0;
							break;
						default:
							return;
					}
					bullets[i].type = type;
					bullets[i].x = x;
					bullets[i].y = y;
					bullets[i].vx = vx;
					bullets[i].vy = vy;
					bullets[i].visible = true;
					bullets[i].using = true;
					bullets[i].mine = false;
					bullets[i]._element.style.zIndex = LAYER_OBJECT2;
					stage.addChild( bullets[i] );
					return bullets[i];
				}
			}
			return null;
		}

		//奇数弾
		/////////////////////////////////////////////////////////////////////////////
		var enterOddBullet = function( x, y, speed ){
			var mx = player.x + 16, my = player.y + 16;
			var d = Math.sqrt((mx-x)*(mx-x) + (my-y)*(my-y));
			var vx = (mx-x) / d * speed;
			var vy = (my-y) / d * speed;
			enterBullet( 0, x, y, vx, vy );
		}

		//偶数弾
		/////////////////////////////////////////////////////////////////////////////
		var enterEvenBullet = function( x, y, px, py, speed ){
			var mx = player.x + 16 + px, my = player.y + 16 + py;
			var d = Math.sqrt((mx-x)*(mx-x) + (my-y)*(my-y));
			var vx = (mx-x) / d * speed;
			var vy = (my-y) / d * speed;
			enterBullet( 0, x, y, vx, vy );
		}

		//狙い撃ち弾
		/////////////////////////////////////////////////////////////////////////////
		var enterSnipeBullet = function( x, y, tx, ty, speed ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx = (tx-x) / d * speed;
			var vy = (ty-y) / d * speed;
			enterBullet( 0, x, y, vx, vy );
		}
		
		//nWay弾
		/////////////////////////////////////////////////////////////////////////////
		var enterNWayBullet = function( x, y, tx, ty, theta, n, speed ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx0 = (tx-x) / d * speed;
			var vy0 = (ty-y) / d * speed;

			var rad_step = Math.pi / 180 * theta;
			var rad = n%2 ? -n/2*rad_step : (-n/2+0.5)*rad_step;
			for( i = 0; i < n; i++, rad += rad_step ){
				var c = Math.cos(rad), s = Math.sin(rad);
				var vx = vx0 * c - vy0 * s;
				var vy = vx0 * s - vy0 * c;
				enterBullet( 0, x, y, vx, vy );
			}
		}
		//円形弾
		/////////////////////////////////////////////////////////////////////////////
		var enterCircleBullet = function( x, y, tx, ty, theta, num, speed ){
			var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
			var vx0 = (tx-x) / d * speed;
			var vy0 = (ty-y) / d * speed;
			enterBullet( 0, x, y, vx0, vy0 );

			var rad_step = Math.pi / 180 * theta;
			var rad = n%2 ? -n/2*rad_step : (-n/2+0.5)*rad_step;
			for( i = 0; i < num; i++, rad += rad_step ){
				var c = Math.cos(rad), s = Math.sin(rad);
				var vx = vx0 * c - vy0 * s;
				var vy = vx0 * s - vy0 * c;
				enterBullet( 0, x, y, vx, vy );
			}
		}

/////////////////////////////////////////////////////////////////////////////
//	特殊効果管理
/////////////////////////////////////////////////////////////////////////////

		//爆発エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burn = function( type, x, y ){
			switch( type ){
				case 0:
					var bomb = new Sprite( 32, 32 );
					bomb.image = game.assets['media/effect1.png'];
					bomb.frame = 0;
					bomb.frameMax = 7;
					break;
				case 1:
					var bomb = new Sprite( 48, 48 );
					bomb.image = game.assets['media/effect3.png'];
					bomb.frame = 0;
					bomb.frameMax = 6;
					break;
				default:
					return;
			}
			bomb.x = x;
			bomb.y = y;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', function() {
				if( game.frame % 4 == 0 )this.frame++;
				if( this.frame > this.frameMax ){
					stage.removeChild( this );
					delete this;
				}
			});
			stage.addChild( bomb );
		}

		//着弾エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burnShot = function( x, y ){
			var bomb = new Sprite( 16, 16 );
			bomb.image = game.assets['media/effect2.png'];
			bomb.frame = 0;
			bomb.x = x;	bomb.y = y;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', function() {
				if( game.frame % 1 == 0 )this.frame++;
				if( this.frame > 7 ){
					stage.removeChild( this );
					delete this;
				}
			});
			stage.addChild( bomb );
		}

		//消滅エフェクト
		/////////////////////////////////////////////////////////////////////////////
		var burnShip = function( x, y ){
			var bomb = new Sprite( 48, 48 );
			bomb.image = game.assets['media/effect4.png'];
			bomb.frame = 0;
			bomb.x = x;	bomb.y = y;
			bomb._element.style.zIndex = LAYER_EFFECT;
			bomb.addEventListener('enterframe', function() {
				if( game.frame % 4 == 0 )this.frame++;
				if( this.frame > 7 ){
					stage.removeChild( this );
					delete this;
				}
			});
			stage.addChild( bomb );
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
						player.y = Math.floor( (this.step - player.y ) / 10 + player.y );
						if( player.y == this.step ){
							this.flag = false;
						}
					}
					if( player.y < 240 && this.flag == false ){
						if( this.time % 1 == 0 )player.y += 1;
						if( player.y == 240 ){
							player.auto = false;
							stage.removeChild( this );
							delete this;
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
				if( this.time < 180 ){
					if( player.x > 144 )player.x -= 1;
					if( player.x < 144 )player.x += 1;
					if( player.y > 144 )player.y -= 1;
					if( player.y < 144 )player.y += 1;
				}
				if( this.time == 180 ){
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
						if( this.time < 120 ){
							if( game.frame % 3 == 0 ){
								if( this.time > 10 && this.time < 60 ){
									this.frame--;
									if( this.frame < 0 )this.frame = 0;
								}
								if( this.time > 60 ){
									player.visible = false;
									this.al = -0.02;
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
						if( 120 < this.time && this.time < 170 ){
							if( this.time % 3 == 0 && back.opacity > 0 && this.time < 150 )back.opacity -= 0.1;
							if( this.time == 165 ){
								back.image = game.assets['media/space2.png'];
								back.y = -320;
								back.pattern = 2;

								this.frame = 6;
								this.opacity = 1;
								this.al = 0.02;
								this.scaleX = 1;
								this.scaleY = 1;
								player.y = 240;
								this.y = player.y - 16;
							}
						}
						//ワープ終了
						if( 170 < this.time && this.time < 300 ){
							if( game.frame % 3 == 0 ){
								if( this.time > 170 && this.time < 210 ){
									this.frame--;
									if( this.frame < 0 )this.frame = 0;
								}
								if( this.time > 220 ){
									player.visible = true;
									this.al = -0.02;
									this.frame++;
									if( this.frame > 6 )this.frame = 6;
									this.scaleX -= 0.05;
									this.scaleY += 0.05;
								}
							}
							this.opacity += this.al;
							if( this.opacity > 1 )this.opacity = 1;
						}
						if( this.time == 300 ){
							stage.removeChild( this );
							delete this;
							stage.event = false;
						}
						this.time++;
					});	//gate
					stage.addChild( gate );
					stage.removeChild( this );
					delete this;
				}
				this.time++;
			});	//ec
			stage.addChild( ec );
		}

		//ステージクリアイベント
		/////////////////////////////////////////////////////////////////////////////
		var eventStageClear = function(){
			stage.event = true;
			var ec = new Group();
			ec.time = 0;
			ec.addEventListener('enterframe', function() {
				if( this.time > 180 ){
					player.y -= 3;
					if( player.y < -32 ){
						var	msg = "STAGE CLEAR!! SCORE:" + stage.score;
						game.end( stage.score, msg );
						stage.removeChild( this );
						delete this;
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
				if( this.count % sec( 0.5 ) == 0){
					if( this.visible )
						this.visible = false;
					else
						this.visible = true;
				}
				if( this.count == sec( 6 ) ){
					stage.removeChild( this );
					delete this;
				}
			});
			stage.addChild( warning );
		}

/////////////////////////////////////////////////////////////////////////////
//	操作系
/////////////////////////////////////////////////////////////////////////////

		var touchX, touchY, moveX, moveY;
		game.rootScene.addEventListener('touchstart', function(e) {
			touch = true;
			touchX = e.localX;
			touchY = e.localY;
		});
		game.rootScene.addEventListener('touchmove', function(e) {
			moveX = e.localX - touchX;
			moveY = e.localY - touchY;
			if( !stage.event && !player.auto ){
				player.x += moveX;
				player.y += moveY;
			}

			touchX = e.localX;
			touchY = e.localY;
			if( player.x < 0 )player.x = 0;
			if( player.x > game.width )player.x = game.width;
			if( player.y < 0 )player.y = 0;
			if( player.y > game.height )player.x = game.height;
		});
		game.rootScene.addEventListener('touchend', function(e) {
			if( stage.event )return;
			touch = false;
			moveX = e.localX - touchX;
			moveY = e.localY - touchY;
			if( !stage.event && !player.auto ){
				player.x += moveX;
				player.y += moveY;
			}

			touchX = e.localX;
			touchY = e.localY;
			if( player.x < 0 )player.x = 0;
			if( player.x > game.width )player.x = game.width;
			if( player.y < 0 )player.y = 0;
			if( player.y > game.height )player.x = game.height;
		});

/////////////////////////////////////////////////////////////////////////////
//	敵機アルゴリズム
/////////////////////////////////////////////////////////////////////////////

		var enemyAlgorithm = {
			'Attacker':function(){
				//初期化処理
				if( this.time == 0 ){
					this.image = game.assets['media/enemy1.png'];
					this.width = 32;
					this.height = 32;

					this.count = 5;
					this.point = 100;
					this.def = 50;
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
				if( this.time > 60 && this.time % 6 == 0 && this.count > 0 ){
//					enterBullet( 0, this.x + 16, this.y + 20, 0, 4 );
					enterOddBullet( this.x + 16, this.y + 20, 3 );
//					enterNWayBullet( this.x + 16, this.y + 20,this.x + 16, this.y + 40,20,5,3 );
					//x, y, tx, ty, theta, num, speed 
 					this.count--;
				}
				if( this.time == 120 )this.count = 5;
			},

			'Attacker2':function(){
				//初期化処理
				if( this.time == 0 ){
					this.image = game.assets['media/enemy1.png'];
					this.width = 32;
					this.height = 32;

					this.count = 5;
					this.point = 200;
					this.def = 100;
					this.movTable = {	//移動パターンテーブル
						0: {time:  0, x:   0, y:   0},
						1: {time: 20, x: -20, y:  20},
						2: {time: 40, x:-100, y:  50},
						3: {time: 60, x:-130, y: 100},
						4: {time: 80, x:-200, y:  80},
						5: {time:100, x:-260, y:  60},
						6: {time:120, x:-400, y:  20},
					};
					this.movTableMax = 7;
					this.movTableNow = 0;	//現在テーブル
					this.nextTime = 0;
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
					this.vx = (this.toX-this.x) / (position.time - this.time);
					this.vy = (this.toY-this.y) / (position.time - this.time);
				}
				this.x += this.vx;
				this.y += this.vy;
				if( this.time > 60 && this.time % 6 == 0 && this.count > 0 ){
//					enterBullet( 0, this.x + 16, this.y + 20, 0, 4 );
					enterOddBullet( this.x + 16, this.y + 20, 3 );
					this.count--;
				}
				if( this.time == 120 )this.count = 5;
			},

			'BigWing':function(){	//BigWing
				//初期化処理
				if( this.time == 0 ){
					this.image = game.assets['media/enemy2.png'];
					this.width = 128;
					this.height = 47;

					this.point = 1000;
					this.def = 1000;
					this.dead = function( point ){
						for( i = 0; i < 20; i++ ){
							x = rand( 128 );
							y = rand( 47 );
							burn( this.burnType, this.x + x, this.y + y );
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
				}
				if( game.frame % 4 == 0 ){
					this.frame++;
					this.frame %= 2;
				}
				if( this.time < 240 ){
					if( game.frame % 2 == 0 )this.y += 1;
				}else{
					if( game.frame % 2 == 0 )this.x += 1;
				}
				if( this.time % 20 == 0 ){
					enterBullet( 0, this.x + 60, this.y + 20, -1, 2 );
					enterBullet( 0, this.x + 60, this.y + 20,  1, 2 );
					enterBullet( 0, this.x + 32, this.y + 20, -1, 3 );
					enterBullet( 0, this.x + 96, this.y + 20,  1, 3 );
				}
				if( this.time % 30 == 0 ){
					enterBullet( 0, this.x + 60, this.y + 20,  0, 2 );
				}
			},

			'Delta':function(){	//DeltaWing
				//初期化処理
				if( this.time == 0 ){
					this.image = game.assets['media/enemy3.png'];
					this.width = 64;
					this.height = 48;

					this.point = 500;
					this.def = 200;
					this.burnType = 1;
					if( this.y > 0 ){
						this.vy = -2;
					}else{
						this.vy = 2;
						this.rotation = 180;
					}
				}
				if( game.frame % 4 == 0 ){
					this.frame++;
					this.frame %= 2;
				}
				if( this.time % 30 == 0 ){
//					enterOddBullet( this.x + 16, this.y + 32, 1 );
					if( this.x < game.width/2 ){
						enterBullet( 0, this.x + 16, this.y + 32, 1, 0 );
					}else{
						enterBullet( 0, this.x + 16, this.y + 32,-1, 0 );
					}
				}
				this.y += this.vy;
			},

			'Trident':function(){	//MissleCarrier
				//初期化処理
				if( this.time == 0 ){
					this.image = game.assets['media/enemy4.png'];
					this.width = 120;
					this.height = 80;

					this.point = 800;
					this.def = 400;
					this.burnType = 1;
					this.vy = 1;
					this._element.style.zIndex = LAYER_OBJECT4;
					this.mis1 = enterEnemy( 'Missile', this.x +  5, this.y - 20, 0 );
					this.mis2 = enterEnemy( 'Missile', this.x + 83, this.y - 20, 0 );
					this.mis1.vx = -1;
					this.mis2.vx =  1;
					this.dead = function( point ){
						for( i = 0; i < 10; i++ ){
							x = rand( 120 );
							y = rand( 80 );
							burn( this.burnType, this.x + x, this.y + y );
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
				}
				if( this.time % 2 == 0 )this.y += this.vy;
			},
			'Missile':function(){
				if( this.time == 0 ){
					this.image = game.assets['media/missile.png'];
					this.width = 32;
					this.height = 128;

					this.point = 500;
					this.def = 200;
					this.burnType = 1;
					this.vy = 1;
					this._element.style.zIndex = LAYER_OBJECT5;
					this.dead = function( point ){
						for( i = 0; i < 10; i++ ){
							burn( 0, this.x+rand(20)-10, this.y + 100 - i * 16 );
							burn( 0, this.x+rand(20)-10, this.y + 100 - i * 16 );
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
				}
				if( this.time % 2 == 0 ){
					this.y += this.vy;
					if( this.time > 60 && this.time < 120){
						this.x += this.vx;
						this.vy = 2;
					}
					if( this.time > 120 ){
						this.vy = 3;
					}
				}
				if( this.def < 4 && this.frame == 0 ){
					this.frame++;
				}
				if( this.def < 3 && this.frame == 1 ){
					this.frame++;
				}
			},

			//ボス
			/////////////////////////////////////////////////////////////
			'Goriate':function(){
				if( this.time == 0 ){
					//メインボディの設定
					this.image = game.assets['media/boss1_body.png'];
					this.width = 64;
					this.height = 80;

					this.point = 50000;
					this.def = 6000;
					this.burnType = 1;
					this._element.style.zIndex = LAYER_OBJECT4;
					this.dead = function( point ){
						for( i = 0; i < 20; i++ ){
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16 );
							burn( 1, this.x+rand(100)-10, this.y + 100 - i * 16 );
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.bossDead = true;
						stage.socre += point;
					};

					//Add both arm
					this.armL = enterEnemyChild( this, 'Goriate_L', -48, -35, 0 );
					this.armR = enterEnemyChild( this, 'Goriate_R',  55, -35, 0 );

					//Add brooken body
					this.bb = new Sprite( 184, 184 );
					this.bb.image = game.assets['media/boss1_break.png'];
					this.bb.x = this.x - 60;
					this.bb.y = this.y - 40;
					this.bb.time = 0;
					this.bb.body = this;
					this.bb._element.style.zIndex = LAYER_OBJECT5;
					this.bb.addEventListener('enterframe', function() {
						if( this.body.def < 1 ){
							this.time = 90;
						}
						if( this.time > 0 )this.time--;
						if( this.body.def < 1 && this.time == 0 ){
							stage.removeChild( this );
							delete this;
						}
					});
					stage.addChild( this.bb );
					
					this.cycle = 0;	//行動パターンサイクル
					this.count = 0;
				}
				if( this.cycle == 0 ){
					if( this.y < 20 ){
						if(this.time % 5 == 0 ){
							this.y += 2;
							this.bb.y += 2;
							this.armL.y += 2;
							this.armR.y += 2;
						}
					}else{
						this.cycle++;
						this.vx = 1;
						this.vy = 1;
						this.count = 10;
						this.interval = 30;
						this.bTime = this.time;
					}
				}
				if( this.cycle == 1 ){
					if(this.time % 5 == 0 ){
						this.x += this.vx;
						this.bb.x += this.vx;
						this.armL.x += this.vx;
						this.armR.x += this.vx;
						if( this.x > 200 ){
							this.vx = -1;
						}
						if( this.x < 10 ){
							this.vx = 1;
						}
					}
					if( this.time % 5 == 0 && this.count > 0 ){
						enterBullet( 0, this.x + 28, this.y + 60, -1, 2 );
						enterBullet( 0, this.x + 28, this.y + 60,  1, 2 );
						enterBullet( 0, this.x + 28, this.y + 60, -1, 3 );
						enterBullet( 0, this.x + 28, this.y + 60,  1, 3 );
						this.count--;
						if( this.count == 0 ){
							this.bTime = this.time;
						}
					}
					if( this.time - this.bTime == this.interval ){
						this.count = 10;
					}
				}
			},
			//左腕
			'Goriate_L':function(){
				if( this.time == 0 ){
					this.image = game.assets['media/boss1_engine.png'];
					this.width = 56;
					this.height = 200;

					this.point = 20000;
					this.def = 3000;
					this.burnType = 1;
					this._element.style.zIndex = LAYER_OBJECT4;
					this.dead = function( point ){
						for( i = 0; i < 60; i++ ){
							burn( 1, this.x+rand(96)-40, this.y + rand(220)-10);
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
					this.count = 5;
					this.interval = 30;
					this.bTime = this.time;

					//ウィングの追加
					this.wing = enterEnemyChild( this, 'Goriate_WL', 0, 0, 0 );

					//砲台の追加
//					var num1 = enterEnemyChild( this, 'Goriate_T', -20, -100, 0 );
//					var num2 = enterEnemyChild( this, 'Goriate_T', -20, -100, 0 );
				}
				if( this.parent ){
					if( this.parent.def < 1 ){
						this.dead( 0 );	//親が先に破壊されたらポイントは無し
					}
				}
				if( this.time % 5 == 0 && this.count > 0 ){
					enterBullet( 0, this.x + 23, this.y + 110, -1, 2 );
					enterBullet( 0, this.x + 23, this.y + 110,  1, 2 );
					enterBullet( 0, this.x + 23, this.y + 110, -1, 3 );
					enterBullet( 0, this.x + 23, this.y + 110,  1, 3 );
					this.count--;
					if( this.count == 0 ){
						this.bTime = this.time;
					}
				}
				if( this.time - this.bTime == this.interval ){
					this.count = 5;
				}
			},
			//右腕
			'Goriate_R':function(){
				if( this.time == 0 ){
					this.image = game.assets['media/boss1_engine.png'];
					this.width = 56;
					this.height = 200;

					this.point = 20000;
					this.def = 3000;
					this.burnType = 1;
					this._element.style.zIndex = LAYER_OBJECT4;
					this.dead = function( point ){
						for( i = 0; i < 60; i++ ){
							burn( 1, this.x+rand(96)-40, this.y + rand(220)-10);
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
					this.count = 5;
					this.interval = 30;
					this.bTime = this.time;
				}
				if( this.parent ){
					if( this.parent.def < 1 ){
						this.dead( 0 );	//親が先に破壊されたらポイントは無し
					}
				}
				if( this.time % 5 == 0 && this.count > 0 ){
					enterBullet( 0, this.x + 23, this.y + 110, -1, 2 );
					enterBullet( 0, this.x + 23, this.y + 110,  1, 2 );
					enterBullet( 0, this.x + 23, this.y + 110, -1, 3 );
					enterBullet( 0, this.x + 23, this.y + 110,  1, 3 );
					this.count--;
					if( this.count == 0 ){
						this.bTime = this.time;
					}
				}
				if( this.time - this.bTime == this.interval ){
					this.count = 5;
				}
			},
			//左翼
			'Goriate_WL':function(){
				if( this.time == 0 ){
					this.image = game.assets['media/boss1_wingL.png'];
					this.width = 16;
					this.height = 116;

					this.point = 10000;
					this.def = 300;
					this.burnType = 1;
					this._element.style.zIndex = LAYER_OBJECT4;
					this.dead = function( point ){
						for( i = 0; i < 10; i++ ){
							burn( 1, this.x+rand(20)-10, this.y + rand(130)-20);
						}
						this.visible = false;
						this.using = false;
						stage.removeChild( this );
						stage.socre += point;
					};
				}
				if( this.parent ){
					if( this.parent.def < 1 ){
						this.dead( 0 );	//親が先に破壊されたらポイントは無し
					}
				}
			},
			//砲台
			'Goriate_T':function(){
				if( this.time == 0 ){
					this.image = game.assets['media/boss1_turret.png'];
					this.width = 56;
					this.height = 200;

					this.point = 5000;
					this.def = 300;
					this.burnType = 1;
					this._element.style.zIndex = LAYER_OBJECT3;
				}
				if( this.parent ){
					this.x = this.parent.x + 55;
					this.y = this.parent.y - 35;
				}
			},
		};
	}
	game.start();
};
