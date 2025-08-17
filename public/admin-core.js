// AdminCore - Central authentication and API management
window.AdminCore = {
    authToken: localStorage.getItem('adminToken'),
    
    // API request wrapper with authentication
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            }
        };
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(endpoint, mergedOptions);
            
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },
    
    // Handle unauthorized access
    handleUnauthorized() {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.authToken;
    },
    
    // Login function
    async login(username, password) {
        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.authToken = result.token;
                localStorage.setItem('adminToken', this.authToken);
                return true;
            } else {
                throw new Error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },
    
    // Logout function
    async logout() {
        try {
            await fetch('/admin/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }
        
        localStorage.removeItem('adminToken');
        this.authToken = null;
        window.location.href = '/admin';
    },
    
    // Base API URL
    API_URL: '/api/admin',
    
    // Common API endpoints
    endpoints: {
        suppliers: '/api/admin/suppliers',
        bases: '/api/admin/bases', 
        oils: '/api/admin/oils',
        vessels: '/api/admin/vessels',
        users: '/api/admin/users',
        stats: '/api/admin/stats'
    },
    
    // Utility functions
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            z-index: 10000;
            background: ${type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#667eea'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    
    // Alias for showToast (used by modular JS files)
    showToast(message, type = 'info') {
        this.showNotification(message, type);
    },
    
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    },
    
    // Format date
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    },
    
    // Data storage for modules
    suppliers: [],
    bases: [],
    oils: [],
    vessels: [],
    
    // Setter methods for modular JS files
    setSuppliers(suppliers) {
        this.suppliers = suppliers;
    },
    
    setBases(bases) {
        this.bases = bases;
    },
    
    setOils(oils) {
        this.oils = oils;
    },
    
    setVessels(vessels) {
        this.vessels = vessels;
    },
    
    // Getter methods
    getSuppliers() {
        return this.suppliers;
    },
    
    getBases() {
        return this.bases;
    },
    
    getOils() {
        return this.oils;
    },
    
    getVessels() {
        return this.vessels;
    },
    
    // Legacy method for backward compatibility
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`
        };
    }
};

// Auto-redirect if not authenticated
if (!AdminCore.isAuthenticated() && !window.location.pathname.includes('login')) {
    console.log('Not authenticated, redirecting...');
    // Don't redirect immediately, let the page load first
}