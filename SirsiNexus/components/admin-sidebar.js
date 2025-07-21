// Admin Sidebar Component - Stub implementation
class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        console.log('AdminSidebar component initialized');
    }
    
    connectedCallback() {
        // Component is connected to DOM
        this.renderSidebar();
    }

    renderSidebar() {
        this.innerHTML = `
            <nav class="sidebar">
                <ul>
                    <li><a href="admin-dashboard.html">Dashboard</a></li>
                    <li><a href="advanced-analytics-dashboard.html">Advanced Analytics</a></li> <!-- New link -->
                    <li><a href="settings.html">Settings</a></li>
                </ul>
            </nav>
        `;
    }
    openMobileSidebar() {
        console.log('Opening mobile sidebar');
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.add('open');
        }
    }
}

// Register the custom element
customElements.define('admin-sidebar', AdminSidebar);
