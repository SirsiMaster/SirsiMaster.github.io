// SirsiNexus UI Component Library
// Fix paths to be relative to root
const BASE_PATH = '';

class SirsiHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }

                .header {
                    background: var(--header-bg, #ffffff);
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(8px);
                }

                :host-context(.dark) .header {
                    background: rgba(31, 41, 55, 0.95);
                    border-color: #334155;
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .nav-content {
                    display: flex;
                    height: 4rem;
                    align-items: center;
                    justify-content: space-between;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .logo {
                    width: 3rem;
                    height: 3rem;
                    object-fit: contain;
                }

                .title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary, #1a1a1a);
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .nav-items {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                ::slotted(a) {
                    font-size: 0.875rem;
                    color: var(--text-secondary, #64748b);
                    text-decoration: none;
                    transition: color 0.2s;
                }

                ::slotted(a:hover) {
                    color: var(--text-primary, #1a1a1a);
                }

                :host-context(.dark) ::slotted(a) {
                    color: #94a3b8;
                }

                :host-context(.dark) ::slotted(a:hover) {
                    color: #f1f5f9;
                }

                .theme-toggle {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    color: var(--text-secondary, #64748b);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .theme-toggle:hover {
                    color: var(--text-primary, #1a1a1a);
                    background: var(--hover-bg, #f1f5f9);
                }

                :host-context(.dark) .theme-toggle:hover {
                    color: #f1f5f9;
                    background: #334155;
                }

                .version-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    background: var(--badge-bg, #f1f5f9);
                    border-radius: 0.25rem;
                    color: var(--text-secondary, #64748b);
                }

                :host-context(.dark) .version-badge {
                    background: #334155;
                    color: #94a3b8;
                }
            </style>

            <header class="header">
                <div class="container">
                    <nav class="nav-content">
                        <div class="logo-section">
<img src="/assets/images/Sirsi_Logo_300ppi_cguiyg.png" alt="Sirsi Logo" class="logo light-logo">
                            <img src="/assets/images/Sirsi_Logo_300ppi_Inverted_lt7asx.png" alt="Sirsi Logo" class="logo dark-logo" style="display: none;">
                            <div>
                                <h1 class="title">SirsiNexus</h1>
                                <span class="version-badge">v0.5.0-alpha</span>
                            </div>
                        </div>
                        <div class="nav-items">
                            <slot name="nav-items"></slot>
                            <button class="theme-toggle" onclick="window.toggleTheme()">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </nav>
                </div>
            </header>
        `;

        // Handle theme
        const darkLogo = this.shadowRoot.querySelector('.dark-logo');
        const lightLogo = this.shadowRoot.querySelector('.light-logo');
        
        const updateLogos = () => {
            const isDark = document.documentElement.classList.contains('dark');
            darkLogo.style.display = isDark ? 'block' : 'none';
            lightLogo.style.display = isDark ? 'none' : 'block';
        };

        // Initial update
        updateLogos();

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateLogos();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true
        });
    }
}

class SirsiFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                }

                .footer {
                    background: var(--footer-bg, #1a1a1a);
                    color: #ffffff;
                    padding: 3rem 0;
                    margin-top: 4rem;
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }

                .copyright {
                    text-align: center;
                    padding-top: 2rem;
                    margin-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-size: 0.875rem;
                }

                ::slotted(*) {
                    color: #ffffff;
                }
            </style>

            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <slot name="footer-content"></slot>
                    </div>
                    <div class="copyright">
                        © ${new Date().getFullYear()} SirsiNexus. All rights reserved.
                    </div>
                </div>
            </footer>
        `;
    }
}

class SirsiMetric extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'label'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const value = this.getAttribute('value');
        const label = this.getAttribute('label');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .metric {
                    background: var(--metric-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.3s;
                }

                :host-context(.dark) .metric {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .metric:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
                }

                :host-context(.dark) .metric:hover {
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }

                .value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--value-color, #16a34a);
                    margin-bottom: 0.5rem;
                }

                :host-context(.dark) .value {
                    color: #22c55e;
                }

                .label {
                    font-size: 0.875rem;
                    color: var(--label-color, #64748b);
                    font-weight: 500;
                }

                :host-context(.dark) .label {
                    color: #94a3b8;
                }
            </style>

            <div class="metric">
                <div class="value">${value}</div>
                <div class="label">${label}</div>
            </div>
        `;
    }
}

class SirsiChart extends HTMLElement {
    static get observedAttributes() {
        return ['title'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .chart-container {
                    background: var(--chart-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }

                :host-context(.dark) .chart-container {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--title-color, #1a1a1a);
                    margin-bottom: 1rem;
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .chart-content {
                    position: relative;
                    height: 400px;
                }
            </style>

            <div class="chart-container">
                <div class="title">${title}</div>
                <div class="chart-content">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

class SirsiFeature extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'description', 'icon'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title');
        const description = this.getAttribute('description');
        const icon = this.getAttribute('icon');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .feature {
                    background: var(--feature-bg, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }

                :host-context(.dark) .feature {
                    background: rgba(31, 41, 55, 0.5);
                    border-color: #334155;
                }

                .feature:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
                }

                :host-context(.dark) .feature:hover {
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }

                .icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--title-color, #1a1a1a);
                    margin-bottom: 0.5rem;
                }

                :host-context(.dark) .title {
                    color: #f1f5f9;
                }

                .description {
                    font-size: 0.875rem;
                    color: var(--description-color, #64748b);
                    line-height: 1.5;
                }

                :host-context(.dark) .description {
                    color: #94a3b8;
                }
            </style>

            <div class="feature">
                <div class="icon">${icon}</div>
                <div class="title">${title}</div>
                <div class="description">${description}</div>
            </div>
        `;
    }
}

/**
 * SirsiNexus UI Component Library
 * Provides consistent styling and components across all pages
 */

class UILibrary {
    constructor() {
        this.version = 'v0.5.0-alpha';
        this.init();
    }

    init() {
        this.injectStyles();
        this.setupComponents();
    }

    injectStyles() {
        const styles = `
            /* Professional Enterprise Styling */
            .sirsi-container {
                @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
            }

            .sirsi-card {
                @apply bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700;
            }

            .sirsi-stat {
                @apply flex flex-col p-4 bg-slate-50 dark:bg-slate-700 rounded-lg;
            }

            .sirsi-stat-value {
                @apply text-2xl font-bold text-primary-600 dark:text-primary-400;
            }

            .sirsi-stat-label {
                @apply text-sm text-slate-600 dark:text-slate-400;
            }

            .sirsi-grid {
                @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
            }

            .sirsi-section {
                @apply py-12;
            }

            .sirsi-heading-1 {
                @apply text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white;
            }

            .sirsi-heading-2 {
                @apply text-2xl md:text-3xl font-bold text-slate-900 dark:text-white;
            }

            .sirsi-text {
                @apply text-slate-600 dark:text-slate-400 leading-relaxed;
            }

            .sirsi-button {
                @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors;
            }

            .sirsi-button-primary {
                @apply sirsi-button bg-primary-600 text-white hover:bg-primary-700;
            }

            .sirsi-button-secondary {
                @apply sirsi-button bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600;
            }

            /* Chart Containers */
            .sirsi-chart-container {
                @apply sirsi-card overflow-hidden;
                min-height: 300px;
            }

            /* Feature List */
            .sirsi-feature-list {
                @apply space-y-4;
            }

            .sirsi-feature-item {
                @apply flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700;
            }

            .sirsi-feature-icon {
                @apply w-8 h-8 text-primary-600 dark:text-primary-400;
            }

            /* Timeline */
            .sirsi-timeline {
                @apply relative pl-8 space-y-8 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-200 dark:before:bg-primary-800;
            }

            .sirsi-timeline-item {
                @apply relative;
            }

            .sirsi-timeline-dot {
                @apply absolute -left-10 w-4 h-4 rounded-full bg-primary-600;
            }

            /* Table */
            .sirsi-table {
                @apply w-full text-left;
            }

            .sirsi-table th {
                @apply px-4 py-2 bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white;
            }

            .sirsi-table td {
                @apply px-4 py-2 border-t border-slate-200 dark:border-slate-700;
            }

            /* Metric Grid */
            .sirsi-metric-grid {
                @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
            }

            .sirsi-metric-card {
                @apply sirsi-card flex flex-col items-center text-center;
            }

            .sirsi-metric-value {
                @apply text-3xl font-bold text-primary-600 dark:text-primary-400;
            }

            .sirsi-metric-label {
                @apply text-sm text-slate-600 dark:text-slate-400 mt-1;
            }

            /* Alert/Callout */
            .sirsi-alert {
                @apply p-4 rounded-lg border;
            }

            .sirsi-alert-info {
                @apply sirsi-alert bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200;
            }

            .sirsi-alert-success {
                @apply sirsi-alert bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200;
            }

            /* Navigation */
            .sirsi-nav {
                @apply flex items-center space-x-4;
            }

            .sirsi-nav-item {
                @apply text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors;
            }

            /* Version Badge */
            .sirsi-version-badge {
                @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupComponents() {
        // Register custom elements
if (!customElements.get('sirsi-header')) customElements.define('sirsi-header', SirsiHeader);
        if (!customElements.get('sirsi-footer')) customElements.define('sirsi-footer', SirsiFooter);
        if (!customElements.get('sirsi-metric')) customElements.define('sirsi-metric', SirsiMetric);
        if (!customElements.get('sirsi-feature')) customElements.define('sirsi-feature', SirsiFeature);
        if (!customElements.get('sirsi-chart')) customElements.define('sirsi-chart', SirsiChart);
    }

    createHeader() {
        return class extends HTMLElement {
            connectedCallback() {
                this.innerHTML = `
                    <header class="bg-white dark:bg-gray-800/95 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
                        <div class="sirsi-container">
                            <div class="flex h-16 items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <img src="/assets/images/logo.svg" alt="SirsiNexus" class="h-8 w-auto">
                                    <div>
                                        <h1 class="text-lg font-semibold">SirsiNexus</h1>
                                        <div class="flex items-center gap-2">
                                            <span class="sirsi-version-badge">${this.version}</span>
                                        </div>
                                    </div>
                                </div>
                                <nav class="sirsi-nav">
                                    <slot name="nav-items"></slot>
                                </nav>
                            </div>
                        </div>
                    </header>
                `;
            }
        }
    }

    createFooter() {
        return class extends HTMLElement {
            connectedCallback() {
                this.innerHTML = `
                    <footer class="bg-slate-900 text-white py-12">
                        <div class="sirsi-container">
                            <div class="grid md:grid-cols-3 gap-8">
                                <div>
                                    <h3 class="text-lg font-semibold mb-4">SirsiNexus</h3>
                                    <p class="text-slate-400">AI-Powered Cloud Infrastructure</p>
                                </div>
                                <div>
                                    <slot name="footer-content"></slot>
                                </div>
                                <div class="text-sm text-slate-400">
                                    © 2025 Sirsi Technologies Inc. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            }
        }
    }

    createMetric() {
        return class extends HTMLElement {
            connectedCallback() {
                const value = this.getAttribute('value');
                const label = this.getAttribute('label');
                
                this.innerHTML = `
                    <div class="sirsi-metric-card">
                        <div class="sirsi-metric-value">${value}</div>
                        <div class="sirsi-metric-label">${label}</div>
                    </div>
                `;
            }
        }
    }

    createFeature() {
        return class extends HTMLElement {
            connectedCallback() {
                const title = this.getAttribute('title');
                const description = this.getAttribute('description');
                const icon = this.getAttribute('icon');

                this.innerHTML = `
                    <div class="sirsi-feature-item">
                        <div class="sirsi-feature-icon">${icon}</div>
                        <div>
                            <h3 class="font-semibold mb-1">${title}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${description}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    createChart() {
        return class extends HTMLElement {
            connectedCallback() {
                const title = this.getAttribute('title');
                
                this.innerHTML = `
                    <div class="sirsi-chart-container">
                        <h3 class="font-semibold mb-4">${title}</h3>
                        <div class="w-full h-full">
                            <slot></slot>
                        </div>
                    </div>
                `;
            }
        }
    }
}

// Initialize library
window.SirsiUI = new UILibrary();
