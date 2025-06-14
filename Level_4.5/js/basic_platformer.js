//Declare my variables

var canvas;
var context;
var timer;
var interval;
var player;


	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");	

	player = new GameObject({x:150, y:canvas.height/2-100});

	platform0 = new GameObject();
		platform0.width = canvas.width-300;
		platform0.x = platform0.width/2;
		platform0.color = "#66ff33";
		
	
	platform1 = new GameObject();
		platform1.x = platform1.width;
		platform1.y = platform0.y- platform0.height/2 - platform1.height/2;
		platform1.color = "#66ff33";
		platform1.vx = 3;
		
	platform2 = new GameObject();
		platform2.width = canvas.width-300;
		platform2.x = platform0.width/2;
		platform2.color = "#66ff33";
		platform2.y = platform0.y- 200;
		platform2.color = "#66ff33";

		
	
	goal = new GameObject({width:24, height:50, x:platform1.x, y:platform1.y+100, color:"#00ffff"});
	

	var fX = .85;
	var fY = .97;
	
	var gravity = 1;

	interval = 1000/60;
	timer = setInterval(animate, interval);

	// Add a wall between the two platforms, same color as platforms
	wall = new GameObject();
	wall.width = 40;
	wall.height = 200;
	wall.x = platform0.x + platform0.width/2 - wall.width/2; // Position between platforms
	wall.y = (platform0.y + platform2.y) / 2; // Vertically between platforms
	wall.color = "#66ff33";
	

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
	player.vx += 2;
	
	player.x += Math.round(player.vx);
	player.y += Math.round(player.vy);
	

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
	
	while(platform1.hitTestPoint(player.left()))
	{
		player.x++;
	}
	
	//---------Objective: Save Me!---------------------------------------------------------------------------------------------------- 
	//---------Add a wall that will stop the player from falling--------------------------------------------------------------------------------


	
	// Wall collision: stop player from falling through the wall
    while(wall.hitTestPoint(player.right()) && player.vx >= 0)
    {
        player.x--;
        player.vx = 0;
    }
    while(wall.hitTestPoint(player.left()) && player.vx <= 0)
    {
        player.x++;
        player.vx = 0;
    }
    while(wall.hitTestPoint(player.bottom()) && player.vy >= 0)
    {
        player.y--;
        player.vy = 0;
        player.canJump = true;
    }
    while(wall.hitTestPoint(player.top()) && player.vy <= 0)
    {
        player.y++;
        player.vy = 0;
    }

	
	
	
	
	
	platform0.drawRect();
	platform2.drawRect();
	
	player.drawRect();
	
	//Show hit points
	player.drawDebug();
	goal.drawCircle();
	wall.drawRect(); // Draw the wall
}

