// GuessGame.js - Number guessing game implementation
import { BaseGame } from './BaseGame.js';

export class GuessGame extends BaseGame {
    constructor(terminal) {
        super(terminal);
        this.gameName = 'guess';
    }

    start() {
        this.gameData = {
            target: Math.floor(Math.random() * 100) + 1,
            attempts: 0,
            maxAttempts: 7,
            guesses: []
        };

        super.start();

        const startText = `
<span class="success">🎯 NUMBER GUESSING GAME 🎯</span>

I'm thinking of a number between 1 and 100.
You have ${this.gameData.maxAttempts} attempts to guess it!

<span class="info">Type your guess (1-100) or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleInput(input) {
        if (super.handleInput(input)) return;

        const guess = parseInt(input);

        if (isNaN(guess) || guess < 1 || guess > 100) {
            this.error('Please enter a valid number between 1 and 100!');
            return;
        }

        this.gameData.attempts++;
        this.gameData.guesses.push(guess);

        if (guess === this.gameData.target) {
            this.success('🎉 CONGRATULATIONS! You guessed it!');
            this.info(`The number was ${this.gameData.target}`);
            this.info(`It took you ${this.gameData.attempts} attempts`);
            this.info(`Your guesses: ${this.gameData.guesses.join(', ')}`);
            this.end();
            return;
        }

        const remaining = this.gameData.maxAttempts - this.gameData.attempts;
        const hint = guess < this.gameData.target ? 'higher' : 'lower';

        if (remaining === 0) {
            this.error('💥 GAME OVER! No attempts left!');
            this.warning(`The number was ${this.gameData.target}`);
            this.info(`Your guesses: ${this.gameData.guesses.join(', ')}`);
            this.end();
        } else {
            this.warning(`Try ${hint}! (${remaining} attempts left)`);
            this.info(`Your guesses so far: ${this.gameData.guesses.join(', ')}`);
        }
    }
}
