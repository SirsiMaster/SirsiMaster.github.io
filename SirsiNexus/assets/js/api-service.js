/**
 * SirsiNexus API Service
 * Comprehensive API integration layer with authentication, error handling, and caching
 * @version 1.0.0
 */

class APIService {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
        this.defaultTimeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        // Initialize request interceptors
        this.interceptors = {
            request: [],
            response: [],
            error: []
        };
        
        this.setupDefaults();
    }

    /**
     * Setup default configurations
     */
    setupDefaults() {
        // Add auth token to all requests
        this.addRequestInterceptor((config) => {
            const token = sessionManager.getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // Add timestamp to prevent caching
            if (!config.cache) {
                config.headers = config.headers || {};
                config.headers['Cache-Control'] = 'no-cache';
                config.headers['X-Timestamp'] = Date.now();
            }
            
            return config;
        });

        // Handle token refresh on 401
        this.addResponseInterceptor(
            (response) => response,
            async (error) => {
                if (error.status === 401 && !error.config._retry) {
                    error.config._retry = true;
                    
                    try {
                        await sessionManager.refreshToken();
                        // Retry the original request
                        return this.request(error.config);
                    } catch (refreshError) {
                        sessionManager.logout('token_expired');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(onFulfilled, onRejected) {
        this.interceptors.request.push({ onFulfilled, onRejected });
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(onFulfilled, onRejected) {
        this.interceptors.response.push({ onFulfilled, onRejected });
    }

    /**
     * Add error interceptor
     */
    addErrorInterceptor(handler) {
        this.interceptors.error.push(handler);
    }

    /**
     * Make HTTP request
     */
    async request(config) {
        // Apply request interceptors
        let requestConfig = { ...config };
        for (const interceptor of this.interceptors.request) {
            if (interceptor.onFulfilled) {
                try {
                    requestConfig = await interceptor.onFulfilled(requestConfig);
                } catch (error) {
                    if (interceptor.onRejected) {
                        return interceptor.onRejected(error);
                    }
                    throw error;
                }
            }
        }

        const url = this.buildUrl(requestConfig.url);
        const options = this.buildRequestOptions(requestConfig);

        try {
            let response = await this.fetchWithRetry(url, options);
            
            // Apply response interceptors
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onFulfilled) {
                    try {
                        response = await interceptor.onFulfilled(response);
                    } catch (error) {
                        if (interceptor.onRejected) {
                            return interceptor.onRejected(error);
                        }
                        throw error;
                    }
                }
            }

            return response;
        } catch (error) {
            // Apply error interceptors
            for (const interceptor of this.interceptors.error) {
                try {
                    await interceptor(error);
                } catch (handlerError) {
                    console.error('Error in error interceptor:', handlerError);
                }
            }

            // Apply response error interceptors
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onRejected) {
                    try {
                        return await interceptor.onRejected(error);
                    } catch (rejectionError) {
                        // Continue to next interceptor
                    }
                }
            }

            throw error;
        }
    }

    /**
     * Build full URL
     */
    buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    /**
     * Build fetch options from config
     */
    buildRequestOptions(config) {
        const options = {
            method: config.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...config.headers
            },
            signal: this.createTimeoutSignal(config.timeout || this.defaultTimeout)
        };

        if (config.body) {
            if (config.body instanceof FormData) {
                // Remove Content-Type header for FormData
                delete options.headers['Content-Type'];
                options.body = config.body;
            } else if (typeof config.body === 'object') {
                options.body = JSON.stringify(config.body);
            } else {
                options.body = config.body;
            }
        }

        return options;
    }

    /**
     * Create timeout signal
     */
    createTimeoutSignal(timeout) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    }

    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.config = options;
                
                // Try to parse error response
                try {
                    const errorData = await response.json();
                    error.data = errorData;
                } catch (parseError) {
                    error.data = await response.text();
                }
                
                throw error;
            }

            // Parse response based on content type
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('text/')) {
                data = await response.text();
            } else {
                data = await response.blob();
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                config: options
            };
        } catch (error) {
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.warn(`Request failed, retrying (${attempt}/${this.retryAttempts})...`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Determine if request should be retried
     */
    shouldRetry(error) {
        // Retry on network errors or server errors (5xx)
        return !error.status || (error.status >= 500 && error.status < 600);
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // HTTP Methods

    /**
     * GET request
     */
    async get(url, config = {}) {
        return this.request({
            ...config,
            method: 'GET',
            url
        });
    }

    /**
     * POST request
     */
    async post(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'POST',
            url,
            body: data
        });
    }

    /**
     * PUT request
     */
    async put(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'PUT',
            url,
            body: data
        });
    }

    /**
     * PATCH request
     */
    async patch(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'PATCH',
            url,
            body: data
        });
    }

    /**
     * DELETE request
     */
    async delete(url, config = {}) {
        return this.request({
            ...config,
            method: 'DELETE',
            url
        });
    }

    /**
     * Upload file(s)
     */
    async upload(url, files, additionalData = {}, config = {}) {
        const formData = new FormData();
        
        // Add files
        if (files instanceof FileList || Array.isArray(files)) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        } else {
            formData.append('file', files);
        }
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request({
            ...config,
            method: 'POST',
            url,
            body: formData
        });
    }

    /**
     * Download file
     */
    async download(url, config = {}) {
        const response = await this.request({
            ...config,
            method: 'GET',
            url
        });

        // Create download link
        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get filename from response headers or URL
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'download';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        } else {
            const urlParts = url.split('/');
            filename = urlParts[urlParts.length - 1] || 'download';
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return response;
    }
}

