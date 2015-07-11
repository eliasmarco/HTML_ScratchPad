//==============================
// BECIRCLED
// 020112 elias
//==============================
var iphone = true;

// Canvas Settings
var canvas,
	ctx,
	width  = 320, //800
	height = 460; //600

// Board Settings
var board,
	block1X,
	block1Y,
	block2X,
	block2Y,
	boardWidth  = 6,
	boardHeight = 8,
	tileNum 	= 6,

	tileSizeX 	= 48,	//55
	tileSizeY 	= 48,	//55
	leftOffset  = 15,	//10
	topOffset   = 20;	//10

// Score 
var initScore = false;
	score = 0,
	multiplier = 50,
	intervalTimer = 1;
	timeLimit = 59;
	
// Game Settings
var gameState = 0,
	fps = 50;
	
// Misc
var debug = "NULL",
	xsprite,
	useImage = false,
	disableExplode = true;
	
//================================
// Game Init
//================================	
function game_init(){
	canvas = document.getElementById('game_canvas');
	ctx    = canvas.getContext('2d');

	if(!ctx)alert('shit');

	board = genBoard();

	xsprite = newSprite();
	xsprite.initSprite(ctx,0,0,0,0,64,64,4,1,"images/explosprite.png",0,0);	
	xsprite.drawOnce = true;
	
    //canvas.addEventListener('mousedown', mouseDown, false);
    //canvas.addEventListener('mouseup', mouseUp, false);	
    //canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('click', click, false);

	gameLoop();
}

//================================
// Game Loop
//================================
function gameLoop() {
	ctx.clearRect(0,0,width,height);
	drawThings();
	if(initScore){
		intervalTimer++;
		if(intervalTimer == Math.floor(1000/fps)){
			timeLimit--;
			intervalTimer = 1;
		}
		if(timeLimit == 0){
			gameState = 2;
		}
	}
	game = setTimeout(gameLoop,fps);
}

//================================
// Render
//================================
function drawThings(){
	xsprite.stopAnim = false;

	if(gameState == 0){
		initScore = false;
		score = 0,
		multiplier = 50,
		intervalTimer = 1;
		timeLimit = 59;
		startPage();
	}if(gameState == 1){
		printBoard();
		if(!pauseForAnim()){
			var val = validMoveCheck();
			if(!val){
				if(initScore){
					alert("No more moves");
				};
				board = genBoard();
			}
		}
		if(!pauseForAnim()){
			boardSweep();
		}
		if(!initScore){
			if(!checkSweep()){
				initScore = true;
			}
		}
		showScore();
		//writeConsole();
	}if(gameState == 2){
		scorePage();
		
	}
}

//================================
// Game Pages
//================================
function startPage(){
	ctx.fillStyle = "rgba(0,0,0, 1)";
	ctx.fillRect(0,0,width,height);

	if(iphone){
		ctx.font = 'bold 24px helvetica';
	}else{
		ctx.font = 'bold 48px helvetica';
	}
	ctx.fillStyle = '#fff';
	var text = "CLICK TO START";
	if(iphone){
		ctx.fillText(text, 50,150);
	}else{
		ctx.fillText(text, 110,200);
	}
}

function scorePage(){
	ctx.fillStyle = "rgba(0,0,0, 1)";
	ctx.fillRect(0,0,width,height);
	if(iphone){
		ctx.font = 'bold 24px helvetica';
		ctx.fillStyle = '#fff';
		var text = "GAME OVER";
		ctx.fillText(text, 80,100);
		var text = "YOUR SCORE IS";
		ctx.fillText(text, 60,150);
		ctx.font = 'bold 48px helvetica';
		ctx.fillText(score, 110,200);
		ctx.font = 'bold 24px helvetica';
		ctx.fillText('Click to play again', 55,250);
	}else{
		ctx.font = 'bold 48px helvetica';
		ctx.fillStyle = '#fff';
		var text = "YOUR SCORE IS";
		ctx.fillText(text, 110,200);
		ctx.font = 'bold 70px helvetica';
		ctx.fillText(score, 270,280);
	}
}

