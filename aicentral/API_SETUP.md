# API Setup Guide for AI Central

AI Central now supports live news feeds from **GNews.io**. Follow these steps to enable real-time AI company news.

## Quick Start

### 1. Get Your Free API Key

1. Visit [https://gnews.io/register](https://gnews.io/register)
2. Sign up for a free account (no credit card required)
3. Verify your email address
4. Copy your API key from the dashboard

**Free Tier Limits:**
- 100 requests per day
- Up to 10 articles per request
- 12-hour delay on articles
- 30 days of historical data
- Perfect for personal projects and testing

### 2. Configure the Application

#### Option A: Update main.js (Dashboard Page)
1. Open `main.js` in a text editor
2. Find line 4: `const NEWS_API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Save the file

```javascript
// Before
const NEWS_API_KEY = 'YOUR_API_KEY_HERE';

// After (example)
const NEWS_API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
```

#### Option B: Update companies.html (Company Details Page)
1. Open `companies.html` in a text editor
2. Find line 223: `const NEWS_API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace with your API key
4. Save the file

### 3. Test the Integration

1. Open `index.html` in your web browser
2. You should see:
   - A loading spinner while fetching news
   - Real AI company news articles with timestamps
   - Article images and source names
   - "Read Article →" links to original sources

If you see a yellow warning banner, the API key is either missing or invalid.

## Features Enabled with API

### News Feed (index.html)
- ✅ Live news from 6 AI companies (Google, OpenAI, Microsoft, Meta, Anthropic, xAI)
- ✅ Real article images
- ✅ Actual publish timestamps (e.g., "15 minutes ago", "3 hours ago")
- ✅ Source attribution (e.g., "TechCrunch", "VentureBeat")
- ✅ Direct links to full articles
- ✅ Automatic categorization (Research, Product, Partnership, Business, etc.)
- ✅ Up to 10 articles per company

### Company Pages (companies.html)
- ✅ Real-time company timeline with latest news
- ✅ Recent product launches from actual news
- ✅ Accurate dates instead of mock data
- ✅ Dynamic updates when switching companies

## Fallback Behavior

**Without API Key:** The application works perfectly with mock data
**With Invalid API Key:** Shows warning banner and falls back to mock data
**API Rate Limit Exceeded:** Gracefully falls back to cached/mock data

## API Search Terms

The application searches for these terms per company:

- **Google:** Google AI, DeepMind, Gemini AI, Bard, Google Vertex
- **OpenAI:** OpenAI, ChatGPT, GPT-4, GPT-5, DALL-E, Sam Altman
- **Microsoft:** Microsoft AI, Copilot, Azure AI, Bing AI
- **Meta:** Meta AI, Llama, LLaMA, Facebook AI, FAIR
- **Anthropic:** Anthropic, Claude AI, Constitutional AI
- **xAI:** xAI, Grok, Elon Musk AI

## Troubleshooting

### Issue: No news showing up
**Solution:**
1. Check browser console (F12) for errors
2. Verify API key is correct (no extra spaces)
3. Ensure you haven't exceeded 100 requests/day
4. Try a different browser to rule out CORS issues

### Issue: "Failed to fetch news" error
**Solution:**
1. Check your internet connection
2. Verify GNews.io is not down: [https://gnews.io/](https://gnews.io/)
3. Ensure your API key is still valid (check dashboard)

### Issue: Getting old news
**Solution:**
- GNews free tier has a 12-hour delay on articles
- News is sorted by `publishedAt` date (newest first)
- Articles may be 12+ hours old due to free tier restrictions

### Issue: CORS errors in browser console
**Solution:**
- Open the HTML files directly in browser (file://)
- Or use a local server: `python -m http.server 8000` or `npx serve`
- GNews.io supports CORS for development

## Advanced Configuration

### Adjust Articles Per Company
Edit line 298 in `main.js`:
```javascript
// Default: 10 articles per company (max for free tier)
max=10

// Note: GNews free tier maxes out at 10 articles per request
```

### Change News Language
Edit line 298 in `main.js`:
```javascript
// Default: English
lang=en

// Other options: es (Spanish), fr (French), de (German), etc.
```

### Add More Companies
1. Add company to `companySearchTerms` object (line 8-15)
2. Add company info to `companiesData` object
3. Add filter checkbox in `index.html`
4. Add company card in `companies.html`

## API Quotas & Limits

**Free Tier:**
- 100 requests/day
- Resets at midnight UTC
- Each company fetch = 1 request
- Full dashboard load = 6 requests (one per company)
- ~16 page loads per day

**Need More?**
- Upgrade to Developer plan ($449/month) for 250,000 requests/month
- Consider caching responses in localStorage
- Implement request debouncing

## Alternative APIs

If GNews doesn't meet your needs:

1. **NewsData.io** - 200 free credits/day, 80+ languages
2. **NewsAPI.org** - 100 requests/day but 24-hour delay on free tier
3. **NewsAPI.ai** - AI-powered search, 90+ languages
4. **The Guardian API** - Free with registration, great for news

To switch APIs, update the `fetch()` calls in:
- Line 297-299 in `main.js`
- Line 456-458 in `companies.html`

## Privacy & Security

**Important:**
- ⚠️ API keys in client-side JavaScript are visible to users
- ⚠️ Free tier keys have rate limits - don't hardcode in production
- ✅ For public projects, use environment variables or backend proxy
- ✅ NewsAPI.org allows key regeneration if exposed

**Better approach for production:**
```javascript
// Don't expose API key in client code
// Instead, create a backend endpoint:
const response = await fetch('/api/news?company=google');
```

## Need Help?

- GNews Documentation: [https://gnews.io/docs](https://gnews.io/docs)
- GNews Support: [contact@gnews.io](mailto:contact@gnews.io)
- AI Central Issues: Check browser console (F12) for detailed errors

---

**Happy News Tracking! 🤖📰**