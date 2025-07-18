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
    }

    /**
     * Get the appropriate back URL based on current path
     */
    getBackUrl() {
        const path = this.currentPath;
        const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
        
        // Root level - no back button needed
        if (pathSegments.length === 0 || path === '/index.html') {
            return null;
        }
        
        // First level (e.g., /investor-portal/index.html)
        if (pathSegments.length === 1 || 
            (pathSegments.length === 2 && pathSegments[1] === 'index.html')) {
            return '/index.html';
        }
        
        // Second level (e.g., /investor-portal/committee/index.html)
        if (pathSegments.length === 2 || 
            (pathSegments.length === 3 && pathSegments[2] === 'index.html')) {
            return `/${pathSegments[0]}/index.html`;
        }
        
        // Third level and beyond (e.g., /investor-portal/committee/kpi-metrics.html)
        if (pathSegments.length >= 3) {
            return `/${pathSegments[0]}/${pathSegments[1]}/index.html`;
        }
        
        return '/index.html';
    }

    /**
     * Get breadcrumb information for current page
     */
    getBreadcrumb() {
        const path = this.currentPath;
        const pathSegments = path.split('/').filter(segment => segment && segment !== 'index.html');
        
        const breadcrumb = [];
        
        // Always include home
        breadcrumb.push({ name: 'Home', url: '/index.html' });
        
        // Add intermediate segments
        if (pathSegments.length >= 1) {
            if (pathSegments[0] === 'investor-portal') {
                breadcrumb.push({ name: 'Investor Portal', url: '/investor-portal/index.html' });
            }
            
            if (pathSegments.length >= 2) {
                if (pathSegments[1] === 'committee') {
                    breadcrumb.push({ name: 'Committee', url: '/investor-portal/committee/index.html' });
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
                
                <div class="flex items-center gap-4 ml-auto">
                    <button onclick="logout()" class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors">
                        Logout
                    </button>
                    <button onclick="toggleTheme()" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-600" style="min-width: 40px; min-height: 40px;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
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
        window.location.href = '/investor-login.html';
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
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universalNav = new UniversalNavigation();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalNavigation;
}
