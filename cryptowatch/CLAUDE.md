# Crypto Tracker Dashboard — Product Requirements Document (PRD)

**Project Type:** Single-file HTML dashboard (no build step)

**Primary Data Source:** CoinGecko public API (no auth)

**Owner:** You

**Last Updated:** Sept 16, 2025

---

## 1) Summary

A single-page, portfolio-ready crypto dashboard that showcases live prices for top coins (Bitcoin, Ethereum, etc.), 7‑day sparklines, market cap, and 24h volume. It must load quickly, work with no frameworks or build tools, and be deployable as a single `.html` file. The page should look polished (dark mode by default) and feel snappy with real-time-ish updates via periodic API refresh.

---

## 2) Goals & Non-Goals

### Goals

* Display a curated list of cryptocurrencies with:

  * **Current price** (USD default)
  * **24h change (%)** with green/red trend pill
  * **Market cap** and **24h volume**
  * **7‑day sparkline** per asset
* Be **one file** (HTML+CSS+JS inlined). Optional CDN fonts/icons allowed.
* Auto-refresh data on a configurable interval (default: 30s–60s).
* Provide lightweight interactions: sort, search, and a compact details drawer.
* Be **portfolio-quality**: clean visuals, responsive layout, accessible semantics.

### Non-Goals

* Full portfolio management, wallets, or trading.
* Historical analytics beyond 7–30 day lightweight views.
* Authentication or user accounts.

---

## 3) Target Users & Use Cases

* **Recruiters/Clients**: Evaluate front-end craft and data handling.
* **Crypto-curious users**: Quick glance at market trends.

**Use Cases**

* Scan the top 10–50 coins and identify gainers/losers quickly.
* Open an asset details drawer for slightly deeper context (ATH/ATL, supply, links).
* Toggle time range for sparkline (7d default; optional 24h/30d).

---

## 4) Scope

### In-Scope

* Single HTML file with inline styles and scripts.
* Fetching and rendering live data from CoinGecko.
* Client-side search/filter/sort, currency toggle (USD default; optional EUR).
* Dark mode with high-contrast accessible palette.
* Graceful error states and mock/fallback data.

### Out-of-Scope

* Server-side code, databases, or build tools.
* User auth, watchlists synced to cloud.

---

## 5) Feature Requirements

### 5.1 Landing Layout (Responsive)

* **Header**: product title, last-updated timestamp, currency selector (USD/EUR), refresh button.
* **Market Intelligence Cards**: 3-4 compact overview cards showing market summary (fear/greed index, market cap dominance, top gainer/loser, total market cap).
* **Toolbar**: search input, sort dropdown (Price, 24h %, Market Cap), toggle for rows density (Comfortable/Compact).
* **Grid/List of Coins** (cards on mobile, table on desktop):

  * Rank, logo, symbol, name
  * Current price (formatted), 24h change (color-coded), market cap, 24h volume
  * Inline 7‑day sparkline (SVG), tooltip showing max/min and last value
* **Details Drawer** (expands from bottom on mobile, side panel on desktop):

  * Price, 24h %, 7d %, market dominance (if available)
  * Supply info (circulating/total/max)
  * ATH/ATL + drawdown/upsides (if provided by API)
  * External links (homepage, explorer) opening in new tab

### 5.2 Interactions

* **Search** by name or symbol (client-side fuzzy starts-with and contains)
* **Sort** by columns (asc/desc)
* **Pagination or Virtualization** (optional): default to top 20; allow 10/20/50 selector
* **Auto-Refresh**: default 60s; pause/resume via button; honor document visibility (pause when tab hidden)
* **Currency Toggle**: USD default; optionally load EUR
* **Time Range Toggle** for sparkline: 7d (default); optional 24h and 30d

### 5.3 Accessibility & Intl

* Semantic headings and roles; keyboard navigable; focus styles visible
* Sufficient color contrast (WCAG AA)
* Locale-aware number formatting; compact notations for big numbers (e.g., 1.2B)

### 5.4 Performance

