// DOM Elements
const contactForm = document.getElementById('contactForm');
const successModal = document.getElementById('successModal');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');

// Form Validation
function validateForm() {
    let isValid = true;
    const errors = [];

    // Name validation (Arabic characters and spaces only)
    const nameRegex = /^[\u0600-\u06FF\s]{3,50}$/;
    if (!nameRegex.test(nameInput.value)) {
        errors.push('الرجاء إدخال اسم صحيح باللغة العربية');
        nameInput.classList.add('error');
        isValid = false;
    } else {
        nameInput.classList.remove('error');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        errors.push('الرجاء إدخال بريد إلكتروني صحيح');
        emailInput.classList.add('error');
        isValid = false;
    } else {
        emailInput.classList.remove('error');
    }

    // Phone validation (Algerian phone numbers)
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        errors.push('الرجاء إدخال رقم هاتف صحيح');
        phoneInput.classList.add('error');
        isValid = false;
    } else {
        phoneInput.classList.remove('error');
    }

    // Subject validation
    if (subjectInput.value.length < 3) {
        errors.push('الرجاء إدخال موضوع صحيح');
        subjectInput.classList.add('error');
        isValid = false;
    } else {
        subjectInput.classList.remove('error');
    }

    // Message validation
    if (messageInput.value.length < 10) {
        errors.push('الرجاء إدخال رسالة لا تقل عن 10 أحرف');
        messageInput.classList.add('error');
        isValid = false;
    } else {
        messageInput.classList.remove('error');
    }

    if (!isValid) {
        showErrors(errors);
    }

    return isValid;
}

// Show error messages
function showErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    // Create and append new error messages
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.color = 'var(--danger)';
    errorContainer.style.marginBottom = '1rem';
    errorContainer.style.padding = '1rem';
    errorContainer.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
    errorContainer.style.borderRadius = '4px';

    errors.forEach(error => {
        const errorElement = document.createElement('p');
        errorElement.textContent = error;
        errorElement.style.marginBottom = '0.5rem';
        errorContainer.appendChild(errorElement);
    });

    contactForm.insertBefore(errorContainer, contactForm.firstChild);

    // Remove error messages after 5 seconds
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Disable submit button and show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success modal
        showSuccessModal();

        // Reset form
        contactForm.reset();

        // Remove any error styling
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.classList.remove('error'));

    } catch (error) {
        console.error('Error submitting form:', error);
        showErrors(['حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.']);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Show success modal
function showSuccessModal() {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners
contactForm.addEventListener('submit', handleSubmit);

// Close modal when clicking outside
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
        closeModal();
    }
});

// Real-time validation
const inputs = contactForm.querySelectorAll('input, textarea');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}); 