// BaseGame.js - Base class for all terminal games
export class BaseGame {
    constructor(terminal) {
        this.terminal = terminal;
        this.gameData = {};
        this.gameName = '';
    }

    // Start the game - to be overridden by subclasses
    start() {
        this.terminal.gameActive = true;
        this.terminal.currentGame = this.gameName;
        this.terminal.gameData = this.gameData;
    }

    // Handle input - checks for quit/exit first, then delegates to game-specific logic
    handleInput(input) {
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            this.end();
            return true;
        }
        return false;
    }

    // End the game
    end() {
        this.terminal.gameActive = false;
        this.terminal.currentGame = null;
        this.terminal.gameData = {};
        this.addToOutput('<span class="warning">Game ended. Back to terminal.</span>', 'command-output');
        this.addToOutput('Type \'games\' to see available games or \'help\' for all commands.', 'info');
    }

    // Helper to add output to terminal
    addToOutput(content, className = 'command-output') {
        this.terminal.addToOutput(content, className);
    }

    // Helper for success messages
    success(message) {
        this.addToOutput(`<span class="success">${message}</span>`, 'command-output');
    }

    // Helper for error messages
    error(message) {
        this.addToOutput(`<span class="error">${message}</span>`, 'command-output');
    }

    // Helper for info messages
    info(message) {
        this.addToOutput(`<span class="info">${message}</span>`, 'command-output');
    }

    // Helper for warning messages
    warning(message) {
        this.addToOutput(`<span class="warning">${message}</span>`, 'command-output');
    }
}
