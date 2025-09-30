// AI Central Dashboard - Main JavaScript

// GNews API Configuration
const NEWS_API_KEY = 'f3156c16725fa6ea9f9cbbdc2dc63198'; // Get free API key from https://gnews.io/
const NEWS_API_BASE_URL = 'https://gnews.io/api/v4';

// Company search terms for API queries
const companySearchTerms = {
    google: ['Google AI', 'DeepMind', 'Gemini AI', 'Bard', 'Google Vertex'],
    openai: ['OpenAI', 'ChatGPT', 'GPT-4', 'GPT-5', 'DALL-E', 'Sam Altman'],
    microsoft: ['Microsoft AI', 'Copilot', 'Azure AI', 'Bing AI'],
    meta: ['Meta AI', 'Llama', 'LLaMA', 'Facebook AI', 'FAIR'],
    anthropic: ['Anthropic', 'Claude AI', 'Constitutional AI'],
    xai: ['xAI', 'Grok', 'Elon Musk AI']
};

// Fallback mock data for AI companies and their updates (used if API fails)
const companiesData = {
    google: {
        name: "Google",
        logo: "https://kimi-web-img.moonshot.cn/img/upload.wikimedia.org/ea635a7bbade06d41544eba63db5fd5cd5edc82f.png",
        color: "#4285f4",
        updates: [
            {
                id: 1,
                title: "Gemini 2.0 Released with Enhanced Multimodal Capabilities",
                excerpt: "Google announces the next generation of their AI model with improved reasoning and multimodal understanding.",
                category: "Research",
                timestamp: "2 hours ago",
                type: "research"
            },
            {
                id: 2,
                title: "DeepMind Partners with NHS for AI Healthcare Solutions",
                excerpt: "New collaboration focuses on developing AI tools for early disease detection and treatment optimization.",
                category: "Partnership",
                timestamp: "6 hours ago",
                type: "partnership"
            },
            {
                id: 3,
                title: "Bard Integration Expands to Google Workspace",
                excerpt: "AI-powered writing assistance now available across Docs, Gmail, and other Workspace applications.",
                category: "Product",
                timestamp: "1 day ago",
                type: "product"
            }
        ]
    },
    openai: {
        name: "OpenAI",
        logo: "https://kimi-web-img.moonshot.cn/img/sickboat.com/633559291181e0e1e58000d486f870e15c057318.jpg",
        color: "#10a37f",
        updates: [
            {
                id: 4,
                title: "GPT-5 Training Reaches New Milestones",
                excerpt: "OpenAI reports significant improvements in reasoning capabilities and reduced hallucination rates.",
                category: "Research",
                timestamp: "4 hours ago",
                type: "research"
            },
            {
                id: 5,
                title: "DALL-E 3 API Now Available for Developers",
                excerpt: "Enhanced image generation capabilities accessible through API with improved safety measures.",
                category: "Product",
                timestamp: "8 hours ago",
                type: "product"
            },
            {
                id: 6,
                title: "ChatGPT Enterprise Reaches 1 Million Users",
                excerpt: "Rapid adoption of enterprise version drives focus on business-specific features and integrations.",
                category: "Business",
                timestamp: "12 hours ago",
                type: "business"
            }
        ]
    },
    microsoft: {
        name: "Microsoft",
        logo: "https://kimi-web-img.moonshot.cn/img/upload.wikimedia.org/2166b33a335fe6f5382a08d0dd7601676db7e263.png",
        color: "#0078d4",
        updates: [
            {
                id: 7,
                title: "Copilot Pro Launches with Advanced Features",
                excerpt: "Premium AI assistant offers enhanced productivity tools and priority access to latest models.",
                category: "Product",
                timestamp: "3 hours ago",
                type: "product"
            },
            {
                id: 8,
                title: "Azure AI Studio Gets Major Update",
                excerpt: "New tools for model training, deployment, and monitoring streamline AI development workflow.",
                category: "Platform",
                timestamp: "7 hours ago",
                type: "platform"
            },
            {
                id: 9,
                title: "Microsoft Research Open-Sources New AI Framework",
                excerpt: "Framework aims to improve AI model interpretability and reduce bias in decision-making systems.",
                category: "Research",
                timestamp: "1 day ago",
                type: "research"
            }
        ]
    },
    meta: {
        name: "Meta",
        logo: "https://kimi-web-img.moonshot.cn/img/upload.wikimedia.org/2166b33a335fe6f5382a08d0dd7601676db7e263.png",
        color: "#1877f2",
        updates: [
            {
                id: 10,
                title: "Llama 3 Shows Impressive Performance Gains",
                excerpt: "Latest open-source language model demonstrates competitive results across multiple benchmarks.",
                category: "Research",
                timestamp: "5 hours ago",
                type: "research"
            },
            {
                id: 11,
                title: "Meta AI Assistant Rolls Out to Instagram",
                excerpt: "AI-powered features help users create content, get recommendations, and enhance their experience.",
                category: "Product",
                timestamp: "9 hours ago",
                type: "product"
            },
            {
                id: 12,
                title: "Reality Labs Unveils New AR/AI Integration",
                excerpt: "Breakthrough technology combines augmented reality with AI for immersive user experiences.",
                category: "Technology",
                timestamp: "1 day ago",
                type: "technology"
            }
        ]
    },
    anthropic: {
        name: "Anthropic",
        logo: "https://kimi-web-img.moonshot.cn/img/upload.wikimedia.org/2166b33a335fe6f5382a08d0dd7601676db7e263.png",
        color: "#d4a574",
        updates: [
            {
                id: 13,
                title: "Claude 3.5 Demonstrates Enhanced Reasoning",
                excerpt: "Latest model shows significant improvements in complex problem-solving and ethical reasoning.",
                category: "Research",
                timestamp: "6 hours ago",
                type: "research"
            },
            {
                id: 14,
                title: "Constitutional AI Research Published in Nature",
                excerpt: "Peer-reviewed paper details breakthrough in AI alignment and safety methodology.",
                category: "Publication",
                timestamp: "10 hours ago",
                type: "publication"
            },
            {
                id: 15,
                title: "Enterprise Claude API Enters General Availability",
                excerpt: "Business-focused version offers enhanced security, compliance, and customization options.",
                category: "Business",
                timestamp: "1 day ago",
                type: "business"
            }
        ]
    },
    xai: {
        name: "xAI",
        logo: "https://kimi-web-img.moonshot.cn/img/thumbs.dreamstime.com/00ba938fff81084a8405e59201d37dc8d9a9768d.jpg",
        color: "#1d9bf0",
        updates: [
            {
                id: 16,
                title: "Grok-2 Beta Shows Improved Conversational Abilities",
                excerpt: "xAI's conversational AI demonstrates more natural interactions and better context understanding.",
                category: "Research",
                timestamp: "4 hours ago",
                type: "research"
            },
            {
                id: 17,
                title: "xAI Partners with Tesla for Autonomous Driving Research",
                excerpt: "Collaboration focuses on developing advanced AI systems for next-generation vehicle autonomy.",
                category: "Partnership",
                timestamp: "8 hours ago",
                type: "partnership"
            },
            {
                id: 18,
                title: "New AI Training Infrastructure Announced",
                excerpt: "Massive compute cluster deployment aims to accelerate AI model development and training.",
                category: "Infrastructure",
                timestamp: "1 day ago",
                type: "infrastructure"
            }
        ]
    }
};

