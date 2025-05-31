//Declare my variables

var canvas;
var context;
var timer;
var interval;
var player;


	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");	

	player = new GameObject({x:100, y:canvas.height/2-100});

	platform0 = new GameObject();
		platform0.width = 200;
		platform0.x = platform0.width/2;
		platform0.y = canvas.height - platform0.height/2;
		platform0.color = "#66ff33";
		
	goal = new GameObject({width:24, height:50, x:canvas.width-50, y:100, color:"#00ffff"});
	

	var fX = .85;
	var fY = 1.01;
	
	var gravity = 1;

	interval = 1000/60;
	timer = setInterval(animate, interval);


// Created additional platforms for the player to use
var platforms = [platform0];

var platform1 = new GameObject();
platform1.width = 150;
platform1.height = 30;
platform1.x = 400;
platform1.y = 600;
platform1.color = "#ff9933";
platforms.push(platform1);

var platform2 = new GameObject();
platform2.width = 120;
platform2.height = 30;
platform2.x = 700;
platform2.y = 400;
platform2.color = "#3399ff";
platforms.push(platform2);

var platform3 = new GameObject();
platform3.width = 100;
platform3.height = 30;
platform3.x = 850;
platform3.y = 220;
platform3.color = "#ff33aa";
platforms.push(platform3);


function animate()
{
	
	context.clearRect(0,0,canvas.width, canvas.height);	

	if(w && player.canJump && player.vy ==0)
	{
		player.canJump = false;
		player.vy += player.jumpHeight;
	}

	if(a)
	{
		player.vx += -player.ax * player.force;
	}
	if(d)
	{
		player.vx += player.ax * player.force;
	}

	player.vx *= fX;
	player.vy *= fY;
	
	player.vy += gravity;
	
	player.x += Math.round(player.vx);
	player.y += Math.round(player.vy);
	

	// Platform collision checks for all platforms
	for(let i=0; i<platforms.length; i++)
	{
		let p = platforms[i];
		while(p.hitTestPoint(player.bottom()) && player.vy >=0)
		{
			player.y--;
			player.vy = 0;
			player.canJump = true;
		}
		while(p.hitTestPoint(player.left()) && player.vx <=0)
		{
			player.x++;
			player.vx = 0;
		}
		while(p.hitTestPoint(player.right()) && player.vx >=0)
		{
			player.x--;
			player.vx = 0;
		}
		while(p.hitTestPoint(player.top()) && player.vy <=0)
		{
			player.y++;
			player.vy = 0;
		}
	}

	
	//---------Objective: Treasure!!!!!!!---------------------------------------------------------------------------------------------------- 
	//---------Run this program first.
	//---------Get Creative. Find a new way to get your player from the platform to the pearl. 
	//---------You can do anything you would like except break the following rules:
	//---------RULE1: You cannot spawn your player on the pearl!
	//---------RULE2: You cannot change the innitial locations of platform0 or the goal! 
		
	if(player.hitTestObject(goal))
	{
		goal.y = 10000;
		context.textAlign = "center";
		context.drawText("You Win!!!", canvas.width/2, canvas.height/2);
	}
	
	
	// Draw all platforms
	for(let i=0; i<platforms.length; i++)
	{
		platforms[i].drawRect();
	}

	//Show hit points
	player.drawRect();
	goal.drawCircle();
}


