// SirsiNexus Configuration

const SIRSI_CONFIG = {
    // Base path for GitHub Pages
    basePath: '/SirsiNexus',
    
    // Asset paths
    paths: {
        components: '/SirsiNexus/components',
        assets: '/SirsiNexus/assets',
        styles: '/SirsiNexus/assets/css',
        images: '/SirsiNexus/assets/images',
        js: '/SirsiNexus/assets/js'
    },
    
    // Theme configuration
    theme: {
        light: {
            primary: '#22c55e',
            secondary: '#64748b',
            background: '#ffffff',
            text: '#374151'
        },
        dark: {
            primary: '#4ade80',
            secondary: '#94a3b8',
            background: '#1e293b',
            text: '#f1f5f9'
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SIRSI_CONFIG;
}
