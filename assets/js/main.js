// DOM Elements
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.className = 'mobile-menu-btn';
mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';

const header = document.querySelector('.main-header');
const navLinks = document.querySelector('.nav-links');
const searchIcon = document.querySelector('.search-icon');

// Initialize
function init() {
    setupMobileMenu();
    setupSearch();
    setupScrollEffects();
    setupHeroSlider();
    setupScrollAnimations();
}

// Mobile Menu Setup
function setupMobileMenu() {
    const navContainer = document.querySelector('.nav-container');
    navContainer.insertBefore(mobileMenuBtn, navLinks);
    
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// Search Setup
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', handleSearch);
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchResults.contains(e.target) && e.target !== searchInput) {
                searchResults.style.display = 'none';
            }
        });
    }
}

// Scroll Effects
function setupScrollEffects() {
    let lastScroll = 0;
    const scrollThreshold = 80;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Header show/hide with smooth transition
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        // Add scrolled class with delay
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Language Toggle
const languageToggle = document.querySelector('.language-toggle');
if (languageToggle) {
    languageToggle.addEventListener('click', () => {
        document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
        document.documentElement.lang = document.documentElement.lang === 'ar' ? 'en' : 'ar';
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

// Cart Functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.count = 0;
        this.updateCart();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        
        this.updateCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            }
        }
        this.updateCart();
    }

    updateCart() {
        this.count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart count in UI
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.count;
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    clearCart() {
        this.items = [];
        this.updateCart();
    }
}

// Initialize cart
const cart = new Cart();

// Form Validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const formData = new FormData(form);
        
        // Basic form validation
        for (let [key, value] of formData.entries()) {
            const input = form.querySelector(`[name="${key}"]`);
            const errorMessage = input.nextElementSibling;
            
            if (!value.trim()) {
                isValid = false;
                input.classList.add('error');
                if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                    const error = document.createElement('div');
                    error.className = 'error-message';
                    error.textContent = 'هذا الحقل مطلوب';
                    input.parentNode.insertBefore(error, input.nextSibling);
                }
            } else {
                input.classList.remove('error');
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.remove();
                }
            }
        }
        
        if (isValid) {
            // Handle form submission
            console.log('Form submitted:', Object.fromEntries(formData));
            form.reset();
        }
    });
});

// Newsletter Subscription
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Newsletter subscription:', email);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'شكراً لاشتراكك في نشرتنا البريدية';
            newsletterForm.appendChild(successMessage);
            
            // Reset form
            newsletterForm.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        } catch (error) {
            console.error('Newsletter subscription error:', error);
        }
    });
}

// Initialize elements with fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
});

// Hero Slider
function setupHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    function showSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.classList.remove('active');
        });
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        slides[index].style.opacity = '1';
        dots[index].classList.add('active');

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    function nextSlide() {
        if (isTransitioning) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        if (isTransitioning) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideshow() {
        stopSlideshow();
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startSlideshow();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startSlideshow();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index !== currentSlide) {
                currentSlide = index;
                showSlide(currentSlide);
                startSlideshow();
            }
        });
    });

    slider.addEventListener('mouseenter', stopSlideshow);
    slider.addEventListener('mouseleave', startSlideshow);

    // Start with first slide
    showSlide(0);
    startSlideshow();
}

// Setup Scroll Animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });

    // Observe category cards
    document.querySelectorAll('.category-card').forEach(card => {
        observer.observe(card);
    });
} 