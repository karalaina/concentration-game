//Kara Campbell, 101007288

var guess = [];	//array to store values of clicked cards
var active = []; //array to store divs of clicked cards
var numGuess; //variable to keep track of number of attempted matches

$(document).ready(function() {
	user = prompt('What is your name?');
	getInfo(user);
	});
	
//send get request to server with user name
//returns game board data
function getInfo(user) {
	$.ajax({
	  method:"GET",
	  url:"/memory/intro",
	  data: {'username':user},
	  success: displayGame,
	  dataType:'json'
	});
}

//displays board with the board data recieved from the server
function displayGame(data) {
	user = data.user;
	numGuess = 0;
	$("#level").html(data.level);
	$("#gameboard").empty();
	for (var i=0; i<data.board.length; i++) {
		$("#gameboard").append("<tr id='row"+i+"'></tr>");
	}
	var k = 0;
	for (var i=0; i<data.board.length; i++) {
		for (var j=0; j<data.board.length; j++) {
			var div = $("<div class='tile' id='"+k+"'data-row='"+i+"'data-col='"+j+"'></div>");
			$("#row"+i).append(div);
			k++;
		}	
	}		
	$(".tile").click(chooseTile);
}
//Sends a get request to the server for the data associated with a clicked card
//returns card data
function chooseTile() {
	var num = $(this).attr('id');
	active.push($(this));
	$(this).removeClass("tile").addClass("clicked"); 
	$(this).off("click");
	$.ajax({
		method:"GET",
		url: "/memory/card",
		data: {'username': user, 'row': $(this).data('row'), "col": $(this).data('col')},
		success: function(data) {
			$("#"+num).html("<p>"+data+"</p>"); 
			guess.push(data);
			if (guess.length == 2) {
				numGuess++;
				setTimeout(flip, 500);
			}
		},
		dataType: 'text'
	});
}
//if two clicked cards do not match, flip them back over
//call checkSolved to see if board is solved
function flip() {
	var bool = isMatch();
	if(!bool) {
		for(var i=0; i<active.length; i++) {
			active[i].removeClass("clicked").addClass("tile").html("");
			active[i].click(chooseTile);
		}
	}
	active = [];
	guess = [];
	checkSolved();
}
//determines if two cards match
//returns true if they match and false if they dont
function isMatch() {
	if (guess[0] != guess[1]) {
		return false;		
	}else
		return true;
}
//if no unflipped cards left on the board, Congratulate the user and ask if they want to start s new game
function checkSolved() {
	var a = $(".tile").length;
	if (a == 0)
		var bool = confirm("Congrats! You finished the game in "+numGuess.toString()+" moves!\nStart a new game?");
	if(bool)
		getInfo(user);
}



