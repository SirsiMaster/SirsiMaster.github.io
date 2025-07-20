/**
 * Admin Sidebar Navigation Component
 * Provides comprehensive navigation with sections, icons, active states, and mobile collapsible functionality
 */

class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        this.isCollapsed = false;
        this.isMobile = window.innerWidth < 768;
        this.currentPath = window.location.pathname;
        
        // Navigation sections configuration
        this.navigationSections = [
            {
                id: 'dashboard',
                title: 'Dashboard',
                href: '/SirsiNexus/admin-dashboard.html',
                icon: this.getDashboardIcon(),
                active: false
            },
            {
                id: 'analytics',
                title: 'Analytics',
                href: '/SirsiNexus/analytics-dashboard.html',
                icon: this.getAnalyticsIcon(),
                active: false,
                badge: 'LIVE'
            },
            {
                id: 'qr-manager',
                title: 'QR Code Manager',
                href: '/SirsiNexus/qr-code-manager.html',
                icon: this.getQRIcon(),
                active: false,
                badge: 'NEW'
            },
            {
                id: 'user-management',
                title: 'User Management',
                href: '/SirsiNexus/admin/users.html',
                icon: this.getUsersIcon(),
                active: false
            },
            {
                id: 'data-room',
                title: 'Data Room',
                href: '/SirsiNexus/admin/data-room.html',
                icon: this.getFolderIcon(),
                active: false
            },
            {
                id: 'telemetry',
                title: 'Telemetry',
                href: '/SirsiNexus/admin/telemetry.html',
                icon: this.getChartIcon(),
                active: false
            },
            {
                id: 'site-admin',
                title: 'Site Admin',
                href: '/SirsiNexus/admin/site-admin.html',
                icon: this.getCogIcon(),
                active: false
            },
            {
                id: 'security',
                title: 'Security',
                href: '/SirsiNexus/admin/security.html',
                icon: this.getShieldIcon(),
                active: false
            },
            {
                id: 'monitoring',
                title: 'System Monitoring',
                href: '/SirsiNexus/admin/monitoring.html',
                icon: this.getMonitoringIcon(),
                active: false,
                badge: 'LIVE'
            },
            {
                id: 'system-logs',
                title: 'System Logs',
                href: '/SirsiNexus/admin/logs.html',
                icon: this.getDocumentIcon(),
                active: false
            }
        ];

        this.init();
    }

    init() {
        this.setActiveState();
        this.render();
        this.bindEvents();
        this.handleResize();
    }

    setActiveState() {
        this.navigationSections.forEach(section => {
            section.active = this.currentPath.includes(section.href) || 
                           (section.id === 'dashboard' && this.currentPath.includes('admin-dashboard.html'));
        });
    }

    // Line art SVG icons
    getDashboardIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>`;
    }
    
    getAnalyticsIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 3v18h18"></path>
            <path d="M18.7 8l-5-5L9 7.7l-4.7-2"></path>
            <circle cx="18" cy="8" r="2"></circle>
            <circle cx="9" cy="8" r="2"></circle>
            <circle cx="5" cy="6" r="2"></circle>
        </svg>`;
    }

    getUsersIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
        </svg>`;
    }

    getFolderIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
        </svg>`;
    }

    getChartIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 20V10"></path>
            <path d="M12 20V4"></path>
            <path d="M6 20v-6"></path>
        </svg>`;
    }

    getCogIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
        </svg>`;
    }

    getShieldIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>`;
    }

    getDocumentIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
        </svg>`;
    }

    getQRIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="6" y="6" width="1" height="1" fill="currentColor"></rect>
            <rect x="17" y="6" width="1" height="1" fill="currentColor"></rect>
            <rect x="17" y="17" width="1" height="1" fill="currentColor"></rect>
            <rect x="3" y="14" width="1" height="1" fill="currentColor"></rect>
            <rect x="5" y="12" width="1" height="1" fill="currentColor"></rect>
            <rect x="7" y="14" width="1" height="1" fill="currentColor"></rect>
            <rect x="9" y="12" width="1" height="1" fill="currentColor"></rect>
            <rect x="11" y="14" width="1" height="1" fill="currentColor"></rect>
        </svg>`;
    }

    getMonitoringIcon() {
        return `<svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <path d="M7 8l3 3-3 3"></path>
            <path d="M14 8h3"></path>
        </svg>`;
    }

    getCollapseIcon() {
        return `<svg class="sidebar-collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="15,18 9,12 15,6"></polyline>
        </svg>`;
    }

    getExpandIcon() {
        return `<svg class="sidebar-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="9,18 15,12 9,6"></polyline>
        </svg>`;
    }

    render() {
        this.innerHTML = `
            <aside class="admin-sidebar ${this.isCollapsed ? 'collapsed' : ''} ${this.isMobile ? 'mobile' : ''}">
                <!-- Sidebar Header -->
                <div class="sidebar-header">
                    <div class="sidebar-brand">
                        <div class="brand-icon">SN</div>
                        <span class="brand-text">SirsiNexus Admin</span>
                    </div>
                    <button class="sidebar-toggle" aria-label="Toggle Sidebar">
                        ${this.isCollapsed ? this.getExpandIcon() : this.getCollapseIcon()}
                    </button>
                </div>

                <!-- Navigation Menu -->
                <nav class="sidebar-nav">
                    <ul class="nav-list">
                        ${this.navigationSections.map(section => `
                            <li class="nav-item ${section.active ? 'active' : ''}">
                                <a href="${section.href}" class="nav-link" data-section="${section.id}">
                                    <span class="nav-icon">${section.icon}</span>
                                    <span class="nav-text">
                                        ${section.title}
                                        ${section.badge ? `<span class="nav-badge">${section.badge}</span>` : ''}
                                    </span>
                                    ${section.active ? '<span class="active-indicator"></span>' : ''}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </nav>

                <!-- Sidebar Footer -->
                <div class="sidebar-footer">
                    <button class="logout-btn" onclick="this.logout()">
                        <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span class="logout-text">Logout</span>
                    </button>
                </div>

                <!-- Mobile Overlay -->
                <div class="mobile-overlay" onclick="this.closeMobileSidebar()"></div>
            </aside>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('admin-sidebar-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'admin-sidebar-styles';
        styles.textContent = `
            .admin-sidebar {
                position: fixed;
                top: 0;
                left: 0;
                width: 280px;
                height: 100vh;
                background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                border-right: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }

            .dark .admin-sidebar {
                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
                border-right-color: #334155;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .admin-sidebar.collapsed {
                width: 80px;
            }

            /* Sidebar Header */
            .sidebar-header {
                padding: 1.5rem 1.25rem;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 80px;
            }

            .dark .sidebar-header {
                border-bottom-color: #334155;
            }

            .sidebar-brand {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
                min-width: 0;
            }

            .brand-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.875rem;
                letter-spacing: -0.025em;
                flex-shrink: 0;
            }

            .brand-text {
                font-weight: 700;
                font-size: 1.125rem;
                color: #1e293b;
                white-space: nowrap;
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            .dark .brand-text {
                color: #f1f5f9;
            }

            .admin-sidebar.collapsed .brand-text {
                opacity: 0;
                pointer-events: none;
            }

            .sidebar-toggle {
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #64748b;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .sidebar-toggle:hover {
                background: #f1f5f9;
                color: #334155;
            }

            .dark .sidebar-toggle:hover {
                background: #334155;
                color: #cbd5e1;
            }

            .sidebar-collapse-icon,
            .sidebar-expand-icon {
                width: 18px;
                height: 18px;
            }

            /* Navigation */
            .sidebar-nav {
                flex: 1;
                overflow-y: auto;
                padding: 1rem 0;
            }

            .nav-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .nav-item {
                margin: 0.25rem 0;
                position: relative;
            }

            .nav-link {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.875rem 1.25rem;
                text-decoration: none;
                color: #64748b;
                font-weight: 500;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                border-radius: 0;
                position: relative;
                min-height: 48px;
            }

            .nav-link:hover {
                background: linear-gradient(90deg, #f1f5f9 0%, transparent 100%);
                color: #334155;
            }

            .dark .nav-link {
                color: #94a3b8;
            }

            .dark .nav-link:hover {
                background: linear-gradient(90deg, #334155 0%, transparent 100%);
                color: #e2e8f0;
            }

            .nav-item.active .nav-link {
                background: linear-gradient(90deg, #ecfdf5 0%, transparent 100%);
                color: #059669;
                font-weight: 600;
            }

            .dark .nav-item.active .nav-link {
                background: linear-gradient(90deg, #064e3b 0%, transparent 100%);
                color: #34d399;
            }

            .nav-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .sidebar-icon {
                width: 20px;
                height: 20px;
            }

            .nav-text {
                flex: 1;
                white-space: nowrap;
                opacity: 1;
                transition: opacity 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .admin-sidebar.collapsed .nav-text {
                opacity: 0;
                pointer-events: none;
            }
            
            .nav-badge {
                background: linear-gradient(135deg, #dc2626, #ef4444);
                color: white;
                font-size: 0.6rem;
                font-weight: 700;
                padding: 0.125rem 0.375rem;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                animation: pulse-glow 2s infinite;
            }
            
            @keyframes pulse-glow {
                0%, 100% {
                    opacity: 1;
                    box-shadow: 0 0 6px rgba(220, 38, 38, 0.5);
                }
                50% {
                    opacity: 0.8;
                    box-shadow: 0 0 12px rgba(220, 38, 38, 0.8);
                }
            }

            .active-indicator {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 24px;
                background: #059669;
                border-radius: 2px 0 0 2px;
            }

            .dark .active-indicator {
                background: #34d399;
            }

            .admin-sidebar.collapsed .active-indicator {
                right: auto;
                left: 4px;
                width: 24px;
                height: 3px;
                border-radius: 2px;
            }

            /* Sidebar Footer */
            .sidebar-footer {
                padding: 1rem 1.25rem;
                border-top: 1px solid #e2e8f0;
            }

            .dark .sidebar-footer {
                border-top-color: #334155;
            }

            .logout-btn {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                width: 100%;
                padding: 0.875rem;
                background: transparent;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                color: #64748b;
                font-weight: 500;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .logout-btn:hover {
                background: #fee2e2;
                border-color: #fecaca;
                color: #dc2626;
            }

            .dark .logout-btn {
                border-color: #334155;
                color: #94a3b8;
            }

            .dark .logout-btn:hover {
                background: #7f1d1d;
                border-color: #991b1b;
                color: #fca5a5;
            }

            .logout-icon {
                width: 18px;
                height: 18px;
            }

            .logout-text {
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            .admin-sidebar.collapsed .logout-text {
                opacity: 0;
                pointer-events: none;
            }

            /* Mobile Styles */
            @media (max-width: 768px) {
                .admin-sidebar {
                    transform: translateX(-100%);
                    width: 280px;
                }

                .admin-sidebar.mobile-open {
                    transform: translateX(0);
                }

                .mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 999;
                }

                .admin-sidebar.mobile-open .mobile-overlay {
                    opacity: 1;
                    pointer-events: all;
                }
            }

            /* Content adjustment */
            .sidebar-content {
                margin-left: 280px;
                transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .admin-sidebar.collapsed ~ .sidebar-content {
                margin-left: 80px;
            }

            @media (max-width: 768px) {
                .sidebar-content {
                    margin-left: 0;
                }
            }

            /* Scrollbar Styling */
            .sidebar-nav::-webkit-scrollbar {
                width: 4px;
            }

            .sidebar-nav::-webkit-scrollbar-track {
                background: transparent;
            }

            .sidebar-nav::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 2px;
            }

            .dark .sidebar-nav::-webkit-scrollbar-thumb {
                background: #475569;
            }

            .sidebar-nav::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }

            .dark .sidebar-nav::-webkit-scrollbar-thumb:hover {
                background: #64748b;
            }
        `;

        document.head.appendChild(styles);
    }

    bindEvents() {
        // Toggle sidebar
        const toggleBtn = this.querySelector('.sidebar-toggle');
        toggleBtn?.addEventListener('click', () => this.toggleSidebar());

        // Logout functionality
        const logoutBtn = this.querySelector('.logout-btn');
        logoutBtn?.addEventListener('click', () => this.logout());

        // Handle navigation clicks
        const navLinks = this.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Handle mobile overlay
        const overlay = this.querySelector('.mobile-overlay');
        overlay?.addEventListener('click', () => this.closeMobileSidebar());

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (wasMobile !== this.isMobile) {
            this.classList.toggle('mobile', this.isMobile);
            if (!this.isMobile) {
                this.classList.remove('mobile-open');
            }
        }
    }

    toggleSidebar() {
        if (this.isMobile) {
            this.classList.toggle('mobile-open');
        } else {
            this.isCollapsed = !this.isCollapsed;
            this.classList.toggle('collapsed', this.isCollapsed);
            
            // Update toggle icon
            const toggleBtn = this.querySelector('.sidebar-toggle');
            toggleBtn.innerHTML = this.isCollapsed ? this.getExpandIcon() : this.getCollapseIcon();
            
            // Save state
            localStorage.setItem('admin-sidebar-collapsed', this.isCollapsed.toString());
        }

        // Dispatch event for other components to adjust
        this.dispatchEvent(new CustomEvent('sidebar-toggle', {
            detail: { collapsed: this.isCollapsed, mobile: this.isMobile },
            bubbles: true
        }));
    }

    closeMobileSidebar() {
        if (this.isMobile) {
            this.classList.remove('mobile-open');
        }
    }

    handleNavigation(e) {
        const link = e.currentTarget;
        const sectionId = link.dataset.section;
        
        // Update active state
        this.navigationSections.forEach(section => {
            section.active = section.id === sectionId;
        });
        
        // Update UI
        this.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        link.closest('.nav-item').classList.add('active');
        
        // Close mobile sidebar on navigation
        if (this.isMobile) {
            this.closeMobileSidebar();
        }

        // Dispatch navigation event
        this.dispatchEvent(new CustomEvent('sidebar-navigation', {
            detail: { sectionId, href: link.href },
            bubbles: true
        }));
    }

    logout() {
        // Clear authentication data
        sessionStorage.removeItem('investorAuth');
        localStorage.removeItem('investor-authenticated');
        localStorage.removeItem('investor-id');
        localStorage.removeItem('user-role');
        localStorage.removeItem('admin-sidebar-collapsed');
        
        // Dispatch logout event
        this.dispatchEvent(new CustomEvent('admin-logout', {
            bubbles: true
        }));
        
        // Redirect to login
        window.location.href = '/SirsiNexus/investor-login.html';
    }

    // Public API methods
    setActiveSection(sectionId) {
        this.navigationSections.forEach(section => {
            section.active = section.id === sectionId;
        });
        
        this.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeItem = this.querySelector(`[data-section="${sectionId}"]`)?.closest('.nav-item');
        activeItem?.classList.add('active');
    }

    openMobileSidebar() {
        if (this.isMobile) {
            this.classList.add('mobile-open');
        }
    }

    connectedCallback() {
        // Restore collapsed state
        const savedState = localStorage.getItem('admin-sidebar-collapsed');
        if (savedState !== null) {
            this.isCollapsed = savedState === 'true';
            this.classList.toggle('collapsed', this.isCollapsed);
        }
    }
}

// Register the custom element
customElements.define('admin-sidebar', AdminSidebar);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSidebar;
}