/**
 * Dashboard-specific API service
 */
class DashboardAPI extends APIService {
    constructor() {
        super('/api/dashboard');
    }

    // Dashboard Metrics
    async getMetrics(timeframe = '24h') {
        return this.get(`/metrics?timeframe=${timeframe}`, { cache: true });
    }

    async getKPIs() {
        return this.get('/kpis', { cache: true });
    }

    // User Management
    async getUsers(page = 1, limit = 20, search = '') {
        const params = new URLSearchParams({ page, limit, search });
        return this.get(`/users?${params}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(userId, updates) {
        return this.put(`/users/${userId}`, updates);
    }

    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }

    // Activity Logs
    async getRecentActivity(limit = 10) {
        return this.get(`/activity?limit=${limit}`);
    }

    async getActivityLogs(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.get(`/activity/logs?${params}`);
    }

    // System Health
    async getSystemHealth() {
        return this.get('/system/health');
    }

    async getSystemMetrics() {
        return this.get('/system/metrics');
    }

    // Analytics
    async getChartData(chartType, timeframe = '7d') {
        return this.get(`/analytics/${chartType}?timeframe=${timeframe}`, { cache: true });
    }

    async getRevenueData(timeframe = '30d') {
        return this.get(`/analytics/revenue?timeframe=${timeframe}`);
    }

    async getUserGrowthData(timeframe = '30d') {
        return this.get(`/analytics/user-growth?timeframe=${timeframe}`);
    }

    // Notifications
    async getNotifications() {
        return this.get('/notifications');
    }

    async markNotificationRead(notificationId) {
        return this.patch(`/notifications/${notificationId}`, { read: true });
    }

    async markAllNotificationsRead() {
        return this.patch('/notifications/mark-all-read');
    }

    // Settings
    async getSettings() {
        return this.get('/settings');
    }

    async updateSettings(settings) {
        return this.put('/settings', settings);
    }

    // Reports
    async generateReport(reportType, parameters = {}) {
        return this.post(`/reports/generate`, { type: reportType, ...parameters });
    }

    async getReportStatus(reportId) {
        return this.get(`/reports/${reportId}/status`);
    }

    async downloadReport(reportId) {
        return this.download(`/reports/${reportId}/download`);
    }

    // System Status
    async getSystemStatus() {
        return this.get('/system/status');
    }
}

// Mock API responses for development
class MockDashboardAPI extends DashboardAPI {
    constructor() {
        super();
        this.setupMocks();
    }

    setupMocks() {
        // Override methods with mock implementations
        this.getMetrics = this.mockGetMetrics.bind(this);
        this.getKPIs = this.mockGetKPIs.bind(this);
        this.getRecentActivity = this.mockGetRecentActivity.bind(this);
        this.getChartData = this.mockGetChartData.bind(this);
        this.getSystemStatus = this.mockGetSystemStatus.bind(this);
        this.getNotifications = this.mockGetNotifications.bind(this);
        this.getUsers = this.mockGetUsers.bind(this);
    }

    async mockGetMetrics(timeframe) {
        await this.delay(500); // Simulate API delay
        
        return {
            data: {
                totalRevenue: 2400000,
                activeUsers: 15429,
                systemUptime: 98.5,
                newSignups: 1249,
                conversionRate: 12.3,
                avgSessionDuration: 420
            },
            status: 200
        };
    }

    async mockGetKPIs() {
        await this.delay(300);
        
        return {
            data: [
                {
                    id: 'revenue',
                    name: 'Total Revenue',
                    value: '$2.4M',
                    change: '+24.1%',
                    trend: 'up',
                    color: 'emerald'
                },
                {
                    id: 'users',
                    name: 'Active Users',
                    value: '15,429',
                    change: '+12.5%',
                    trend: 'up',
                    color: 'blue'
                },
                {
                    id: 'uptime',
                    name: 'System Uptime',
                    value: '98.5%',
                    change: '-0.2%',
                    trend: 'down',
                    color: 'green'
                },
                {
                    id: 'signups',
                    name: 'New Signups',
                    value: '1,249',
                    change: '+18.7%',
                    trend: 'up',
                    color: 'purple'
                }
            ],
            status: 200
        };
    }

    async mockGetSystemStatus() {
        await this.delay(200);

        return {
            data: {
                cpuUsage: '45%',
                memoryUsage: '2.5GB / 8GB',
                diskSpace: '120GB / 256GB',
                serverUptime: '48 days',
                runningServices: { serviceA: 'active', serviceB: 'inactive' },
            },
            status: 200
        };
    }

    async mockGetRecentActivity() {
        await this.delay(400);
        
        return {
            data: [
                {
                    id: 1,
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    user: 'john.doe@example.com',
                    action: 'User Registration',
                    status: 'success',
                    details: 'New user account created'
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
                    user: 'admin@sirsinexus.com',
                    action: 'System Configuration',
                    status: 'completed',
                    details: 'Updated security settings'
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                    user: 'jane.smith@example.com',
                    action: 'Password Reset',
                    status: 'pending',
                    details: 'Password reset email sent'
                }
            ],
            status: 200
        };
    }

    async mockGetUsers() {
        await this.delay(300);

        return {
            data: [
                { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'user', phone: '123-456-7890', status: 'active' },
                { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'admin', phone: '987-654-3210', status: 'active' },
                { id: 3, name: 'Chris Johnson', email: 'chris.johnson@example.com', role: 'moderator', phone: '555-555-5555', status: 'inactive' }
            ],
            status: 200
        };
    }

    async mockGetNotifications() {
        await this.delay(200);

        return {
            data: [
                { id: 1, title: 'Welcome to SirsiNexus!', message: 'Your account has been created successfully.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
                { id: 2, title: 'Maintenance Scheduled', message: 'System maintenance is scheduled for tonight at 11 PM.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
                { id: 3, title: 'New Feature Released', message: 'Check out the new analytics dashboard.', timestamp: new Date(Date.now() - 10800000).toISOString(), read: false }
            ],
            status: 200
        };
    }

    async mockGetChartData(chartType) {
        await this.delay(600);
        
        const mockData = {
            revenue: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: 'rgb(5, 150, 105)',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)'
                }]
            },
            users: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: [1200, 1900, 800, 1500, 1200, 1800],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)'
                }]
            }
        };
        
        return {
            data: mockData[chartType] || mockData.revenue,
            status: 200
        };
    }
}

// Global API service instances
const apiService = new APIService();
const dashboardAPI = new MockDashboardAPI(); // Use MockDashboardAPI for development

// Global error handler
dashboardAPI.addErrorInterceptor((error) => {
    console.error('API Error:', error);
    
    // Show user-friendly error messages
    const errorMessages = {
        400: 'Invalid request. Please check your input.',
        401: 'Session expired. Please log in again.',
        403: 'Access denied. Insufficient permissions.',
        404: 'Resource not found.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
        default: 'An unexpected error occurred. Please try again.'
    };
    
    const message = errorMessages[error.status] || errorMessages.default;
    
    // Show toast notification or update UI
    if (window.showToast) {
        window.showToast(message, 'error');
    } else {
        console.error('User message:', message);
    }
});

// Expose to global window object
window.APIService = APIService;
window.DashboardAPI = DashboardAPI;
window.MockDashboardAPI = MockDashboardAPI;
window.apiService = apiService;
window.dashboardAPI = dashboardAPI;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, DashboardAPI, MockDashboardAPI };
}
