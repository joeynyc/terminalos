// Minimal Blog JavaScript - Load and render posts from JSON with fallback
class BlogLoader {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        // Fallback posts data - update this when you add new posts to posts.json
        this.fallbackPosts = [
            {
                "id": "building-terminal-portfolio",
                "title": "Building a Terminal Portfolio",
                "date": "2024-09-04",
                "content": "Sometimes the best user interfaces are the ones that feel familiar. There's something magical about the command line - its simplicity, its directness, its honesty.\n\nWhen I decided to build my portfolio, I could have gone with any number of modern frameworks or flashy animations. Instead, I chose to build something that felt authentic to who I am as a developer.\n\nThe terminal interface isn't just aesthetic - it's functional. Every command does something meaningful. The games aren't just easter eggs; they're demonstrations of interactive programming. The theme system shows attention to user experience.\n\nThis blog represents the opposite philosophy - minimal, clean, focused purely on content. No distractions, no unnecessary elements. Just words and thoughts."
            },
            {
                "id": "art-of-minimal-design",
                "title": "The Art of Minimal Design",
                "date": "2024-09-03",
                "content": "Less is more. This phrase gets thrown around a lot in design circles, but what does it really mean for developers?\n\nMinimal design isn't about removing features - it's about intentionality. Every element should have a purpose. Every line of code should justify its existence.\n\nThis blog page is an exercise in that philosophy. Black text on white background. Clean typography. No social media widgets, no comment systems, no analytics tracking. Just content.\n\nSometimes the most radical thing you can do is keep it simple."
            },
            {
                "id": "code-as-craft",
                "title": "Code as Craft",
                "date": "2024-09-02",
                "content": "Programming is more than just solving problems - it's about creating experiences. Every function, every variable name, every comment is a choice that affects how someone else will interact with your work.\n\nI believe code should be readable like prose. Variable names should tell stories. Functions should have single, clear purposes. Comments should explain why, not what.\n\nWhen you write code with care, it shows. When you build interfaces with empathy, users feel it. When you craft experiences with intention, magic happens.\n\nThat's what I strive for in every project - not just working code, but code that works beautifully."
            },
            {
                "id": "welcome",
                "title": "Welcome",
                "date": "2024-09-01",
                "content": "This is my blog. A place for thoughts, ideas, and reflections on code, design, and the craft of building things on the web.\n\nYou won't find any frameworks here, no complex build systems, no tracking scripts. Just HTML, CSS, and the occasional bit of JavaScript when it serves a purpose.\n\nIf you found this through the terminal, welcome. If you stumbled here by accident, I hope you'll stay for a while.\n\nThanks for reading."
            }
        ];
        this.loadPosts();
    }

    async loadPosts() {
        try {
            // Try to load from JSON first (works when served via server)
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            const posts = await response.json();
            this.renderPosts(posts);
        } catch (error) {
            // Fallback to embedded posts data (works for local files)
            console.log('Using fallback posts data');
            this.renderPosts(this.fallbackPosts);
        }
    }

    renderPosts(posts) {
        // Clear any existing content
        this.postsContainer.innerHTML = '';
        
        // Render each post
        posts.forEach(post => {
            const article = this.createPostElement(post);
            this.postsContainer.appendChild(article);
        });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'post';
        
        // Create post header
        const header = document.createElement('header');
        header.className = 'post-header';
        
        const title = document.createElement('h2');
        title.className = 'post-title';
        title.textContent = post.title;
        
        const date = document.createElement('time');
        date.className = 'post-date';
        date.setAttribute('datetime', post.date);
        date.textContent = this.formatDate(post.date);
        
        header.appendChild(title);
        header.appendChild(date);
        
        // Create post content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'post-content';
        
        // Convert newlines to paragraphs
        const paragraphs = post.content.split('\n\n');
        paragraphs.forEach(paragraphText => {
            if (paragraphText.trim()) {
                const p = document.createElement('p');
                p.textContent = paragraphText.trim();
                contentDiv.appendChild(p);
            }
        });
        
        article.appendChild(header);
        article.appendChild(contentDiv);
        
        return article;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

}

// Initialize blog loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BlogLoader();
});