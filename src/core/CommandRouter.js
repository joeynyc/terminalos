// CommandRouter.js - Command registry and execution system with metadata
/**
 * Command class - Represents a single terminal command with metadata
 */
export class Command {
    constructor({ name, aliases = [], handler, description, usage = '', category = 'general', hidden = false }) {
        this.name = name;
        this.aliases = Array.isArray(aliases) ? aliases : [];
        this.handler = handler;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.hidden = hidden;

        // Validate required fields
        if (!name || typeof name !== 'string') {
            throw new Error('Command name is required and must be a string');
        }
        if (!handler || typeof handler !== 'function') {
            throw new Error('Command handler is required and must be a function');
        }
        if (!description || typeof description !== 'string') {
            throw new Error('Command description is required and must be a string');
        }
    }

    /**
     * Execute the command with given arguments
     */
    execute(args) {
        return this.handler(args);
    }

    /**
     * Get formatted help text for this command
     */
    getHelpText() {
        const aliases = this.aliases.length > 0 ? ` (aliases: ${this.aliases.join(', ')})` : '';
        const usage = this.usage ? `\n    Usage: ${this.usage}` : '';
        return `<span class="success">${this.name}</span>${aliases} - ${this.description}${usage}`;
    }
}

/**
 * CommandRouter class - Central command registry and execution system
 */
export class CommandRouter {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.categories = new Map();
    }

    /**
     * Register a command or array of commands
     */
    register(commandOrCommands) {
        const commands = Array.isArray(commandOrCommands) ? commandOrCommands : [commandOrCommands];

        for (const command of commands) {
            if (!(command instanceof Command)) {
                throw new Error('Can only register Command instances');
            }

            // Register main command name
            this.commands.set(command.name, command);

            // Register aliases
            for (const alias of command.aliases) {
                this.aliases.set(alias, command.name);
            }

            // Add to category
            if (!this.categories.has(command.category)) {
                this.categories.set(command.category, []);
            }
            this.categories.get(command.category).push(command);
        }

        return this;
    }

    /**
     * Execute a command by name or alias
     * @param {string} input - Command string with arguments
     * @returns {*} - Command execution result
     */
    execute(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }

        const [commandName, ...args] = input.trim().split(' ');

        // Resolve alias to main command name
        const resolvedName = this.aliases.get(commandName) || commandName;

        // Get command
        const command = this.commands.get(resolvedName);

        if (!command) {
            return { error: true, message: `Command not found: ${commandName}` };
        }

        // Execute command
        try {
            return command.execute(args);
        } catch (error) {
            return { error: true, message: `Command execution failed: ${error.message}` };
        }
    }

    /**
     * Check if a command exists
     */
    has(commandName) {
        return this.commands.has(commandName) || this.aliases.has(commandName);
    }

    /**
     * Get a command by name or alias
     */
    get(commandName) {
        const resolvedName = this.aliases.get(commandName) || commandName;
        return this.commands.get(resolvedName);
    }

    /**
     * Get all commands in a category
     */
    getCategory(categoryName) {
        return this.categories.get(categoryName) || [];
    }

    /**
     * Get all category names
     */
    getCategoryNames() {
        return Array.from(this.categories.keys());
    }

    /**
     * Get all command names (excluding aliases)
     */
    getAllCommandNames() {
        return Array.from(this.commands.keys());
    }

    /**
     * Get all commands (excluding hidden ones by default)
     */
    getAllCommands(includeHidden = false) {
        return Array.from(this.commands.values())
            .filter(cmd => includeHidden || !cmd.hidden);
    }

    /**
     * Auto-generate help text from command metadata
     * @param {string} filter - Optional filter by category or command name
     * @returns {string} - Formatted help text
     */
    getHelp(filter = null) {
        let helpText = 'Available Commands:\n──────────────────\n';

        if (filter) {
            // Filter by specific category or command
            if (this.categories.has(filter)) {
                const commands = this.getCategory(filter);
                helpText += this._formatCategoryHelp(filter, commands);
            } else {
                const command = this.get(filter);
                if (command) {
                    helpText += command.getHelpText() + '\n';
                } else {
                    helpText += `No help available for: ${filter}\n`;
                }
            }
        } else {
            // Show all categories
            const categoryOrder = [
                'about',
                'tools',
                'system',
                'theme',
                'games',
                'mobile',
                'special'
            ];

            for (const category of categoryOrder) {
                if (this.categories.has(category)) {
                    const commands = this.getCategory(category)
                        .filter(cmd => !cmd.hidden)
                        .sort((a, b) => a.name.localeCompare(b.name));

                    if (commands.length > 0) {
                        helpText += '\n' + this._formatCategoryHelp(category, commands);
                    }
                }
            }
        }

        return helpText;
    }

    /**
     * Format help text for a category
     * @private
     */
    _formatCategoryHelp(categoryName, commands) {
        const categoryTitles = {
            about: '<span class="info">About & Profile:</span>',
            tools: '<span class="info">Available Tools:</span>',
            system: '<span class="info">System Commands:</span>',
            theme: '<span class="warning">Theme Commands:</span>',
            games: '<span class="warning">Games:</span>',
            mobile: '<span class="warning">📱 Mobile Commands:</span>',
            special: '<span class="warning">Special Commands:</span>'
        };

        let text = (categoryTitles[categoryName] || `<span class="info">${categoryName}:</span>`) + '\n';

        for (const command of commands) {
            text += command.getHelpText() + '\n';
        }

        return text;
    }

    /**
     * Get autocompletion suggestions for partial input
     */
    getCompletions(partial) {
        if (!partial) {
            return [];
        }

        const lower = partial.toLowerCase();
        const matches = [];

        // Check main commands
        for (const name of this.commands.keys()) {
            if (name.toLowerCase().startsWith(lower)) {
                matches.push(name);
            }
        }

        // Check aliases
        for (const alias of this.aliases.keys()) {
            if (alias.toLowerCase().startsWith(lower)) {
                matches.push(alias);
            }
        }

        return matches.sort();
    }
}
