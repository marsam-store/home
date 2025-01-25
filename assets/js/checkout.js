// Algerian Wilayas
const wilayas = [
    "01 - أدرار",
    "02 - الشلف",
    "03 - الأغواط",
    "04 - أم البواقي",
    "05 - باتنة",
    "06 - بجاية",
    "07 - بسكرة",
    "08 - بشار",
    "09 - البليدة",
    "10 - البويرة",
    "11 - تمنراست",
    "12 - تبسة",
    "13 - تلمسان",
    "14 - تيارت",
    "15 - تيزي وزو",
    "16 - الجزائر",
    "17 - الجلفة",
    "18 - جيجل",
    "19 - سطيف",
    "20 - سعيدة",
    "21 - سكيكدة",
    "22 - سيدي بلعباس",
    "23 - عنابة",
    "24 - قالمة",
    "25 - قسنطينة",
    "26 - المدية",
    "27 - مستغانم",
    "28 - المسيلة",
    "29 - معسكر",
    "30 - ورقلة",
    "31 - وهران",
    "32 - البيض",
    "33 - إليزي",
    "34 - برج بوعريريج",
    "35 - بومرداس",
    "36 - الطارف",
    "37 - تندوف",
    "38 - تيسمسيلت",
    "39 - الوادي",
    "40 - خنشلة",
    "41 - سوق أهراس",
    "42 - تيبازة",
    "43 - ميلة",
    "44 - عين الدفلى",
    "45 - النعامة",
    "46 - عين تموشنت",
    "47 - غرداية",
    "48 - غليزان",
    "49 - المغير",
    "50 - المنيعة",
    "51 - أولاد جلال",
    "52 - برج باجي مختار",
    "53 - بني عباس",
    "54 - تيميمون",
    "55 - تقرت",
    "56 - جانت",
    "57 - عين صالح",
    "58 - عين قزام"
];

// Fixed shipping cost
const SHIPPING_COST = 800;

// DOM Elements
const elements = {
    progressSteps: document.querySelectorAll('.progress-step'),
    checkoutSteps: document.querySelectorAll('.checkout-step'),
    nextButtons: document.querySelectorAll('.next-step'),
    prevButtons: document.querySelectorAll('.prev-step'),
    placeOrderButton: document.getElementById('placeOrder'),
    successModal: document.getElementById('successModal'),
    
    // Form Elements
    shippingForm: document.getElementById('shippingForm'),
    fullNameInput: document.getElementById('fullName'),
    phoneInput: document.getElementById('phone'),
    emailInput: document.getElementById('email'),
    wilayaSelect: document.getElementById('wilaya'),
    addressInput: document.getElementById('address'),
    
    // Summary Elements
    subtotalElement: document.getElementById('subtotal'),
    shippingElement: document.getElementById('shipping'),
    totalElement: document.getElementById('total'),
    cartItemsContainer: document.querySelector('.cart-items'),
    shippingSummary: document.getElementById('shippingSummary'),
    paymentSummary: document.getElementById('paymentSummary')
};

// Current step tracker
let currentStep = 1;

// Initialize the checkout page
function initCheckout() {
    if (!elements.wilayaSelect) return; // Exit if not on checkout page
    
    loadWilayas();
    loadCartItems();
    updateOrderSummary();
    setupEventListeners();
}

// Load Wilayas
function loadWilayas() {
    wilayas.forEach((wilaya, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = wilaya;
        elements.wilayaSelect.appendChild(option);
    });
}

// Load cart items from localStorage
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    elements.cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4 class="item-name">${item.name}</h4>
                <p class="item-price">${item.price} د.ج</p>
                <p>الكمية: ${item.quantity}</p>
            </div>
        `;
        elements.cartItemsContainer.appendChild(cartItem);
    });
}

// Update order summary
function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = SHIPPING_COST;
    const total = subtotal + shipping;

    elements.subtotalElement.textContent = `${subtotal.toLocaleString()} د.ج`;
    elements.shippingElement.textContent = `${shipping.toLocaleString()} د.ج`;
    elements.totalElement.textContent = `${total.toLocaleString()} د.ج`;
}

// Validate current step
function validateStep(step) {
    switch(step) {
        case 1:
            return validateShippingInfo();
        case 2:
            return true; // Always valid since we only have cash on delivery
        default:
            return true;
    }
}

// Validate shipping information
function validateShippingInfo() {
    const nameRegex = /^[\u0600-\u06FF\s]{3,50}$/;
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(elements.fullNameInput.value)) {
        alert('الرجاء إدخال اسم صحيح باللغة العربية');
        return false;
    }

    if (!phoneRegex.test(elements.phoneInput.value)) {
        alert('الرجاء إدخال رقم هاتف صحيح');
        return false;
    }

    if (elements.emailInput.value && !emailRegex.test(elements.emailInput.value)) {
        alert('الرجاء إدخال بريد إلكتروني صحيح');
        return false;
    }

    if (!elements.wilayaSelect.value) {
        alert('الرجاء اختيار الولاية');
        return false;
    }

    if (elements.addressInput.value.length < 10) {
        alert('الرجاء إدخال عنوان تفصيلي صحيح');
        return false;
    }

    return true;
}

// Navigate to next step
function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep === 2) {
            updateSummary();
        }
        updateStepUI(currentStep + 1);
        currentStep++;
    }
}

// Navigate to previous step
function prevStep() {
    if (currentStep > 1) {
        updateStepUI(currentStep - 1);
        currentStep--;
    }
}

// Update step UI
function updateStepUI(step) {
    elements.progressSteps.forEach((stepEl, index) => {
        stepEl.classList.toggle('active', index + 1 <= step);
    });

    elements.checkoutSteps.forEach((stepEl, index) => {
        stepEl.classList.toggle('active', index + 1 === step);
    });
}

// Update order summary before confirmation
function updateSummary() {
    // Update shipping summary
    elements.shippingSummary.innerHTML = `
        <p><strong>الاسم:</strong> ${elements.fullNameInput.value}</p>
        <p><strong>الهاتف:</strong> ${elements.phoneInput.value}</p>
        <p><strong>البريد الإلكتروني:</strong> ${elements.emailInput.value || 'غير محدد'}</p>
        <p><strong>الولاية:</strong> ${elements.wilayaSelect.options[elements.wilayaSelect.selectedIndex].text}</p>
        <p><strong>العنوان:</strong> ${elements.addressInput.value}</p>
    `;

    // Update payment summary
    elements.paymentSummary.innerHTML = `
        <p><strong>طريقة الدفع:</strong> الدفع عند الاستلام</p>
    `;
}

// Place order
function placeOrder() {
    // Here you would typically send the order to your backend
    // For now, we'll just show the success message and clear the cart
    localStorage.removeItem('cart');
    elements.successModal.classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    elements.nextButtons.forEach(button => {
        button.addEventListener('click', nextStep);
    });

    elements.prevButtons.forEach(button => {
        button.addEventListener('click', prevStep);
    });

    elements.placeOrderButton.addEventListener('click', placeOrder);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', initCheckout); 