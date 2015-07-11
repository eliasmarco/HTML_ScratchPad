//==============================
// ALIEN INVASION
// 033012 elias
//==============================

// Canvas Settings
var canvas,
    ctx,
    width = 600,
    height = 600,
	fps = 30;

// Enemy Settings	
var enemies = [],
	enemyTotal = 6,
    enemy_x = 50,
    enemy_y = -45,
    enemy_w = 64,
    enemy_h = 64,
    min_speed = 2,
    max_speed = 5;

// Control Settings
var rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false,
    spaceKey = false,
	keyLatch = false,
	latchCounter = 0,
	mouse_X,
	mouse_Y,
	mouse_downX,
	mouse_downY,
	mouse_upX,
	mouse_upY,
	mousePressed = false,
	disableControls = false;
	

// Hero Settings
var ship,
	ship_w 	 = 64,
	ship_h 	 = 96,
    ship_x 	 = (width / 2) - (ship_w/2),
    ship_y 	 = height - ship_h - 10,
	movement = 7;
    explodes = [],
    lasers 	 = [],
    laserTotal = 2,
	//fireBurst  = 3,
	fireSpeed  = 7,
	counter1   = 0,
	counter2   = 0,
	counter3   = 0,
	counter4   = 0,
	playtime   = 0,
	flag1   = false,
	flag2   = false,
	flag3   = false,
	invincible = false;
	
// Game Settings
var score = 0,
    lives = 3,
    alive = true,
    gameStarted = false,
	gameState = 0;

//Misc Assets
var bonus = [],
	starfield,
    starX = 0, 
	starY = 0, 
	starY2 = -600;
	global_rotation = 0;

	var particles = 100;
	var particle_vec = [];
	
	
// Enemy Functions 
function genRandomSprite(){
	enemy_sprite = newSprite();
	var randomnumber=Math.floor(Math.random()*3);
	var randomanimspeed=Math.floor(Math.random()*3);
	if(randomnumber == 2){
		enemy_sprite.initSprite(ctx,"asteroid2",enemy_w,enemy_h,0,0,"images/asteroids2.png")	
		enemy_sprite.setAnim(0,4,4,randomanimspeed);
	}else{
		enemy_sprite.initSprite(ctx,"asteroid",enemy_w,enemy_h,0,0,"images/asteroids.png")
		enemy_sprite.setAnim(randomnumber,8,4,randomanimspeed);
	}
	enemy_sprite.move_speed = Math.floor(Math.random()*max_speed) + min_speed;
	return enemy_sprite;
}

function genEnemies(){
	for (var i = 0; i < enemyTotal; i++) {
		var enemy = genRandomSprite();
		enemy.position_x = enemy_x;
		enemy.position_y = enemy_y;
		enemies.push(enemy);
		var randomtile = (Math.floor(Math.random()*10));
		var randomoffset = (Math.floor(Math.random()*30));
		enemy_x = (randomtile*60) + randomoffset;
	}
}	

function drawEnemies() {
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].updateSprite();
		enemies[i].drawSprite();
		//enemies[i].createTrail();
	}
}

function moveEnemies() {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].position_y < height) {
			enemies[i].position_y += (enemies[i].move_speed/2);
		} else if (enemies[i].position_y > height - 1) {
			enemies.splice(i,1);
			var enemy = genRandomSprite();
			enemy.position_x = enemy_x;
			enemy.position_y = enemy_y;
			enemies.push(enemy);
			var randomtile = (Math.floor(Math.random()*10));
			var randomoffset = (Math.floor(Math.random()*30));
			enemy_x = (randomtile*60) + randomoffset;
		}
	}
}