//================================
// Game Functions
//================================
function genRandomSpriteAt(x,y){
	var sprite = newSprite();
	var randomnumber=Math.floor(Math.random()*tileNum);
	sprite.initSprite(ctx,leftOffset+(x*tileSizeX),topOffset+(y*tileSizeY),(randomnumber*tileSizeX),0,tileSizeX,tileSizeY,1,1,"images/sprite3.png",0,randomnumber);	
	return sprite;
}

function genBoard(){
	myboard = new Array(boardWidth);
	
	for(i = 0; i < boardWidth; i++){
		myboard[i] = new Array(boardHeight);
		for(j = 0; j < boardHeight; j++){		
			myboard[i][j] = genRandomSpriteAt(i,j);
		}
	}
	return myboard;
}

function pauseForAnim(){
	for(i = 0; i < boardWidth; i++){
		for(j = 0; j < boardHeight; j++){		
			if(board[i][j].isActive){
				return true;
			}
		}
	}
	return false;
}

function printBoard(){
	for(i = 0; i < boardWidth; i++){
		for(j = 0; j < boardHeight; j++){		
			board[i][j].drawSprite();
			board[i][j].updateSpritePos();
		}
	}
}

function boardSweep(){
	if(!pauseForAnim()){
		sweepHorizontal(false);
		sweepVertical(false);
		shiftDead();
	}
}

//var noExplode = false;
function checkSweep(){
	sweepHorizontal(true);
	sweepVertical(true);
	return checkForDead();
}

function sweepHorizontal(noExplode){
	for(j = boardHeight-1; j >= 0; j--){		
		for(i = 0; i < (boardWidth-2); i++){
			if((board[i][j].id == board[i+1][j].id)&&(board[i][j].id == board[i+2][j].id)){
				var cont = true;
				
				board[i][j].isDead = true;
				board[i+1][j].isDead = true;
				board[i+2][j].isDead = true;
				
				if(!noExplode&&!disableExplode){
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i][j].x,board[i][j].y);
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i+1][j].x,board[i+1][j].y);
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i+2][j].x,board[i+2][j].y);
				}
				
				for(k=(boardWidth-3);k!=1 ;k--){
					if((i < k)&&(cont)){
						if((board[i][j].id == board[i+(boardWidth-k)][j].id)){
							board[i+(boardWidth-k)][j].isDead = true;
							if(!noExplode){
								xsprite.stopAnim = false;
								xsprite.drawSpriteAt(board[i+(boardWidth-k)][j].x,board[i+(boardWidth-k)][j].y);
							}
							cont = true;
						}else{
							cont = false;
						}
					}
				}
			}
		}
	}	
}

function sweepVertical(noExplode){
	for(i = 0; i < boardWidth; i++){
		for(j = 0; j < boardHeight-2; j++){			
			if((board[i][j].id == board[i][j+1].id)&&(board[i][j].id == board[i][j+2].id)){
				var cont = false;
				board[i][j].isDead = true;
				board[i][j+1].isDead = true;
				board[i][j+2].isDead = true;

				if(!noExplode&&!disableExplode){
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i][j].x,board[i][j].y);
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i][j+1].x,board[i][j+1].y);
					xsprite.stopAnim = false;
					xsprite.drawSpriteAt(board[i][j+2].x,board[i][j+2].y);
				}
				
				for(k = (boardHeight-3);k!=1;k--){
					if((i < k)&&(cont)){
						if((board[i][j].id == board[i][j+(boardHeight-k)].id)){
							board[i][j+(boardHeight-k)].isDead = true;
							if(!noExplode){
								xsprite.stopAnim = false;
								xsprite.drawSpriteAt(board[i][j+(boardHeight-k)].x,board[i][j+(boardHeight-k)].y);
							}
							cont = true;
						}else{
							cont = false;
						}
					}
				}
			}
		}
	}
}