// State management
let currentFilters = ['all'];
let bookmarkedItems = JSON.parse(localStorage.getItem('bookmarkedItems')) || [];
let currentTimeFilter = '24h';
let displayedItems = 12;
let apiNewsData = {}; // Store fetched news from API
let useAPI = NEWS_API_KEY !== 'YOUR_API_KEY_HERE'; // Check if API key is configured

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeParticles();
    initializeScrollAnimations();
    initializeFilters();
    initializeSearch();
    initializeBookmarks();

    // Fetch news from API or use mock data
    if (useAPI) {
        console.log('🔄 API enabled - fetching live news...');
        showLoadingState();
        fetchAllCompanyNews().then(() => {
            console.log('✅ News fetch complete!');
            hideLoadingState();
            renderNewsFeed();
        }).catch(error => {
            console.error('❌ Failed to fetch news:', error);
            hideLoadingState();
            showAPIError();
            renderNewsFeed(); // Fall back to mock data
        });
    } else {
        console.log('📋 Using mock data (API key not configured)');
        renderNewsFeed();
    }

    setupEventListeners();
});

// API Functions
async function fetchAllCompanyNews() {
    const promises = Object.keys(companySearchTerms).map(companyKey =>
        fetchCompanyNews(companyKey)
    );

    const results = await Promise.all(promises);

    let successCount = 0;

    // Merge API data with company info
    results.forEach((articles, index) => {
        const companyKey = Object.keys(companySearchTerms)[index];
        const companyInfo = companiesData[companyKey];

        if (articles.length > 0) {
            successCount++;
            apiNewsData[companyKey] = {
                ...companyInfo,
                updates: articles.map((article, idx) => ({
                    id: `api-${companyKey}-${idx}`,
                    title: article.title,
                    excerpt: article.description || article.content?.substring(0, 150) + '...' || 'No description available.',
                    category: categorizeArticle(article),
                    timestamp: getRelativeTime(article.publishedAt),
                    type: getArticleType(article),
                    url: article.url,
                    source: article.source?.name || article.source?.url || 'Unknown Source',
                    image: article.image || null
                }))
            };
        }
    });

    console.log(`📊 Successfully loaded news for ${successCount}/${Object.keys(companySearchTerms).length} companies`);

    // If no companies loaded, throw error to trigger fallback
    if (successCount === 0) {
        throw new Error('No news articles loaded from API');
    }
}

