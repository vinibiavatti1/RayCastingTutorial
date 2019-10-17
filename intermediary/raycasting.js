// Data
let data = {
    screen: {
        width: 640,
        height: 480,
        halfWidth: null,
        halfHeight: null,
        scale: 4
    },
    projection: {
        width: null,
        height: null,
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
    player: {
        fov: 60,
        halfFov: null,
        x: 2,
        y: 2,
        angle: 0,
        radius: 10,
        speed: {
            movement: 0.05,
            rotation: 3.0
        }
    },
    map: [
        [2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,2],
        [2,0,0,2,2,0,2,0,0,2],
        [2,0,0,2,0,0,2,0,0,2],
        [2,0,0,2,0,0,2,0,0,2],
        [2,0,0,2,0,2,2,0,0,2],
        [2,0,0,0,0,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2],
    ],
    key: {
        up: {
            code: "KeyW",
            active: false
        },
        down: {
            code: "KeyS",
            active: false
        },
        left: {
            code: "KeyA",
            active: false
        },
        right: {
            code: "KeyD",
            active: false
        }
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
        },
        {
            width: 16,
            height: 16,
            id: "texture",
            data: null
        }
    ]
}

// Calculated data
data.screen.halfWidth = data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.player.halfFov = data.player.fov / 2;
data.projection.width = data.screen.width / data.screen.scale;
data.projection.height = data.screen.height / data.screen.scale;
data.projection.halfWidth = data.projection.width / 2;
data.projection.halfHeight = data.projection.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.projection.width;

// Canvas
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = "1px solid black";
document.body.appendChild(screen);

// Canvas context
const screenContext = screen.getContext("2d");
screenContext.scale(data.screen.scale, data.screen.scale);

// Main loop
let mainLoop = null;

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

// Start
window.onload = function() {
    loadTextures();
    main();
}

/**
 * Main loop
 */
function main() {
    mainLoop = setInterval(function() {
        clearScreen();
        movePlayer();
        rayCasting();
    }, data.render.dalay);
}

/**
 * Raycasting logic
 */
function rayCasting() {
    let rayAngle = data.player.angle - data.player.halfFov;
    for(let rayCount = 0; rayCount < data.projection.width; rayCount++) {
        
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
 * Clear screen
 */
function clearScreen() {
    screenContext.clearRect(0, 0, data.projection.width, data.projection.height);
}

/**
 * Movement
 */
function movePlayer() {
    if(data.key.up.active) {
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x + playerCos;
        let newY = data.player.y + playerSin;
        let checkX = Math.floor(newX + playerCos * data.player.radius);
        let checkY = Math.floor(newY + playerSin * data.player.radius);

        // Collision detection
        if(data.map[checkY][Math.floor(data.player.x)] == 0) {
            data.player.y = newY;
        }
        if(data.map[Math.floor(data.player.y)][checkX] == 0) {
            data.player.x = newX;
        } 

    }
    if(data.key.down.active) {
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x - playerCos;
        let newY = data.player.y - playerSin;
        let checkX = Math.floor(newX - playerCos * data.player.radius);
        let checkY = Math.floor(newY - playerSin * data.player.radius);

        // Collision detection
        if(data.map[checkY][Math.floor(data.player.x)] == 0) {
            data.player.y = newY;
        }
        if(data.map[Math.floor(data.player.y)][checkX] == 0) {
            data.player.x = newX;
        } 
    }
    if(data.key.left.active) {
        data.player.angle -= data.player.speed.rotation;
        data.player.angle %= 360;
    }
    if(data.key.right.active) {
        data.player.angle += data.player.speed.rotation;
        data.player.angle %= 360;
    } 
}

/**
 * Key down check
 */
document.addEventListener('keydown', (event) => {
    let keyCode = event.code;

    if(keyCode === data.key.up.code) {
        data.key.up.active = true;
    } 
    if(keyCode === data.key.down.code) {
        data.key.down.active = true;
    } 
    if(keyCode === data.key.left.code) {
        data.key.left.active = true;
    } 
    if(keyCode === data.key.right.code) {
        data.key.right.active = true;
    } 
});

/**
 * Key up check
 */
document.addEventListener('keyup', (event) => {
    let keyCode = event.code;

    if(keyCode === data.key.up.code) {
        data.key.up.active = false;
    } 
    if(keyCode === data.key.down.code) {
        data.key.down.active = false;
    } 
    if(keyCode === data.key.left.code) {
        data.key.left.active = false;
    } 
    if(keyCode === data.key.right.code) {
        data.key.right.active = false;
    } 
});

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
        if(texture.id) {
            screenContext.strokeStyle = texture.data[texturePositionX + i * texture.width];
        } else {
            screenContext.strokeStyle = texture.colors[texture.bitmap[i][texturePositionX]];
        }
        
        screenContext.beginPath();
        screenContext.moveTo(x, y);
        screenContext.lineTo(x, y + (yIncrementer + 0.5));
        screenContext.stroke();
        y += yIncrementer;
    }
}

/**
 * Load textures
 */
function loadTextures() {
    for(let i = 0; i < data.textures.length; i++) {
        if(data.textures[i].id) {
            data.textures[i].data = getTextureData(data.textures[i]);
        }
    }
}

/**
 * Get texture data
 * @param {Object} texture 
 */
function getTextureData(texture) {
    let image = document.getElementById(texture.id);
    let canvas = document.createElement('canvas');
    canvas.width = texture.width;
    canvas.height = texture.height;
    let canvasContext = canvas.getContext('2d');
    canvasContext.drawImage(image, 0, 0, texture.width, texture.height);
    let imageData = canvasContext.getImageData(0, 0, texture.width, texture.height).data;
    return parseImageData(imageData);
}

/**
 * Parse image data to a css rgb array
 * @param {array} imageData 
 */
function parseImageData(imageData) {
    let colorArray = [];
    for (let i = 0; i < imageData.length; i += 4) {
        colorArray.push(`rgb(${imageData[i]},${imageData[i + 1]},${imageData[i + 2]})`);
    }
    return colorArray;
}

/**
 * Window focus
 */
screen.onclick = function() {
    if(!mainLoop) {
        main();
    }
}

/**
 * Window focus lost event
 */
window.addEventListener('blur', function(event) {
    if(mainLoop != null) {
        clearInterval(mainLoop);
        mainLoop = null;
        renderFocusLost();
    }
});

/**
 * Render focus lost
 */
function renderFocusLost() {
    screenContext.fillStyle = 'rgba(0,0,0,0.5)';
    screenContext.fillRect(0, 0, data.projection.width, data.projection.height);
    screenContext.fillStyle = 'white';
    screenContext.font = '10px Lucida Console';
    screenContext.fillText('CLICK TO FOCUS', 37,data.projection.halfHeight);
}