function shiftDead(){
	//killAdjacent();

	for(i=0;i < boardWidth; i++){
		var deadCount = 0;
		for(j=(boardHeight-1);j >= 0; j--){			
			if(board[i][j].isDead){
				deadCount++;
			}
		}

		for(j=(boardHeight-1);j >= 0; j--){	
			var flag = false;
			if(board[i][j].isDead){
				var stop = false;

				for(k=j; k>=0 && (stop == false); k--){
					if(!board[i][k].isDead){
						board[i][k].moveSpriteTo(board[i][j].x,board[i][j].y);
						board[i][j] = board[i][k];
						board[i][k].isDead = true;
						stop = true;
					}
				}
			}
		}
		
		for(j=(boardHeight-1);j >= 0; j--){	
			board[i][j].isDead = false;		
		}
		for(j=deadCount-1; j >= 0 ; j--){
			board[i][j] = genRandomSpriteAt(i,(-deadCount+j));
			board[i][j].moveSpriteTo(leftOffset+(i*tileSizeX),topOffset+(j*tileSizeY));
		}
		updateScore(deadCount);
	}
}

function checkForDead(){
	for(j = 0; j < boardHeight; j++){		
		for(i = 0; i < boardWidth; i++){
			if(board[i][j].isDead){
				return true;
			}
		}
	}
	return false
}

function killAdjacent(){
	for(j = 0; j < boardHeight; j++){		
		for(i = 0; i < boardWidth; i++){
			if(board[i][j].isDead){
				if(j != boardHeight-1){
					if(board[i][j+1].id == board[i][j].id){
						board[i][j+1].isDead = true;
						xsprite.stopAnim = false;
						xsprite.drawSpriteAt(board[i][j+1].x,board[i][j+1].y);
					}
				}
				if(j != 0){
					if(board[i][j-1].id == board[i][j].id){
						board[i][j-1].isDead = true;					
						xsprite.stopAnim = false;
						xsprite.drawSpriteAt(board[i][j-1].x,board[i][j-1].y);
					}
				}
				if(i != boardWidth-1){
					if(board[i+1][j].id == board[i][j].id){
						board[i+1][j].isDead = true;
						xsprite.stopAnim = false;
						xsprite.drawSpriteAt(board[i+1][j].x,board[i+1][j].y);
					}
				}
				if(i != 0){
					if(board[i-1][j].id == board[i][j].id){
						board[i-1][j].isDead = true;
						xsprite.stopAnim = false;
						xsprite.drawSpriteAt(board[i-1][j].x,board[i-1][j].y);
					}
				}
			}
		}
	}
}

function validMoveCheck(){
	var ret = false;
	for(j = 0; j < boardHeight; j++){		
		for(i = 0; i < boardWidth-2; i++){
			if(board[i][j].id == board[i+1][j].id){
				ret = checkRight(i+1,j)||checkLeft(i,j);
			}
			if(board[i][j].id == board[i+2][j].id){
				ret = ret||checkBetweenHorizontal(i,j);
			}
		}
	}	
	
	for(i = 0; i < boardWidth; i++){		
		for(j = 0; j < boardHeight-2; j++){
			if(board[i][j].id == board[i][j+1].id){
				ret = ret||checkUp(i,j)||checkDown(i,j+1);
			}
			if(board[i][j].id == board[i][j+2].id){
				ret = ret||checkBetweenVertical(i,j);
			}
		}
	}	
	return ret;
}

function checkBetweenHorizontal(x,y){
	if(y > 0){
		if(board[x][y].id == board[x+1][y-1].id){	
			return true;
		}
		return false;
	}
	
	if(y < boardHeight-1){
		if(board[x][y].id == board[x+1][y+1].id){	
			return true;
		}
		return false;
	}
}