function genLight(){
	var light_sprite = newSprite();
	var randomnumber=Math.floor(Math.random()*100);
	if(randomnumber < 10){
		light_sprite.initSprite(ctx,"light",64,64,0,0,"images/light.png")	
		light_sprite.setAnim(0,4,4,1);
		var randomtile = (Math.floor(Math.random()*10));
		var randomoffset = (Math.floor(Math.random()*30));
		light_sprite.position_x = (randomtile*60) + randomoffset;
		light_sprite.position_y = enemy_y;
	}else if((randomnumber > 10)&&(randomnumber < 15)){
		light_sprite.initSprite(ctx,"rings",75,75,0,0,"images/threerings.png")	
		light_sprite.setAnim(0,6,8,1);
		var randomtile = (Math.floor(Math.random()*10));
		var randomoffset = (Math.floor(Math.random()*30));
		light_sprite.position_x = (randomtile*60) + randomoffset;
		light_sprite.position_y = enemy_y;
	}
	light_sprite.move_speed = max_speed;
	bonus.push(light_sprite);
}

function moveLight() {
	if(bonus.length != 0){
		for (var i = 0; i < bonus.length; i++) {
			if (bonus[i].position_y < height) {
				bonus[i].position_y += (bonus[i].move_speed/2);
			} else if (enemies[i].position_y > height - 1) {
				bonus.splice(i,1);
			}
		}
	}
}

function drawLight() {
	for (var i = 0; i < bonus.length; i++) {
		bonus[i].updateSprite();
		bonus[i].drawSprite();
	}
}

function timer(){
	counter4 += 1;
	if(counter4 == 100){
		counter4 = 0;	
		genLight();
	}
}

// Hero Functions
function drawShip() {
	if(!disableControls){
		if (rightKey){
			ship_sprite.position_x += movement;
		}else if (leftKey){
			ship_sprite.position_x -= movement;
		}
		 
		if (upKey){
			ship_sprite.position_y -= movement;
		}else if (downKey) {
			ship_sprite.position_y += movement;
		}
	 
		if (ship_sprite.position_x <= 0){
			ship_sprite.position_x = 0;
		} 
		if ((ship_sprite.position_x + ship_sprite.size_w) >= width) {
			ship_sprite.position_x = width - ship_sprite.size_w;
		}
		if (ship_sprite.position_y <= 0) {
			ship_sprite.position_y = 0;
		}
		if ((ship_sprite.position_y + ship_sprite.size_h) >= height) {
			ship_sprite.position_y = height - ship_sprite.size_h;
		}

		ship_sprite.updateSprite();	
		if(invincible){
			counter3 += 1;
			if(counter3%2 == 0){
				ship_sprite.drawSprite();
			}
		}else{
			ship_sprite.drawSprite();
		}
		
		if(counter3 == 75){
			invincible = false;
			counter3 = 0;
		}
	}
}

function newlaser() {
	var laser = {
		position_x : 0,
		position_y : 0,
		size_w : 10,
		size_h : 10,
		color : 0,
		setpos : function(x,y){
			laser.position_x = x;
			laser.position_y = y;
		},
		gencolor : function(){
			var r = 255;//Math.random()*255>>0;
			var g = 128;//Math.random()*255>>0;
			var b = 0;//128;//Math.random()*255>>0;
			laser.color = "rgba("+r+", "+g+", "+b+",1)";
		}
		
	} 
	return laser;
}

// Laser Functions
function drawLaser() {
	if(!disableControls){
		if( spaceKey ){
			if(!keyLatch){
				/*laser_sprite = newSprite();
				laser_sprite.initSprite(ctx,"blast",32,32,0,0,"images/blast.png")
				laser_sprite.position_x = ship_sprite.position_x + 16;
				laser_sprite.position_y = ship_sprite.posit   y - 5;*/
				var laservec = newlaser();
				laservec.setpos(ship_sprite.position_x + 16,ship_sprite.position_y - 5);
				laservec.gencolor();
				lasers.push(laservec);	
				keyLatch = true;
			}
		}
		
		if(keyLatch){
			latchCounter += 1;
		}
		
		if(latchCounter == fireSpeed){
			latchCounter = 0;
			keyLatch = false;
		}

		if (lasers.length){
			for (var i = 0; i < lasers.length; i++) {
				ctx.globalCompositeOperation = "lighter";
				ctx.beginPath();
				
				var gradient = ctx.createRadialGradient(lasers[i].position_x,lasers[i].position_y,0,lasers[i].position_x,lasers[i].position_y,20);
				gradient.addColorStop(0,"white");
				gradient.addColorStop(0.4,"white");
				gradient.addColorStop(0.4,lasers[i].color);
				gradient.addColorStop(1,"black");
				ctx.fillStyle = gradient;
				ctx.arc(lasers[i].position_x,lasers[i].position_y,30, Math.PI*2,false);
				ctx.fill();
				ctx.globalCompositeOperation = "source-over";
			}
		}
	}
}