async function fetchCompanyNews(companyKey) {
    const searchTerms = companySearchTerms[companyKey];
    const query = searchTerms[0]; // Use first term for better results

    try {
        console.log(`Fetching news for ${companyKey}...`);

        // GNews API search endpoint with CORS proxy for file:// protocol support
        // max=10 returns up to 10 articles
        // lang=en for English articles only
        const apiUrl = `${NEWS_API_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${NEWS_API_KEY}`;
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(corsProxy + encodeURIComponent(apiUrl));

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`API error for ${companyKey}: ${response.status}`, errorData.message || '');

            // Return empty array instead of throwing to allow other companies to load
            return [];
        }

        const data = await response.json();
        console.log(`✓ Fetched ${data.articles?.length || 0} articles for ${companyKey}`);
        return data.articles || [];
    } catch (error) {
        console.error(`Failed to fetch news for ${companyKey}:`, error);
        return [];
    }
}

function categorizeArticle(article) {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = title + ' ' + description;

    if (content.includes('research') || content.includes('paper') || content.includes('study')) {
        return 'Research';
    } else if (content.includes('launch') || content.includes('release') || content.includes('product')) {
        return 'Product';
    } else if (content.includes('partner') || content.includes('collaboration') || content.includes('deal')) {
        return 'Partnership';
    } else if (content.includes('hire') || content.includes('ceo') || content.includes('leadership')) {
        return 'Leadership';
    } else if (content.includes('funding') || content.includes('investment') || content.includes('valuation')) {
        return 'Business';
    } else {
        return 'News';
    }
}