function checkBetweenVertical(x,y){
	if(x > 0){
		if(board[x][y].id == board[x-1][y+1].id){	
			return true;
		}
		return false;
	}
	
	if(x < boardWidth-1){
		if(board[x][y].id == board[x+1][y+1].id){	
			return true;
		}
		return false;
	}
}

function checkRight(x,y){
	if(x < boardWidth-2){
		if(board[x+2][y].id == board[x][y].id){
			debug = "Valid move @ " + (x+2) + " " + (y);
			return true;
		}
	}
	if(x < boardWidth-1){
		if(y != boardHeight-1){
			if(board[x+1][y+1].id == board[x][y].id){
				debug = "Valid move @ " + (x+1) + " " + (y+1);
				return true;
			}
		}
		if(y != 0){
			if(board[x+1][y-1].id == board[x][y].id){
				debug = "Valid move @ " + (x+1) + " " + (y-1);
				return true;
			}
		}
	}
	return false;
}

function checkLeft(x,y){
	if(x > 1){
		if(board[x-2][y].id == board[x][y].id){
			debug = "Valid move @ " + (x-2) + " " + y;
			return true;
		}
	}
	if(x > 0){
		if(y != boardHeight-1){
			if(board[x-1][y+1].id == board[x][y].id){
				debug = "Valid move @ " + (x-1) + " " + (y+1);
				return true;
			}
		}
		if(y != 0){
			if(board[x-1][y-1].id == board[x][y].id){
				debug = "Valid move @ " + (x-1) + " " + (y-1);
				return true;
			}
		}
	}
	return false;
}

function checkUp(x,y){
	if(y > 1){
		if(board[x][y-2].id == board[x][y].id){
			debug = "Valid move @ " + (x) + " " + (y-2);
			return true;
		}
	}
	if(y > 0){
		if(x != boardWidth-1){
			if(board[x+1][y-1].id == board[x][y].id){
				debug = "Valid move @ " + (x+1) + " " + (y-1);
				return true;
			}
		}
		if(x != 0){
			if(board[x-1][y-1].id == board[x][y].id){
				debug = "Valid move @ " + (x-1) + " " + (y-1);
				return true;
			}
		}
	}
	return false;
}

function checkDown(x,y){
	if(y < boardHeight-2){
		if(board[x][y+2].id == board[x][y].id){
			debug = "Valid move @ " + (x) + " " + (y+2);
			return true;
		}
	}
	if(y < boardHeight-1){
		if(x != boardWidth-1){
			if(board[x+1][y+1].id == board[x][y].id){
				debug = "Valid move @ " + (x+1) + " " + (y+1);
				return true;
			}
		}
		if(x != 0){
			if(board[x-1][y+1].id == board[x][y].id){
				debug = "Valid move @ " + (x-1) + " " + (y+1);
				return true;
			}
		}
	}
	return false;
}

function genNewTile(){
	randomnumber=Math.floor(Math.random()*tileNum);
	
	return randomnumber;
}

function blockSwitch(){
	var temp = board[block2X][block2Y];
	board[block2X][block2Y] = board[block1X][block1Y];
	board[block1X][block1Y] = temp;	

	if(checkSweep()){
		board[block2X][block2Y].moveSpriteTo(board[block1X][block1Y].x,board[block1X][block1Y].y);
		board[block1X][block1Y].moveSpriteTo(board[block2X][block2Y].x,board[block2X][block2Y].y);
	}else{
		var temp = board[block2X][block2Y];
		board[block2X][block2Y] = board[block1X][block1Y];
		board[block1X][block1Y] = temp;	
	}
	
	debug = "Block Switching " + block1X + "," + block1Y + " to " + block2X + "," +block2Y;
}

