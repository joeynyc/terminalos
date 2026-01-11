// WordleGame.js - Wordle-style word guessing game
import { BaseGame } from './BaseGame.js';

export class WordleGame extends BaseGame {
    constructor(terminal) {
        super(terminal);
        this.gameName = 'wordle';
        this.words = ['REACT', 'SNAKE', 'GAMES', 'CODER', 'LINUX', 'PIXEL', 'BYTES', 'DEBUG', 'LOGIC', 'ARRAY'];
    }

    start() {
        this.gameData = {
            target: this.words[Math.floor(Math.random() * this.words.length)],
            attempts: 0,
            maxAttempts: 6,
            guesses: [],
            letters: new Set()
        };

        super.start();

        const startText = `
<span class="success">📝 WORD GUESSING GAME 📝</span>

Guess the 5-letter word! You have ${this.gameData.maxAttempts} attempts.

<span class="info">🟩 = Correct letter in right position</span>
<span class="warning">🟨 = Correct letter in wrong position</span>
<span class="error">⬜ = Letter not in word</span>

<span class="info">Type a 5-letter word or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleInput(input) {
        if (super.handleInput(input)) return;

        const guess = input.toUpperCase().trim();

        if (guess.length !== 5 || !/^[A-Z]+$/.test(guess)) {
            this.error('Please enter a valid 5-letter word!');
            return;
        }

        this.gameData.attempts++;
        this.gameData.guesses.push(guess);

        // Check each letter
        let result = '';
        let feedback = '';
        for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            this.gameData.letters.add(letter);

            if (letter === this.gameData.target[i]) {
                result += '🟩';
                feedback += `<span class="success">${letter}</span>`;
            } else if (this.gameData.target.includes(letter)) {
                result += '🟨';
                feedback += `<span class="warning">${letter}</span>`;
            } else {
                result += '⬜';
                feedback += `<span class="error">${letter}</span>`;
            }
        }

        this.addToOutput(`${feedback} ${result}`, 'command-output');

        if (guess === this.gameData.target) {
            this.success('🎉 EXCELLENT! You found the word!');
            this.info(`The word was "${this.gameData.target}"`);
            this.info(`Solved in ${this.gameData.attempts} attempts`);
            this.end();
            return;
        }

        const remaining = this.gameData.maxAttempts - this.gameData.attempts;
        if (remaining === 0) {
            this.error('💥 GAME OVER! No attempts left!');
            this.warning(`The word was "${this.gameData.target}"`);
            this.end();
        } else {
            this.info(`${remaining} attempts remaining`);
        }
    }
}