function moveLaser() {
	for (var i = 0; i < lasers.length; i++) {
		if (lasers[i].position_y > -50) {
			lasers[i].position_y -= 10;
		} else if (lasers[i].position_y < -10) {
			lasers.splice(i, 1);
		}
	}
}
function set_explode(x,y,ex){
	if(ex == 0){
		flag1 = true;
		yex_sprite.position_x = x;
		yex_sprite.position_y = y;	
	}else{
		flag2 = true;
		bex_sprite.position_x = x;
		bex_sprite.position_y = y;		
	}
}

function drawExplosion(){
	if(flag1){
		if(yex_sprite.anim_cycle_flag){
			disableControls = false;
			ship_sprite.hide = false;			
			flag1 = false
			yex_sprite.anim_cycle_flag = false;
		}else{
			disableControls = true;
			ship_sprite.hide = true;
			yex_sprite.drawSprite();
			yex_sprite.updateSprite();
		}
	}
	if(explodes.length > 0){
		for (var i = 0 ; i < explodes.length; i++){
			if(explodes[i].anim_cycle_flag){
				flag2 = false
				explodes[i].anim_cycle_flag = false;
				explodes.splice(i,1);
			}else{
				explodes[i].drawSprite();
				explodes[i].updateSprite();
			}
		}
	}
}

function createExplodeSprite(x,y){
	var bsprite = newSprite();
	bsprite.initSprite(ctx,"blue_explosion",96,96,0,0,"images/bex.png")
	bsprite.setAnim(0,3,4,1);
	bsprite.posSprite(x,y);
	return bsprite;
}

// Collision Detection
function hitTest() {
	var remove = false;
	
	for (var i = 0; i < lasers.length; i++) {
		for (var j = 0; j < bonus.length; j++) {
			if (collide(lasers[i],bonus[j])) {		
				if(bonus[j].prop_name == "rings"){
					bonus.splice(i,1);
					set_explode(ship_sprite.position_x,ship_sprite.position_y,0);
					checkLives();	
					reset_hero();
				}
			}
		}
	}
	for (var i = 0; i < lasers.length; i++) {
		for (var j = 0; j < enemies.length; j++) {
			if (collide(lasers[i],enemies[j])) {
				//set_explode(enemies[j].position_x,enemies[j].position_y,1);
				var exp = createExplodeSprite(enemies[j].position_x,enemies[j].position_y);
				explodes.push(exp);
				
				remove = true;
				enemies.splice(j, 1);
				score += 10;

				var enemy = genRandomSprite();
				enemy.position_x = enemy_x;
				enemy.position_y = enemy_y;
				enemies.push(enemy);
				var randomtile = (Math.floor(Math.random()*10));
				var randomoffset = (Math.floor(Math.random()*30));
				enemy_x = (randomtile*60) + randomoffset;

			}
		}
		if (remove == true) {
			lasers.splice(i, 1);
			remove = false;
		}
	}
}