//================================
// Input Handler
//================================
var leftKey = false, 
	upKey = false, 
	rightKey = false, 
	downKey = false,
	mouse_X,
	mouse_Y,
	mouse_downX,
	mouse_downY,
	mouse_upX,
	mouse_upY,
	mousePressed = false;

	function keyDown(e) {
	e.preventDefault();
	switch(e.keyCode){
		case 37:leftKey = true;break;
		case 38:upKey = true;break;
		case 39:rightKey = true;break;
		case 40:downKey = true;break;
	}
}

function keyUp(e) {
	switch(e.keyCode){
		case 37:leftKey = false;break;
		case 38:upKey = false;break;
		case 39:rightKey = false;break;
		case 40:downKey = false;break;
	}
}
/*
function touchMove(event) 
{

    event.preventDefault();
    mouse_X = event.targetTouches[0].screenX - mouse_downX;
    mouse_Y = event.targetTouches[0].screenY - mouse_downY;

}

function touchDown(event)
{
	event.preventDefault();

	if(!pauseForAnim()){
		mousePressed = true;
		mouse_downX = event.targetTouches[0].screenX;
		mouse_downY = event.targetTouches[0].screenY;
		block1X = Math.floor(((mouse_downX - leftOffset)/tileSizeX));
		block1Y = Math.floor(((mouse_downY - topOffset)/tileSizeY));
		debug = "mouse down @ " + block1X + " " + block1Y;
	}
}

function touchUp(event)
{
	if(!pauseForAnim()){
		debug = "Selected " + board[block1X][block1Y];
		mousePressed = false;
		mouse_upX = event.targetTouches[0].screenX;
		mouse_upY = event.targetTouches[0].screenY;
		block2X = Math.floor(((mouse_upX - leftOffset)/tileSizeX));
		block2Y = Math.floor(((mouse_upY - topOffset)/tileSizeY));
		
		if((block2X < (block1X - 1))||(block2X > (block1X + 1))){
			block2X = block1X - 1;
		}
		
		if((block2Y < (block1Y - 1))||(block2Y > (block1Y + 1))){
			block2X = block1X - 1;	
		}
		
		if(((block2X > block1X)||(block2X < block1X))&&
		   ((block2Y > block1Y)||(block2Y < block1Y))){
			block2X = block1X;	
			block2Y = block1Y;	
		}
		
		debug = "mouse up @ " + block2X + " " + block2Y;
		blockSwitch();
	}
}
*/
function mouseMove(e){
	if(!pauseForAnim()){
		mouse_X = e.clientX - document.getElementById('game_canvas').offsetLeft;
		mouse_Y = e.clientY - document.getElementById('game_canvas').offsetTop;
	}
}

function mouseDown(e){
	if(!pauseForAnim()){
		mousePressed = true;
		mouse_downX = e.clientX - document.getElementById('game_canvas').offsetLeft;
		mouse_downY = e.clientY - document.getElementById('game_canvas').offsetTop;
		block1X = Math.floor(((mouse_downX - leftOffset)/tileSizeX));
		block1Y = Math.floor(((mouse_downY - topOffset)/tileSizeY));
		debug = "mouse down @ " + block1X + " " + block1Y;
	}
}
function mouseUp(e){
	if(!pauseForAnim()){
		debug = "Selected " + board[block1X][block1Y];
		mousePressed = false;
		mouse_upX = e.clientX - document.getElementById('game_canvas').offsetLeft;
		mouse_upY = e.clientY - document.getElementById('game_canvas').offsetTop;
		block2X = Math.floor(((mouse_upX - leftOffset)/tileSizeX));
		block2Y = Math.floor(((mouse_upY - topOffset)/tileSizeY));
		
		if((block2X < (block1X - 1))||(block2X > (block1X + 1))){
			block2X = block1X - 1;
		}
		
		if((block2Y < (block1Y - 1))||(block2Y > (block1Y + 1))){
			block2X = block1X - 1;	
		}
		
		if(((block2X > block1X)||(block2X < block1X))&&
		   ((block2Y > block1Y)||(block2Y < block1Y))){
			block2X = block1X;	
			block2Y = block1Y;	
		}
		
		debug = "mouse up @ " + block2X + " " + block2Y;
		blockSwitch();
	}
}

