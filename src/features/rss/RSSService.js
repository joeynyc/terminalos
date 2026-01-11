// RSSService.js - RSS UI logic and state management
import { HackerNewsAPI } from './HackerNewsAPI.js';

export class RSSService {
    constructor(terminal) {
        this.terminal = terminal;
        this.api = new HackerNewsAPI();
        this.stories = [];
        this.isActive = false;
        this.mode = 'hacker-news'; // 'hacker-news' or 'fallback'
    }

    /**
     * Start RSS mode and fetch stories
     */
    async start() {
        this.terminal.addToOutput('<span class="info">📰 Fetching latest Hacker News stories...</span>', 'command-output');

        try {
            const stories = await this.api.fetchTopStories();

            if (!stories || stories.length === 0) {
                throw new Error('No stories received from API');
            }

            this.stories = stories.filter(story => story && story.title);
            this.mode = 'hacker-news';
            this.display();
            this.isActive = true;
            this.terminal.rssActive = true;

        } catch (error) {
            // Try fallback stories
            await this._tryFallback(error);
        }
    }

    /**
     * Try loading fallback stories after API failure
     * @private
     */
    async _tryFallback(apiError) {
        const fallbackStories = await this._loadFallbackStories();

        if (fallbackStories.length) {
            this.terminal.addToOutput('<span class="warning">🔌 Live feed unavailable. Switching to Joey.OS mission briefings.</span>', 'command-output');
            this.stories = fallbackStories;
            this.mode = 'fallback';
            this.display();
            this.isActive = true;
            this.terminal.rssActive = true;
        } else {
            this.terminal.addToOutput('<span class="warning">⚠️ Unable to fetch live stories right now.</span>', 'command-output');
            this.terminal.addToOutput(`<span class="info">${apiError.message}</span>`, 'command-output');
        }
    }

    /**
     * Internal fallback loader that returns stories array
     * @private
     */
    async _loadFallbackStories() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('Fallback posts could not be loaded');
            }

            const posts = await response.json();
            if (!Array.isArray(posts) || posts.length === 0) {
                return [];
            }

            return posts.map((post, index) => {
                const safeId = post?.id || `local-${index}`;
                const date = post?.date ? new Date(post.date) : null;
                const formattedDate = date && !Number.isNaN(date.valueOf())
                    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Recently updated';

                return {
                    id: safeId,
                    title: post?.title || 'Joey.OS briefing',
                    url: `blog.html#${safeId}`,
                    infoLine: `📅 ${formattedDate}`,
                    isLocal: true
                };
            });
        } catch (fallbackError) {
            console.warn('Local fallback stories unavailable:', fallbackError.message);
            return [];
        }
    }

    /**
     * Display stories in numbered format
     */
    display() {
        if (this.stories.length === 0) {
            this.terminal.addToOutput('<span class="warning">No stories available</span>', 'command-output');
            this.end();
            return;
        }

        const heading = this.mode === 'hacker-news'
            ? '🚀 Top Hacker News Stories'
            : '📡 Joey.OS Mission Briefings';
        const offline = this.mode === 'fallback';

        this.terminal.addToOutput(`<span class="success">${heading}</span>`, 'command-output');
        this.terminal.addToOutput('═══════════════════════════════', 'command-output');

        this.stories.forEach((story, index) => {
            const storyNumber = index + 1;
            const points = story.score ?? 0;
            const comments = story.descendants ?? 0;
            const title = story.title.length > 60 ? story.title.substring(0, 57) + '...' : story.title;
            const infoLine = story.infoLine || `↑${points} points | 💬${comments} comments`;

            const storyText = `
<span class="success">${storyNumber.toString().padStart(2, ' ')}.</span> ${title}
    <span class="info">${infoLine}</span>`;

            this.terminal.addToOutput(storyText, 'command-output');
        });

        this.terminal.addToOutput('', 'command-output');
        const range = this.stories.length;
        this.terminal.addToOutput(`<span class="warning">Type a number (1-${range}) to open ${offline ? 'a briefing' : 'a story'}, or "quit" to exit RSS mode</span>`, 'command-output');
        if (offline) {
            this.terminal.addToOutput('<span class="info">Briefings open the Joey.OS blog in a new tab.</span>', 'command-output');
        }
    }

    /**
     * Handle user input in RSS mode
     */
    handleInput(input) {
        const trimmed = input.toLowerCase().trim();

        if (trimmed === 'quit' || trimmed === 'exit') {
            this.end();
            return;
        }

        const choice = parseInt(trimmed);
        if (isNaN(choice) || choice < 1 || choice > this.stories.length) {
            this.terminal.addToOutput(
                `<span class="error">❌ Invalid choice. Enter 1-${this.stories.length} or "quit"</span>`,
                'command-output'
            );
            return;
        }

        this.openStory(choice - 1);
    }

    /**
     * Open selected story in new tab
     */
    openStory(index) {
        const story = this.stories[index];
        if (!story) {
            this.terminal.addToOutput('<span class="error">❌ Story not found</span>', 'command-output');
            return;
        }

        this.terminal.addToOutput(`<span class="info">Opening: ${story.title}</span>`, 'command-output');

        if (story.url) {
            // External link
            window.open(story.url, '_blank');
            this.terminal.addToOutput('<span class="success">✅ Story opened in new tab</span>', 'command-output');
            if (story.isLocal) {
                this.terminal.addToOutput('<span class="info">📓 You\'re viewing a Joey.OS blog post.</span>', 'command-output');
            }
        } else {
            // HN discussion only (Ask HN, Show HN, etc.)
            const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
            window.open(hnUrl, '_blank');
            this.terminal.addToOutput('<span class="success">✅ Hacker News discussion opened in new tab</span>', 'command-output');
        }

        this.terminal.addToOutput('<span class="info">Type another number to open more stories, or "quit" to exit RSS mode</span>', 'command-output');
    }

    /**
     * End RSS mode and return to terminal
     */
    end() {
        this.isActive = false;
        this.terminal.rssActive = false;
        this.stories = [];
        this.terminal.addToOutput('<span class="warning">RSS mode ended. Back to terminal.</span>', 'command-output');
        this.terminal.addToOutput('Type \'rss\' to browse Hacker News again or \'help\' for all commands.', 'info');
    }

    /**
     * Format date string for fallback stories
     * @private
     */
    _formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}
