
class JSRPG {

/* GENERAL GAME FUNCTIONS */
	constructor(){
		var _=this;
		_['staticData']={};
		_['saveData']={};
		_['keyDown']=false;
		$('<div/>', {id: 'game'}).appendTo('#root');
		$('<div/>', {id: 'map'}).appendTo('#game');
		$('<div/>', {id: 'tiles'}).appendTo('#map');
		_.appendGBControls();
		//_.getMenuData();
		_.loadGameData();
		if(_.saveData.settings.newGame){
			//_.showMenu('newGame');
		}else{
			
		}
		_.gameStart();
		/*
		var newGameSettings = $('#start .new .content .form :input').serializeArray();
		$.each(newGameSettings,function(index,setting){
			_.saveData.settings[setting.name]=setting.value;
		});
		*/
	}
	/*
	get staticDataFilenames(){
		return ['menus','items','quests','achievements'];
	}
	*/
	get dataFileNames(){
		return ['settings','character']
	}
	loadGameData(){
		var _=this;
		if( localStorage.getItem('sml_rpg') ){
			var saveData = JSON.parse(localStorage.getItem('sml_rpg'));
			for(var prop in saveData) {
				_[prop] = saveData[prop];
			}
		}else{
			/*
			$.each(_.staticDataFilenames,function(index,staticDataFilename){
				_.getData(staticDataFilename,'assets/gameData/'+staticDataFilename+'.json',true);
			});
			*/
			$.each(_.dataFileNames,function(index,dataFileName){
				_.getData(dataFileName,'assets/gameData/'+dataFileName+'.json');
			});
			$.each(_.maps,function(index,map){
				_.getData(map,_.getMapPath(map));
			});
		}
		return true;
	}
	saveTheGame(){
		var _=this;
		_.keyDown = false;
		_.saveData.settings.newGame = false;
		localStorage.setItem('sml_rpg', JSON.stringify(_));
		console.log('Game Saved: '+( new Date() ) );
	}
	deleteGameData(){
		var _=this;
		_ = {};
		localStorage.removeItem('sml_rpg');
	}
	gameStart(){
		var _=this;
		if(_.saveData.settings.input.value == 'gbc'){
			$('#body').addClass('overlayControls');
		}else{
			$('#body').removeClass('overlayControls');
		}
		if(_.saveData.settings.screen.value == 'fs'){
			document.documentElement.webkitRequestFullscreen();
		}
		_.setupEventListeners();
		_.buildMap(_.saveData.character.map);
	}
	get animationSpeed(){
		return 50;
	}
	get tileSize(){
		return 50;
	}
	setupEventListeners(){
		var _=this;
		$(window).keydown(function(e) {
			$.each(_.saveData.settings.keys.keyCodes,function(fn,key){
				if(e.keyCode==key){
					_.performAction(fn);
					console.log('key');
				}
			});
		});
		$(document).on('click','#controls .btn',function(e){
			_.performAction($(this).attr('data-btn'));
			console.log('click');
		});
		$(document).on('touch','#controls .btn',function(e){
			_.performAction($(this).attr('data-btn'));
			console.log('touch');
		});
	}
	performAction(button){
		var _=this;
		if(!_.keyDown){
			_.keyDown = true;
			switch(button){
				case 'n':
				case 'e':
				case 's':
				case 'w':
					_.move(button);
					break;
				case 'a':
					_.use(_.saveData.character.facing);
					break;
			}
			setTimeout(function(){
				_.keyDown = false;
			},_.animationSpeed);
		}
	}
	getData(key,filePath,isStatic=false){
		var _=this;
		var dataSet = isStatic ? 'staticData' : 'saveData';
		$.ajax({
			type: 'GET',
			url: filePath,
			async: false,
			cache: false,
			dataType: 'json',
			success: function(data){
				_[dataSet][key] = data;
				return true;
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				throw new Error("ERROR FETCHING "+key+" JSON DATA: "+errorThrown);
				return false;
			}
		});
	}
	/*
	showMenu(menuID){
		var _=this;
		if( _.staticData['menus'].hasOwnProperty(menuID) ){
			console.log(_.staticData['menus'][menuID]);
		}
		return false;
	}
	*/

/* MAP FUNCTIONS */
	get maps(){
		return ['map1','map2'];
	}
	getMapPath(map){
		return 'assets/gameData/maps/'+map+'.json';
	}
	getMapBackroundPath(map){
		return 'assets/gameData/maps/'+map+'-back.png';
	}
	buildMap(map){
		var _=this;

	  	/* SET MAP SIZE */
	  	var mapWidth = (_.saveData[map].width*_.tileSize);
	  	var mapHeight = (_.saveData[map].height*_.tileSize);
	  	$('#map').css({
	  		"width":mapWidth+"px",
	  		"height":mapHeight+"px",
	  	});

	  	/* SET MAP BACKGROUND */
	  	if(_.saveData[map].background){
	  		$('#map').css({'background-image':"url('"+_.getMapBackroundPath(map)+"')"});
	  	}else{
	  		$('#map').css({'background-image':""});
	  	}
	  	/* ADD EMPTY TILES */
	  	$('#map #tiles').empty();
	  	for(var r=0;r<_.saveData[map].height;r++){
	  		for(var c=0;c<_.saveData[map].width;c++){
	  			var $tile = $("<div>", {"id":"r"+r+"_c"+c,"class":"tile"});
	  			$('#map #tiles').append($tile);
	  		}
	  	}

	  	if(_.saveData[map].hasOwnProperty('tiles')){
	  		for (var tileID in _.saveData[map].tiles) {
			    if (_.saveData[map].tiles.hasOwnProperty(tileID)) {
			    	var showTileItems = true;
			    	if(_.saveData[map].tiles[tileID].hasOwnProperty('object')){
			    		$('#map #tiles #'+tileID).append($('<div>',_.saveData[map].tiles[tileID].object));
			    		showTileItems = _.saveData[map].tiles[tileID].object['data-type']=='chest'?false:true;
			    	}
			    	if( showTileItems && _.saveData[map].tiles[tileID].hasOwnProperty('items') ){
			    		$.each(_.saveData[map].tiles[tileID].items,function(index,item){
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
	  	var $token = $("<div>", {"id":"token","class":_.saveData.character.facing});
	  	$('#map #tiles #'+_.saveData.character.tile).append($token);
	  	
	  	/* CENTER MAP ON TOKEN */
	  	_.centerToken();
	  	
	}
	getNextTile(key){
		var _=this;
	    var nextId='';
	    var currentTile = _.saveData.character.tile.split("_");
	    var row=parseInt(currentTile[0].replace('r', ''), 10);
	    var col=parseInt(currentTile[1].replace('c', ''), 10);
	    switch(key){
	    	case 'n': row=row-1; break;
	    	case 'e': col=col+1;break;
	    	case 's': row=row+1;break;
	    	case 'w': col=col-1;break;
	    }
	    nextId = "r"+row+"_c"+col;
	    return ($("#"+nextId).length > 0) ? nextId : _.saveData.character.tile;
	}

/* TOKEN FUNCTIONS */
	centerToken(){
		var _=this;
		var ww = $(window).width();
	  	var wh = $(window).height();
	    var currentTile = _.saveData.character.tile.split("_");
	    var row=parseInt(currentTile[0].replace('r', ''), 10);
	    var col=parseInt(currentTile[1].replace('c', ''), 10);
	    var percentFromTop = (_.saveData.settings.input.value=='gbc') ? 0.3 : 0.5;

	    var diameter = _.tileSize * 2 * 5;
	    var viewVertical = wh/diameter*2*percentFromTop;
	    var viewHorizontal = ww/diameter;
	    var zoom = viewHorizontal > viewVertical ? viewVertical : viewHorizontal;
	    var zoom = zoom > 1 ? 1 : zoom;
	    
	    $('#game').css({'zoom':zoom,'width':(100/zoom)+'vw','height':(100/zoom)+'vh'});
	    

	    var left = ((ww/zoom*0.5)-((col*_.tileSize) + (_.tileSize/2)));
	    var top = ((wh/zoom*percentFromTop)-((row*_.tileSize) + (_.tileSize/2)));

	    $('#map').css({'left': left , 'top': top });
	}
	move(dir){

		var _=this;
		var nextTile = this.getNextTile(dir);
		var nextTileIsBlocked = $("#"+nextTile).find('.block,.chest').length > 0;
		var moveToken = $("#"+nextTile).find('.portal').length <= 0;
		_.saveData.character.facing = dir;

		/* move token */
		if(!$('#token').hasClass('moving') && nextTile != _.saveData.character.tile && !nextTileIsBlocked){
			
			/* update save */
			_.saveData.character.foot= (_.saveData.character.foot == 'r' ? 'l' : 'r');
			_.saveData.character.tile = nextTile;
			
			/* update view */
			if(moveToken){
				var id = "#"+_.saveData.character.tile;
				$('#token').removeAttr('class').addClass('moving').addClass(_.saveData.character.facing+_.saveData.character.foot);
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
		            $(this).appendTo(id).removeAttr('class').removeAttr('style').addClass(_.saveData.character.facing);
		            _.centerToken();
		        });
		        $("#map").stop().animate(mapAnimation, _.animationSpeed);
			}else{
				$('#token').removeAttr('class').addClass('moving').addClass(_.saveData.character.facing+_.saveData.character.foot);
				setTimeout(function(){
					$('#token').removeAttr('class').addClass(_.saveData.character.facing);
				},_.animationSpeed)
			}
	    }else{
	    	$('#token').removeAttr('class').addClass(_.saveData.character.facing);
	    }

	    /* check for events */
	    _.activateTileEvents(_.saveData.character.tile);


	    _.centerToken();
	    
	}
	use(dir){
		var _=this;
		var nextTile = _.getNextTile(dir);
		_.activateTileEvents(nextTile);
	}
	activateTileEvents(tileID){
		var _=this;
	    if(_.saveData[_.saveData.character.map].hasOwnProperty('tiles') && _.saveData[_.saveData.character.map].tiles.hasOwnProperty(tileID)){
	    	if(_.saveData[_.saveData.character.map].tiles[tileID].hasOwnProperty('items')){
	    		$.each(_.saveData[_.saveData.character.map].tiles[tileID].items,function(index,item){
	    			if(item.indexOf('money_')==0){
	    				console.log('found '+item);
	    				var money =parseInt(item.replace('money_', ''), 10);
	    				_.saveData.character.money += money;
	    				var moneyIndex = _.saveData[_.saveData.character.map].tiles[tileID].items.indexOf(item);
	    				_.saveData[_.saveData.character.map].tiles[tileID].items.splice(moneyIndex,1);
	    				$('#map #tiles #'+tileID).find('.money').remove();
	    			}else{
	    				console.log(item);
	    			}
	    		});
	    	}
	    	if(_.saveData[_.saveData.character.map].tiles[tileID].hasOwnProperty('object')){
	    		switch(_.saveData[_.saveData.character.map].tiles[tileID]['object']['data-type']){
	    			case 'chest':
	    				var viewObject = $("#"+tileID).find('.chest');
	    				viewObject.removeClass('closed').addClass('open');
	    				_.saveData[_.saveData.character.map].tiles[tileID]['object'].class += ' open';
	    				break;
	    			// DO PORTAL LAST SINCE IT CHANGES THE TILE & MAP VARS	
	    			case 'portal':
	    				var oldMap = _.saveData.character.map;
	    				_.saveData.character.map  = _.saveData[oldMap].tiles[tileID]['object']['data-map'];
	    				_.saveData.character.tile = _.saveData[oldMap].tiles[tileID]['object']['data-tile'];
	    				_.saveTheGame();
	    				_.buildMap(_.saveData.character.map);
	    				break;
	    			default:;
	    		}
	    	}
	    }
	}
	appendGBControls(){
		var controls = 
		`<div id="controls">
			<div id="dpad">
				<div class="left btn" data-btn="w"></div>
				<div class="up btn" data-btn="n"></div>
				<div class="right btn" data-btn="e"></div>
				<div class="down btn" data-btn="s"></div>
			</div>
			<div id="buttons">
				<div class="_a btn" data-btn="a"></div>
				<div class="_b btn" data-btn="b"></div>
			</div>
			<div class="start btn" data-btn="start"></div>
		</div>`;
		$('#root').append(controls);
		return true;
	}
}

theGame = new JSRPG();

