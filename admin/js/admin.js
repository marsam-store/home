// Admin Configuration
const adminConfig = {
    tokenKey: 'adminAuthToken',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    apiEndpoint: '/api/admin' // Replace with actual API endpoint
};

// Initialize Admin
function initializeAdmin() {
    checkAuthentication();
    setupEventListeners();
    setupActivityMonitor();
}

// Check Authentication
function checkAuthentication() {
    const token = getAuthToken();
    
    if (!token) {
        redirectToLogin();
        return;
    }
    
    if (isTokenExpired(token)) {
        logout();
        return;
    }
    
    // Verify token with backend
    verifyToken(token).catch(() => {
        logout();
    });
}

// Get Auth Token
function getAuthToken() {
    return sessionStorage.getItem(adminConfig.tokenKey);
}

// Set Auth Token
function setAuthToken(token) {
    sessionStorage.setItem(adminConfig.tokenKey, token);
}

// Remove Auth Token
function removeAuthToken() {
    sessionStorage.removeItem(adminConfig.tokenKey);
}

// Check if Token is Expired
function isTokenExpired(token) {
    try {
        const tokenData = JSON.parse(atob(token));
        return Date.now() >= tokenData.expires;
    } catch {
        return true;
    }
}

// Verify Token with Backend
async function verifyToken(token) {
    try {
        const response = await fetch(`${adminConfig.apiEndpoint}/verify-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Token verification failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Mobile menu toggle
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const header = document.querySelector('.admin-header');
    if (header) {
        header.prepend(menuToggle);
        
        menuToggle.addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.admin-sidebar');
            const isClickInside = sidebar.contains(e.target) || menuToggle.contains(e.target);
            
            if (!isClickInside && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Setup Activity Monitor
function setupActivityMonitor() {
    let inactivityTimer;
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            showInactivityWarning();
        }, adminConfig.sessionTimeout - 60000); // Show warning 1 minute before timeout
    }
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    // Initial setup
    resetTimer();
}

// Show Inactivity Warning
function showInactivityWarning() {
    const warning = document.createElement('div');
    warning.className = 'inactivity-warning';
    warning.innerHTML = `
        <div class="warning-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>تنبيه عدم النشاط</h3>
            <p>سيتم تسجيل خروجك تلقائياً خلال دقيقة واحدة</p>
            <button class="btn btn-primary" onclick="extendSession()">تمديد الجلسة</button>
        </div>
    `;
    
    document.body.appendChild(warning);
    
    // Auto logout after 1 minute if no action
    setTimeout(() => {
        if (document.contains(warning)) {
            logout();
        }
    }, 60000);
}

// Extend Session
async function extendSession() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${adminConfig.apiEndpoint}/extend-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to extend session');
        }
        
        const { newToken } = await response.json();
        setAuthToken(newToken);
        
        // Remove warning
        const warning = document.querySelector('.inactivity-warning');
        if (warning) {
            warning.remove();
        }
        
        // Reset activity monitor
        setupActivityMonitor();
        
    } catch (error) {
        console.error('Session extension error:', error);
        logout();
    }
}

// Logout
async function logout() {
    try {
        const token = getAuthToken();
        
        // Call logout endpoint
        await fetch(`${adminConfig.apiEndpoint}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear session
        removeAuthToken();
        redirectToLogin();
    }
}

// Redirect to Login
function redirectToLogin() {
    window.location.href = 'login.html';
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    try {
        const response = await fetch(`${adminConfig.apiEndpoint}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('Unauthorized');
            }
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Show Loading
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
    `;
    document.body.appendChild(loading);
}

// Hide Loading
function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// Show Toast Message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Format Currency
function formatCurrency(amount) {
    return amount.toLocaleString('ar-DZ', {
        style: 'currency',
        currency: 'DZD'
    });
}

// Format Date
function formatDate(date, format = 'long') {
    const options = {
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return new Date(date).toLocaleDateString('ar-DZ', options[format]);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAdmin); 