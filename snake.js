//Setup convas and start button
var canvas = $("#canvas").get(0);
var $start = $("#start");
var ctx = canvas.getContext("2d");
//Getting width and height from the canvas
var width = canvas.width;
var height = canvas.height;
//Processing blocks of width and height
var blockSize = 20;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;
//Score
var score = 0;
//Button Activity
var startActive = true;

//Creating borders
var drawBorder = function() {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

//Score in the upper left corner
var drawScore = function() {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, blockSize, blockSize);
};

//Clears the interval and log the "Game Over"
var gameOver = function() {
    clearInterval(intervalId);
    ctx.font = "60px Comic Sans MS";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", width / 2, height / 2);
    startActive = true;
};

//Creating circle
var circle = function(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

var Block = function(col, row) {
    this.col = col;
    this.row = row;
};

//Draw a square in the block
Block.prototype.drawSquare = function(color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

//Draw a circle in the block
Block.prototype.drawCircle = function(color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

//Checking whether this block is in one place with another block
Block.prototype.equal = function(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

var Snake = function() {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];
    this.direction = "right";
    this.nextDirection = "right";
};

//Draw a square for each snake body segment 
Snake.prototype.draw = function() {
    for (var i = 0; i < this.segments.length; i++) {
        var color = Math.random() * 55 + 200
        this.segments[i].drawSquare(`rgb(
            ${Math.floor(color)},
            ${Math.floor(color / 4)},
            ${Math.floor(color)})`);
    }
};

/*Create a new head and add it to the beginning of the snake
 to move the snake in the current direction*/
Snake.prototype.move = function() {
    var head = this.segments[0];
    var newHead;
    this.direction = this.nextDirection;
    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
    }
    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }
    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
        score++;
        if (this.segments.length == (widthInBlocks - 2) * (heightInBlocks - 2)) {
            gameOver();
            return;
        }
        apple.move();
    } else {
        this.segments.pop();
    }
};

//Checking if the snake collided with a wall or its body
Snake.prototype.checkCollision = function(head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);
    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
    var selfCollision = false;
    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }
    return wallCollision || selfCollision;

};

//Set the direction of movement based on the keyboard
Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }
    this.nextDirection = newDirection;
};

var Apple = function() {
    this.position = new Block(10, 10)
};

//Draw a circle on the apple position
Apple.prototype.draw = function() {
    this.position.drawCircle("Crimson");
};

//Moving the apple to a new random position 
//and checking that it is not generated in the body of the snake
Apple.prototype.move = function() {
    var randomCol;
    var randomRow;
    var appleBlock;
    var appleInSnake = true;
    while (appleInSnake) {
        randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        appleBlock = new Block(randomCol, randomRow);
        appleInSnake = false;
        for (var i = 0; i < snake.segments.length; i++) {
            if (appleBlock.equal(snake.segments[i])) {
                appleInSnake = true;
                break;
            }
        }
    }
    this.position = appleBlock;
};

var snake = NaN;
var apple = NaN;
var intervalId = NaN;

//Connecting the start button and resetting all values
$start.click(function() {
    if (startActive) {
        apple = new Apple();
        snake = new Snake();
        score = 0;
        //Passing an animation function to setInterval
        intervalId = setInterval(function() {
            ctx.clearRect(0, 0, width, height);
            drawScore();
            snake.move();
            snake.draw();
            apple.draw();
            drawBorder();
        }, 100);
        startActive = false;
    }
})

//Convert the key-code in the directions
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

//Manage directions set by pressing keys
$("body").keydown(function(event) {
    var newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});