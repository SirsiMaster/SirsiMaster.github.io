// SirsiNexus - Clean Theme Toggle Implementation
// Fresh implementation to prevent conflicts and ensure reliable operation

(function() {
    'use strict';
    
    // Simple theme toggle function - adds/removes 'dark' class on html element
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        
        // Update theme toggle button icon
        updateThemeIcon(!isDark);
    }
    
    // Update the theme toggle button icon based on current theme
    function updateThemeIcon(isDark) {
        const themeButtons = document.querySelectorAll('[data-theme-toggle]');
        themeButtons.forEach(button => {
            const svg = button.querySelector('svg');
            if (svg) {
                if (isDark) {
                    // Moon icon for dark mode
                    svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
                } else {
                    // Sun icon for light mode  
                    svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
                }
            }
        });
    }
    
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        
        document.documentElement.classList.toggle('dark', shouldBeDark);
        updateThemeIcon(shouldBeDark);
    }
    
    // Make toggle function globally available
    window.toggleTheme = toggleTheme;
    
    // Initialize theme immediately to prevent flash
    initTheme();
    
    // Re-initialize when DOM is ready and set up event listeners
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        
        // Add click handlers to all theme toggle buttons
        const themeButtons = document.querySelectorAll('[data-theme-toggle]');
        themeButtons.forEach(button => {
            button.addEventListener('click', toggleTheme);
        });
    });
    
})();
