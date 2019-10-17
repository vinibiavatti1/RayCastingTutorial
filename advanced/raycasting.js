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
        halfHeight: null,
        imageData: null,
        buffer: null
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
        radius: 20,
        speed: {
            movement: 0.02,
            rotation: 0.7
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
    ],
    backgrounds: [
        {
            width: 360,
            height: 60,
            id: "background",
            data: null
        }
    ],
    sprites: [
        {
            id: "tree",
            x: 7,
            y: 1,
            width: 8,
            height: 16,
            active: false,
            data: null
        },
        {
            id: "tree",
            x: 7,
            y: 2,
            width: 8,
            height: 16,
            active: false,
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
screenContext.imageSmoothingEnabled = false;

// Buffer
data.projection.imageData = screenContext.createImageData(data.projection.width, data.projection.height);
data.projection.buffer = data.projection.imageData.data;

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
 * Color object
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @param {number} a 
 */
function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

/**
 * Draw pixel on buffer
 * @param {number} x 
 * @param {number} y 
 * @param {RGBA Object} color 
 */
function drawPixel(x, y, color) {
    if(color.r == 255 && color.g == 0 && color.b == 255) return;
    let offset = 4 * (Math.floor(x) + Math.floor(y) * data.projection.width);
    data.projection.buffer[offset  ] = color.r;
    data.projection.buffer[offset+1] = color.g;
    data.projection.buffer[offset+2] = color.b;
    data.projection.buffer[offset+3] = color.a;
}

/**
 * Draw line in the buffer
 * @param {Number} x 
 * @param {Number} y1 
 * @param {Number} y2 
 * @param {Color} color 
 */
function drawLine(x1, y1, y2, color) {
    for(let y = y1; y < y2; y++) {
        drawPixel(x1, y, color);
    }
}

// Start
window.onload = function() {
    loadTextures();
    loadBackgrounds();
    loadSprites();
    main();
}

/**
 * Main loop
 */
function main() {
    mainLoop = setInterval(function() {
        inativeSprites();
        clearScreen();
        movePlayer();
        rayCasting();
        drawSprites();
        renderBuffer();
    }, data.render.dalay);
}

/**
 * Render buffer
 */
function renderBuffer() {
    let canvas = document.createElement('canvas');
    canvas.width = data.projection.width;
    canvas.height = data.projection.height;
    canvas.getContext('2d').putImageData(data.projection.imageData, 0, 0);
    screenContext.drawImage(canvas, 0, 0);
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
            activeSprites(ray.x, ray.y);
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
        drawBackground(rayCount, 0, data.projection.halfHeight - wallHeight, data.backgrounds[0]);
        drawTexture(rayCount, wallHeight, texturePositionX, texture);
        drawLine(rayCount, data.projection.halfHeight + wallHeight, data.projection.height, new Color(9, 47, 20, 255));

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
        if(data.player.angle < 0) data.player.angle += 360;
        data.player.angle %= 360;
    }
    if(data.key.right.active) {
        data.player.angle += data.player.speed.rotation;
        if(data.player.angle < 0) data.player.angle += 360;
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
    let color = null
    for(let i = 0; i < texture.height; i++) {
        if(texture.id) {            
            color = texture.data[texturePositionX + i * texture.width];
        } else {
            color = texture.colors[texture.bitmap[i][texturePositionX]];
        }
        drawLine(x, y, Math.floor(y + (yIncrementer + 0.5)), color);
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
 * Load backgrounds
 */
function loadBackgrounds() {
    for(let i = 0; i < data.backgrounds.length; i++) {
        if(data.backgrounds[i].id) {
            data.backgrounds[i].data = getTextureData(data.backgrounds[i]);
        }
    }
}

/**
 * Load sprites
 */
function loadSprites() {
    for(let i = 0; i < data.sprites.length; i++) {
        if(data.sprites[i].id) {
            data.sprites[i].data = getTextureData(data.sprites[i]);
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
 * Parse image data to a Color array
 * @param {array} imageData 
 */
function parseImageData(imageData) {
    let colorArray = [];
    for (let i = 0; i < imageData.length; i += 4) {
        colorArray.push(new Color(imageData[i], imageData[i + 1], imageData[i + 2], 255));
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
    clearInterval(mainLoop);
    mainLoop = null;
    renderFocusLost();
});

/**
 * Render focus lost
 */
function renderFocusLost() {
    screenContext.fillStyle = 'rgba(0,0,0,0.5)';
    screenContext.fillRect(0, 0, data.projection.width, data.projection.height);
    screenContext.fillStyle = 'white';
    screenContext.font = '10px Lucida Console';
    screenContext.fillText('CLICK TO FOCUS',data.projection.halfWidth/2,data.projection.halfHeight);
}

/**
 * Draw the background
 * @param {number} x 
 * @param {number} y1 
 * @param {number} y2 
 * @param {Object} background 
 */
function drawBackground(x, y1, y2, background) {
    let offset = (data.player.angle + x);
    for(let y = y1; y < y2; y++) {
        let textureX = Math.floor(offset % background.width);
        let textureY = Math.floor(y % background.height);
        let color = background.data[textureX + textureY * background.width];
        drawPixel(x, y, color); 
    }
}

/**
 * Convert radians to degrees
 * @param {number} radians 
 */
function radiansToDegrees(radians) {
     return 180 * radians / Math.PI;
}

/**
 * Active sprites in determinate postion
 * @param {number} x 
 * @param {number} y 
 */
function activeSprites(x, y) {
    for(let i = 0; i < data.sprites.length; i++) {
        if(data.sprites[i].x == Math.floor(x) && data.sprites[i].y == Math.floor(y)) {
            data.sprites[i].active = true;
        }
    }
}

/**
 * Inactive all of the sprites
 */
function inativeSprites() {
    for(let i = 0; i < data.sprites.length; i++) {
        data.sprites[i].active = false;
    }
}

/**
 * Draw rect in the buffer
 * @param {number} x1 
 * @param {number} x2 
 * @param {number} y1 
 * @param {number} y2 
 * @param {Color} color 
 */
function drawRect(x1, x2, y1, y2, color) {
    for(let x = x1; x < x2; x++) {
        if(x < 0) continue;
        if(x > data.projection.width) continue;
        drawLine(x, y1, y2, color);
    }
}

/**
 * Find the coordinates for all activated sprites and draw it in the projection
 */
function drawSprites() {
    for(let i = 0; i < data.sprites.length; i++) {
        if(data.sprites[i].active) {

            let sprite = data.sprites[i];

            // Get X and Y coords in relation of the player coords
            let spriteXRelative = sprite.x + 0.5 - data.player.x;
            let spriteYRelative = sprite.y + 0.5 - data.player.y;

            // Get angle of the sprite in relation of the player angle
            let spriteAngleRadians = Math.atan2(spriteYRelative, spriteXRelative);
            let spriteAngle = radiansToDegrees(spriteAngleRadians) - Math.floor(data.player.angle - data.player.halfFov);

            // Sprite angle checking
            if(spriteAngle > 360) spriteAngle -= 360;
            if(spriteAngle < 0) spriteAngle += 360;

            // Three rule to discover the x position of the script
            let spriteX = Math.floor(spriteAngle * data.projection.width / data.player.fov);

            // SpriteX right position fix
            if(spriteX > data.projection.width) {
                spriteX %= data.projection.width;
                spriteX -= data.projection.width;
            }
            
            // Get the distance of the sprite (Pythagoras theorem)
            let distance = Math.sqrt(Math.pow(data.player.x - sprite.x, 2) + Math.pow(data.player.y - sprite.y, 2));

            // Calc sprite width and height
            let spriteHeight = Math.floor(data.projection.halfHeight / distance);
            let spriteWidth = Math.floor(data.projection.halfWidth / distance);

            // Draw the sprite
            drawSprite(spriteX, spriteWidth, spriteHeight, sprite);
        }
    }
}

/**
 * Draw the sprite in the projeciton position
 * @param {number} xProjection 
 * @param {number} spriteWidth 
 * @param {number} spriteHeight 
 * @param {Object} sprite 
 */
function drawSprite(xProjection, spriteWidth, spriteHeight, sprite) {

    // Decrement halfwidth of the sprite to consider the middle of the sprite to draw 
    xProjection = xProjection - sprite.width;

    // Define the projection incrementers for draw
    let xIncrementer = (spriteWidth) / sprite.width;
    let yIncrementer = (spriteHeight * 2) / sprite.height;

    // Iterate sprite width and height
    for(let spriteX = 0; spriteX < sprite.width; spriteX += 1) {

        // Define the Y cursor to draw
        let yProjection = data.projection.halfHeight - spriteHeight;

        for(let spriteY = 0; spriteY < sprite.height; spriteY++) {
            let color = sprite.data[spriteX + spriteY * sprite.width];
            drawRect(xProjection, xProjection + xIncrementer, yProjection, yProjection + yIncrementer, color);

            // Increment Y
            yProjection += yIncrementer;
        }

        // Increment X
        xProjection += xIncrementer;
    }
    
}