// Projection
const canvas = document.getElementById("projection-plane");
const projectionPlane = canvas.getContext("2d");

// Data
let data = {
    projection: {
        width: 80,
        height: 60,
        midWidth: 80 / 2,
        midHeight: 60 / 2,
        incrementAngle: null,
        scale: 10
    },
    player: {
        fov: 60,
        midFov: 30,
        height: 32,
        x: 3,
        y: 3,
        angle: 90,
        distance: null
    },
    texture: {
        width: 8,
        height: 8
    },
    cubeSize: 64,
    map: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1],
    ],
    keys: {
        up: "KeyW",
        down: "KeyS",
        left: "KeyA",
        right: "KeyD"
    }
}

// Calculated data
data.player.distance = Math.floor(data.projection.midWidth / Math.tan(degreeToRadian(data.player.midFov)));
data.projection.incrementAngle = data.player.fov / data.projection.width;
canvas.width = data.projection.width * data.projection.scale;
canvas.height = data.projection.height * data.projection.scale;
projectionPlane.scale(data.projection.scale, data.projection.scale);

// Print data
console.log(data);

// Start
main();

/**
 * Main loop
 */
function main() {
    let interval = setInterval(function() {
        //data.player.angle = 300;
        //data.player.angle += 5;
        clearProjection();
        rayCasting();
        
        //clearInterval(interval);
    }, 30);
}

let texture = [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ];

/**
 * Raycasting logic
 */
function rayCasting() {
    let rayAngle = data.player.angle - data.player.midFov;
    for(let rayCount = 0; rayCount < data.projection.width + 1; rayCount++) {
        
        // Ray data
        let ray = {
            x: data.player.x,
            y: data.player.y
        }

        // Ray path incrementers
        let rayCos = Math.cos(degreeToRadian(rayAngle)) / data.cubeSize;
        let raySin = Math.sin(degreeToRadian(rayAngle)) / data.cubeSize;
        
        // Wall finder
        let wall = false;
        while(!wall) {
            ray.x += rayCos;
            ray.y += raySin;
            wall = data.map[Math.floor(ray.x)][Math.floor(ray.y)] > 0;
        }

        // Texture position
        let texturePositionX = Math.floor((data.texture.width * (ray.x + ray.y)) % data.texture.width);
        
        // Pythagoras theorem
        let distance = Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));

        // Fish eye fix
        distance = distance * Math.cos(degreeToRadian(rayAngle - data.player.angle));

        // Wall height
        let wallHeight = data.projection.height / distance;

        // Draw
        drawLine(rayCount, 0, rayCount, data.projection.midHeight - wallHeight, "cyan");
        drawTexture(rayCount, wallHeight, texturePositionX);
        drawLine(rayCount, data.projection.midHeight + wallHeight, rayCount, data.projection.height, "green");

        // Increment
        rayAngle += data.projection.incrementAngle;
    }
}

/**
 * Clear projection plane
 */
function clearProjection() {
    projectionPlane.clearRect(0, 0, data.projection.width, data.projection.height);
}

/**
 * Draw line into projection
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 * @param {String} cssColor 
 */
function drawLine(x1, y1, x2, y2, cssColor) {
    projectionPlane.strokeStyle = cssColor;
    projectionPlane.beginPath();
    projectionPlane.moveTo(x1, y1);
    projectionPlane.lineTo(x2, y2);
    projectionPlane.stroke();
}

function drawTexture(x, wallHeight, texturePositionX) {
    let inc = data.texture.height / (wallHeight * 2);
    let texturePositionY = 0;
    
    for(let i = data.projection.midHeight - wallHeight; i < data.projection.midHeight + wallHeight; i++) {
        texturePositionY += inc;
        projectionPlane.fillStyle = texture[texturePositionX][Math.floor(texturePositionY)] == 1 ? "blue" : "grey";
        projectionPlane.fillRect(x, i, data.projection.scale, data.projection.scale);
    }
}

/**
 * Cast degree to radian
 * @param {degree} degree 
 */
function degreeToRadian(degree) {
    let pi = Math.PI;
    return degree * pi / 180;
}

document.addEventListener('keydown', (event) => {
    let sin;
    let cos;
    let newX;
    let newY;

    switch(event.code) {
        case data.keys.up: 
            sin = Math.cos(degreeToRadian(data.player.angle)) / 2;
            cos = Math.sin(degreeToRadian(data.player.angle)) / 2;
            newX = data.player.x + sin;
            newY = data.player.y + cos;
            if(data.map[Math.floor(newX)][Math.floor(newY)] == 0) {
                data.player.x = newX;
                data.player.y = newY;
            }
            break;
        case data.keys.down: 
            sin = Math.cos(degreeToRadian(data.player.angle)) / 2;
            cos = Math.sin(degreeToRadian(data.player.angle)) / 2;
            newX = data.player.x - sin;
            newY = data.player.y - cos;
            if(data.map[Math.floor(newX)][Math.floor(newY)] == 0) {
                data.player.x = newX;
                data.player.y = newY;
            }
            break;
        case data.keys.left: data.player.angle -= 5; break;
        case data.keys.right: data.player.angle += 5; break;
    }
});