function getArticleType(article) {
    const category = categorizeArticle(article);
    return category.toLowerCase();
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Loading and Error States
function showLoadingState() {
    const newsFeed = document.getElementById('newsFeed');
    newsFeed.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-gray-400">Fetching latest AI news...</p>
        </div>
    `;
}

function hideLoadingState() {
    // Loading state will be replaced by news feed
}

function showAPIError() {
    const errorBanner = document.createElement('div');
    errorBanner.className = 'bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-6 rounded';
    errorBanner.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm text-yellow-200">
                    Failed to fetch live news. Showing cached/demo content.
                    <a href="https://gnews.io/" target="_blank" class="underline font-medium">Get a free API key</a>
                    and update <code>NEWS_API_KEY</code> in main.js to enable live news.
                </p>
            </div>
        </div>
    `;

    const mainContent = document.querySelector('#newsFeed').parentElement;
    mainContent.insertBefore(errorBanner, document.getElementById('newsFeed'));
}

// Floating particles animation
function initializeParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Scroll animations
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Filter functionality
function initializeFilters() {
    const checkboxes = document.querySelectorAll('.company-checkbox');
    const timeFilter = document.getElementById('timeFilter');

    // Set initial filter styles on page load
    updateFilterStyles();

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'all' && this.checked) {
                // If "All" is checked, uncheck others
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
                currentFilters = ['all'];
            } else if (this.value === 'all' && !this.checked) {
                // If "All" is unchecked, check the first company
                checkboxes[1].checked = true;
                currentFilters = [checkboxes[1].value];
            } else {
                // If a specific company is checked, uncheck "All"
                const allCheckbox = document.querySelector('input[value="all"]');
                allCheckbox.checked = false;

                if (this.checked) {
                    // Add to filters if not already present
                    if (!currentFilters.includes(this.value)) {
                        currentFilters = currentFilters.filter(f => f !== 'all');
                        currentFilters.push(this.value);
                    }
                } else {
                    currentFilters = currentFilters.filter(f => f !== this.value);
                }

                // If no filters selected, check "All"
                if (currentFilters.length === 0 || currentFilters.includes('all')) {
                    allCheckbox.checked = true;
                    currentFilters = ['all'];
                }
            }

            updateFilterStyles();
            renderNewsFeed();
        });
    });

    timeFilter.addEventListener('change', function() {
        currentTimeFilter = this.value;
        renderNewsFeed();
    });
}

