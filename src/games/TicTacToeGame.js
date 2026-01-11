// TicTacToeGame.js - Tic-Tac-Toe game with AI opponent
import { BaseGame } from './BaseGame.js';

export class TicTacToeGame extends BaseGame {
    constructor(terminal) {
        super(terminal);
        this.gameName = 'tictactoe';
    }

    start() {
        this.gameData = {
            board: Array(9).fill(' '),
            playerSymbol: 'X',
            aiSymbol: 'O',
            gameOver: false
        };

        super.start();

        const startText = `
<span class="success">⭕ TIC-TAC-TOE vs AI ❌</span>

You are X, AI is O. Choose your position (1-9):

 1 | 2 | 3
-----------
 4 | 5 | 6
-----------
 7 | 8 | 9

<span class="info">Type a number (1-9) or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
        this.displayBoard();
    }

    handleInput(input) {
        if (super.handleInput(input)) return;

        if (this.gameData.gameOver) return;

        const position = parseInt(input) - 1;

        if (isNaN(position) || position < 0 || position > 8) {
            this.error('Please enter a number between 1 and 9!');
            return;
        }

        if (this.gameData.board[position] !== ' ') {
            this.error('That position is already taken!');
            return;
        }

        // Player move
        this.gameData.board[position] = this.gameData.playerSymbol;
        this.displayBoard();

        if (this.checkWin(this.gameData.playerSymbol)) {
            this.success('🎉 YOU WIN! Congratulations!');
            this.gameData.gameOver = true;
            this.end();
            return;
        }

        if (this.gameData.board.every(cell => cell !== ' ')) {
            this.warning('🤝 It\'s a tie! Good game!');
            this.gameData.gameOver = true;
            this.end();
            return;
        }

        // AI move
        const aiMove = this.getAIMove();
        this.gameData.board[aiMove] = this.gameData.aiSymbol;
        this.info(`AI chooses position ${aiMove + 1}`);
        this.displayBoard();

        if (this.checkWin(this.gameData.aiSymbol)) {
            this.error('🤖 AI WINS! Better luck next time!');
            this.gameData.gameOver = true;
            this.end();
            return;
        }

        if (this.gameData.board.every(cell => cell !== ' ')) {
            this.warning('🤝 It\'s a tie! Good game!');
            this.gameData.gameOver = true;
            this.end();
        }
    }

    displayBoard() {
        const board = this.gameData.board;
        const display = `
 ${board[0]} | ${board[1]} | ${board[2]}
-----------
 ${board[3]} | ${board[4]} | ${board[5]}
-----------
 ${board[6]} | ${board[7]} | ${board[8]}
        `;
        this.addToOutput(`<pre>${display}</pre>`, 'command-output');
    }

    checkWin(symbol) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winPatterns.some(pattern =>
            pattern.every(index => this.gameData.board[index] === symbol)
        );
    }

    getAIMove() {
        // Simple AI: Try to win, then block player, then take center/corners
        const board = this.gameData.board;

        // Check if AI can win
        for (let i = 0; i < 9; i++) {
            if (board[i] === ' ') {
                board[i] = this.gameData.aiSymbol;
                if (this.checkWin(this.gameData.aiSymbol)) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        // Check if need to block player
        for (let i = 0; i < 9; i++) {
            if (board[i] === ' ') {
                board[i] = this.gameData.playerSymbol;
                if (this.checkWin(this.gameData.playerSymbol)) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        // Take center if available
        if (board[4] === ' ') return 4;

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === ' ');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available spot
        const available = board.map((cell, index) => cell === ' ' ? index : null).filter(x => x !== null);
        return available[Math.floor(Math.random() * available.length)];
    }
}
