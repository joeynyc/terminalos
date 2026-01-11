// HackerNewsAPI.js - API service layer for Hacker News with proxy fallback
export class HackerNewsAPI {
    constructor() {
        this.proxies = [
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://cors-anywhere.herokuapp.com/',
            'https://corsproxy.io/?'
        ];
        this.baseURL = 'https://hacker-news.firebaseio.com/v0';
        this.storyDelay = 150; // ms delay between story fetches
    }

    /**
     * Fetch top 10 stories from Hacker News with proxy fallback
     * @returns {Promise<Array>} Array of story objects with title, url, points, comments
     */
    async fetchTopStories() {
        let lastError = null;

        // Try each proxy in sequence
        for (const proxy of this.proxies) {
            try {
                const stories = await this._fetchWithProxy(proxy);
                if (stories && stories.length > 0) {
                    return stories;
                }
            } catch (error) {
                lastError = error;
                console.warn(`Proxy ${proxy} failed:`, error.message);
                continue;
            }
        }

        // All proxies failed
        throw new Error(lastError?.message || 'All proxies failed to fetch stories');
    }

    /**
     * Fetch stories using a specific proxy
     * @private
     */
    async _fetchWithProxy(proxy) {
        // Fetch top story IDs
        const topStoriesURL = `${proxy}${this.baseURL}/topstories.json`;
        const response = await fetch(topStoriesURL, {
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const topStoryIds = await response.json();
        const storyIds = topStoryIds.slice(0, 10);

        // Fetch individual stories with delay
        const stories = [];
        for (const id of storyIds) {
            try {
                const story = await this._fetchStory(id, proxy);
                if (story) {
                    stories.push(story);
                }
                // Delay between requests to avoid rate limiting
                await this._delay(this.storyDelay);
            } catch (error) {
                console.warn(`Failed to fetch story ${id}:`, error.message);
                continue;
            }
        }

        return stories;
    }

    /**
     * Fetch individual story details
     * @private
     */
    async _fetchStory(storyId, proxy) {
        const storyURL = `${proxy}${this.baseURL}/item/${storyId}.json`;
        const response = await fetch(storyURL, {
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            title: data.title || 'No title',
            url: data.url || `https://news.ycombinator.com/item?id=${storyId}`,
            points: data.score || 0,
            comments: data.descendants || 0
        };
    }

    /**
     * Delay helper for rate limiting
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
