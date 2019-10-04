// Data
let data = {
    screen: {
        width: 640,
        height: 480,
        halfWidth: null,
        halfHeight: null
    },
    rayCasting: {
        incrementAngle: null,
        precision: 64
    },
    player: {
        fov: 60,
        halfFov: null,
        x: 2,
        y: 2,
        angle: 90
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
    ]
}

// Calculated data
data.screen.halfWidth = data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.screen.width;
data.player.halfFov = data.player.fov / 2;

// Canvas creation
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = "1px solid black";
document.body.appendChild(screen);
const screenContext = screen.getContext("2d");
//screenContext.translate(.5, .5);
screenContext.fillStyle = "black";
screenContext.fillRect(0,0,100,100);
// Start
main();

/**
 * Main loop
 */
function main() {
    //setInterval(function() {
        //clearScreen();
        rayCasting();
    //}, 200);
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
            wall = data.map[Math.floor(ray.x)][Math.floor(ray.y)];
        }

        // Pythagoras theorem
        let distance = Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));

        // Wall height
        let wallHeight = Math.floor(data.screen.halfHeight / distance);

        // Draw
        drawLine(rayCount, 0, rayCount, data.screen.halfHeight - wallHeight, "black");
        drawLine(rayCount, data.screen.halfHeight - wallHeight, rayCount, data.screen.halfHeight + wallHeight, "red");
        drawLine(rayCount, data.screen.halfHeight + wallHeight, rayCount, data.screen.height, "black");

        // Increment
        rayAngle += data.rayCasting.incrementAngle;
    }
}

/**
 * Clear screen
 */
function clearScreen() {
    screenContext.clearRect(0, 0, data.screen.width, data.screen.height);
}

/**
 * Draw line into screen
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 * @param {String} cssColor 
 */
function drawLine(x1, y1, x2, y2, cssColor) {
    screenContext.strokeStyle = cssColor;
    screenContext.beginPath();
    screenContext.moveTo(x1, y1);
    screenContext.lineTo(x2, y2);
    screenContext.stroke();
}

/**
 * Cast degree to radian
 * @param {degree} degree 
 */
function degreeToRadians(degree) {
    let pi = Math.PI;
    return degree * pi / 180;
}