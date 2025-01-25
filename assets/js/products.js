// Handle Sort
function handleSort(e) {
    const sortValue = e.target.value;
    if (!sortValue) return;
    
    let sortedProducts = [...products];
    switch (sortValue) {
        case 'price-asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            break;
    }
    renderProducts(sortedProducts);
}

// Sample products data
const products = [
    {
        id: 1,
        name: "فستان كلاسيكي أسود",
        price: 9500,
        category: "dresses",
        colors: ["black"],
        sizes: ["S", "M", "L"],
        images: ["assets/images/products/dress1.jpg"],
        description: "فستان كلاسيكي أنيق مناسب لجميع المناسبات"
    },
    {
        id: 2,
        name: "فستان سهرة مطرز",
        price: 15000,
        category: "dresses",
        colors: ["gold", "silver"],
        sizes: ["M", "L"],
        images: ["assets/images/products/dress2.jpg"],
        description: "فستان سهرة فاخر مع تطريز يدوي"
    },
    {
        id: 3,
        name: "حقيبة يد فاخرة",
        price: 4500,
        category: "bags",
        colors: ["brown"],
        images: ["assets/images/products/bag1.jpg"],
        description: "حقيبة يد جلدية فاخرة"
    },
    {
        id: 4,
        name: "حقيبة كتف أنيقة",
        price: 3800,
        category: "bags",
        colors: ["black"],
        images: ["assets/images/products/bag2.jpg"],
        description: "حقيبة كتف عصرية مناسبة للاستخدام اليومي"
    },
    {
        id: 5,
        name: "طقم اكسسوارات ذهبي",
        price: 2500,
        category: "accessories",
        colors: ["gold"],
        images: ["assets/images/products/accessory1.jpg"],
        description: "طقم اكسسوارات ذهبي فاخر"
    }
];

// DOM Elements
const productsGrid = document.querySelector('.products-grid');
const filterBtn = document.querySelector('.filter-btn');
const filterSidebar = document.querySelector('.filter-sidebar');
const closeFilter = document.querySelector('.close-filter');
const filterOverlay = document.querySelector('.filter-overlay');
const applyFilter = document.querySelector('.apply-filter');
const resetFilter = document.querySelector('.reset-filter');
const sortSelect = document.querySelector('.sort-select');
const productsCount = document.querySelector('.products-count span');

// Filter State
let filterState = {
    categories: [],
    colors: [],
    sizes: [],
    priceRange: {
        min: 0,
        max: 20000
    }
};

// Pagination State
let currentPage = 1;
const itemsPerPage = 12;

// Initialize Products
function initializeProducts() {
    renderProducts(products);
    setupEventListeners();
    updateProductsCount(products.length);
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter Toggle
    if (filterBtn) {
        filterBtn.addEventListener('click', toggleFilter);
    }

    if (closeFilter) {
        closeFilter.addEventListener('click', toggleFilter);
    }

    if (filterOverlay) {
        filterOverlay.addEventListener('click', toggleFilter);
    }

    // Filter Actions
    if (applyFilter) {
        applyFilter.addEventListener('click', handleApplyFilter);
    }

    if (resetFilter) {
        resetFilter.addEventListener('click', handleResetFilter);
    }

    // Sort Products
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // Filter Options
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilterState);
    });

    // Price Range
    const minPrice = document.getElementById('price-min');
    const maxPrice = document.getElementById('price-max');
    
    if (minPrice) {
        minPrice.addEventListener('input', updatePriceRange);
    }
    
    if (maxPrice) {
        maxPrice.addEventListener('input', updatePriceRange);
    }
}

// Toggle Filter Sidebar
function toggleFilter() {
    filterSidebar.classList.toggle('active');
    filterOverlay.style.display = filterSidebar.classList.contains('active') ? 'block' : 'none';
    document.body.style.overflow = filterSidebar.classList.contains('active') ? 'hidden' : '';
}

// Update Filter State
function updateFilterState(e) {
    const type = e.target.dataset.type;
    const value = e.target.value;
    
    if (type === 'category') {
        updateArray(filterState.categories, value, e.target.checked);
    } else if (type === 'color') {
        updateArray(filterState.colors, value, e.target.checked);
    } else if (type === 'size') {
        updateArray(filterState.sizes, value, e.target.checked);
    }
}

// Update Array Helper
function updateArray(array, value, add) {
    const index = array.indexOf(value);
    if (add && index === -1) {
        array.push(value);
    } else if (!add && index !== -1) {
        array.splice(index, 1);
    }
}

// Update Price Range
function updatePriceRange(e) {
    const minPrice = document.getElementById('price-min');
    const maxPrice = document.getElementById('price-max');
    
    filterState.priceRange.min = parseInt(minPrice.value) || 0;
    filterState.priceRange.max = parseInt(maxPrice.value) || 20000;
}

