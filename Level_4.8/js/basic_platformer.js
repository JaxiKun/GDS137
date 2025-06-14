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
		platform0.width = canvas.width-300;
		platform0.x = platform0.width/2;
		platform0.color = "#66ff33";
		
	
	platform1 = new GameObject();
		platform1.x = 500;
		platform1.y = platform0.y- platform0.height/2 - platform1.height/2;
		platform1.color = "#ffff00";
		
	platform2 = new GameObject();
		platform2.width = canvas.width-300;
		platform2.x = platform0.width/2;
		platform2.color = "#66ff33";
		platform2.y = platform0.y- 200;
		platform2.color = "#66ff33";

		
	
	goal = new GameObject({width:24, height:50, x:20, y:platform0.y-100, color:"#00ffff"});
	

	var fX = .85;
	var fY = .97;
	
	var gravity = 1;
	

	interval = 1000/60;
	timer = setInterval(animate, interval);

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
	
	platform1.x += platform1.vx;

	while(platform0.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
		player.canJump = true;
	}
	while(platform0.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}
	while(platform0.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}
	while(platform0.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(platform2.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(platform2.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
		player.canJump = true;
	}
	while(platform2.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}
	while(platform2.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}
	while(platform1.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(platform1.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
		player.canJump = true;
	}
	while(platform1.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}
	while(platform1.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	
	//---------Objective: Let Me Out!---------------------------------------------------------------------------------------------------- 
	//---------Run this program first.
	//---------Get the pearl to open the door--------------------------------------------------------------------------------------------
	//---------Hint: you'll need a new variable to keep track of the key-----------------------------------------------------------------

	// 1. Add a variable to track if the player has the pearl
	var hasPearl = false;

	if(player.hitTestObject(goal))
	{
		goal.y = 10000;
		hasPearl = true; // Player has collected the pearl
		console.log("Player has the pearl!"); // Log when the player gets the pearl
		player.color = "#ff00ff"; // Change player color when touching the pearl
	}

	
	if (
		platform1.visible !== false &&
		player.color === "#ff00ff"
	) {
		console.log("Player has the new color, yellow door disappears!");
		platform1.visible = false;
		platform1.y = -1000;
	}

	platform0.drawRect();
	platform2.drawRect();
	if (platform1.visible !== false) platform1.drawRect();
	player.drawRect();
	
	//Show hit points
	player.drawDebug();
	goal.drawCircle();
}

