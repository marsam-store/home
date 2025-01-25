// Cart Modal HTML
const cartModalHTML = `
    <div id="cart-modal" class="cart-modal">
        <div class="cart-modal-content">
            <div class="cart-header">
                <h2>سلة التسوق</h2>
                <button class="close-cart">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>المجموع:</span>
                    <span class="total-amount">0 د.ج</span>
                </div>
                <button class="checkout-button">متابعة الشراء</button>
            </div>
        </div>
    </div>
`;

// Add cart modal to the DOM
document.body.insertAdjacentHTML('beforeend', cartModalHTML);

// Cart UI Elements
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.querySelector('.cart-items');
const totalAmount = document.querySelector('.total-amount');
const checkoutButton = document.querySelector('.checkout-button');
const closeCart = document.querySelector('.close-cart');

// Cart Manager Class
class CartManager {
    constructor() {
        // Load and clean up the cart
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cart = savedCart.filter(item => {
            return item && 
                   item.id && 
                   item.name && 
                   item.name !== 'منتج غير معروف' && 
                   item.price && 
                   parseFloat(item.price) > 0;
        });
        
        // Save the cleaned cart
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        this.cartIcon = document.querySelector('.cart-icon');
        this.cartCount = document.querySelector('.cart-count');
        this.cartModal = document.querySelector('.cart-modal');
        this.cartItemsContainer = document.querySelector('.cart-items');
        this.cartTotal = document.querySelector('.cart-total');
        
        this.updateCartCount();
        this.updateCartDisplay();
        if (this.cartIcon && this.cartModal) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Only add event listeners if elements exist
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.toggleCart());
        }

        if (this.cartModal) {
            this.cartModal.addEventListener('click', (e) => {
                if (e.target === this.cartModal) {
                    this.closeCart();
                }
            });
        }

        const closeCartBtn = this.cartModal?.querySelector('.close-cart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => this.closeCart());
        }
    }

    toggleCart() {
        if (this.cartModal) {
            this.cartModal.classList.toggle('active');
            this.updateCartDisplay();
        }
    }

    closeCart() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
        }
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            this.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    updateCartDisplay() {
        if (!this.cartModal) return;
        
        const cartItems = this.cartModal.querySelector('.cart-items');
        const cartTotal = this.cartModal.querySelector('.cart-total');
        
        if (!cartItems || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
            cartTotal.textContent = 'المجموع: 0 د.ج';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => {
            // Ensure item has valid price and quantity
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            const name = item.name || 'منتج غير معروف';
            const image = item.image || 'assets/images/products/placeholder.jpg';
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${image}" alt="${name}">
                    <div class="cart-item-info">
                        <h4>${name}</h4>
                        <p class="item-details">
                            ${item.color ? `اللون: ${item.color}` : ''}
                            ${item.size ? `المقاس: ${item.size}` : ''}
                        </p>
                        <p class="item-price">${price.toLocaleString('ar-DZ')} د.ج</p>
                        <div class="quantity-controls">
                            <button class="decrease-qty">-</button>
                            <span class="item-qty">${quantity}</span>
                            <button class="increase-qty">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove">&times;</button>
                </div>
            `;
        }).join('');

        const total = this.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);
        
        cartTotal.textContent = `المجموع: ${total.toLocaleString('ar-DZ')} د.ج`;

        // Re-attach event listeners for the new elements
        this.setupCartItemListeners();
    }

    setupCartItemListeners() {
        const cartItems = this.cartModal.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            const id = parseInt(item.dataset.id);
            const decreaseBtn = item.querySelector('.decrease-qty');
            const increaseBtn = item.querySelector('.increase-qty');
            const removeBtn = item.querySelector('.cart-item-remove');

            decreaseBtn.addEventListener('click', () => this.updateQuantity(id, -1));
            increaseBtn.addEventListener('click', () => this.updateQuantity(id, 1));
            removeBtn.addEventListener('click', () => this.removeItem(id));
        });
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 0) + 1;
        } else {
            // Ensure we have all required fields with valid values
            this.cart.push({
                id: product.id,
                name: product.name || 'منتج غير معروف',
                price: parseFloat(product.price) || 0,
                image: product.image || product.images?.[0] || 'assets/images/products/placeholder.jpg',
                quantity: 1,
                color: product.color || product.colors?.[0] || '',
                size: product.size || product.sizes?.[0] || ''
            });
        }
        
        this.saveCart();
        this.showMessage('تمت إضافة المنتج إلى السلة', 'success');
    }

    updateQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            item.quantity = (parseInt(item.quantity) || 0) + change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
            }
        }
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        // Keep cart open by calling updateCartDisplay directly
        this.updateCartDisplay();
        // Show removal message while keeping cart open
        this.showMessage('تم إزالة المنتج من السلة', 'success');
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        // Keep cart open after clearing
        this.updateCartDisplay();
        this.showMessage('تم إفراغ السلة', 'success');
    }

    showMessage(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Export for use in other scripts
window.cartManager = cartManager; 