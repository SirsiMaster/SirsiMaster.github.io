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
                    <li><a href="/sirsinexusportal/admin/">Dashboard</a></li>
                    <li><a href="/sirsinexusportal/admin/dashboard/analytics.html">Analytics</a></li>
                    <li><a href="/sirsinexusportal/admin/dashboard/analytics-advanced.html">Advanced Analytics</a></li>
                    <li><a href="/sirsinexusportal/admin/dashboard/telemetry.html">Telemetry</a></li>
                    <li><a href="/sirsinexusportal/admin/dashboard/system-logs.html">System Logs</a></li>
                    <li><a href="/sirsinexusportal/admin/users/">User Management</a></li>
                    <li><a href="/sirsinexusportal/admin/security/">Security</a></li>
                    <li><a href="/sirsinexusportal/admin/security/monitoring.html">Monitoring</a></li>
                    <li><a href="/sirsinexusportal/admin/data-room.html">Data Room</a></li>
                    <li><a href="/sirsinexusportal/admin/site-settings.html">Site Settings</a></li>
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
