
CanvasGroup = enchant.Class.create(enchant.Group,{
	initialize:function(){
		enchant.Group.call(this);
		this.addEventListener('enterframe',function(){
			this.context.clearRect(0,0,game.width,game.height);

			for(i=0;i<this.canvasChildNodes.length;i++){
				var node = this.canvasChildNodes[i];
				if(node.alphaBlending){
					this.context.globalCompositeOperation = 
															node.alphaBlending;
				}else{
					this.context.globalCompositeOperation = 
															"source-atob";
				}
				try{
					var row = node._image.width / node.width | 0;
						this.context.drawImage(node.image._element,
							node.width*(node.frame%row),
							(node.frame/row|0)*node.height,
							node._width,node._height,
							node.x-node.width*(node.scaleX-1)/2,
							node.y-node.height*(node.scaleY-1)/2,
							node.width*node.scaleX,
							node.height*node.scaleY
										);
				}catch(e){
				}
			}
		});

		var canvasSurface = new Surface(game.width,game.height);
		var canvasSprite = new Sprite(game.width,game.height);
		canvasSprite.image = canvasSurface;
		this.addChild(canvasSprite);
		this.context = canvasSurface.context;
		this.surface = canvasSurface;

        this.canvasChildNodes = [];

        this.currentTime = Date.now();

		this.addChild = function(node){
	        this.childNodes.push(node);
	        this.canvasChildNodes.push(node);
	        node.parentNode = this;
	        node.dispatchEvent(new enchant.Event('added'));
	        if (this.scene) {
	            var e = new enchant.Event('addedtoscene');
	            node.scene = this.scene;
	            node.dispatchEvent(e);
	            node._updateCoordinate();
	        }
		};
	},
	removeChild:function(node){
		for(i = 0; i < this.canvasChildNodes.length; i++){
	 		if(this.canvasChildNodes[i] === node){
 				this.canvasChildNodes.splice(i,1);
			}
		}

	}
});