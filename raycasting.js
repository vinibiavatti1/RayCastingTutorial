// Data
let data = {
    screen: {
        width: 640,
        height: 480,
        halfWidth: null,
        halfHeight: null,
        scale: 1
    },
    projection: {
        width: null,
        height: null,
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
        height: 32,
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
    ],
    keys: {
        up: "KeyW",
        down: "KeyS",
        left: "KeyA",
        right: "KeyD"
    },
    textures: [
        {
            width: 8,
            height: 8,
            bitmap: [
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [0,1,0,0,0,1,0,0],
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [0,1,0,0,0,1,0,0]
            ],
            colors: [
                "rgb(255, 241, 232)",
                "rgb(194, 195, 199)",
            ]
        }
    ]
}

// Calculated data
data.screen.halfWidth = data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.projection.width = data.screen.width / data.screen.scale;
data.projection.height = data.screen.height / data.screen.scale;
data.projection.halfWidth = data.projection.width / 2;
data.projection.halfHeight = data.projection.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.projection.width;
data.player.halfFov = data.player.fov / 2;

// Canvas creation
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = "1px solid black";
document.body.appendChild(screen);
const screenContext = screen.getContext("2d");
screenContext.scale(data.screen.scale, data.screen.scale);
screenContext.translate(0.5, 0.5);

// Start
main();

/**
 * Main loop
 */
function main() {
    setInterval(function() {
        clearProjection();
        rayCasting();
    }, 30);
}

/**
 * Raycasting logic
 */
function rayCasting() {
    let rayAngle = data.player.angle - data.player.halfFov;
    for(let rayCount = 0; rayCount < data.projection.width + 1; rayCount++) {
        
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

        // Fish eye fix
        distance = distance * Math.cos(degreeToRadians(rayAngle - data.player.angle));

        // Wall height
        let wallHeight = Math.floor(data.projection.halfHeight / distance);

        // Get texture
        let texture = data.textures[wall - 1];

        // Calcule texture position
        let texturePositionX = Math.floor((texture.width * (ray.x + ray.y)) % texture.width);

        // Draw
        drawLine(rayCount, 0, rayCount, data.projection.halfHeight - wallHeight, "black");
        drawTexture(rayCount, wallHeight, texturePositionX, texture);
        drawLine(rayCount, data.projection.halfHeight + wallHeight, rayCount, data.projection.height, "rgb(95, 87, 79)");

        // Increment
        rayAngle += data.rayCasting.incrementAngle;
    }
}

/**
 * Clear projection plane
 */
function clearProjection() {
    screenContext.clearRect(0, 0, data.projection.width, data.projection.height);
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
    screenContext.strokeStyle = cssColor;
    screenContext.beginPath();
    screenContext.moveTo(x1, y1);
    screenContext.lineTo(x2, y2);
    screenContext.stroke();
}

/**
 * Draw texture
 * @param {*} x 
 * @param {*} wallHeight 
 * @param {*} texturePositionX 
 * @param {*} texture 
 */
function drawTexture(x, wallHeight, texturePositionX, texture) {
    let yIncrementer = (wallHeight * 2) / texture.height;
    let y = data.projection.halfHeight - wallHeight;
    for(let i = 0; i < texture.height; i++) {
        screenContext.strokeStyle = texture.colors[texture.bitmap[i][texturePositionX]];
        screenContext.beginPath();
        screenContext.moveTo(x, y);
        screenContext.lineTo(x, y + yIncrementer);
        screenContext.stroke();
        y += yIncrementer;
    }
}

/**
 * Cast degree to radian
 * @param {degree} degree 
 */
function degreeToRadians(degree) {
    let pi = Math.PI;
    return degree * pi / 180;
}

/**
 * Movement Event
 */
document.addEventListener('keydown', (event) => {
    let sin;
    let cos;
    let newX;
    let newY;

    switch(event.code) {
        case data.keys.up: 
            sin = Math.cos(degreeToRadians(data.player.angle)) / 2;
            cos = Math.sin(degreeToRadians(data.player.angle)) / 2;
            newX = data.player.x + sin;
            newY = data.player.y + cos;
            if(data.map[Math.floor(newX)][Math.floor(newY)] == 0) {
                data.player.x = newX;
                data.player.y = newY;
            }
            break;
        case data.keys.down: 
            sin = Math.cos(degreeToRadians(data.player.angle)) / 2;
            cos = Math.sin(degreeToRadians(data.player.angle)) / 2;
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