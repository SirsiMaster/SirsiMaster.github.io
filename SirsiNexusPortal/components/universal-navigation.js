/**
 * Universal Navigation Component
 * Provides consistent navigation across all pages with smart back button functionality
 */

class UniversalNavigation {
    constructor() {
        this.currentPath = window.location.pathname;
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupBackNavigation();
        this.bindEvents();
        this.setupSearch();
    }

    /**
     * Get the appropriate back URL based on current path
     */
    getBackUrl() {
        const path = this.currentPath;
        const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
        
        // Root level - no back button needed
        if (pathSegments.length === 0 || path === '/SirsiNexusPortal/index.html') {
            return null;
        }
        
        // First level (e.g., /SirsiNexusPortal/investor-portal/index.html)
        if (pathSegments.length === 1 || 
            (pathSegments.length === 2 && pathSegments[1] === 'index.html')) {
            return '/SirsiNexusPortal/index.html';
        }
        
        // Second level (e.g., /SirsiNexusPortal/investor-portal/committee/index.html)
        if (pathSegments.length === 2 || 
            (pathSegments.length === 3 && pathSegments[2] === 'index.html')) {
            return `/SirsiNexusPortal/${pathSegments[0]}/index.html`;
        }
        
        // Third level and beyond (e.g., /SirsiNexusPortal/investor-portal/committee/kpi-metrics.html)
        if (pathSegments.length >= 3) {
            return `/SirsiNexusPortal/${pathSegments[0]}/${pathSegments[1]}/index.html`;
        }
        
        return '/SirsiNexusPortal/index.html';
    }

    /**
     * Get breadcrumb information for current page
     */
    getBreadcrumb() {
        const path = this.currentPath;
        const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
        
        const breadcrumb = [];
        
        // Always include home
        breadcrumb.push({ name: 'Home', url: '/SirsiNexusPortal/index.html' });
        
        // Add intermediate segments
        if (pathSegments.length >= 1) {
            if (pathSegments[0] === 'investor-portal') {
                breadcrumb.push({ name: 'Investor Portal', url: '/SirsiNexusPortal/investor-portal/index.html' });
            }
            
            if (pathSegments.length >= 2) {
                if (pathSegments[1] === 'committee') {
                    breadcrumb.push({ name: 'Committee', url: '/SirsiNexusPortal/investor-portal/committee/index.html' });
                }
            }
        }
        
        return breadcrumb;
    }

    /**
     * Render navigation HTML
     */
    renderNavigation() {
        const backUrl = this.getBackUrl();
        const breadcrumb = this.getBreadcrumb();
        
        return `
            <nav class="flex items-center gap-4">
                ${backUrl ? `
                    <a href="${backUrl}" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                ` : ''}
                
                <!-- Breadcrumb -->
                <div class="flex items-center gap-2">
                    ${breadcrumb.map((item, index) => `
                        <a href="${item.url}" class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                            ${item.name}
                        </a>
                        ${index < breadcrumb.length - 1 ? '<span class="text-slate-400 dark:text-slate-600">/</span>' : ''}
                    `).join('')}
                </div>
                
                <!-- Universal Search Bar -->
                <div class="flex-1 max-w-xl mx-4">
                    <div class="relative">
                        <input 
                            type="text" 
                            id="universal-search" 
                            placeholder="Search documents, metrics, users..." 
                            class="w-full px-4 py-2 pl-10 pr-4 text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <kbd class="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded">⌘K</kbd>
                    </div>
                    <!-- Search Results Dropdown -->
                    <div id="search-results" class="absolute mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 hidden max-h-96 overflow-y-auto z-50">
                        <!-- Results will be populated here -->
                    </div>
                </div>
                
                <div class="flex items-center gap-4 ml-auto">
                    <button onclick="logout()" class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors">
                        Logout
                    </button>
                    <button onclick="toggleTheme()" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-600" style="min-width: 40px; min-height: 40px;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 818 0z"></path>
                        </svg>
                    </button>
                </div>
            </nav>
        `;
    }