* Lighthouse Performance ≥ 90 on modern desktop & mobile
* First meaningful paint under 2s on 3G Fast conditions
* Minimize layout thrash; use requestAnimationFrame for sparkline updates

---

## 6) Data & APIs

### 6.1 Primary Endpoints (CoinGecko)

* **Markets list (preferred single call):**

  * `GET /api/v3/coins/markets?vs_currency=usd&ids=&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d`
  * Returns price, market cap, 24h change, and sparkline data in one payload.
* **Market chart (per-coin, details drawer):**

  * `GET /api/v3/coins/{id}/market_chart?vs_currency=usd&days=7&interval=hourly`
* **Coins metadata (optional details):**

  * `GET /api/v3/coins/{id}` (for links, supply, ATH/ATL)
* **Market intelligence data:**

  * `GET /api/v3/global` (for total market cap, market cap percentage by coin)
  * Markets endpoint already provides top gainer/loser data from sorting
  * Fear/greed index: implement client-side calculation or use external API if needed

> Notes: Respect CoinGecko’s public rate limits (subject to change). Implement retry with exponential backoff and jitter. Cache last good response in memory; surface stale banner when showing cached.

### 6.2 Data Model (Client-side)

```ts
interface CoinRow {
  id: string;
  symbol: string; // e.g., btc
  name: string;   // e.g., Bitcoin
  image: string;  // logo URL
  rank: number;
  price: number;  // current_price
  change24hPct: number; // price_change_percentage_24h
  change7dPct?: number; // from price_change_percentage_7d_in_currency
  marketCap: number;
  volume24h: number;    // total_volume
  sparkline7d: number[]; // prices
}

interface MarketIntelligence {
  totalMarketCap: number;
  marketCapChange24h: number;
  topGainer: { symbol: string; change: number };
  topLoser: { symbol: string; change: number };
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex?: number; // optional client-side calculation
}
```

---

## 7) UX & Visual Design

### 7.1 Style

