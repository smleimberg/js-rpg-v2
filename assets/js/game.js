
class JSRPG {

/* GENERAL GAME FUNCTIONS */
	constructor(){
		var _=this;
		_['gameData'] = _.getGameData();
		if(_.gameData.settings.newGame){
			$('#body').addClass('newGame');
		}else{
			$('#body').addClass('continueGame');
		}
		$(document).on('click','#start .form .button',function(e){
			e.preventDefault();
			var action = $(this).attr('data-action');
			switch(action){
				case 'playNewGame':
					var newGameSettings = $('#start .new .content .form :input').serializeArray();
					$.each(newGameSettings,function(index,setting){
						_.gameData.settings[setting.name]=setting.value;
					});
					_.gameStart();
					break;
				case 'continueGame':
					_.gameStart();
					break;
				case 'confirmNewGame':
					$('#body').removeClass('newGame').removeClass('continueGame').addClass('confirmNewGame');
					break;
				case 'yesNewGame':
					_.deleteGameData();
					_['gameData'] = _.getGameData();
					$('#body').removeClass('confirmNewGame').removeClass('continueGame').addClass('newGame');
					break;
				case 'noNewGame':
					$('#body').removeClass('newGame').removeClass('confirmNewGame').addClass('continueGame');
					break;
				default:;
			}
		});
	}
	newGame(){
		var _=this;
		localStorage.removeItem('sml_rpg');
		$.each(_.maps,function(index,map){
			localStorage.removeItem('sml_rpg_map_'+map);
		});
	}
	saveTheGame(){
		var _=this;
		_.gameData.settings.newGame = false;
		localStorage.setItem('sml_rpg', JSON.stringify(_.gameData));
		$.each(_.maps,function(index,map){
			localStorage.setItem('sml_rpg_map_'+map, JSON.stringify(_['sml_rpg_map_'+map]));
		});
		console.log('Game Saved: '+( new Date() ) );
	}
	deleteGameData(){
		var _=this;
		delete _.gameData;
		localStorage.removeItem('sml_rpg');
		$.each(_.maps,function(index,map){
			delete _['sml_rpg_map_'+map];
			localStorage.removeItem('sml_rpg_map_'+map);
		});
	}
	gameStart(){
		$('#body').removeClass('gameStart').removeClass('newGame').removeClass('continueGame').removeClass('confirmNewGame');
		var _=this;
		if(_.gameData.settings.input == 'gbc'){
			$('#body').addClass('overlayControls');
		}else{
			$('#body').removeClass('overlayControls');
		}
		if(_.gameData.settings.screen == 'fs'){
			document.documentElement.webkitRequestFullscreen();
		}
		_.setupEventListeners();
		_.heartbeat();
		_['sml_rpg_map_'+_.gameData.map] = _.getMapData(_.gameData.map,true);
		var maps = ['map1','map2'];
		$.each(maps,function(index,map){
			_['sml_rpg_map_'+map] = _.getMapData(map,false);
		});
	}
	get animationSpeed(){
		return 100;
	}
	get tileSize(){
		return 50;
	}
	getGameData(){
		if(this.gameData){
			return this.gameData;
		}else if(localStorage.getItem('sml_rpg')){
		    return JSON.parse(localStorage.getItem('sml_rpg'));
		}else{
			var initializationData ={
				"settings":{
					"newGame":true,
					"input":false,
					"difficulty":"normal",
					"screen":"normal",
					"keys":{
						"n":87,
						"e":68,
						"s":83,
						"w":65,
						"a":74
					}
				},
				"money":0,
				"map":"map1",
				"tile":"r2_c4",
			    "facing":"s",
			    "foot":'l',
			    "stats":{
			    	"xp":0,
					"level":1,
					"health":20,

			    },
			    "inventory":[]
			};
		    this.setGameData(initializationData);
		    return initializationData;
		}
	}
	setGameData(gameData){
		this['gameData'] = gameData;
	}
	heartbeat(){
		setInterval(function(){ 
			var loadingStates = ['map-loading'];
			var statesLoading = 0;
			$.each(loadingStates,function(index,state){
				if($('#game').hasClass(state)){
					statesLoading +=1;
				}
			});
			if(statesLoading>0){
				$('#game').addClass('loading');
			}else{
				$('#game').removeClass('loading');
			}
		}, this.animationSpeed);
	}
	setupEventListeners(){
		var _=this;
		$(window).keydown(function(e) {
			$.each(_.gameData.settings.keys,function(fn,key){
				if(e.keyCode==key){
					_.performAction(fn);
				}
			});
		});
		$(document).on('click','#controls .btn',function(e){
			_.performAction($(this).attr('data-btn'));
		});
	}
	performAction(button){
		var _=this;
		switch(button){
			case 'n':
			case 'e':
			case 's':
			case 'w':
				_.move(button);
				break;
			case 'a':
				_.use(_.gameData.facing);
				break;
		}
	}

/* MAP FUNCTIONS */
	get maps(){
		return ['map1','map2'];
	}
	buildMap(mapData){
		var _=this;

		/* ADJUST GAME STATE */
		$('#game').addClass('map-loading');

	  	/* SET MAP SIZE */
	  	var mapWidth = (mapData.width*_.tileSize);
	  	var mapHeight = (mapData.height*_.tileSize);
	  	$('#map').css({
	  		"width":mapWidth+"px",
	  		"height":mapHeight+"px",
	  	});

	  	/* SET MAP BACKGROUND */
	  	if(mapData.background){
	  		$('#map').css({'background-image':"url('assets/gameData/maps/"+mapData.name+"-back.png')"});
	  	}else{
	  		$('#map').css({'background-image':""});
	  	}
	  	/* ADD EMPTY TILES */
	  	$('#map #tiles').empty();
	  	for(var r=0;r<mapData.height;r++){
	  		for(var c=0;c<mapData.width;c++){
	  			var $tile = $("<div>", {"id":"r"+r+"_c"+c,"class":"tile"});
	  			$('#map #tiles').append($tile);
	  		}
	  	}

	  	if(mapData.hasOwnProperty('tiles')){
	  		for (var tileID in mapData.tiles) {
			    if (mapData.tiles.hasOwnProperty(tileID)) {
			    	var showTileItems = true;
			    	if(mapData.tiles[tileID].hasOwnProperty('object')){
			    		var object = mapData.tiles[tileID].object;
			    		$('#map #tiles #'+tileID).append($('<div>',object));
			    		showTileItems = object['data-type']=='chest'?false:true;
			    	}
			    	if( showTileItems && mapData.tiles[tileID].hasOwnProperty('items') ){
			    		var items = mapData.tiles[tileID].items;
			    		$.each(items,function(index,item){
			    			if(item.indexOf('money_')==0){
			    				$('#map #tiles #'+tileID).append($('<div>',{'class':'money'}));
			    			}else{
			    				$('#map #tiles #'+tileID).append($('<div>',{'id':item, 'class':'item'}));
			    			}
			    		});
			    	}
			    }
			}
	  	}

	  	/* PLACE TOKEN */
	  	var $token = $("<div>", {"id":"token","class":_.gameData.facing});
	  	$('#map #tiles #'+_.gameData.tile).append($token);
	  	
	  	/* CENTER MAP ON TOKEN */
	  	_.centerToken();

	  	/* ADJUST GAME STATE */
	  	$('#game').removeClass('map-loading');
	  	
	}
	getMapData(map,build){
		var _=this;
		var mapData = false;
		if(_.hasOwnProperty('sml_rpg_map_'+map)){
			mapData = _['sml_rpg_map_'+map];
			if(build){
				_.buildMap(_['sml_rpg_map_'+map]);
			}
		}else if( localStorage.getItem('sml_rpg_map_'+map) ){
			mapData = JSON.parse(localStorage.getItem('sml_rpg_map_'+map));
			if(build){
				_.buildMap(mapData);
			}
		}else{
			var filePath = 'assets/gameData/maps/'+map+'.json';
			$.ajax({
				type: 'GET',
				url: filePath,
				async: false,
				cache: false,
				dataType: 'json',
				success: function(data){
					mapData = data;
					if(build){
						_.buildMap(mapData);
					}
					_.setMapData(map,mapData);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					throw new Error("ERROR FETCHING MAP DATA: "+errorThrown);
				}
			});
		}
		return mapData;
	}
	setMapData(map,mapData){
		this['sml_rpg_map_'+map] = mapData;
	}
	getNextTile(key){
	    var nextId='';
	    var next_col=0;
	    var next_row=0;
	    var currentTile = this.gameData.tile.split("_");
	    var row=parseInt(currentTile[0].replace('r', ''), 10);
	    var col=parseInt(currentTile[1].replace('c', ''), 10);
	    if(key=='n'){
	        next_row=row-1;
	        nextId = "r"+next_row+"_c"+col;
	    }
	    if(key=='w'){
	        next_col=col-1;
	        nextId = "r"+row+"_c"+next_col;
	    }
	    if(key=='s'){
	        next_row=row+1;
	        nextId = "r"+next_row+"_c"+col;
	    }
	    if(key=='e'){
	        next_col=col+1;
	        nextId = "r"+row+"_c"+next_col;
	    }
	    return ($("#"+nextId).length > 0) ? nextId : this.gameData.tile;
	}

/* TOKEN FUNCTIONS */
	centerToken(){
		var _=this;
		var ww = $(window).width();
	  	var wh = $(window).height();
	    var currentTile = this.gameData.tile.split("_");
	    var row=parseInt(currentTile[0].replace('r', ''), 10);
	    var col=parseInt(currentTile[1].replace('c', ''), 10);
	    var percentFromTop = (_.gameData.settings.input=='gbc') ? 0.33 : 0.5;

	    $('#map').css({'left':  (ww*0.5)-((col*_.tileSize)+(_.tileSize/2)) , 'top':  (wh*percentFromTop)-((row*_.tileSize)+(_.tileSize/2)) });
	}
	move(dir){

		$('#game').addClass('map-loading');

		var _=this;
		var nextTile = this.getNextTile(dir);
		var nextTileIsBlocked = $("#"+nextTile).find('.block,.chest').length > 0;
		var moveToken = $("#"+nextTile).find('.portal').length <= 0;
		_.gameData.facing = dir;

		/* move token */
		if(!$('#token').hasClass('moving') && nextTile != _.gameData.tile && !nextTileIsBlocked){
			
			/* update save */
			_.gameData.foot= (_.gameData.foot == 'r' ? 'l' : 'r');
			_.gameData.tile = nextTile;
			
			/* update view */
			if(moveToken){
				var id = "#"+_.gameData.tile;
				$('#token').removeAttr('class').addClass('moving').addClass(_.gameData.facing+_.gameData.foot);
				var tokenAnimation = {}, mapAnimation = {};
				switch(dir){
		            case 'n':
		            	tokenAnimation = {"top": "-=50px"};
		            	mapAnimation = {"top": "+=50px"}; break;
		            case 'w':
		            	tokenAnimation = {"left": "-=50px"};
		            	mapAnimation = {"left": "+=50px"}; break;
		            case 's':
		            	tokenAnimation = {"top": "+=50px"}; 
		            	mapAnimation = {"top": "-=50px"}; break;
		            case 'e':
		            	tokenAnimation = {"left": "+=50px"}; 
		            	mapAnimation = {"left": "-=50px"}; break;
		            default:;
		        }
		        $("#token").stop().animate(tokenAnimation, _.animationSpeed,function(){
		            $(this).appendTo(id).removeAttr('class').removeAttr('style').addClass(_.gameData.facing);
		            _.centerToken();
		        });
		        $("#map").stop().animate(mapAnimation, _.animationSpeed);
			}
	    }else{
	    	$('#token').removeAttr('class').addClass(_.gameData.facing);
	    }

	    /* check for events */
	    _.activateTileEvents(_.gameData.tile);


	    _.centerToken();

	    $('#game').removeClass('map-loading');
	    
	}
	use(dir){
		var _=this;
		var nextTile = _.getNextTile(dir);
		_.activateTileEvents(nextTile);
	}
	activateTileEvents(tileID){
		var _=this;
	    if(_['sml_rpg_map_'+_.gameData.map].hasOwnProperty('tiles') && _['sml_rpg_map_'+_.gameData.map].tiles.hasOwnProperty(tileID)){
	    	if(_['sml_rpg_map_'+_.gameData.map].tiles[tileID].hasOwnProperty('items')){
	    		$.each(_['sml_rpg_map_'+_.gameData.map].tiles[tileID].items,function(index,item){
	    			if(item.indexOf('money_')==0){
	    				console.log('found '+item);
	    				var money =parseInt(item.replace('money_', ''), 10);
	    				_.gameData.money += money;
	    				var moneyIndex = _['sml_rpg_map_'+_.gameData.map].tiles[tileID].items.indexOf(item);
	    				_['sml_rpg_map_'+_.gameData.map].tiles[tileID].items.splice(moneyIndex,1);
	    				$('#map #tiles #'+tileID).find('.money').remove();
	    			}else{
	    				console.log(item);
	    			}
	    		});
	    	}
	    	if(_['sml_rpg_map_'+_.gameData.map].tiles[tileID].hasOwnProperty('object')){
	    		switch(_['sml_rpg_map_'+_.gameData.map].tiles[tileID]['object']['data-type']){
	    			case 'chest':
	    				console.log();
	    				var viewObject = $("#"+tileID).find('.chest');
	    				viewObject.removeClass('closed').addClass('open');
	    				_['sml_rpg_map_'+_.gameData.map].tiles[tileID]['object'].class += ' open';
	    				break;
	    			// DO PORTAL LAST SINCE IT CHANGES THE TILE & MAP VARS	
	    			case 'portal':
	    				var oldMap = _.gameData.map;
	    				_.gameData.map  = _['sml_rpg_map_'+oldMap].tiles[tileID]['object']['data-map'];
	    				_.gameData.tile = _['sml_rpg_map_'+oldMap].tiles[tileID]['object']['data-tile'];
	    				_.getMapData(_.gameData.map,true);
	    				break;
	    			default:;
	    		}
	    	}
	    }
	}
}

theGame = new JSRPG();