    /**
     * Setup theme functionality
     */
    setupTheme() {
        const theme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    /**
     * Setup back navigation functionality
     */
    setupBackNavigation() {
        // Add keyboard shortcut for back navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft')) {
                const backUrl = this.getBackUrl();
                if (backUrl) {
                    window.location.href = backUrl;
                }
            }
        });
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Make functions available globally
        window.toggleTheme = this.toggleTheme.bind(this);
        window.logout = this.logout.bind(this);
        window.goBack = this.goBack.bind(this);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        
        if (wasDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    /**
     * Logout functionality
     */
    logout() {
        sessionStorage.removeItem('investorAuth');
        localStorage.removeItem('investor-authenticated');
        localStorage.removeItem('investor-id');
        localStorage.removeItem('user-role');
        window.location.href = '/SirsiNexusPortal/investor-login.html';
    }

    /**
     * Go back one level
     */
    goBack() {
        const backUrl = this.getBackUrl();
        if (backUrl) {
            window.location.href = backUrl;
        }
    }

    /**
     * Setup universal search functionality
     */
    setupSearch() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const searchInput = document.getElementById('universal-search');
            const searchResults = document.getElementById('search-results');
            
            if (!searchInput || !searchResults) return;

            // Sample data for search (in production, this would come from an API)
            const searchData = [
                // Documents
                { type: 'document', title: 'Annual Report 2023', path: '/documents/annual-report-2023.pdf', icon: '📄' },
                { type: 'document', title: 'Investment Prospectus', path: '/documents/investment-prospectus.pdf', icon: '📄' },
                { type: 'document', title: 'Portfolio Performance Q4', path: '/documents/portfolio-q4.pdf', icon: '📄' },
                { type: 'document', title: 'Risk Assessment Report', path: '/documents/risk-assessment.pdf', icon: '📄' },
                
                // Metrics & Analytics
                { type: 'metric', title: 'Portfolio Performance', path: '/investor-portal/portfolio-overview.html', icon: '📊' },
                { type: 'metric', title: 'KPI Metrics', path: '/investor-portal/committee/kpi-metrics.html', icon: '📈' },
                { type: 'metric', title: 'Market Analysis', path: '/investor-portal/market-analysis.html', icon: '📉' },
                { type: 'metric', title: 'ROI Dashboard', path: '/investor-portal/roi-dashboard.html', icon: '💹' },
                
                // Users & Committee
                { type: 'user', title: 'John Smith - Committee Chair', path: '/investor-portal/committee/members.html', icon: '👤' },
                { type: 'user', title: 'Sarah Johnson - Investment Director', path: '/investor-portal/committee/members.html', icon: '👤' },
                { type: 'user', title: 'Michael Brown - Risk Manager', path: '/investor-portal/committee/members.html', icon: '👤' },
                
                // Pages
                { type: 'page', title: 'Committee Dashboard', path: '/investor-portal/committee/index.html', icon: '🏢' },
                { type: 'page', title: 'Data Room', path: '/investor-portal/data-room.html', icon: '🗄️' },
                { type: 'page', title: 'Company Updates', path: '/investor-portal/company-updates.html', icon: '📰' },
                { type: 'page', title: 'Investor Relations', path: '/investor-portal/investor-relations.html', icon: '🤝' }
            ];

            let searchTimeout;
            let selectedIndex = -1;

            // Search function
            const performSearch = (query) => {
                if (!query.trim()) {
                    searchResults.classList.add('hidden');
                    return;
                }

                const results = searchData.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase())
                );

                if (results.length === 0) {
                    searchResults.innerHTML = `
                        <div class="p-4 text-sm text-gray-500 dark:text-gray-400">
                            No results found for "${query}"
                        </div>
                    `;
                } else {
                    searchResults.innerHTML = results.map((item, index) => `
                        <a href="${item.path}" 
                           class="search-result-item block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${index === selectedIndex ? 'bg-gray-50 dark:bg-slate-700' : ''}"
                           data-index="${index}">
                            <div class="flex items-center gap-3">
                                <span class="text-lg">${item.icon}</span>
                                <div>
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${item.title}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
                                </div>
                            </div>
                        </a>
                    `).join('');
                }

                searchResults.classList.remove('hidden');
                selectedIndex = -1;
            };

            // Input event handler
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => performSearch(e.target.value), 200);
            });

            // Keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                const items = searchResults.querySelectorAll('.search-result-item');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    updateSelection(items);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    updateSelection(items);
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    items[selectedIndex].click();
                } else if (e.key === 'Escape') {
                    searchInput.value = '';
                    searchResults.classList.add('hidden');
                    searchInput.blur();
                }
            });

            // Update visual selection
            const updateSelection = (items) => {
                items.forEach((item, index) => {
                    if (index === selectedIndex) {
                        item.classList.add('bg-gray-50', 'dark:bg-slate-700');
                    } else {
                        item.classList.remove('bg-gray-50', 'dark:bg-slate-700');
                    }
                });
            };

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.add('hidden');
                }
            });

            // Global keyboard shortcut (Cmd/Ctrl + K)
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            });
        }, 100);
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universalNav = new UniversalNavigation();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalNavigation;
}