* Dark background (#0B0F14) with soft-elevated cards
* Accent color for positive (green) and negative (red) changes
* Mono font for numbers; humanist sans for labels (e.g., Inter + JetBrains Mono via CDN)

### 7.2 Components

* **AppShell**: Header + Market Cards + Toolbar + Content + Drawer
* **MarketCards**: 4-card grid showing market intelligence (responsive: 2x2 on mobile, 1x4 on desktop)
* **CoinTable**: responsive grid/table switching at 768px breakpoint
* **Sparkline**: inline SVG path with gradient fill; hover tooltip with point value/time
* **Badge**: trend chips (▲ 5.2%) with aria-label
* **Empty/Error**: illustrations or icons; retry action

### 7.3 States

* **Loading**: skeleton rows (logo circle + text bars + sparkline block)
* **Error**: message + retry; if cached, show data with stale badge
* **No Results**: when search filters out everything

---

## 8) Functional Requirements (FR)

1. Fetch and render top *N* coins with all required columns within 2s on good connection.
2. Sorting must work on price, 24h %, and market cap.
3. Search must filter by name or ticker symbol in real time (<50ms debounce).
4. Sparks must reflect the selected time range; data updates when range changes.
5. Details drawer must open within 150ms and populate metadata + mini chart.
6. Auto-refresh respects tab visibility and user pause state.
7. Currency toggle re-fetches and re-renders without full page reload.

---

## 9) Non-Functional Requirements (NFR)

* **Reliability:** show last-updated time; recover from transient errors automatically
* **Security:** use HTTPS; sanitize all text; disable inline event handlers for safety (but keep single-file)
* **Privacy:** no tracking without explicit note; optional simple client-side metrics only
* **Portability:** single `.html` works on GitHub Pages/Netlify with no config

---

## 10) Error Handling & Fallbacks

* If API fails:

  * Show banner: “Live data unavailable — showing last saved snapshot (timestamp).”
  * Retry strategy: 3 attempts, exponential backoff (e.g., 1s, 2s, 4s)
* If rate-limited:

  * Respect `Retry-After` header if present; otherwise backoff to 60–90s
* If any field missing:

  * Render `—` placeholders; do not break layout

---

## 11) Telemetry (Client-side only, optional)

* Count refreshes, search usage, time-range toggles (stored in `localStorage`, no network)
* Expose a tiny debug panel (press `D`) showing fetch timings and cache age

---

## 12) Accessibility QA Checklist

* [ ] All interactive controls reachable via keyboard (Tab/Shift+Tab)
* [ ] Visible focus ring
* [ ] aria-sort on sortable headers
* [ ] aria-live region for Last Updated timestamp
* [ ] Color contrast ≥ 4.5:1 for text; ≥ 3:1 for large text/icons

---

## 13) Performance Budget

* HTML ≤ 80KB minified target (fonts excluded)
* No images beyond coin logos fetched at runtime; inline SVGs only
* Paint under 2s on mobile mid‑tier device

---

## 14) Milestones & Acceptance Criteria

### M1 — Skeleton & Data Wiring (1 day)

* Fetch markets API, render 20 rows with price/24h%/mcap/volume, last-updated label
* **Acceptance:** Data loads, sorts, searches; Lighthouse Perf ≥ 80

### M2 — Sparklines & Details (1 day)

* Inline SVG 7‑day sparkline with tooltip; details drawer with metadata
* **Acceptance:** Hover tooltips; drawer loads under 150ms after data available

### M3 — Polish & A11y (1 day)

* Dark theme, contrast, keyboard nav, error fallbacks, auto-refresh
* **Acceptance:** A11y checks pass; reload/pause works; graceful errors

---

## 15) Open Questions

* Should we pin a fixed list (BTC, ETH, SOL) or allow `per_page` selector up to 50?
* Include EUR toggle by default, or keep code‑ready but hidden?
* Add 30d sparkline as a second tab or a toggle?

---

## 16) Test Plan (Manual)

* **Happy path:** load, sort by market cap, search “eth”, open details
* **Error path:** simulate network offline, confirm stale snapshot usage
* **Rate limit:** throttle and verify backoff and user messaging
* **A11y:** keyboard tab through, check aria labels and sorting announcements
* **Responsive:** iPhone SE, iPad, desktop wide

---

## 17) Visual Spec Notes (Dev-ready Hints)

* Use CSS grid on desktop table; switch to stacked cards <768px
* Numbers right-aligned; monospace font; compact formatting (Intl.NumberFormat)
* Sparkline: compute min/max; scale to viewBox; area fill with vertical gradient

---

## 18) Implementation Outline (Single File)

* `<head>`: meta, title, CSS (in `<style>`), optional CDN fonts/icons
* `<body>`: Header, Toolbar, Table/Grid container, Drawer, Templates, Toast
* `<script>`:

  * Fetch helpers (with backoff), state store, renderers, event wiring
  * Sparkline generator (SVG path from array)
  * Intl formatters (currency, compact numbers, percent)
  * LocalStorage cache + last snapshot

---

## 19) Example Requests (for dev)

* Markets (top 20, USD):

  * `/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d`
* One coin 7d chart:

  * `/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=hourly`
* Metadata for details drawer:

  * `/api/v3/coins/bitcoin`

---

## 20) Acceptance Demo Script

1. Load page → skeleton shimmer → data appears with timestamp
2. Sort by 24h % → see green/red ranks change
3. Type “sol” → filter to Solana card
4. Click Solana → drawer shows supply + ATH/ATL; mini chart loads
5. Toggle currency to EUR → values re-render; last updated changes
6. Switch time range to 30d (if enabled) → sparkline updates
7. Simulate offline → banner shows; cached data persists

---

## 21) Nice-to-Haves (Backlog)

* Local watchlist (client-only)
* Column chooser and density presets
* Shareable state in URL hash (`#q=eth&sort=change24h`)
* Mini heatmap of daily returns
* Enhanced fear/greed calculation with volume and volatility factors
* Market sentiment indicators from social media APIs
