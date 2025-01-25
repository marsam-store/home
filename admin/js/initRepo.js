import { config, githubAPI } from './config.js';

async function initializeRepository() {
    const dataFiles = [
        { path: config.DATA_FILES.PRODUCTS, content: [] },
        { path: config.DATA_FILES.ORDERS, content: [] },
        { path: config.DATA_FILES.CUSTOMERS, content: [] },
        { path: config.DATA_FILES.MESSAGES, content: [] },
        { path: config.DATA_FILES.CATEGORIES, content: [] }
    ];

    console.log('Starting repository initialization...');

    for (const file of dataFiles) {
        console.log(`Creating ${file.path}...`);
        try {
            const success = await githubAPI.createFile(file.path, file.content, `Initialize ${file.path}`);
            if (success) {
                console.log(`✅ Successfully created ${file.path}`);
            } else {
                console.error(`❌ Failed to create ${file.path}`);
            }
        } catch (error) {
            console.error(`Error creating ${file.path}:`, error);
        }
    }

    console.log('Repository initialization complete!');
}

// Add button to trigger initialization
document.addEventListener('DOMContentLoaded', () => {
    const loginBox = document.querySelector('.login-box');
    const initButton = document.createElement('button');
    initButton.className = 'login-btn init-repo-btn';
    initButton.textContent = 'تهيئة المستودع';
    initButton.style.marginTop = '1rem';
    initButton.style.background = '#2ecc71';
    
    initButton.addEventListener('click', async () => {
        initButton.disabled = true;
        initButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التهيئة...';
        
        await initializeRepository();
        
        initButton.textContent = '✅ تم تهيئة المستودع';
        setTimeout(() => {
            initButton.remove();
        }, 3000);
    });
    
    loginBox.appendChild(initButton);
}); 