function shipCollision() {
	if(!invincible){
		for (var i = 0; i < enemies.length; i++) {
			if (collide(ship_sprite,enemies[i])){
				var exp = createExplodeSprite(enemies[i].position_x,enemies[i].position_y);
				explodes.push(exp);
				set_explode(ship_sprite.position_x,ship_sprite.position_y,0);
				enemies.splice(i, 1);
				checkLives();	
				reset_hero();
			}
		}
	}
	
	for (var i = 0; i < bonus.length; i++) {
		if (collide(ship_sprite,bonus[i])){
			if(bonus[i].prop_name == "light"){
				score += 100;
			}else if(bonus[i].prop_name == "rings"){
				score += 500;
				/*for (var j = 0; j < enemies.length; j++) {
					var exp2 = createExplodeSprite(enemies[j].position_x,enemies[j].position_y);
					explodes.push(exp2);
					enemies.splice(j, enemies.length);
					score += 10;
				}
				genEnemies();	
				score += 100;*/
			}
			bonus.splice(i, 1);
		}
	}
}

function collide(object1, object2){
    var left1, left2, over_left;
    var right1, right2, over_right;
    var top1, top2, over_top;
    var bottom1, bottom2, over_bottom;
    var over_width, over_height;
	var overlap_factor = 10;
	
	bottom1 = object1.position_y + object1.size_h;
	bottom2 = object2.position_y + object2.size_h;
	top1 	= object1.position_y;
	top2 	= object2.position_y;
	
	right1 = object1.position_x + object1.size_w;
	right2 = object2.position_x + object2.size_w;
	left1 = object1.position_x;
	left2 = object2.position_x;

    if (bottom1-overlap_factor < top2) return false;
    if (bottom2-overlap_factor < top1) return false;

    if (right1-overlap_factor < left2) return false;
    if (left1+overlap_factor > right2) return false;
	
	return true;
}

// Game State
function checkLives() {
	lives -= 1;
	if (lives > 0) {
		reset_hero();
	} else if (lives == 0) {
		alive = false;
	}
}

// Reset
function reset_hero(){
    ship_sprite.position_x 	 = (width / 2) - (ship_w/2);
    ship_sprite.position_y 	 = height - ship_h - 10;
	invincible = true;
}

function reset_all(){
    reset_hero();
	ship_sprite.resetSprite();
	bex_sprite.resetSprite();
	yex_sprite.resetSprite();
	for (var i = 0; i < enemies.length; i++) {
		enemies.splice(i, 1);
	}
	genEnemies();
	counter1   = 0,
	counter2   = 0,
	counter3   = 0,
	flag1   = false,
	flag2   = false,
	flag3   = false
	invincible = false;
}

function scoreTotal() {
    ctx.font = 'bold 50px courier';
    ctx.fillText('Game Over!', width / 2 - 130, height / 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px courier';
    ctx.fillText('Click to Play Again', width / 2 - 100, (height / 2) + 35);
    canvas.addEventListener('click', click, false);
}

function scoreDisplay(){
	ctx.font = 'bold 20px courier';
	ctx.fillStyle = '#efe';
	ctx.fillText('Score: ', 10, 55);
	ctx.fillText(score, 90, 55);
	ctx.fillText('Lives:', 10, 30);
	ctx.fillText(lives, 90, 30);
}

function startPage() {

	ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px courier';
    ctx.fillText('Asteroids', width / 2 - 130, height / 2);
    ctx.font = 'bold 20px courier';
    ctx.fillText('Click to Play', width / 2 - 100, height / 2 + 35);

    ctx.fillText('Move - Arrow Keys', width / 2 - 100, height / 2 + 70);
	ctx.fillText('Fire - Spacebar', width / 2 - 100, height / 2 + 100);
}

// Game Entry Point
function game_init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
  
	if(!ctx)
		alert('shit');
	
	loadAssets();
	
	document.addEventListener('keydown', keyDown, false);
	document.addEventListener('keyup', keyUp, false);
	canvas.addEventListener('click', click, false);
	gameLoop();
}

