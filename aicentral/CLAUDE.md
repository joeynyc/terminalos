# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Central is a static web application that aggregates AI company information from Google, OpenAI, Microsoft, Meta, Anthropic, and xAI. The project provides a centralized dashboard for tracking AI developments without the noise of social media.

## Architecture

### Project Structure
- **index.html** - Main dashboard with news feed aggregation, company filters, search, and bookmarking
- **companies.html** - Company-specific detail pages with timelines, personnel tracking, and metrics
- **analytics.html** - Data visualization and trend analysis with charts and heatmaps
- **main.js** - Core JavaScript with mock data, event handlers, filtering logic, and animations
- **resources/** - Static assets (logos, images, textures)

### Technology Stack
This is a **client-side only application** with no backend or build process:
- Pure HTML/CSS/JavaScript (no frameworks)
- Tailwind CSS via CDN for styling
- Animation libraries: Anime.js, ECharts.js, Splide.js, Matter.js, Shader-Park, Pixi.js, p5.js
- Local storage for user preferences and bookmarks
- Mock data structure in main.js
- **GNews.io API** for live news feeds (free tier: 100 requests/day, 12-hour delay)

### Data Architecture
All data is defined as JavaScript objects in main.js following this structure:
```javascript
companiesData = {
  [companyKey]: {
    name, logo, color,
    updates: [{ id, title, excerpt, category, timestamp, type }]
  }
}
```

## Development

### Running the Application
Simply open any HTML file in a browser - no build step, server, or dependencies to install.

### Making Changes

**HTML Files:**
- Each page is self-contained with embedded styles
- Navigation bar is duplicated across all pages (not componentized)
- Shared visual styling (glass morphism, card hover effects) should be kept consistent

**JavaScript (main.js):**
- All interactive functionality lives in main.js
- Mock data is at the top of the file
- Event listeners and filtering logic handle company/time/search filters
- Bookmark system uses localStorage with key "aiCentralBookmarks"

**Adding New Companies:**
- Update companiesData object in main.js
- Add checkbox to filter sidebar in index.html
- Add logo URL (currently using placeholder CDN links)
- Update company count metrics

**Adding New Features:**
- Search functionality filters across all update titles/excerpts
- Time filtering simulates recency based on mock timestamps
- Bookmark system stores update IDs in localStorage
- All animations use Anime.js for consistency

### Design System

**Color Palette:**
- Primary: Deep Charcoal (#1a1a1a) - backgrounds
- Secondary: Warm Gray (#6b7280) - supporting text
- Accent: Electric Blue (#3b82f6) - interactive elements
- Success: Sage Green (#10b981) - positive indicators
- Warning: Amber (#f59e0b) - alerts

**Visual Effects:**
- Glass morphism with backdrop-filter blur
- Card hover: translateY(-8px) with shadow expansion
- Smooth transitions using cubic-bezier(0.4, 0, 0.2, 1)
- Reveal animations on scroll with 30px translateY

**Typography:**
- Font: Inter via Google Fonts
- Hero: 3.5rem (56px)
- H1: 2.5rem (40px)
- Body: 1rem (16px)

## Key Concepts

### Company Filtering
- Checkboxes in sidebar toggle visibility of updates from specific companies
- "All Companies" checkbox controls select all/deselect all behavior
- Active filters add 'active' class with blue border and background tint

### Search Implementation
- Real-time search filters updates as user types
- Matches against update title and excerpt fields
- Results display in dropdown with highlighting

### Bookmark System
- Click bookmark icon on any update to save to localStorage
- Bookmarks stored as array of update IDs
- Modal shows all bookmarked items with ability to remove

### Mock Data Strategy
- All company updates are static mock data in main.js
- Timestamps are relative strings ("2 hours ago") not actual dates
- No actual API calls or data fetching occurs
- "Load More" button simulates pagination with pre-defined data

## Important Notes

- This is a **static demo/prototype** with no real data sources
- Company logos use placeholder CDN URLs that may not be reliable
- No responsive breakpoints are explicitly defined despite mobile-first claims in design docs
- Animation libraries are loaded but not all are actively used (Matter.js, Shader-Park, Pixi.js, p5.js)
- The hero background image path (resources/hero-ai-dashboard.png) must exist
- Design documents reference editorial fonts (Tiempos Headline, Suisse Int'l, JetBrains Mono) but implementation uses Inter