function click(e){
	if(gameState == 0){
		gameState = 1;
	}
	if(gameState == 2){
		gameState = 0;
	}
}

//================================
// Sprite Class
//================================
function newSprite(){
	var Sprite = {
		id: 0,
		canvas: 0,
		x: 0,
		y: 0,
		targetx: 0,
		targety: 0,
		width: 0, 
		height: 0,
		framesX: 0,
		framesY: 0,
		stepsize: 0,
		image: 0,
		srcX:0,
		srcY:0,
		initsrcX:0,
		initsrcY:0,
		currentFrame: 0,
		currentStep: 0,
		isReady: false,
		isActive: false,
		isDead: false,
		drawOnce: false,
		stopAnim: false,
		
		initSprite: function(canvas, x, y, srcx, srcy, width, height, framesx, framesy, img_file, stepSize, id){ //initialize sprite
			Sprite.canvas = canvas;
			Sprite.x = x;
			Sprite.y = y;
			Sprite.targetx = x;
			Sprite.targety = y;
			Sprite.srcX = srcx;
			Sprite.srcY = srcy;
			Sprite.initsrcX = srcx;
			Sprite.initsrcY = srcy;
			Sprite.width = width;
			Sprite.height = height;
			Sprite.framesX = framesx;
			Sprite.framesY = framesy;
			Sprite.loadImage(img_file);
			Sprite.stepsize = stepSize;
			Sprite.id = id;
			Sprite.isDead = false;
		},
		
		loadImage: function(img_file){
			Sprite.image = new Image();
			Sprite.image.onload = function(){
				Sprite.isReady = true;
			}
			Sprite.image.src = img_file;
		},

		moveSprite: function(new_x, new_y){
			Sprite.x = Sprite.x + new_x;
			Sprite.y = Sprite.y + new_y;
		},
		
		drawSprite: function(){
			if(!Sprite.stopAnim){
				Sprite.canvas.clearRect(Sprite.x,Sprite.y,Sprite.width,Sprite.height);
				if(Sprite.isReady){
					if(useImage){
						Sprite.canvas.drawImage(Sprite.image, Sprite.srcX, Sprite.srcY, Sprite.width, Sprite.height, 
															  Sprite.x, Sprite.y, Sprite.width, Sprite.height);
					}else{
						Sprite.canvas.beginPath();
						Sprite.canvas.arc(Sprite.x+(tileSizeX/2),Sprite.y+(tileSizeY/2), (tileSizeX/2)*0.9, 0, 2 * Math.PI, false);
						if(!Sprite.isActive){
							switch(Sprite.id){
								case 0: { Sprite.canvas.fillStyle = "rgba(255,0,0,1)"; }
								break;
								case 1: { Sprite.canvas.fillStyle = "rgba(255,255,0,1)"; }
								break;
								case 2: { Sprite.canvas.fillStyle = "rgba(0,255,0,1)"; }
								break;
								case 3: { Sprite.canvas.fillStyle = "rgba(0,255,255,1)"; }
								break;
								case 4: { Sprite.canvas.fillStyle = "rgba(255,0,255,1)"; }
								break;
								case 5: { Sprite.canvas.fillStyle = "rgba(0,0,255,1)"; }
								break;
								case 6: { Sprite.canvas.fillStyle = "rgba(128,0,128,1)"; }
								break;
								case 7: { Sprite.canvas.fillStyle = "rgba(0,128,128,1)"; }
								break;
								case 8: { Sprite.canvas.fillStyle = "rgba(128,128,0,1)"; }
								break;
							}
						}else{
							switch(Sprite.id){
								case 0: { Sprite.canvas.fillStyle = "rgba(255,0,0,0.5)"; }
								break;
								case 1: { Sprite.canvas.fillStyle = "rgba(255,255,0,0.5)"; }
								break;
								case 2: { Sprite.canvas.fillStyle = "rgba(0,255,0,0.5)"; }
								break;
								case 3: { Sprite.canvas.fillStyle = "rgba(0,255,255,0.5)"; }
								break;
								case 4: { Sprite.canvas.fillStyle = "rgba(255,0,255,0.5)"; }
								break;
								case 5: { Sprite.canvas.fillStyle = "rgba(0,0,255,0.5)"; }
								break;
								case 6: { Sprite.canvas.fillStyle = "rgba(128,0,128,0.5)"; }
								break;
								case 7: { Sprite.canvas.fillStyle = "rgba(0,128,128,0.5)"; }
								break;
								case 8: { Sprite.canvas.fillStyle = "rgba(128,128,0,0.5)"; }
								break;
							}
						}
						Sprite.canvas.fill();
						Sprite.canvas.lineWidth = 5;
						Sprite.canvas.strokeStyle = "black";
						Sprite.canvas.stroke();
					}
				}
				Sprite.stepSprite();
			}
		},
		
		drawSpriteAt: function(x,y){
			if(!Sprite.stopAnim){
				Sprite.canvas.clearRect(x,y,Sprite.width,Sprite.height);
				if(Sprite.isReady){
					if(useImage){
						// Sprite.canvas.drawImage(Sprite.image, Sprite.srcX, Sprite.srcY, Sprite.width, Sprite.height, 
															// x, y, Sprite.width, Sprite.height);
					}else{			 
						Sprite.canvas.beginPath();
						Sprite.canvas.arc(x+(tileSizeX/2),y+(tileSizeY/2), (tileSizeX/2)*0.9, 0, 2 * Math.PI, false);
						
						if(!Sprite.isActive){
							switch(Sprite.id){
								case 0: { Sprite.canvas.fillStyle = "rgba(255,0,0,1)"; }
								break;
								case 1: { Sprite.canvas.fillStyle = "rgba(255,255,0,1)"; }
								break;
								case 2: { Sprite.canvas.fillStyle = "rgba(0,255,0,1)"; }
								break;
								case 3: { Sprite.canvas.fillStyle = "rgba(0,255,255,1)"; }
								break;
								case 4: { Sprite.canvas.fillStyle = "rgba(255,0,255,1)"; }
								break;
								case 5: { Sprite.canvas.fillStyle = "rgba(0,0,255,1)"; }
								break;
								case 6: { Sprite.canvas.fillStyle = "rgba(128,0,128,1)"; }
								break;
								case 7: { Sprite.canvas.fillStyle = "rgba(0,128,128,1)"; }
								break;
								case 8: { Sprite.canvas.fillStyle = "rgba(128,128,0,1)"; }
								break;
							}
						}else{
							switch(Sprite.id){
								case 0: { Sprite.canvas.fillStyle = "rgba(255,0,0,0.5)"; }
								break;
								case 1: { Sprite.canvas.fillStyle = "rgba(255,255,0,0.5)"; }
								break;
								case 2: { Sprite.canvas.fillStyle = "rgba(0,255,0,0.5)"; }
								break;
								case 3: { Sprite.canvas.fillStyle = "rgba(0,255,255,0.5)"; }
								break;
								case 4: { Sprite.canvas.fillStyle = "rgba(255,0,255,0.5)"; }
								break;
								case 5: { Sprite.canvas.fillStyle = "rgba(0,0,255,0.5)"; }
								break;
								case 6: { Sprite.canvas.fillStyle = "rgba(128,0,128,0.5)"; }
								break;
								case 7: { Sprite.canvas.fillStyle = "rgba(0,128,128,0.5)"; }
								break;
								case 8: { Sprite.canvas.fillStyle = "rgba(128,128,0,0.5)"; }
								break;
							}
						}
						Sprite.canvas.fill();
						Sprite.canvas.lineWidth = 5;
						Sprite.canvas.strokeStyle = "black";
						Sprite.canvas.stroke();
					}
				}
				Sprite.stepSprite();
			}
		},

		moveSpriteTo: function(x,y){
			Sprite.targetx = x;
			Sprite.targety = y;
		},
		
		updateSpritePos: function(){
			if(Sprite.x != Sprite.targetx || Sprite.y != Sprite.targety){
				Sprite.isActive = true;
			}else{
				Sprite.isActive = false;
			}
				
			if(Sprite.x != Sprite.targetx){
				if(Sprite.x > Sprite.targetx){
					Sprite.x -= tileSizeX/2;
				}else{
					Sprite.x += tileSizeX/2;				
				}
			}
			
			if(Sprite.y != Sprite.targety){
				if(Sprite.y > Sprite.targety){
					Sprite.y -= tileSizeY/2;												
				}else{
					Sprite.y += tileSizeY/2;								
				}
			}
		},

		moveSpriteAt: function(x,y){
			Sprite.canvas.clearRect(x,y,Sprite.width,Sprite.height);
			if(Sprite.isReady){
				Sprite.canvas.drawImage(Sprite.image, Sprite.srcX, Sprite.srcY, Sprite.width, Sprite.height, 
													x, y, Sprite.width, Sprite.height);
			}
		},
		
		stepSprite: function(){
			if(Sprite.currentStep == Sprite.stepsize){
				if(Sprite.currentFrame < (Sprite.framesX * Sprite.framesY)-2){ 
					Sprite.srcX = Sprite.srcX + Sprite.width;
					if(Sprite.srcX == Sprite.framesX*Sprite.width){
						Sprite.srcX = Sprite.initsrcX;
						Sprite.srcY = Sprite.srcY + Sprite.height;
					}
					Sprite.currentFrame = Sprite.currentFrame+1;
				}else{
					Sprite.srcX = Sprite.srcX + Sprite.width;
					Sprite.currentFrame = Sprite.currentFrame+1;
					Sprite.currentFrame = 0;
					Sprite.srcX = Sprite.initsrcX;
					Sprite.srcY = Sprite.initsrcY;
					if(Sprite.drawOnce){
						Sprite.stopAnim = true;
						//alert('stop agad');
					}
				}
				Sprite.currentStep = 0;
			}else{
				Sprite.currentStep = Sprite.currentStep+1;
			}
		},
	}
	
	return Sprite;
};