function loadAssets(){
	genEnemies();

	starfield = new Image();
	starfield.src = 'images/stars2.png';

	starfield2 = new Image();
	starfield2.src = 'images/stars.png';

	space = new Image();
	space.src = 'images/space.jpg';  

	ship_sprite = newSprite();
	ship_sprite.initSprite(ctx,"ship",64,96,0,0,"images/ship2.png")
	ship_sprite.setAnim(0,4,1,2);
	ship_sprite.posSprite(ship_x,ship_y)
	
	yex_sprite = newSprite();
	yex_sprite.initSprite(ctx,"yellow_explosion",128,96,0,0,"images/yex.png")
	yex_sprite.setAnim(0,4,5,1);

	for(i=0;i <particles; i++){
		particle_vec.push(new createParticle())
		particle_vec[i].setlocation(ship_sprite.position_x+30,ship_sprite.position_y+8);
	}	
}

// Game Loop
function gameLoop() {
	clearCanvas();
	drawStarfield();
	//drawShip();
	switch(gameState){
		case 0 :
			startPage();
			playtime = 0;
		break;
		case 1 :
			document.getElementById('audiotag1').play();
			scoreDisplay();
			if ((alive && lives) == 0) {
				gameState = 2;}else{
				hitTest();
				shipCollision();
				moveLaser();
				moveEnemies();
				drawEnemies();
				drawShip();
				drawLaser();
				drawExplosion();
				createflame();
				timer();				
				moveLight();
				drawLight();
			}
		break;		
		case 2 :
			scoreTotal();	
			drawExplosion();
			moveEnemies();
			drawEnemies();
			playtime = 0;
			timer();
			moveLight();
			drawLight();
		break;
	}
	
	game = setTimeout(gameLoop, fps);
}

// Canvas Handling
function clearCanvas() {
	ctx.clearRect(0,0,width,height);
}

function drawStarfield() {
	//ctx.drawImage(space,0,0);
	ctx.drawImage(starfield,starX,starY);
	ctx.drawImage(starfield2,starX,starY2);
	if (starY > 0) {
		starY = -599;
	}
	if (starY2 > 0) {
		starY2 = -599;
	}
	starY += 1;
	starY2 += 3;
}

//================================
// Input Handler
//================================
function keyDown(e) {
	e.preventDefault();
	switch(e.keyCode){
		case 37:leftKey = true;break;
		case 38:upKey = true;break;
		case 39:rightKey = true;break;
		case 40:downKey = true;break;
		case 32:spaceKey = true;
		break;
	}
}

function keyUp(e) {
	switch(e.keyCode){
		case 32:spaceKey = false;break;
		case 37:leftKey = false;break;
		case 38:upKey = false;break;
		case 39:rightKey = false;break;
		case 40:downKey = false;break;
	}
}

function mouseMove(e){
	mouse_X = e.clientX - document.getElementById('game_canvas').offsetLeft;
	mouse_Y = e.clientY - document.getElementById('game_canvas').offsetTop;
}

function mouseDown(e){
	mouse_downX = e.clientX - document.getElementById('game_canvas').offsetLeft;
	mouse_downY = e.clientY - document.getElementById('game_canvas').offsetTop;
}
function mouseUp(e){
	mouse_upX = e.clientX - document.getElementById('game_canvas').offsetLeft;
	mouse_upY = e.clientY - document.getElementById('game_canvas').offsetTop;
}

function click(e){
	if(gameState == 0){
		canvas.removeEventListener('click', click, false);
		gameState = 1;
	}else if(gameState == 2){
		canvas.removeEventListener('click', click, false);
		alive = true;
		lives = 3;
		reset_hero();
		gameState = 1;
	}
}


