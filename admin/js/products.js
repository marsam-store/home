document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize elements
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    const productForm = document.getElementById('productForm');
    const searchInput = document.getElementById('searchProducts');
    const categoryFilter = document.getElementById('categoryFilter');
    const cancelBtn = document.querySelector('.cancel-btn');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');

    // Load products
    loadProducts();

    // Event listeners
    addProductBtn.addEventListener('click', () => {
        openModal();
    });

    closeModal.addEventListener('click', () => {
        closeModalHandler();
    });

    cancelBtn.addEventListener('click', () => {
        closeModalHandler();
    });

    productForm.addEventListener('submit', handleProductSubmit);
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    imageInput.addEventListener('change', handleImageUpload);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModalHandler();
        }
    });
});

// Load products from localStorage
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">لا توجد منتجات حالياً</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price} د.ج</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${getStockStatusClass(product.stock)}">
                    ${getStockStatusText(product.stock)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update total products count
    localStorage.setItem('totalProducts', products.length);
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const product = {
        id: Date.now().toString(),
        name: formData.get('name'),
        category: formData.get('category'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        description: formData.get('description'),
        images: await getUploadedImages(),
        createdAt: new Date().toISOString()
    };

    // Get existing products
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Add new product
    products.push(product);
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Reload products table
    loadProducts();
    
    // Close modal and reset form
    closeModalHandler();
    showNotification('تم إضافة المنتج بنجاح', 'success');
}

// Handle image upload
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    imagePreview.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            imagePreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
}

// Get uploaded images as base64
function getUploadedImages() {
    return new Promise((resolve) => {
        const images = Array.from(document.querySelectorAll('.preview-image')).map(img => img.src);
        resolve(images);
    });
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    filterProducts(searchTerm, categoryValue);
}

// Handle category filter
function handleCategoryFilter(e) {
    const categoryValue = e.target.value;
    const searchTerm = searchInput.value.toLowerCase();
    filterProducts(searchTerm, categoryValue);
}

// Filter products
function filterProducts(searchTerm, category) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    const tbody = document.getElementById('productsTableBody');
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">لا توجد نتائج</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price} د.ج</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${getStockStatusClass(product.stock)}">
                    ${getStockStatusText(product.stock)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Helper functions
function getCategoryName(category) {
    const categories = {
        dresses: 'فساتين',
        abayas: 'عبايات',
        bags: 'حقائب',
        accessories: 'إكسسوارات'
    };
    return categories[category] || category;
}

function getStockStatusClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
}

function getStockStatusText(stock) {
    if (stock === 0) return 'نفذ المخزون';
    if (stock <= 5) return 'مخزون منخفض';
    return 'متوفر';
}

// Modal functions
function openModal(productId = null) {
    productModal.classList.add('active');
    if (!productId) {
        productForm.reset();
        imagePreview.innerHTML = '';
    }
}

function closeModalHandler() {
    productModal.classList.remove('active');
    productForm.reset();
    imagePreview.innerHTML = '';
}

// Edit product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description;
        
        // Show existing images
        imagePreview.innerHTML = product.images.map(image => `
            <img src="${image}" class="preview-image" alt="${product.name}">
        `).join('');
        
        // Update form for editing
        productForm.dataset.editId = productId;
        document.querySelector('.modal-header h2').textContent = 'تعديل المنتج';
        document.querySelector('.save-btn').textContent = 'حفظ التغييرات';
        
        openModal(productId);
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const updatedProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        loadProducts();
        showNotification('تم حذف المنتج بنجاح', 'success');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 