//================================
// Scoring System
//================================
function updateScore(count){
	if(initScore){
		score += count * multiplier;
	}
}

function showScore(){
	if(iphone){
		ctx.clearRect(10,410,320,50);
		ctx.font = 'bold 25px courier';
		ctx.fillStyle = 'rgb(128,255,128)';
		var text = "SCORE: ";
		ctx.fillText(text, 20,435);
		ctx.font = 'bold 25px courier';
		ctx.fillText(score, 110,435);
		ctx.font = 'bold 25px courier';
		var time = "Time: ";
		ctx.fillText(time, 195,435);
		ctx.font = 'bold 25px courier';
		ctx.fillText(timeLimit, 270,435);
	}else{
		ctx.clearRect(30,350,100,50);
		ctx.font = 'bold 48px courier';
		ctx.fillStyle = 'rgb(128,255,128)';
		var text = "SCORE : ";
		ctx.fillText(text, 30,280);
		ctx.font = 'bold 72px courier';
		ctx.fillText(score, 100,330);
		ctx.font = 'bold 48px courier';
		var time = "Time Limit : ";
		ctx.fillText(time, 30,380);
		ctx.font = 'bold 72px courier';
		ctx.fillText(timeLimit, 120,440);
	}
}

//================================
// Misc Functions
//================================
function writeConsole(){
	ctx.clearRect(30,350,240,100);
	ctx.font = 'bold 15px console';
	ctx.fillStyle = '#000';
	var text = "Console";
	ctx.fillText(text, 30,250);
	ctx.fillText(debug, 30,270);
}
