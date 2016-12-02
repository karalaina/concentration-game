//Kara Campbell, 101007288

// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var b = require('./makeBoard.js');

const ROOT = "./public_html";

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

var users = {};

// handler for incoming requests
function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	//handle get requests for /memory/intro
	if (urlObj.pathname === "/memory/intro") {
		var level;		
		if(urlObj.query.username)	//get username from query string
			var username = urlObj.query.username; 
		else
			var username = "User";	//if empty string, set username to "User"
		if (users[username]) {		//if user already exists
			if (users[username].level < 5) //increment game level if below level 5
				level = users[username].level + 1;
		}else
			level = 1;	//else start game at level 1
	
		var client = {board: b.makeBoard(level*2)};	//make board based on level
		client.level = level;
		users[username] = client;	//store client info in users object
				
		var game = {};
		game.board = client.board;
		game.level = client.level;
		game.user = username;
		respond(200, JSON.stringify(game));	//send board and level to client
	}
	//handle get requests for memory/card
	if (urlObj.pathname === "/memory/card") {
		var row = urlObj.query.row;		//get card row and column
		var col = urlObj.query.col;
		var username = urlObj.query.username;	//get username
		
		var data = users[username].board[row][col];	//get card value
		respond(200, data.toString());	//send value to client
	}
	
	//code taken from COMP2406 website
	//the callback sequence for static serving...
	fs.stat(filename,function(err, stats){
		if(err){   //try and open the file and handle the error, handle the error
			respondErr(err);
		}else{
			if (stats.isDirectory()) {
				if(urlObj.pathname == "/")	filename+="/index.html";
			}			
			fs.readFile(filename,"utf8",function(err, data){
				if(err)respondErr(err);
				else respond(200,data);
			});
		}
	});			
	//code taken from COMP2406 website
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
	//code taken from COMP2406 website 
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
	//code taken from COMP2406 website
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request



function randEle(list){
	return list[Math.floor(Math.random()*list.length)];
}