//================================
// Sprite Class
//================================
function newSprite(){
	var Sprite = {
		//sprite information
		prop_ctx: 0,
		prop_name: 0,
		prop_info: 0,
		prop_image: 0,
		size_w: 0, 
		size_h: 0,
		src_x: 0,
		src_y: 0,
		state_ready: false,
		hide: false,
		//coordinate information
		position_x: 0,
		position_y: 0,
		translate_x: 0,
		translate_y: 0,
		move_speed: 0,
		move_active: false,
		init_x: 0,
		init_y: 0,
		//animation information
		anim_enabled: true,
		anim_frames: 0,
		anim_frames_x: 0,
		anim_frames_y: 0,
		anim_step_size: 0,
		anim_current_f: 0,
		anim_current_step: 0,
		anim_cycle_flag: false,
		//sprite functions
		initSprite: function(ctx,name,w,h,x,y,file){
			Sprite.prop_ctx = ctx;
			Sprite.prop_name = name;
			Sprite.size_w = w;
			Sprite.size_h = h;
			Sprite.src_x = x;
			Sprite.src_y = y;
			Sprite.init_x = x;
			Sprite.init_y = y;
			Sprite.loadImage(file);
			
			for(i=0;i <Sprite.particles; i++){
				Sprite.particle_vec.push(new createMeteor())
				Sprite.particle_vec[i].setlocation(Sprite.position_x+30,Sprite.position_y+10);
			}	
		},
		
		loadImage: function(file){
			Sprite.prop_image = new Image();
			Sprite.prop_image.onload = function(){
				Sprite.state_ready = true;
			}
			Sprite.prop_image.src = file;
		},

		posSprite: function(x,y){
			Sprite.position_x = x;
			Sprite.position_y = y;
		},
		
		moveSprite: function(x,y,speed){
			translate_x = x;
			translate_y = y;
			move_speed  = speed;
			move_active = true;
		},
		
		updateSprite: function(){
			if(Sprite.move_active){
				if(Sprite.position_x > Sprite.translate_x){
					Sprite.position_x -= move_speed;
				}else{
					Sprite.position_x += move_speed;
				}
				if(Sprite.position_y > Sprite.translate_y){
					Sprite.position_y -= move_speed;
				}else{
					Sprite.position_y += move_speed;
				}
			}
			
			if(Sprite.anim_enabled){
				if(Sprite.anim_current_step == Sprite.anim_step_size){
					if(Sprite.anim_current_f < (Sprite.anim_frames_x*Sprite.anim_frames_y)-1){
						if(Sprite.anim_frames_y > 1){
							if((Sprite.anim_current_f+1)%Sprite.anim_frames_x == 0){
								Sprite.src_y = Sprite.src_y + Sprite.size_h;						
								Sprite.src_x = Sprite.init_x;
							}else{
								Sprite.src_x = Sprite.src_x + Sprite.size_w;
							}
						}else{
							Sprite.src_x = Sprite.src_x + Sprite.size_w;
						}
						Sprite.anim_current_f += 1;
					}else{
						Sprite.anim_cycle_flag = true;
						Sprite.anim_current_f = 0;
						Sprite.src_y = Sprite.init_y;
						Sprite.src_x = Sprite.init_x;
					}
					Sprite.anim_current_step = 0;
				}else{
					Sprite.anim_current_step += 1;
				}
			}
		},
		
		drawSprite: function(){
			if(!Sprite.hide){
				//Sprite.prop_ctx.clearRect(Sprite.position_x,Sprite.position_y,Sprite.size_w,Sprite.size_h);
				if(Sprite.state_ready){
					Sprite.prop_ctx.drawImage(Sprite.prop_image,
										 Sprite.src_x,
										 Sprite.src_y,
										 Sprite.size_w,
										 Sprite.size_h, 
										 Sprite.position_x,
										 Sprite.position_y,
										 Sprite.size_w,
										 Sprite.size_h);
				}
			}
		},
		
		setAnim: function(select,x,y,step_size){
			Sprite.src_y 		  = Sprite.init_y + (Sprite.size_h*(select*y));
			Sprite.init_y		  = Sprite.size_h*(select*y);
			Sprite.anim_frames_x  = x;
			Sprite.anim_frames_y  = y;
			Sprite.anim_step_size = step_size;
		},
		
		resetSprite: function(){
			Sprite.translate_x = 0;
			Sprite.translate_y = 0;
			Sprite.anim_current_f    = 0;
			Sprite.anim_current_step = 0;
		},
		
		particles : 100,
		particle_vec : [],
		
		createTrail : function (){
			// ctx.fillStyle = "black";
			// ctx.fillRect(0,0,200,200);
			globalCompositeOperation="lighter";
			for(i=0;i < Sprite.particle_vec.length; i++){
				var p = Sprite.particle_vec[i];
				ctx.beginPath();
				p.opacity = Math.round(p.remaining_life/p.life*100)/100
				var gradient = ctx.createRadialGradient(p.location.x,p.location.y,0,p.location.x,p.location.y,p.radius);
				gradient.addColorStop(0,"rgba("+p.r+","+p.g+", "+p.b+","+p.opacity+")");
				gradient.addColorStop(0.5,"rgba("+p.r+","+p.g+", "+p.b+","+p.opacity+")");
				gradient.addColorStop(1,"rgba("+p.r+","+p.g+", "+p.b+",0)");
				ctx.fillStyle = gradient;
				ctx.arc(p.location.x,p.location.y,p.radius, Math.PI*2,false);
				ctx.fill();
				
				p.remaining_life--;
				p.radius--;
				p.location.x += p.speed.x;
				p.location.y += p.speed.y;
				
				if(p.remaining_life < 0||p.radius < 0){
					Sprite.particle_vec[i] = new createMeteor();
					Sprite.particle_vec[i].setlocation(Sprite.position_x+30,Sprite.position_y+10);		}
				//updateParticles();
			}
			globalCompositeOperation="source-over";
		} 
		
	}
	
	return Sprite;
};



