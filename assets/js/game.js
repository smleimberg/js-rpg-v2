
class JSRPG {

/* GENERAL GAME FUNCTIONS */
	constructor(){
		var _=this;
		_['staticData']={};
		_['saveData']={};
		_.buildTheGame();
		_.loadGameData();
		_['keyDown']=false;
		_['menuOpen']=false;
		_['gameStart']=false;
		if(_.saveData.settings.screen.value == 'fs'){
			document.documentElement.webkitRequestFullscreen();
		}
		if(_.saveData.settings.input.value == 'gbc'){
			$('#body').addClass('overlayControls');
		}else{
			$('#body').removeClass('overlayControls');
		}
		if(_.saveData.settings.newGame){
			_.showMenu('startScreen');
		}else{
			_.showMenu('continueGame');
		}
		_.setupEventListeners();
		/*
		var newGameSettings = $('#start .new .content .form :input').serializeArray();
		$.each(newGameSettings,function(index,setting){
			_.saveData.settings[setting.name]=setting.value;
		});
		*/
	}
	get staticDataFilenames(){
		return ['menus','items','quests','achievements'];
	}
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
			$.each(_.staticDataFilenames,function(index,staticDataFilename){
				_.getData(staticDataFilename,'assets/gameData/'+staticDataFilename+'.json',true);
			});
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
		_.gameStart = true;
		_.saveData.settings.newGame = false;
		localStorage.setItem('sml_rpg', JSON.stringify(_));
		console.log('Game Saved: '+( new Date() ) );
	}
	deleteGameData(){
		var _=this;
		_.staticData = {};
		_.saveData = {};
		localStorage.removeItem('sml_rpg');
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
	get animationSpeed(){
		return 100;
	}
	get tileSize(){
		return 50;
	}
	setupEventListeners(){
		var _=this;
		$(window).keydown(function(e) {
			console.log('"'+e.key+'"='+e.keyCode);
			$.each(_.saveData.settings.keys.keyCodes,function(fn,key){
				if(e.keyCode==key){
					_.performAction(fn);
				}
			});
		});
		$(document).on('click','#controls .btn',function(e){
			_.performAction($(this).attr('data-btn'));
		});
		$(document).on('touch','#controls .btn',function(e){
			_.performAction($(this).attr('data-btn'));
		});
		$(document).on('click','#menu .btn',function(e){
			_.doMenuAction($(this));
		});
		$(document).on('touch','#menu .btn',function(e){
			_.doMenuAction($(this));
		});
		
	}
	performAction(button){
		var _=this;
		if(!_.keyDown){
			_.keyDown = true;
			if(_.menuOpen){
				switch(button){
					case 'n':
					case 'w':
						var rheticleIndex = parseInt($('#menu .btn.rheticle').attr('data-btn-index'));
						$('#menu .btn').removeClass('rheticle');
						if( rheticleIndex > 0){
							$('#menu #btn_'+(rheticleIndex-1)).addClass('rheticle');
						}else if(rheticleIndex == 0){
							$('#menu #btn_'+($('#menu .btn').length-1)).addClass('rheticle');
						}
						break;
					case 's':
					case 'e':
						var rheticleIndex = parseInt($('#menu .btn.rheticle').attr('data-btn-index'));
						$('#menu .btn').removeClass('rheticle');
						if( rheticleIndex < ($('#menu .btn').length-1) ){
							$('#menu #btn_'+(rheticleIndex+1)).addClass('rheticle');
						}else if( rheticleIndex == ($('#menu .btn').length-1) ){
							$('#menu #btn_0').addClass('rheticle');
						}
						break;
					case 'a':
						_.doMenuAction($('#menu .btn.rheticle'));
						break;
					case 'b':
						console.log('b key');
						console.log(_.gameStart);
						console.log($('#menu #menuBack'));
						if( _.gameStart && $('#menu #menuBack').length > 0 ){
							console.log($('#menu #menuBack'));
							_.doMenuAction($('#menu #menuBack'));
						}
						break;
					case 'start':
						if( !_.saveData.settings.newGame ){
							_.hideMenu();
						}
						break;
				}
			}else{
				switch(button){
					case 'n':
					case 'w':
					case 's':
					case 'e':
						_.move(button);
						break;
					case 'a':
						_.use(_.saveData.character.facing);
						break;
					case 'start':
						_.showMenu('mainMenu');
						break;
				}
			}
			setTimeout(function(){
				_.keyDown = false;
			},_.animationSpeed);
		}
	}
	doMenuAction(button){
		var _=this;
		var action = button.attr('data-action');
		console.log(action);
		switch(action){
			case 'openSubmenu':
				var menu = button.attr('data-menu');
				if(menu=='exitMenu'){
					_.hideMenu();
				}else{
					_.showMenu(menu);
				}
				break;
			case 'playCurrentGame':
				document.documentElement.webkitRequestFullscreen();
				_.buildMap(_.saveData.character.map);
				_.hideMenu();
				break;
			case 'playNewGame':
				document.documentElement.webkitRequestFullscreen();
				_.deleteGameData();
				_.loadGameData();
				_.saveTheGame();
				_.buildMap(_.saveData.character.map);
				_.hideMenu();
				break;
			case 'saveCurrentGame':
				_.saveTheGame();
				_.hideMenu();
				break;
			case 'showStartScreen':
				_.showMenu('startScreen');
				break;
		}
	}
	get menuDataNames(){
		return ['back','title','text','display','submit'];
	}
	hideMenu(){
		var _=this;
		$('#menu').addClass('hidden');
		$('#body').removeClass('menuOpen');
		_.menuOpen=false;
	}
	showMenu(menuID){
		var _=this;
		var menuData = _.buildMenu(menuID);
		if(menuData != false){
			$.each(_.menuDataNames,function(index,menuDataName){
				if(menuData[menuDataName]!=false){
					$('#menu .'+menuDataName).html(menuData[menuDataName]).removeClass('hidden');
				}else{
					$('#menu .'+menuDataName).html('').addClass('hidden');
				}
			});
			if($('#menu .btn').length > 0){
				$.each($('#menu .btn'),function(index,element){
					$(element).attr({'id':'btn_'+index,'data-btn-index':index});
				});
				$('#menu .btn').removeClass('rheticle');
				$('#menu .btn:eq(0)').addClass('rheticle');
			}else{
				// WTF NO BUTTONS?
				throw new Error("MENU "+menuID+" HAS NO BUTTONS");
			}
			_.menuOpen=true;
			$('#menu').removeClass('hidden');
			$('#body').addClass('menuOpen');
		}else{
			_.hideMenu();
		}
		return true;
	}
	buildMenu(menuID){
		var _=this;
		var menuText = false;
		if( _.staticData['menus'].hasOwnProperty(menuID) ){
			menuText = {};
			$.each(_.menuDataNames,function(index,menuDataName){
				if(_.staticData['menus'][menuID].hasOwnProperty(menuDataName)){
					switch(menuDataName){
						case 'back':
							if(_.gameStart){
								menuText['back']='<div class="btn" data-action="openSubmenu" data-menu="'+_.staticData['menus'][menuID]['back']+'">Back</div>';
							}
							break;
						case 'title':
							menuText['title']='<h1>'+_.staticData['menus'][menuID]['title']+'</h1>';
							break;
						case 'text':
							menuText['text']='<p>'+_.staticData['menus'][menuID]['text']+'</p>';
							break;
						case 'submit':
							var submitHTML = '';
							$.each(_.staticData['menus'][menuID]['submit'],function(index,button){
								var dataMenu = '';
								if(button.hasOwnProperty('menu')){
									dataMenu = ' data-menu="'+button.menu+'"';
								}
								submitHTML += ' <div class="btn" data-action="'+button.action+'" '+dataMenu+'>'+button.text+'</div>';
							});
							menuText['submit']=submitHTML;
							break;
					}
				}else{
					menuText[menuDataName]=false;
				}
			});
			switch(_.staticData['menus'][menuID].type){
				case 'custom':
					switch(menuID){
						case 'newGame':
							return {'back':false,"title":_.staticData['menus'][menuID].title}
							break;
						case 'continueGame':
							break;
					}
					break;
				case 'submenu':
					var displayHTML ='';
					$.each(_.staticData['menus'][menuID].list,function(index,submenuID){
						if(_.staticData['menus'].hasOwnProperty(submenuID)){
							displayHTML += '<div class="btn" data-action="openSubmenu" data-menu="'+submenuID+'">'+_.staticData['menus'][submenuID].title+'</div>';
						}else{
							throw new Error("ERROR SUBMENU "+submenuID+" DNE");
						}
					});
					menuText['display']=displayHTML;
					break;
				case 'itemList':
					break;
			}
		}
		return menuText;
	}

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
		_.gameStart = true;

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


		/* turn token */
		if(_.saveData.character.facing != dir || nextTileIsBlocked){
			_.saveData.character.foot= (_.saveData.character.foot == 'r' ? 'l' : 'r');
			_.saveData.character.facing = dir;
			$('#token').removeAttr('class').addClass(_.saveData.character.facing);
		}
		/* move token */
		else if( nextTile != _.saveData.character.tile){
			
			/* update save */
			_.saveData.character.foot= (_.saveData.character.foot == 'r' ? 'l' : 'r');
			_.saveData.character.tile = nextTile;
			_.saveData.character.facing = dir;
			
			/* update view */
			if(moveToken){
				var id = "#"+_.saveData.character.tile;
				$('#token').removeAttr('class').addClass(_.saveData.character.facing+_.saveData.character.foot);
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
				$('#token').removeAttr('class').addClass(_.saveData.character.facing+_.saveData.character.foot);
				setTimeout(function(){
					$('#token').removeAttr('class').addClass(_.saveData.character.facing);
				},_.animationSpeed)
			}
			_.activateTileEvents(_.saveData.character.tile);
			_.centerToken();
	    }	    
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
	buildTheGame(){
		var map = 
		`<div id="game">
			<div id="map">
				<div id="tiles"></div>
			</div>
		</div>`;
		$('#root').append(map);
		var menu = 
		`<div id="menu" class="screen">
			<div class="window">
				<div class="content">
					<div class="title"></div>
					<div class="text"></div>
					<div class="display"></div>
					<div class="submit"></div>
					<div class="back"></div>
				</div>
			</div>
			<div class="rheticle"></div>
		</div>`;
		$('#root').append(menu);
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

