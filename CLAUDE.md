# Claude Code Configuration

This file contains configuration and commands for Claude Code to help with development of the Terminal Portfolio Website.

## Project Overview
This is a terminal-style portfolio website built with vanilla HTML, CSS, and JavaScript. It features an interactive command-line interface that showcases skills and experience, including a live RSS feed from Hacker News.

## Common Development Tasks

### Testing
```bash
# Open the main site for testing
open index.html

# Test mobile responsiveness
open mobile-test.html

# Test blog functionality
open blog.html

# Test RSS functionality (requires internet connection)
# Type 'rss' in terminal to fetch live Hacker News stories
```

### Code Quality
```bash
# No specific linting configured - this is a vanilla JS project
# Validation can be done through browser dev tools
```

### File Structure
- `index.html` - Main terminal interface
- `script.js` - Terminal logic and commands  
- `styles.css` - Styling and animations
- `blog.html` - Blog feature
- `mobile-test.html` - Mobile testing utilities

## RSS Feature Implementation

### Problem Encountered
The RSS feature initially failed due to Content Security Policy (CSP) restrictions blocking external network requests. When opening `index.html` directly (file:// protocol), all API calls to Hacker News and CORS proxy services were blocked.

### Error Messages Observed
```
❌ Refused to connect to 'https://api.codetabs.com/v1/proxy...' because it violates CSP directive: "default-src 'self'"
❌ Failed to fetch live Hacker News stories
```

### Solution Implemented
Fixed by updating the CSP policy in `index.html` to allow external connections:

**Before:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;">
```

**After:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https: http:;">
```

**Key Change:** Added `connect-src 'self' https: http:` to allow external API connections while maintaining security.

### RSS Technical Details
- **API Source:** Hacker News Official API (https://hacker-news.firebaseio.com/v0/)
- **CORS Handling:** Multi-proxy fallback system (codetabs.com, thingproxy.freeboard.io, cors-anywhere, corsproxy.io)
- **Rate Limiting:** 150ms delay between individual story fetches
- **Error Handling:** Graceful fallback with user-friendly error messages
- **State Management:** RSS mode similar to game system with numbered story selection

### Usage
```
joey@terminal:~$ rss
📰 Fetching latest Hacker News stories...
🚀 Top Hacker News Stories
═══════════════════════════════
 1. Sample Story Title...
    ↑342 points | 💬89 comments
...
Type a number (1-10) to open story, or "quit" to exit RSS mode
```

## Development Notes
- Pure vanilla JavaScript project (no build process required)
- Static site that can be served directly OR opened as file://
- Focus on terminal UX and interactive commands
- Mobile-responsive design
- Live external data integration via RSS feature

## Deployment
This is a static website - simply upload files to any static hosting service (GitHub Pages, Netlify, Vercel, etc.). The RSS feature works in both served and file:// environments thanks to the CSP configuration.