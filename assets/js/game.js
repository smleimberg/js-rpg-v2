
class JSRPG {

/* GENERAL GAME FUNCTIONS */
	constructor(){
		var _=this;
		//MAIN OBJECT VARIABLES
		_['newGame']=true;
		_['staticData']={};
		_['saveData']={};
		_.buildTheGame();
		_.loadGameData();
		//FLAGS
		_['keyDown']=false;
		_['menuOpen']=false;
		_['gameStart']=false;
		_.updateSettingView('input',_.saveData.settings.input.value);
		if(_.newGame){
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
		return ['menus','quests','achievements'];
	}
	get dataFileNames(){
		return ['settings','character','items']
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
		_.newGame = false;
		localStorage.setItem('sml_rpg', JSON.stringify(_));
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
				}
			});
		});
		var touchEvent = 'click';
		//var touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
		$(document).on(touchEvent,'#controls .btn',function(e){
			e.stopImmediatePropagation();
			e.preventDefault();
			_.performAction($(this).attr('data-btn'));
		});
		$(document).on(touchEvent,'#menu .btn',function(e){
			e.stopImmediatePropagation();
			e.preventDefault();
			_.doMenuAction($(this));
		});
		$(document).on(touchEvent,'#menu-toggle',function(e){
			e.stopImmediatePropagation();
			e.preventDefault();
			_.showMenu('mainMenu');
		});
		$(window).on('resize',function(e){
			_.centerToken();
		});
	}
	updateSettingView(sName,sValue){
		switch(sName){
			case 'screen':
				switch(sValue){
					case 'fs': 
						var docElm = document.documentElement;
						if (docElm.webkitRequestFullScreen) {
				            docElm.webkitRequestFullScreen();
				        } else if (docElm.mozRequestFullScreen) {
				            docElm.mozRequestFullScreen();
				        } else if (docElm.msRequestFullscreen) {
				            docElm.msRequestFullscreen();
				        } else if (docElm.requestFullscreen) {
				            docElm.requestFullscreen();
				        }
						break
					default: 
						if (document.webkitExitFullscreen) {
				            document.webkitExitFullscreen();
				        } else if (document.mozCancelFullScreen) {
				            document.mozCancelFullScreen();
				        } else if (document.msExitFullscreen) {
				            document.msExitFullscreen();
				        } else if (document.exitFullscreen) {
				            document.exitFullscreen();
				        }
						break;
				}
				break;
			case 'input':
				switch(sValue){
					case 'gbc':
						$('#body').addClass('overlayControls');
						break;
					default:
						$('#body').removeClass('overlayControls');
						break;
				}
				break;
		}
	}
	updateSettings(){
		var _=this;
		var newGameSettings = $('#menu .window .content .display :input').serializeArray();
		$.each(newGameSettings,function(index,setting){
			_.saveData.settings[setting.name].value=setting.value;
			_.updateSettingView(setting.name,setting.value);
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
						_.centerRheticle();
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
						_.centerRheticle();
						break;
					case 'a':
						_.doMenuAction($('#menu .btn.rheticle'));
						break;
					case 'b':
						if( _.gameStart && $('#menu .back.btn').length == 1 ){
							_.doMenuAction($('#menu .back.btn'));
						}
						break;
					case 'start':
						if( _.gameStart ){
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

		switch(action){
			case 'checkRadioSetting':
				var radioName = button.find('input').attr('name');
				$('#menu input[name='+radioName+']').removeAttr('checked');
				button.find('input').attr('checked','checked');
				_.updateSettings();
				break;
			case 'openSubmenu':
				var menu = button.attr('data-menu');
				if(menu=='exitMenu'){
					_.hideMenu();
				}else{
					_.showMenu(menu);
				}
				break;
			case 'playCurrentGame':
				_.updateSettings();
				_.buildMap(_.saveData.character.map);
				_.hideMenu();
				break;
			case 'playNewGame':
				_.updateSettings();
				_.deleteGameData();
				_.loadGameData();
				_.saveTheGame();
				_.buildMap(_.saveData.character.map);
				_.hideMenu();
				break;
			case 'saveCurrentGame':
				_.saveTheGame();
				_.showMenu('saveComplete');
				break;
			case 'okSaveComplete':
				_.showMenu('mainMenu');
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
		_.centerToken();
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
			$('#menu').removeClass('hidden').scrollTop(0);
			$('#body').addClass('menuOpen');
		}else{
			_.hideMenu();
		}
		return true;
	}
	buildMenu(menuID){
		var _=this;
		var menuText = false;
		if( _.staticData.menus.hasOwnProperty(menuID) ){
			menuText = {};
			$.each(_.menuDataNames,function(index,menuDataName){
				if(_.staticData.menus[menuID].hasOwnProperty(menuDataName)){
					switch(menuDataName){
						case 'back':
							if(!_.newGame){
								menuText['back']='<div class="back btn" data-action="openSubmenu" data-menu="'+_.staticData.menus[menuID]['back']+'">Back</div>';
							}
							break;
						case 'title':
							menuText['title']='<h1>'+_.staticData.menus[menuID]['title']+'</h1>';
							break;
						case 'text':
							menuText['text']='<p>'+_.staticData.menus[menuID]['text']+'</p>';
							break;
						case 'submit':
							var submitHTML = '';
							$.each(_.staticData.menus[menuID]['submit'],function(index,button){
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
			switch(_.staticData.menus[menuID].type){
				case 'custom':
					var displayHTML ='';
					switch(menuID){
						case 'settings':
						case 'startScreen':
							for(var setting in _.saveData.settings){
								switch(_.saveData.settings[setting].type){
									case 'radio': 
										displayHTML += '<p><strong>'+_.saveData.settings[setting].text+'</strong></p>';
										$.each(_.saveData.settings[setting].options,function(index,option){
											var checked = _.saveData.settings[setting].value == option.value ? 'checked' : '';
											displayHTML += '<label class="setting btn" data-action="checkRadioSetting"><input type="radio" name="'+setting+'" value="'+option.value+'" '+checked+'>'+option.text+'</label>';
										});
										
								}
							}
							break;
						case 'continueGame':
							break;
					}
					menuText['display'] = displayHTML;
					break;
				case 'submenu':
					var displayHTML ='';
					$.each(_.staticData.menus[menuID].list,function(index,submenuID){
						if(_.staticData.menus.hasOwnProperty(submenuID)){
							displayHTML += '<div class="btn" data-action="openSubmenu" data-menu="'+submenuID+'">'+_.staticData.menus[submenuID].title+'</div>';
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
	centerRheticle(){
		var _=this;
	    var rheticleCenter = $('#menu .btn.rheticle').position().top + ( $('#menu .btn.rheticle').height() / 2 ),
	    menuCenter = $('#menu').height() / 2;
	    $('#menu').animate({'scrollTop':rheticleCenter-menuCenter},_.animationSpeed)
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

	    				var money =parseInt(item.replace('money_', ''), 10);
	    				_.saveData.character.money += money;
	    				var moneyIndex = _.saveData[_.saveData.character.map].tiles[tileID].items.indexOf(item);
	    				_.saveData[_.saveData.character.map].tiles[tileID].items.splice(moneyIndex,1);
	    				$('#map #tiles #'+tileID).find('.money').remove();
	    			}else{

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
		`
		<a id="menu-toggle" href="#">
			<span id="hamburger"><span></span></span>
		</a>
		<div id="menu" class="screen">
			<div class="window">
				<div class="content">
					<div class="back"></div>
					<div class="title"></div>
					<div class="text"></div>
					<div class="display"></div>
					<div class="submit"></div>
				</div>
			</div>
		</div>`;
		$('#root').append(menu);
		var controls = 
		`<div id="controls">
			<div id="dpad">
				<a class="left btn" data-btn="w" href="#"></a>
				<a class="up btn" data-btn="n" href="#"></a>
				<a class="right btn" data-btn="e" href="#"></a>
				<a class="down btn" data-btn="s" href="#"></a>
			</div>
			<div id="buttons">
				<a class="_a btn" data-btn="a" href="#"></a>
				<a class="_b btn" data-btn="b" href="#"></a>
			</div>
			<a class="start btn" data-btn="start" href="#"></a>
		</div>`;
		$('#root').append(controls);
		return true;
	}
}

theGame = new JSRPG();

