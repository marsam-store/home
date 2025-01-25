import { config, githubAPI } from './config.js';
import { dataService } from './dataService.js';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('github_token') || sessionStorage.getItem('github_token');
    const username = localStorage.getItem('admin_username') || sessionStorage.getItem('admin_username');

    if (!token || !username) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        // Set the token in the config for API calls
        config.GITHUB_TOKEN = token;
        
        // Initialize the dashboard
        await initializeDashboard();
        
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('github_token');
        localStorage.removeItem('admin_username');
        sessionStorage.removeItem('github_token');
        sessionStorage.removeItem('admin_username');
        window.location.href = 'login.html';
    }
});

// Initialize Dashboard
async function initializeDashboard() {
    try {
        console.log('Initializing dashboard...');
        // Load initial data
        const results = await Promise.all([
            dataService.getProducts(),
            dataService.getOrders(),
            dataService.getMessages(),
            dataService.getCategories()
        ]);
        console.log('Data loaded:', results);

        // Update UI with data
        await updateDashboardStats();
        
        // Initialize sidebar and other UI components
        initializeSidebar();
        initializeNotifications();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('حدث خطأ أثناء تحميل البيانات');
    }
}

// Initialize dashboard statistics
async function updateDashboardStats() {
    try {
        const products = await dataService.getProducts();
        const orders = await dataService.getOrders();
        const messages = await dataService.getMessages();
        const categories = await dataService.getCategories();

        // Update stats in the UI
        const statsElements = {
            'total-products': products.length,
            'total-orders': orders.length,
            'total-messages': messages.length,
            'total-categories': categories.length
        };

        for (const [id, value] of Object.entries(statsElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    } catch (error) {
        console.error('Error updating stats:', error);
        showError('حدث خطأ أثناء تحديث الإحصائيات');
    }
}

// Sidebar functionality
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('github_token');
        localStorage.removeItem('admin_username');
        sessionStorage.removeItem('github_token');
        sessionStorage.removeItem('admin_username');
        window.location.href = 'login.html';
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Notifications functionality
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const closeNotifications = document.querySelector('.close-notifications');
    
    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.add('active');
        loadNotifications();
    });
    
    closeNotifications.addEventListener('click', () => {
        notificationPanel.classList.remove('active');
    });
}

// Load and display notifications
function loadNotifications() {
    const notificationList = document.querySelector('.notification-list');
    // Sample notifications - replace with actual data from backend
    const notifications = [
        { type: 'order', message: 'طلب جديد #123', time: '5 دقائق' },
        { type: 'stock', message: 'المنتج ABC منخفض المخزون', time: '30 دقيقة' },
        { type: 'system', message: 'تم تحديث النظام', time: '2 ساعة' }
    ];
    
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.type}">
            <div class="notification-content">
                <p>${notification.message}</p>
                <span class="notification-time">${notification.time}</span>
            </div>
        </div>
    `).join('');
}

// Filter orders by status
function filterOrders(event) {
    const status = event.target.value;
    // Implement order filtering logic
}

// Handle mobile menu toggle
const menuToggle = document.createElement('button');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector('.content-header').prepend(menuToggle);

menuToggle.addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
}); 