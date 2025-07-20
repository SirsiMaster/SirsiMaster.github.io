/**
 * Professional Admin Header Component for SirsiNexus
 * Enterprise-grade header with all requested features
 */

class AdminHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentTime = new Date();
        this.clockInterval = null;
    }

    connectedCallback() {
        this.render();
        this.initializeComponents();
    }

    disconnectedCallback() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }

    render() {
        const breadcrumbs = this.getAttribute('breadcrumbs') || 'Dashboard';
        const userEmail = this.getAttribute('user-email') || 'admin@sirsinexus.com';
        const userName = this.getAttribute('user-name') || 'Admin User';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                :host {
                    display: block;
                    width: 100%;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                /* Main Header Styles */
                .admin-header {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    border-bottom: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    position: relative;
                    z-index: 100;
                    transition: all 0.3s ease;
                }

                .dark .admin-header {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border-bottom-color: #334155;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }

                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                    min-height: 72px;
                }

                /* Logo and Title Section */
                .brand-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .company-logo {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 1.25rem;
                    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
                }

                .brand-info h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.2;
                    letter-spacing: -0.025em;
                }

                .dark .brand-info h1 {
                    color: #f8fafc;
                }

                .brand-info .subtitle {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                    font-weight: 500;
                }

                .dark .brand-info .subtitle {
                    color: #94a3b8;
                }

                /* Status and Clock Section */
                .status-section {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .system-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 20px;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-green 2s infinite;
                }

                @keyframes pulse-green {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .status-text {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #047857;
                }

                .dark .status-text {
                    color: #34d399;
                }

                .live-clock {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem 1rem;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 12px;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                .clock-time {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #4f46e5;
                    font-variant-numeric: tabular-nums;
                }

                .dark .clock-time {
                    color: #818cf8;
                }

                .clock-date {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dark .clock-date {
                    color: #94a3b8;
                }

                /* Control Section */
                .control-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .theme-toggle {
                    padding: 0.75rem;
                    background: rgba(107, 114, 128, 0.1);
                    border: 1px solid rgba(107, 114, 128, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .theme-toggle:hover {
                    background: rgba(107, 114, 128, 0.2);
                    transform: translateY(-1px);
                }

                .theme-toggle svg {
                    width: 20px;
                    height: 20px;
                    color: #6b7280;
                    transition: all 0.2s ease;
                }

                .dark .theme-toggle svg {
                    color: #94a3b8;
                }

                /* User Dropdown */
                .user-dropdown {
                    position: relative;
                }

                .user-button {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .user-button:hover {
                    background: rgba(59, 130, 246, 0.15);
                    transform: translateY(-1px);
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.125rem;
                }

                .user-name {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1f2937;
                    line-height: 1;
                }

                .dark .user-name {
                    color: #f8fafc;
                }

                .user-role {
                    font-size: 0.75rem;
                    color: #6b7280;
                    line-height: 1;
                }

                .dark .user-role {
                    color: #94a3b8;
                }

                .dropdown-arrow {
                    width: 16px;
                    height: 16px;
                    color: #6b7280;
                    transition: transform 0.2s ease;
                }

                .user-dropdown.open .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    min-width: 200px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                    z-index: 1000;
                }

                .dark .dropdown-menu {
                    background: #1e293b;
                    border-color: #374151;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }

                .user-dropdown.open .dropdown-menu {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #374151;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    border: none;
                    background: none;
                    width: 100%;
                    cursor: pointer;
                }

                .dark .dropdown-item {
                    color: #cbd5e1;
                }

                .dropdown-item:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                .dark .dropdown-item:hover {
                    background: #374151;
                    color: #f8fafc;
                }

                .dropdown-item:first-child {
                    border-radius: 12px 12px 0 0;
                }

                .dropdown-item:last-child {
                    border-radius: 0 0 12px 12px;
                }

                .dropdown-item.danger {
                    color: #dc2626;
                }

                .dropdown-item.danger:hover {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .dark .dropdown-item.danger {
                    color: #f87171;
                }

                .dark .dropdown-item.danger:hover {
                    background: #372c2c;
                    color: #f87171;
                }

                .dropdown-divider {
                    height: 1px;
                    background: #e5e7eb;
                    margin: 0.25rem 0;
                }

                .dark .dropdown-divider {
                    background: #374151;
                }

                /* Mobile Menu Toggle */
                .mobile-menu-toggle {
                    display: none;
                    padding: 0.75rem;
                    background: rgba(107, 114, 128, 0.1);
                    border: 1px solid rgba(107, 114, 128, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mobile-menu-toggle:hover {
                    background: rgba(107, 114, 128, 0.2);
                }

                .mobile-menu-toggle svg {
                    width: 20px;
                    height: 20px;
                    color: #6b7280;
                }

                .dark .mobile-menu-toggle svg {
                    color: #94a3b8;
                }

                /* Breadcrumb Navigation */
                .breadcrumb-section {
                    padding: 0.75rem 0;
                    border-top: 1px solid #f3f4f6;
                    background: rgba(249, 250, 251, 0.5);
                }

                .dark .breadcrumb-section {
                    border-top-color: #374151;
                    background: rgba(15, 23, 42, 0.5);
                }

                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }

                .breadcrumb-item {
                    color: #6b7280;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .dark .breadcrumb-item {
                    color: #94a3b8;
                }

                .breadcrumb-item:hover {
                    color: #374151;
                }

                .dark .breadcrumb-item:hover {
                    color: #f8fafc;
                }

                .breadcrumb-item.current {
                    color: #1f2937;
                    font-weight: 600;
                }

                .dark .breadcrumb-item.current {
                    color: #f8fafc;
                }

                .breadcrumb-separator {
                    color: #d1d5db;
                    font-weight: 400;
                }

                .dark .breadcrumb-separator {
                    color: #4b5563;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .header-container {
                        padding: 0 1rem;
                    }

                    .header-top {
                        flex-wrap: wrap;
                        gap: 1rem;
                    }

                    .status-section {
                        order: 3;
                        flex-basis: 100%;
                        justify-content: center;
                        gap: 1rem;
                    }

                    .mobile-menu-toggle {
                        display: flex;
                    }

                    .control-section {
                        gap: 0.5rem;
                    }

                    .user-info {
                        display: none;
                    }

                    .live-clock {
                        flex-direction: row;
                        gap: 0.5rem;
                    }

                    .brand-info h1 {
                        font-size: 1.25rem;
                    }

                    .company-logo {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .live-clock .clock-date {
                        display: none;
                    }

                    .system-status {
                        padding: 0.25rem 0.75rem;
                    }

                    .status-text {
                        font-size: 0.75rem;
                    }
                }
            </style>

            <header class="admin-header">
                <div class="header-container">
                    <div class="header-top">
                        <!-- Brand Section -->
                        <div class="brand-section">
                            <div class="company-logo">SN</div>
                            <div class="brand-info">
                                <h1>Admin Console</h1>
                                <p class="subtitle">SirsiNexus Management</p>
                            </div>
                        </div>

                        <!-- Status and Clock Section -->
                        <div class="status-section">
                            <div class="system-status">
                                <div class="status-dot"></div>
                                <span class="status-text">System Operational</span>
                            </div>
                            <div class="live-clock">
                                <div class="clock-time" id="clockTime">--:--:--</div>
                                <div class="clock-date" id="clockDate">Loading...</div>
                            </div>
                        </div>

                        <!-- Control Section -->
                        <div class="control-section">
                            <!-- Mobile Menu Toggle -->
                            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>

                            <!-- Theme Toggle -->
                            <button class="theme-toggle" data-theme-toggle>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </button>

                            <!-- User Dropdown -->
                            <div class="user-dropdown" id="userDropdown">
                                <button class="user-button" id="userButton">
                                    <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
                                    <div class="user-info">
                                        <div class="user-name">${userName}</div>
                                        <div class="user-role">Administrator</div>
                                    </div>
                                    <svg class="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" data-action="profile">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        Profile Settings
                                    </button>
                                    <button class="dropdown-item" data-action="preferences">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        Preferences
                                    </button>
                                    <div class="dropdown-divider"></div>
                                    <button class="dropdown-item" data-action="help">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Help & Support
                                    </button>
                                    <div class="dropdown-divider"></div>
                                    <button class="dropdown-item danger" data-action="logout">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Breadcrumb Navigation -->
                    <div class="breadcrumb-section">
                        <nav class="breadcrumb-nav" id="breadcrumbNav">
                            <a href="#" class="breadcrumb-item">Home</a>
                            <span class="breadcrumb-separator">›</span>
                            <span class="breadcrumb-item current">${breadcrumbs}</span>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    initializeComponents() {
        this.initializeClock();
        this.initializeUserDropdown();
        this.initializeMobileMenu();
        this.initializeThemeToggle();
    }

    initializeClock() {
        const updateClock = () => {
            const now = new Date();
            const timeElement = this.shadowRoot.getElementById('clockTime');
            const dateElement = this.shadowRoot.getElementById('clockDate');
            
            if (timeElement && dateElement) {
                const timeString = now.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                const dateString = now.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                timeElement.textContent = timeString;
                dateElement.textContent = dateString;
            }
        };

        // Update immediately
        updateClock();
        
        // Update every second
        this.clockInterval = setInterval(updateClock, 1000);
    }

    initializeUserDropdown() {
        const dropdown = this.shadowRoot.getElementById('userDropdown');
        const button = this.shadowRoot.getElementById('userButton');
        
        if (dropdown && button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });

            // Handle dropdown actions
            const dropdownItems = this.shadowRoot.querySelectorAll('.dropdown-item[data-action]');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = e.currentTarget.getAttribute('data-action');
                    this.handleDropdownAction(action);
                    dropdown.classList.remove('open');
                });
            });
        }
    }

    initializeMobileMenu() {
        const mobileToggle = this.shadowRoot.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('mobile-menu-toggle', {
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }

    initializeThemeToggle() {
        const themeToggle = this.shadowRoot.querySelector('[data-theme-toggle]');
        if (themeToggle && window.toggleTheme) {
            themeToggle.addEventListener('click', () => {
                window.toggleTheme();
            });
        }
    }

    handleDropdownAction(action) {
        const event = new CustomEvent('admin-action', {
            bubbles: true,
            composed: true,
            detail: { action }
        });
        
        this.dispatchEvent(event);
        
        // Handle specific actions
        switch (action) {
            case 'logout':
                if (confirm('Are you sure you want to sign out?')) {
                    this.dispatchEvent(new CustomEvent('logout', {
                        bubbles: true,
                        composed: true
                    }));
                }
                break;
            case 'profile':
                console.log('Opening profile settings...');
                break;
            case 'preferences':
                console.log('Opening preferences...');
                break;
            case 'help':
                console.log('Opening help & support...');
                break;
        }
    }

    // Public method to update breadcrumbs
    updateBreadcrumbs(breadcrumbsArray) {
        const breadcrumbNav = this.shadowRoot.getElementById('breadcrumbNav');
        if (breadcrumbNav) {
            const breadcrumbHTML = breadcrumbsArray.map((crumb, index) => {
                const isLast = index === breadcrumbsArray.length - 1;
                if (isLast) {
                    return `<span class="breadcrumb-item current">${crumb.text}</span>`;
                } else {
                    return `<a href="${crumb.href || '#'}" class="breadcrumb-item">${crumb.text}</a><span class="breadcrumb-separator">›</span>`;
                }
            }).join('');
            
            breadcrumbNav.innerHTML = breadcrumbHTML;
        }
    }

    // Public method to update system status
    updateSystemStatus(status, text) {
        const statusElement = this.shadowRoot.querySelector('.system-status');
        const statusDot = this.shadowRoot.querySelector('.status-dot');
        const statusText = this.shadowRoot.querySelector('.status-text');
        
        if (statusElement && statusDot && statusText) {
            statusText.textContent = text;
            
            // Update colors based on status
            statusElement.style.background = status === 'operational' 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)';
            statusElement.style.borderColor = status === 'operational' 
                ? 'rgba(16, 185, 129, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)';
            statusDot.style.background = status === 'operational' 
                ? '#10b981' 
                : '#ef4444';
            statusText.style.color = status === 'operational' 
                ? '#047857' 
                : '#dc2626';
        }
    }
}

// Define the custom element
customElements.define('admin-header', AdminHeader);
