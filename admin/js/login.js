import { config } from './config.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const togglePasswordBtn = document.querySelector('.toggle-password');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    checkRememberedUser();
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Real-time validation
    usernameInput.addEventListener('input', () => {
        hideInputError(usernameInput);
    });
    
    passwordInput.addEventListener('input', () => {
        hideInputError(passwordInput);
    });
}

async function checkRememberedUser() {
    const rememberedToken = localStorage.getItem('github_token');
    const rememberedUsername = localStorage.getItem('admin_username');
    
    if (rememberedToken && rememberedUsername) {
        const isValid = await validateGitHubToken(rememberedToken);
        if (isValid) {
            window.location.href = 'dashboard.html';
            return;
        } else {
            localStorage.removeItem('github_token');
            localStorage.removeItem('admin_username');
        }
    }
}

async function validateGitHubToken(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const username = usernameInput.value;
    const token = passwordInput.value;
    
    showLoading();
    
    try {
        const isValid = await validateGitHubToken(token);
        
        if (isValid) {
            handleSuccessfulLogin(username, token);
        } else {
            handleFailedLogin();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
    } finally {
        hideLoading();
    }
}

function validateForm() {
    let isValid = true;
    
    if (!validateUsername()) {
        isValid = false;
    }
    
    if (!validatePassword()) {
        isValid = false;
    }
    
    return isValid;
}

function validateUsername() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showInputError(usernameInput, 'الرجاء إدخال اسم المستخدم');
        return false;
    }
    
    return true;
}

function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        showInputError(passwordInput, 'الرجاء إدخال كلمة المرور');
        return false;
    }
    
    return true;
}

function handleSuccessfulLogin(username, token) {
    if (rememberCheckbox.checked) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('admin_username', username);
    } else {
        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('admin_username', username);
    }
    
    window.location.href = 'dashboard.html';
}

function handleFailedLogin() {
    showError('اسم المستخدم أو كلمة المرور غير صحيحة');
    passwordInput.value = '';
}

function showInputError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    
    // Remove any existing error message
    hideInputError(input);
    
    // Add new error message
    input.parentElement.appendChild(errorDiv);
    input.classList.add('error');
}

function hideInputError(input) {
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.classList.remove('error');
}

function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = `fas fa-eye${type === 'password' ? '' : '-slash'}`;
}

function showLoading() {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
}

function hideLoading() {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'تسجيل الدخول';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    
    // Remove any existing error message
    const existingError = loginForm.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message at the top of the form
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Security Configuration
const securityConfig = {
    minPasswordLength: 8,
    maxLoginAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    tokenExpiration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// Login State
let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
let lastAttemptTime = parseInt(localStorage.getItem('lastAttemptTime')) || 0;

// Check Lockout Status
function checkLockoutStatus() {
    if (isLockedOut()) {
        const remainingTime = getRemainingLockoutTime();
        disableLoginForm(remainingTime);
    }
}

// Check if Account is Locked
function isLockedOut() {
    if (loginAttempts >= securityConfig.maxLoginAttempts) {
        const timeSinceLastAttempt = Date.now() - lastAttemptTime;
        if (timeSinceLastAttempt < securityConfig.lockoutDuration) {
            return true;
        } else {
            resetLoginAttempts();
        }
    }
    return false;
}

// Get Remaining Lockout Time
function getRemainingLockoutTime() {
    const timeSinceLastAttempt = Date.now() - lastAttemptTime;
    return Math.max(0, securityConfig.lockoutDuration - timeSinceLastAttempt);
}

// Reset Login Attempts
function resetLoginAttempts() {
    loginAttempts = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastAttemptTime');
}

// Disable Login Form
function disableLoginForm(duration) {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    const countdown = setInterval(() => {
        const remainingMinutes = Math.ceil(duration / 60000);
        submitBtn.textContent = `انتظر ${remainingMinutes} دقيقة`;
        
        if (duration <= 0) {
            clearInterval(countdown);
            submitBtn.disabled = false;
            submitBtn.textContent = 'تسجيل الدخول';
            resetLoginAttempts();
        }
        
        duration -= 1000;
    }, 1000);
} 