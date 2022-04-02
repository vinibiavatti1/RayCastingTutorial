// Data
let data = {
    screen: {
        width: 640,
        height: 480,
        halfWidth: null,
        halfHeight: null
    },
    render: {
        delay: 30
    },
    rayCasting: {
        incrementAngle: null,
        precision: 64
    },
    hud: {
        draw: false,
        grids: false,
        transparent: false
    },
    player: {
        fov: 60,
        halfFov: null,
        x: 2,
        y: 2,
        angle: 90,
        speed: {
            movement: 0.3,
            rotation: 5.0
        }
    },
    map: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1],
    ],
    key: {
        up: "KeyW",
        down: "KeyS",
        left: "KeyA",
        right: "KeyD"
    }
}

// Calculated data
data.screen.halfWidth = data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.screen.width;
data.player.halfFov = data.player.fov / 2;

// Canvas
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = "1px solid black";
document.body.appendChild(screen);

// Canvas context
const screenContext = screen.getContext("2d");

/**
 * Cast degree to radian
 * @param {Number} degree 
 */
function degreeToRadians(degree) {
    let pi = Math.PI;
    return degree * pi / 180;
}

/**
 * Draw line into screen
 * @param {Number} x1 - x coordinate where line will start
 * @param {Number} y1 - y coordinate where line will start
 * @param {Number} x2 - x coordinate where line will end
 * @param {Number} y2 - y coordinate where line will end
 * @param {String} cssColor - Color of line
 */
function drawLine(x1, y1, x2, y2, cssColor) {
    screenContext.strokeStyle = cssColor;
    screenContext.beginPath();
    screenContext.moveTo(x1, y1);
    screenContext.lineTo(x2, y2);
    screenContext.stroke();
}

/**
 * Draw rectangle into screen
 * @param {Number} x1 - x coordinate of rectangle
 * @param {Number} y1 - y coordiante of rectangle
 * @param {Number} w - Width of rectangle
 * @param {Number} h - Height of rectangle
 * @param {String} cssColor - Color of rectangle
 * @param {Boolean} [fill=false] - Decides whether fill or not
 */
function drawRect(x1, y1, w, h, cssColor, fill = false) {
    if (fill == true) {
        screenContext.fillStyle = cssColor;
        screenContext.fillRect(x1, y1, w, h);
    }
    else {
        screenContext.strokeStyle = cssColor;
        screenContext.strokeRect(x1, y1, w, h);
   }
}

/**
 * Draw circle into screen
 * @param {Number} x1 - x coordinate of circle
 * @param {Number} y1 - y coordinate of circle
 * @param {Number} radius - Radius of circle
 * @param {String} cssColor - Color of circle
 */
function drawCircle(x1, y1, radius, cssColor) {
    screenContext.fillStyle = cssColor;
    screenContext.beginPath();
    screenContext.arc(x1, y1, radius, 0, 2 * Math.PI);
    screenContext.fill();
}

// Start
main();

/**
 * Main loop
 */
function main() {
    setInterval(function() {
        clearScreen();
        rayCasting();
        if (data.hud.draw == true) {
            drawHudMap();
        }
    }, data.render.delay);
}

/**
 * Raycasting logic
 */
function rayCasting() {
    let rayAngle = data.player.angle - data.player.halfFov;
    for(let rayCount = 0; rayCount < data.screen.width; rayCount++) {
        
        // Ray data
        let ray = {
            x: data.player.x,
            y: data.player.y
        }

        // Ray path incrementers
        let rayCos = Math.cos(degreeToRadians(rayAngle)) / data.rayCasting.precision;
        let raySin = Math.sin(degreeToRadians(rayAngle)) / data.rayCasting.precision;
        
        // Wall finder
        let wall = 0;
        while(wall == 0) {
            ray.x += rayCos;
            ray.y += raySin;
            wall = data.map[Math.floor(ray.y)][Math.floor(ray.x)];
        }

        // Pythagoras theorem
        let distance = Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));

        // Fish eye fix
        distance = distance * Math.cos(degreeToRadians(rayAngle - data.player.angle));

        // Wall height
        let wallHeight = Math.floor(data.screen.halfHeight / distance);

        // Draw
        drawLine(rayCount, 0, rayCount, data.screen.halfHeight - wallHeight, "cyan");
        drawLine(rayCount, data.screen.halfHeight - wallHeight, rayCount, data.screen.halfHeight + wallHeight, "red");
        drawLine(rayCount, data.screen.halfHeight + wallHeight, rayCount, data.screen.height, "green");

        // Increment
        rayAngle += data.rayCasting.incrementAngle;
    }
}
/**
 * 
 * @param {Number} x1 - x coordinate where map will be drawn from
 * @param {Number} y1 - y coordinate where map will be drawn from
 * @param {Number} w  - Width of each rectangle in map
 * @param {Number} h  - Height of each rectangke in map
 */