function updateFilterStyles() {
    const filters = document.querySelectorAll('.company-filter');
    filters.forEach(filter => {
        const checkbox = filter.querySelector('input');
        if (checkbox.checked) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        const results = searchCompanies(query);
        displaySearchResults(results);
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function searchCompanies(query) {
    const results = [];
    
    Object.entries(companiesData).forEach(([companyKey, company]) => {
        // Search in company name
        if (company.name.toLowerCase().includes(query)) {
            results.push({
                type: 'company',
                name: company.name,
                key: companyKey,
                logo: company.logo
            });
        }
        
        // Search in updates
        company.updates.forEach(update => {
            if (update.title.toLowerCase().includes(query) || 
                update.excerpt.toLowerCase().includes(query) ||
                update.category.toLowerCase().includes(query)) {
                results.push({
                    type: 'update',
                    title: update.title,
                    company: company.name,
                    companyKey: companyKey,
                    category: update.category
                });
            }
        });
    });
    
    return results.slice(0, 8); // Limit to 8 results
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="p-4 text-gray-400">No results found</div>';
    } else {
        searchResults.innerHTML = results.map(result => {
            if (result.type === 'company') {
                return `
                    <div class="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0" 
                         onclick="filterByCompany('${result.key}')">
                        <div class="flex items-center">
                            <img src="${result.logo}" alt="${result.name}" class="w-6 h-6 mr-3">
                            <span class="font-medium">${result.name}</span>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                         onclick="scrollToUpdate('${result.companyKey}', ${result.id})">
                        <div class="text-sm font-medium">${result.title}</div>
                        <div class="text-xs text-gray-400 mt-1">${result.company} • ${result.category}</div>
                    </div>
                `;
            }
        }).join('');
    }
    
    searchResults.classList.remove('hidden');
}

// Bookmark functionality
function initializeBookmarks() {
    const bookmarkModal = document.getElementById('bookmarkModal');
    const closeBookmarkModal = document.getElementById('closeBookmarkModal');
    
    // Close modal
    closeBookmarkModal.addEventListener('click', function() {
        bookmarkModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    bookmarkModal.addEventListener('click', function(e) {
        if (e.target === bookmarkModal) {
            bookmarkModal.classList.add('hidden');
        }
    });
}

function toggleBookmark(updateId, companyKey) {
    const bookmarkKey = `${companyKey}-${updateId}`;
    const bookmarkBtn = document.querySelector(`[data-bookmark="${bookmarkKey}"]`);
    
    if (bookmarkedItems.includes(bookmarkKey)) {
        bookmarkedItems = bookmarkedItems.filter(item => item !== bookmarkKey);
        bookmarkBtn.classList.remove('bookmarked');
    } else {
        bookmarkedItems.push(bookmarkKey);
        bookmarkBtn.classList.add('bookmarked');
    }
    
    localStorage.setItem('bookmarkedItems', JSON.stringify(bookmarkedItems));
    
    // Animate the bookmark button
    anime({
        targets: bookmarkBtn,
        scale: [1, 1.3, 1],
        duration: 300,
        easing: 'easeOutElastic(1, .8)'
    });
}

function showBookmarks() {
    const bookmarkModal = document.getElementById('bookmarkModal');
    const bookmarkedContent = document.getElementById('bookmarkedContent');
    
    if (bookmarkedItems.length === 0) {
        bookmarkedContent.innerHTML = '<p class="text-gray-400 text-center py-8">No bookmarked items yet.</p>';
    } else {
        const bookmarkedUpdates = bookmarkedItems.map(item => {
            const [companyKey, updateId] = item.split('-');
            const company = companiesData[companyKey];
            const update = company.updates.find(u => u.id == updateId);
            
            if (update) {
                return createNewsCard(company, update);
            }
        }).filter(Boolean).join('');
        
        bookmarkedContent.innerHTML = bookmarkedUpdates;
    }
    
    bookmarkModal.classList.remove('hidden');
}

// News feed rendering
function renderNewsFeed() {
    const newsFeed = document.getElementById('newsFeed');
    const allUpdates = [];

    // Use API data if available, otherwise use mock data
    const dataSource = Object.keys(apiNewsData).length > 0 ? apiNewsData : companiesData;

    // Collect all updates from selected companies
    Object.entries(dataSource).forEach(([companyKey, company]) => {
        if (currentFilters.includes('all') || currentFilters.includes(companyKey)) {
            company.updates.forEach(update => {
                allUpdates.push({
                    ...update,
                    company: company,
                    companyKey: companyKey
                });
            });
        }
    });
    
    // Sort by timestamp (newest first)
    allUpdates.sort((a, b) => {
        const timeA = parseTimeString(a.timestamp);
        const timeB = parseTimeString(b.timestamp);
        return timeA - timeB;
    });
    
    // Apply time filter
    const filteredUpdates = allUpdates.filter(update => {
        const timeDiff = parseTimeString(update.timestamp);
        const now = Date.now();
        
        switch (currentTimeFilter) {
            case '24h':
                return (now - timeDiff) <= 24 * 60 * 60 * 1000;
            case 'week':
                return (now - timeDiff) <= 7 * 24 * 60 * 60 * 1000;
            case 'month':
                return (now - timeDiff) <= 30 * 24 * 60 * 60 * 1000;
            default:
                return true;
        }
    });
    
    // Limit displayed items
    const updatesToShow = filteredUpdates.slice(0, displayedItems);
    
    // Render updates
    newsFeed.innerHTML = updatesToShow.map(update => 
        createNewsCard(update.company, update, update.companyKey)
    ).join('');
    
    // Animate new cards
    anime({
        targets: '.news-card',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
    
    // Update bookmark states
    updateBookmarkStates();
}

function createNewsCard(company, update, companyKey) {
    const bookmarkKey = `${companyKey}-${update.id}`;
    const isBookmarked = bookmarkedItems.includes(bookmarkKey);
    const hasUrl = update.url ? true : false;
    const hasImage = update.image ? true : false;
    const source = update.source ? `${update.source}` : '';

    return `
        <div class="news-card p-6 rounded-xl" data-update-id="${update.id}" data-company="${companyKey}">
            ${hasImage ? `<img src="${update.image}" alt="${update.title}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.style.display='none'">` : ''}
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center flex-1">
                    <img src="${company.logo}" alt="${company.name}" class="w-8 h-8 rounded-lg mr-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg">${update.title}</h3>
                        <div class="flex items-center flex-wrap gap-2 text-sm text-gray-400 mt-1">
                            <span>${company.name}</span>
                            <span>•</span>
                            <span class="px-2 py-1 bg-blue-600 rounded-full text-xs">${update.category}</span>
                            <span>•</span>
                            <span>${update.timestamp}</span>
                            ${source ? `<span>•</span><span class="text-xs">${source}</span>` : ''}
                        </div>
                    </div>
                </div>
                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''} p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                        data-bookmark="${bookmarkKey}"
                        onclick="toggleBookmark('${update.id}', '${companyKey}')">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                </button>
            </div>
            <p class="text-gray-300 leading-relaxed">${update.excerpt}</p>
            <div class="mt-4 flex items-center justify-between">
                <div class="flex space-x-2">
                    <span class="px-3 py-1 bg-gray-700 rounded-full text-xs">${update.type}</span>
                </div>
                ${hasUrl ? `<a href="${update.url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Read Article →</a>` :
                           `<button class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors" onclick="expandCard(this)">Read More →</button>`}
            </div>
        </div>
    `;
}

function updateBookmarkStates() {
    document.querySelectorAll('[data-bookmark]').forEach(btn => {
        const bookmarkKey = btn.getAttribute('data-bookmark');
        if (bookmarkedItems.includes(bookmarkKey)) {
            btn.classList.add('bookmarked');
        }
    });
}

// Utility functions
function parseTimeString(timeStr) {
    const now = Date.now();
    const parts = timeStr.split(' ');
    const value = parseInt(parts[0]);
    const unit = parts[1];
    
    switch (unit) {
        case 'hour':
        case 'hours':
            return now - (value * 60 * 60 * 1000);
        case 'day':
        case 'days':
            return now - (value * 24 * 60 * 60 * 1000);
        default:
            return now;
    }
}

function filterByCompany(companyKey) {
    // Uncheck all checkboxes
    document.querySelectorAll('.company-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    // Check the selected company
    const companyCheckbox = document.querySelector(`input[value="${companyKey}"]`);
    if (companyCheckbox) {
        companyCheckbox.checked = true;
        currentFilters = [companyKey];
        updateFilterStyles();
        renderNewsFeed();
    }
    
    // Hide search results
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('searchInput').value = '';
}

function scrollToUpdate(companyKey, updateId) {
    filterByCompany(companyKey);
    
    setTimeout(() => {
        const updateElement = document.querySelector(`[data-update-id="${updateId}"]`);
        if (updateElement) {
            updateElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the element
            updateElement.style.background = 'rgba(59, 130, 246, 0.1)';
            setTimeout(() => {
                updateElement.style.background = '';
            }, 2000);
        }
    }, 100);
    
    // Hide search results
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('searchInput').value = '';
}

function expandCard(button) {
    const card = button.closest('.news-card');
    const isExpanded = card.classList.contains('expanded');
    
    if (isExpanded) {
        card.classList.remove('expanded');
        button.textContent = 'Read More →';
    } else {
        card.classList.add('expanded');
        button.textContent = 'Show Less ←';
    }
    
    // Animate the expansion
    anime({
        targets: card,
        scale: [1, 1.02, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// Event listeners
function setupEventListeners() {
    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        displayedItems += 12;
        renderNewsFeed();
        
        // Animate button
        anime({
            targets: this,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuart'
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'f':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
                case 'b':
                    e.preventDefault();
                    showBookmarks();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            // Close modals and clear search
            document.getElementById('bookmarkModal').classList.add('hidden');
            document.getElementById('searchResults').classList.add('hidden');
            document.getElementById('searchInput').blur();
        }
    });
}

// Initialize filter styles on load
setTimeout(() => {
    updateFilterStyles();
}, 100);