// Apply Filters
function handleApplyFilter() {
    const filteredProducts = products.filter(product => {
        // Category Filter
        if (filterState.categories.length && !filterState.categories.includes(product.category)) {
            return false;
        }
        
        // Color Filter
        if (filterState.colors.length && !product.colors.some(color => filterState.colors.includes(color))) {
            return false;
        }
        
        // Size Filter
        if (filterState.sizes.length && !product.sizes?.some(size => filterState.sizes.includes(size))) {
            return false;
        }
        
        // Price Range Filter
        if (product.price < filterState.priceRange.min || product.price > filterState.priceRange.max) {
            return false;
        }
        
        return true;
    });
    
    renderProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
    toggleFilter();
}

// Reset Filters
function handleResetFilter() {
    // Reset checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price range
    const minPrice = document.getElementById('price-min');
    const maxPrice = document.getElementById('price-max');
    
    if (minPrice) minPrice.value = 0;
    if (maxPrice) maxPrice.value = 20000;
    
    // Reset filter state
    filterState = {
        categories: [],
        colors: [],
        sizes: [],
        priceRange: {
            min: 0,
            max: 20000
        }
    };
    
    // Reset products display
    renderProducts(products);
    updateProductsCount(products.length);
}

// Render Products
function renderProducts(products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
                <button class="quick-view-btn" data-product-id="${product.id}">
                    عرض سريع
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)} د.ج</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    إضافة إلى السلة
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for quick view and add to cart buttons
    setupProductButtons();
}

// Setup Product Buttons
function setupProductButtons() {
    // Quick View Buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (product) {
                showQuickView(product);
            }
        });
    });
    
    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (product) {
                window.cartManager.addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    quantity: 1
                });
                showMessage('تمت إضافة المنتج إلى السلة', 'success');
            }
        });
    });
}

// Update Products Count
function updateProductsCount(count) {
    if (productsCount) {
        productsCount.textContent = count;
    }
}

// Format Price
function formatPrice(price) {
    return price.toLocaleString('ar-DZ');
}

// Show Message
function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Handle Quick View
function handleQuickView(e) {
    const quickViewBtn = e.target.closest('.quick-view-btn');
    if (!quickViewBtn) return;
    
    const productId = parseInt(quickViewBtn.dataset.productId);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        showQuickView(product);
    }
}

// Show Quick View
function showQuickView(product) {
    productQuickView.innerHTML = `
        <div class="quick-view-image">
            <img src="${product.images[0]}" alt="${product.name}">
        </div>
        <div class="quick-view-details">
            <h2>${product.name}</h2>
            <p class="price">${formatPrice(product.price)} د.ج</p>
            <p class="description">${product.description}</p>
            
            <div class="product-options">
                <div class="colors">
                    <h3>اللون:</h3>
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <label class="color-option">
                                <input type="radio" name="color" value="${color}">
                                <span class="color-dot" style="background-color: ${color}"></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="sizes">
                    <h3>المقاس:</h3>
                    <div class="size-options">
                        ${product.sizes.map(size => `
                            <label class="size-option">
                                <input type="radio" name="size" value="${size}">
                                <span>${size}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="stock-status">
                <span class="${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? 'متوفر' : 'نفذت الكمية'}
                </span>
            </div>
            
            <button class="add-to-cart-btn" data-product-id="${product.id}" 
                ${product.stock <= 0 ? 'disabled' : ''}>
                إضافة إلى السلة
            </button>
        </div>
    `;

    quickViewModal.classList.add('active');
    
    // Add to cart event listener
    const addToCartBtn = productQuickView.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
        const selectedColor = productQuickView.querySelector('input[name="color"]:checked')?.value;
        const selectedSize = productQuickView.querySelector('input[name="size"]:checked')?.value;
        
        if (!selectedColor || !selectedSize) {
            showMessage('الرجاء اختيار اللون والمقاس', 'error');
            return;
        }
        
        window.cartManager.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            color: selectedColor,
            size: selectedSize
        });
        
        closeQuickView();
    });
}

// Close Quick View
function closeQuickView() {
    quickViewModal.classList.remove('active');
}

// Handle Pagination
function handlePagination(e) {
    const target = e.target;
    
    if (target.classList.contains('prev-page')) {
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
        }
    } else if (target.classList.contains('next-page')) {
        const totalPages = Math.ceil(products.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters();
        }
    } else if (target.tagName === 'SPAN' && !target.classList.contains('active')) {
        currentPage = parseInt(target.textContent);
        applyFilters();
    }
}

// Update Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    const pageNumbers = pagination.querySelector('.page-numbers');
    const prevBtn = pagination.querySelector('.prev-page');
    const nextBtn = pagination.querySelector('.next-page');
    
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        if (i === currentPage) {
            span.classList.add('active');
        }
        pageNumbers.appendChild(span);
    }
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Update Product Count
function updateProductCount(count) {
    document.querySelector('.products-count span').textContent = count;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeProducts); 