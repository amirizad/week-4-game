var gameData = {};
var alertTxt = "";
var alertCh = 0;
$(window).on('load', function () {
	
	$.getJSON( "data/starwars.json", function() {
	  console.log( "success" );
	})
	  .done(function(data) {
	  	gameData = data;
	    setGame();
	  })
	  .fail(function() {
	    console.log( "error" );
	  });

	$('.main').draggable({
	  create: function( event, ui ) {
	      $(this).css({
	          top: $(this).position().top,
	          bottom: "auto"
	      });
	  }
	});	
	
	$('p').click(function(){
		if($('.selected').length < 2){
			var selChar = $(this);
			var thisID = selChar.attr('id');
			var charNo = thisID.substr(thisID.length - 1);
			$('#alert').empty();
			selChar.addClass('selected');
			if($('.me').length === 0){
				selChar.switchClass( thisID, 'player', 1000, 'easeInOutQuad' );
				selChar.addClass('me');
				var defNo = 0;
				$('p:not(.me)').each(function(){
					defNo++;
					$(this).attr('data-def-no', defNo);
					$(this).switchClass( thisID, 'def' + defNo , 1000, 'easeInOutQuad' );
				})
				$('#me').attr({ 'data-char-no' : charNo ,
								'data-hp' : selChar.attr('data-hp') ,
								'data-ap' : selChar.attr('data-ap')});
				$('#me').val($('#me').attr('data-ap'));
			}else{
				selChar.addClass('defender');
				selChar.switchClass( thisID, 'def', 1000, 'easeInOutQuad' );
				$('#defender').attr({'data-name' : $('#name' + charNo).text() ,
									 'data-char-no' : charNo ,
									 'data-def-no' : selChar.attr('data-def-no') ,
									 'data-hp' : selChar.attr('data-hp') ,
									 'data-ap' : selChar.attr('data-ap')});
			};
		};
	});

	$('#reset').click(function(){
		setGame();
	});

	$('#attack').click(function(){
		battle();
	});
});

function getJson(){
	$.getJSON( "data/starwars.json", function( data ) {
		return data;
	});
};

function setGame(){
	if(!$('p').hasClass('charbox')){$('p').addClass('charbox')};
	$('#attack').removeClass('off');
	for(i = 1 ; i < gameData.character.length + 1 ; i++){
		var charChild = ""
		charChild = charChild + '<img id="img' + i + '" src="">';
		charChild = charChild + '<label id="name' + i + '" class="charname"></label>';
		charChild = charChild + '<label id="hp' + i + '" class="charhp"></label>';
		charChild = charChild + '<span></span>';
		$('#char' + i).removeClass('char' + i);
		var classes = $('#char' + i).attr('class').replace('charbox','');
		$('#char' + i).attr({'data-hp' : gameData.character[ i - 1].hpwr,'data-ap' : gameData.character[i-1].attkpwr})
					  .html(charChild)
					  .switchClass( classes, 'char' + i, 1000, 'easeInOutQuad' )
		$('#img' + i).attr('src', 'assets/images/' + gameData.character[i-1].image);
		$('#name' + i).text(gameData.character[i-1].name);
		$('#ap' + i).text(gameData.character[i-1].attkpwr);
		$('#hp' + i).text(gameData.character[i-1].hpwr);
	};
	$('form input:hidden').removeAttr('data-char-no data-hp data-ap value');
	gameAlert.gameStartMsg();
};

function battle(){
	if($('.selected').length === 2){
		var meHP = parseInt($('#me').attr('data-hp'));
		var meAP = parseInt($('#me').val());
		var meDAP = parseInt($('#me').attr('data-ap'));
		var meCharNo = $('#me').attr('data-char-no');
		var defHP = parseInt($('#defender').attr('data-hp'));
		var defAP = parseInt($('#defender').attr('data-ap'));
		var defCharNo = $('#defender').attr('data-char-no');
		var defNo = $('#defender').attr('data-def-no');
		gameAlert.gameBattleMsg();
		defHP = defHP - meAP;
		if(defHP > 0){ meHP = meHP - defAP };
		if(meHP <= 0){
			meHP = 0;
			gameOver(meCharNo,false);
		};
		if(defHP <= 0){
			defHP = 0;
			destroy(defCharNo, defNo);
		};
		if(meAP > defAP){ meAP = meAP + meDAP };
		$('#me').attr('data-hp' , meHP);
		$('#me').val(meAP);
		$('#defender').attr('data-hp' , defHP);
		$('#ap' + meCharNo).text(meAP);
		$('#hp' + meCharNo).text(meHP);
		$('#hp' + defCharNo).text(defHP);
	}else if($('.selected').length === 1){
		gameAlert.noEnemyMsg();
	}else if($('.selected').length === 0){
		gameAlert.noFighterMsg();
	}else{
		setGame();
	};
};

function destroy(charNo, defNo){
	$('#char' + charNo).removeClass('selected defender').addClass('defeated');
	$('#char' + charNo).switchClass( 'def', 'def' + defNo, 1000, 'easeInOutQuad' );
	if($('.defeated').length < 3){
		gameAlert.selectNextEnemyMsg();
	}else{
		gameOver($('#me').attr('data-char-no'), true);
	}
	
};

function gameOver(charNo, result){
	if(result){
		$('#char' + charNo).switchClass( 'me player','won', 1000, 'easeInOutQuad' );
		gameAlert.gameWonMsg();
	}else{
		$('#char' + charNo).addClass('defeated');
		gameAlert.gameOverMsg();
	};
	$('#attack').addClass('off');
};

var gameAlert = {
	gameStartMsg : function(){
		alertTxt = "Select characters to fight. Good Luck!";
		typeIt();
	},
	noFighterMsg : function(){
		alertTxt = "No one in battle to fight. Please select both your charactor and enemy.";
		typeIt();
	},
	noEnemyMsg : function(){
		alertTxt = "No enemy in battle. Please select your enemy.";
		typeIt();
	},
	gameBattleMsg : function(){
		alertTxt = "You attacked  " + $('#defender').attr('data-name') + "  for " + $('#me').val() +
					   " damage.\r\n" + $('#defender').attr('data-name') + " attacked you back for " +
					   $('#defender').attr('data-ap') + " damage.";
		typeIt();
	},
	selectNextEnemyMsg : function(){
		alertTxt = "You have defeated  " + $('#defender').attr('data-name') +
					   " , you can choose to fight another enemy.";
		typeIt();
	},
	gameOverMsg : function(){
		alertTxt = "You been defeated ... GAME OVER!!!";
		typeIt();
	},
	gameWonMsg : function(){
		alertTxt = "You Won ... GAME OVER!!!";
		typeIt();
	}
}


function typeIt() {   
	if(alertCh > alertTxt.length){
		alertCh = 0;
		return;
	};
	$('#alert').text(alertTxt.substring(0, alertCh++));
	setTimeout(typeIt, 10);
}