function createMeteor(){
	this.speed    = {x: -2.5+Math.random()*5, y:-15+Math.random()*10};
	this.setlocation = function(locx,locy){
		this.location = {x: locx, y:locy}
	}
	this.radius = 10+Math.random()*20;
	this.life = 20+Math.random()*10;
	this.remaining_life = this.life;
	
	this.r = Math.round(Math.random()*128);
	this.g = Math.round(Math.random()*255)+100;
	this.b = 255//Math.round(Math.random()*255)+100;
}


function createParticle(){
	this.speed    = {x: -2.5+Math.random()*5, y:15+Math.random()*10};
	this.setlocation = function(locx,locy){
		this.location = {x: locx, y:locy}
	}
	this.radius = 10+Math.random()*20;
	this.life = 20+Math.random()*10;
	this.remaining_life = this.life;

	this.r = Math.round(Math.random()*255)+50;
	this.g = this.r//255//Math.round(Math.random()*255)+100;
	this.b = this.r//255//Math.round(Math.random()*255);	

}



function createflame(){
	// ctx.fillStyle = "black";
	// ctx.fillRect(0,0,200,200);
	globalCompositeOperation="lighter";
	for(i=0;i < particle_vec.length; i++){
		var p = particle_vec[i];
		ctx.beginPath();
		p.opacity = Math.round(p.remaining_life/p.life*100)/100
		var gradient = ctx.createRadialGradient(p.location.x,p.location.y,0,p.location.x,p.location.y,p.radius);
		gradient.addColorStop(0,"rgba("+p.r+","+p.g+", "+p.b+","+p.opacity+")");
		gradient.addColorStop(0.5,"rgba("+p.r+","+p.g+", "+p.b+","+p.opacity+")");
		gradient.addColorStop(1,"rgba("+p.r+","+p.g+", "+p.b+",0)");
		ctx.fillStyle = gradient;
		ctx.arc(p.location.x,p.location.y,p.radius, Math.PI*2,false);
		ctx.fill();
		
		p.remaining_life--;
		p.radius--;
		p.location.x += p.speed.x;
		p.location.y += p.speed.y;
		
		if(p.remaining_life < 0||p.radius < 0){
			particle_vec[i] = new createParticle();
			particle_vec[i].setlocation(ship_sprite.position_x+30,ship_sprite.position_y+110);		}
		//updateParticles();
	}
	globalCompositeOperation="source-over";
} 



