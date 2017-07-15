
class JSRPG {
	constructor(){
		var _=this;
		_.heartbeat();
		_.setupEventListeners();
		_['gameData'] = _.getGameData();
		_['sml_rpg_map_'+_.gameData.map] = _.getMapData(_.gameData.map,true);
		var maps = ['map1','map2'];
		$.each(maps,function(index,map){
			_['sml_rpg_map_'+map] = _.getMapData(map,false);
		});
	}
	get animationSpeed(){
		return 100;
	}
	getGameData(){
		if(this.gameData){
			return this.gameData;
		}else if(localStorage.getItem('sml_rpg')){
		    return JSON.parse(localStorage.getItem('sml_rpg'));
		}else{
			var initializationData ={
				"map":"map1",
				"tile":"r2_c4",
			    "facing":"s",
			    "foot":'l',
			    "mapData":{}
			};
		    this.setGameData(initializationData);
		    return initializationData;
		}
	}
	setGameData(gameData){
		this['gameData'] = gameData;
	}
	saveTheGame(){
		var _=this;
		localStorage.setItem('sml_rpg', JSON.stringify(_.gameData));
		var maps = ['map1','map2'];
		$.each(maps,function(index,map){
			localStorage.setItem('sml_rpg_map_'+map, JSON.stringify(_['sml_rpg_map_'+map]));
		});
		console.log('Game Saved: '+( new Date() ) );
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
		    //81=q 87=w e=69 r=82 a=65 s=83 d=68
		    if(!$('#game').hasClass('loading')){
			    switch(e.keyCode){
			    case 65: //a=left
			        _.move('w');
			        break;
			    case 68: //d=right
			        _.move('e');
			        break;
			    case 81: //q=
			        _.saveTheGame();
			        break;
			    case 69: //e=
			        _.use(_.gameData.facing);
			        break;
			    case 83: //s=down
			        _.move('s');
			        break;
			    case 87: //w=up
			        _.move('n');
			        break;
			    default:
			    }
			}
		});
	}
	buildMap(mapData){

		/* ADJUST GAME STATE */
		$('#game').addClass('map-loading');

	  	var tileSize = 50;
	  	/* ADD TILES */
	  	var mapWidth = (mapData.width*tileSize);
	  	var mapHeight = (mapData.height*tileSize);
	  	$('#map').css({
	  		"width":mapWidth+"px",
	  		"height":mapHeight+"px",
	  	});
	  	if(mapData.background){
	  		$('#map').css({'background-image':"url('/assets/maps/"+mapData.name+"-back.png')"});
	  	}else{
	  		$('#map').css({'background-image':""});
	  	}
	  	$('#map #tiles').empty();
	  	for(var r=0;r<mapData.height;r++){
	  		for(var c=0;c<mapData.width;c++){
	  			var $tile = $("<div>", {"id":"r"+r+"_c"+c,"class":"tile"});
	  			$('#map #tiles').append($tile);
	  		}
	  	}
	  	if(mapData.objects.length > 0){
		  	$.each(mapData.objects,function(index,object){
		  		if(object.attributes.length > 0){
			  		$.each(object.attributes,function(index,attribute){
			  			switch(attribute.type){
			  				case 'portal':
			  					var $portal = $("<div>", {"class":"portal","data-map":attribute.map,"data-tile":attribute.tile});
	  							$('#map #tiles #'+object.tile).append($portal);
			  					break;
			  				case 'chest':
			  					var $chest = $("<div>", {"class":"chest","data-item":attribute.item});
	  							$('#map #tiles #'+object.tile).append($chest);
			  					break;
			  				case 'block':
			  					var $block = $("<div>", {"class":"block "+attribute.name});
	  							$('#map #tiles #'+object.tile).append($block);
			  					break;
			  				default:;
			  			}
			  		});
			  	}
		  	});
	  	}
	  	/* PLACE TOKEN */
	  	var $token = $("<div>", {"id":"token","class":this.gameData.facing});
	  	$('#map #tiles #'+this.gameData.tile).append($token);
	  	
	  	/* CENTER MAP ON TOKEN */
	  	this.centerToken();

	  	/* ADJUST GAME STATE */
	  	$('#game').removeClass('map-loading');
	  	
	}
	getMapData(map,build){
		var _=this;
		if( localStorage.getItem('sml_rpg_map_'+map) ){
			var mapData = JSON.parse(localStorage.getItem('sml_rpg_map_'+map));
			if(build){
				this.buildMap(mapData);
			}
		    return mapData;
		}else{
			console.log('fetching '+map);
			var filePath = '/assets/maps/'+map+'.json';
			var mapData = false;
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
					console.log('fetched '+map);
					_.setMapData(map,mapData);

				}
			});
			return mapData;
		}
	}
	setMapData(map,mapData){
		this['sml_rpg_map_'+map] = mapData;
	}
	centerToken(){

		var ww = $(window).width();
	  	var wh = $(window).height();
	    var tokenRect = document.getElementById("token").getBoundingClientRect();
	    var tokenCenterTop = tokenRect.top + ((tokenRect.bottom-tokenRect.top)/2);
	    var tokenCenterLeft = tokenRect.left + ((tokenRect.right-tokenRect.left)/2);

	  	if( tokenCenterLeft > (ww*0.5) ){
  			var shift = tokenCenterLeft - (ww*0.5);
  			$('#map').css({'left':'-='+shift+'px'});
  		}
  		if( tokenCenterLeft < (ww*0.5) ){
  			var shift = (ww*0.5) - tokenCenterLeft;
  			$('#map').css({'left':'+='+shift+'px'});
  		}

	  	if( tokenCenterTop > (wh*0.5) ){
  			var shift = tokenCenterTop - (wh*0.5);
  			$('#map').css({'top':'-='+shift+'px'});
  		}
  		if( tokenCenterTop < (wh*0.5) ){
  			var shift = (wh*0.5) - tokenCenterTop;
  			$('#map').css({'top':'+='+shift+'px'});
  		}
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
	move(dir){

		var _=this;
		var gameData = this.gameData;
		var nextTile = this.getNextTile(dir);
		var nextTileIsBlocked = $("#"+nextTile).find('.block,.chest').length > 0;
		var moveToken = $("#"+nextTile).find('.portal').length <= 0;
		gameData.facing = dir;

		/* move token */
		if(!$('#token').hasClass('moving') && nextTile != gameData.tile && !nextTileIsBlocked){
			
			/* update save */
			gameData.foot= (gameData.foot == 'r' ? 'l' : 'r');
			gameData.tile = nextTile;
			
			/* update view */
			if(moveToken){
				var id = "#"+gameData.tile;
				$('#token').removeAttr('class').addClass('moving').addClass(gameData.facing+gameData.foot);
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
		            $(this).appendTo(id).removeAttr('class').removeAttr('style').addClass(gameData.facing);
		        });
		        $("#map").stop().animate(mapAnimation, _.animationSpeed);
			}
	    }else{
	    	$('#token').removeAttr('class').addClass(gameData.facing);
	    }
	    _.setGameData(gameData);

	    /* check for events */
	    var objectTypes = ['portal','item','tool','message'];
	    $.each(objectTypes,function(index,objectType){
	    	var object = $("#"+_.gameData.tile).find('.'+objectType);
	    	if(object.length > 0){
	    		switch(objectType){
	    			case 'portal':
	    				gameData.map = object.attr('data-map');
	    				gameData.tile = object.attr('data-tile');
	    				_.setGameData(gameData);
	    				_.getMapData(gameData.map,true);
	    				break;
	    			default:;
	    		}
	    	}
	    });

	    _.centerToken()
	    
	}
	use(dir){
		var _=this;
		var gameData = this.gameData;
		var nextTile = this.getNextTile(dir);

		var objectTypes = ['chest','item','tool','message'];
	    $.each(objectTypes,function(index,objectType){
	    	var object = $("#"+nextTile).find('.'+objectType);
	    	if(object.length > 0){
	    		switch(objectType){
	    			case 'chest': 
	    				object.addClass('open');
	    				break;
	    			default:;
	    		}
	    	}
	    });
	}
}

theGame = new JSRPG();

