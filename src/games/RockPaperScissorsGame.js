// RockPaperScissorsGame.js - Rock Paper Scissors game vs AI
import { BaseGame } from './BaseGame.js';

export class RockPaperScissorsGame extends BaseGame {
    constructor(terminal) {
        super(terminal);
        this.gameName = 'rps';
        this.validChoices = ['rock', 'paper', 'scissors'];
        this.emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    }

    start() {
        this.gameData = {
            playerScore: 0,
            aiScore: 0,
            rounds: 0,
            maxRounds: 5
        };

        super.start();

        const startText = `
<span class="success">✂️ ROCK PAPER SCISSORS ✂️</span>

Best of ${this.gameData.maxRounds} rounds against the AI!

<span class="info">Commands: rock, paper, scissors, or quit</span>
<span class="warning">Score: You 0 - 0 AI</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleInput(input) {
        if (super.handleInput(input)) return;

        const choice = input.toLowerCase().trim();

        if (!this.validChoices.includes(choice)) {
            this.error('Choose: rock, paper, or scissors!');
            return;
        }

        const aiChoice = this.validChoices[Math.floor(Math.random() * 3)];
        const result = this.getResult(choice, aiChoice);

        this.gameData.rounds++;

        let resultText = `
<span class="info">Round ${this.gameData.rounds}</span>
You: ${this.emojis[choice]} ${choice}
AI:  ${this.emojis[aiChoice]} ${aiChoice}
        `;

        if (result === 'win') {
            this.gameData.playerScore++;
            resultText += '<span class="success">🎉 You win this round!</span>';
        } else if (result === 'lose') {
            this.gameData.aiScore++;
            resultText += '<span class="error">🤖 AI wins this round!</span>';
        } else {
            resultText += '<span class="warning">🤝 It\'s a tie!</span>';
        }

        resultText += `\n<span class="info">Score: You ${this.gameData.playerScore} - ${this.gameData.aiScore} AI</span>`;

        this.addToOutput(resultText, 'command-output');

        if (this.gameData.rounds >= this.gameData.maxRounds) {
            let finalResult;
            if (this.gameData.playerScore > this.gameData.aiScore) {
                finalResult = '<span class="success">🏆 YOU WIN THE GAME! Congratulations!</span>';
            } else if (this.gameData.aiScore > this.gameData.playerScore) {
                finalResult = '<span class="error">🤖 AI WINS THE GAME! Better luck next time!</span>';
            } else {
                finalResult = '<span class="warning">🤝 OVERALL TIE! Great game!</span>';
            }

            this.addToOutput(finalResult, 'command-output');
            this.info(`Final Score: You ${this.gameData.playerScore} - ${this.gameData.aiScore} AI`);
            this.end();
        } else {
            this.info(`${this.gameData.maxRounds - this.gameData.rounds} rounds remaining`);
        }
    }

    getResult(player, ai) {
        if (player === ai) return 'tie';
        if (
            (player === 'rock' && ai === 'scissors') ||
            (player === 'paper' && ai === 'rock') ||
            (player === 'scissors' && ai === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    }
}
