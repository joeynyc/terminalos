// SnakeGame.js - Snake game implementation
import { BaseGame } from './BaseGame.js';

export class SnakeGame extends BaseGame {
    constructor(terminal) {
        super(terminal);
        this.gameName = 'snake';
    }

    start() {
        // Adjust board size for mobile
        const boardWidth = this.terminal.isMobile ? 20 : 30;
        const boardHeight = this.terminal.isMobile ? 12 : 15;

        this.gameData = {
            board: Array(boardHeight).fill().map(() => Array(boardWidth).fill(' ')),
            snake: [{x: Math.floor(boardWidth/2), y: Math.floor(boardHeight/2)},
                    {x: Math.floor(boardWidth/2)-1, y: Math.floor(boardHeight/2)},
                    {x: Math.floor(boardWidth/2)-2, y: Math.floor(boardHeight/2)}],
            direction: {x: 1, y: 0},
            food: {x: Math.floor(boardWidth*0.7), y: Math.floor(boardHeight/2)},
            score: 0,
            gameOver: false,
            boardWidth,
            boardHeight
        };

        super.start();

        this.success('🐍 SNAKE GAME STARTED 🐍');
        if (this.terminal.isMobile) {
            this.info('📱 Mobile Controls: w(up) a(left) s(down) d(right) | "quit" to exit');
            this.warning('💡 Tip: Use your device keyboard for w/a/s/d controls');
        } else {
            this.info('Controls: w(up) a(left) s(down) d(right) | Type "quit" to exit');
        }
        this.updateDisplay();
    }

    handleInput(input) {
        if (super.handleInput(input)) return;

        if (this.gameData.gameOver) {
            if (input.toLowerCase() === 'r' || input.toLowerCase() === 'restart') {
                this.start();
            }
            return;
        }

        const direction = input.toLowerCase();
        switch (direction) {
            case 'w':
                if (this.gameData.direction.y !== 1) this.gameData.direction = {x: 0, y: -1};
                break;
            case 's':
                if (this.gameData.direction.y !== -1) this.gameData.direction = {x: 0, y: 1};
                break;
            case 'a':
                if (this.gameData.direction.x !== 1) this.gameData.direction = {x: -1, y: 0};
                break;
            case 'd':
                if (this.gameData.direction.x !== -1) this.gameData.direction = {x: 1, y: 0};
                break;
            default:
                this.error('Use w/a/s/d to move the snake!');
                return;
        }

        this.move();
    }

    move() {
        const head = {...this.gameData.snake[0]};
        head.x += this.gameData.direction.x;
        head.y += this.gameData.direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= this.gameData.boardWidth || head.y < 0 || head.y >= this.gameData.boardHeight) {
            this.gameData.gameOver = true;
            this.error('💥 GAME OVER! Hit the wall!');
            this.info(`Final Score: ${this.gameData.score}`);
            this.warning('Type "r" to restart or "quit" to exit');
            return;
        }

        // Check self collision
        for (let segment of this.gameData.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameData.gameOver = true;
                this.error('💥 GAME OVER! Snake bit itself!');
                this.info(`Final Score: ${this.gameData.score}`);
                this.warning('Type "r" to restart or "quit" to exit');
                return;
            }
        }

        this.gameData.snake.unshift(head);

        // Check food collision
        if (head.x === this.gameData.food.x && head.y === this.gameData.food.y) {
            this.gameData.score += 10;
            this.generateFood();
        } else {
            this.gameData.snake.pop();
        }

        this.updateDisplay();
    }

    generateFood() {
        do {
            this.gameData.food = {
                x: Math.floor(Math.random() * this.gameData.boardWidth),
                y: Math.floor(Math.random() * this.gameData.boardHeight)
            };
        } while (this.gameData.snake.some(segment =>
            segment.x === this.gameData.food.x && segment.y === this.gameData.food.y
        ));
    }

    updateDisplay() {
        const board = Array(this.gameData.boardHeight).fill().map(() => Array(this.gameData.boardWidth).fill('·'));

        // Place food
        board[this.gameData.food.y][this.gameData.food.x] = '🍎';

        // Place snake
        this.gameData.snake.forEach((segment, index) => {
            if (index === 0) {
                board[segment.y][segment.x] = '█'; // Head
            } else {
                board[segment.y][segment.x] = '▓'; // Body
            }
        });

        const display = board.map(row => row.join('')).join('\n');
        this.addToOutput(`<span class="success">Score: ${this.gameData.score}</span>\n<pre>${display}</pre>`, 'command-output');
    }
}