function drawHudMap(x1 = 0, y1 = 0, w = 10, h = 10) {
    // y/x
    const mapSize = [data.map.length, data.map[0].length];
    
    // Draw HUD background
    if (data.hud.transparent != true) { 
        drawRect(x1, y1, mapSize[1]*w, mapSize[0]*h, "#e5e5e5", true);
    }

    let y; 
    for (y = 0; y < mapSize[0]; y++) { 
      let x;
      for (x = 0; x < mapSize[1]; x++) {
        if (data.map[y][x] == 1) {
            drawRect(x*w+x1, y*h+y1, w, h, "#7f7f7f", true);
            // Draw outline for rectangle
            // https://stackoverflow.com/questions/28057881/javascript-either-strokerect-or-fillrect-blurry-depending-on-translation
            drawRect(parseInt(x*w+x1)+0.50,parseInt(y*h+y1)+0.50,w,h,"#505050", false);
        }
        
        // Draw grids if requested
        if (data.hud.grids == true) {
            drawLine((x*w+x1)+0.50,(y*h+y1)+0.50, (x*w+x1)+0.50, (y*h+y1)+h+0.50, "black");
        }

      }
      if (data.hud.grids == true) { 
          // Draw last vertical line
          drawLine((x*w+x1)+0.50,(y*h+y1)+0.50, (x*w+x1)+0.50, (y*h+y1)+h+0.50, "black");
          // Draw horizantal line
          drawLine(x1+0.50,(y*h+y1)+0.50, (mapSize[1]*w+x1)+0.50, (y*h+y1)+0.50, "black");
      }
    }
    // Draw last horizantal line
    if (data.hud.grids == true) {
        drawLine(x1+0.50,(y*h+y1)+0.50, (mapSize[1]*w+x1)+0.50, (y*h+y1)+0.50, "black");
    }

    // Draw player
    drawCircle(data.player.x*w+x1, data.player.y*h+y1, 5, "red");
    // Draw player rays
    for (let i = data.player.angle - data.player.halfFov; i < data.player.angle + data.player.halfFov; i++) {
      
        // Code reuse from rayCasting() function
        let ray = {
            x: data.player.x,
            y: data.player.y
        }

        let rayCos = Math.cos(degreeToRadians(i)) / data.rayCasting.precision;
        let raySin = Math.sin(degreeToRadians(i)) / data.rayCasting.precision;
        
        let wall = 0;
        while(wall == 0) {
            ray.x += rayCos;
            ray.y += raySin;
            wall = data.map[Math.floor(ray.y)][Math.floor(ray.x)];
        }
        // Draw single ray
        drawLine(data.player.x*w+x1, data.player.y*h+y1, ray.x*w+x1, ray.y*h+y1, "#f2c772"); 
    } 
}

/**
 * Clear screen
 */
function clearScreen() {
    screenContext.clearRect(0, 0, data.screen.width, data.screen.height);
}

/**
 * Movement Event
 */
document.addEventListener('keydown', (event) => {
    let keyCode = event.code;

    if(keyCode === data.key.up) {
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x + playerCos;
        let newY = data.player.y + playerSin;

        // Collision test
        if(data.map[Math.floor(newY)][Math.floor(newX)] == 0) {
            data.player.x = newX;
            data.player.y = newY;
        }
    } else if(keyCode === data.key.down) {
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x - playerCos;
        let newY = data.player.y - playerSin;

        // Collision test
        if(data.map[Math.floor(newY)][Math.floor(newX)] == 0) {
            data.player.x = newX;
            data.player.y = newY;
        }
    } else if(keyCode === data.key.left) {
        data.player.angle -= data.player.speed.rotation;
    } else if(keyCode === data.key.right) {
        data.player.angle += data.player.speed.rotation;
    } 
});
