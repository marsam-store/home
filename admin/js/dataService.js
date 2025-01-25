import { config, githubAPI } from './config.js';

class DataService {
    constructor() {
        this.cache = {
            products: null,
            orders: null,
            customers: null,
            messages: null,
            categories: null
        };
    }

    // Products
    async getProducts() {
        try {
            console.log('Getting products...');
            if (!this.cache.products) {
                this.cache.products = await githubAPI.getFile(config.DATA_FILES.PRODUCTS);
            }
            return this.cache.products || [];
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    }

    async addProduct(product) {
        try {
            const products = await this.getProducts();
            product.id = this.generateId();
            product.createdAt = new Date().toISOString();
            products.push(product);
            
            const success = await githubAPI.updateFile(
                config.DATA_FILES.PRODUCTS,
                products,
                `Add product: ${product.name}`
            );

            if (success) {
                this.cache.products = products;
            }
            return success;
        } catch (error) {
            console.error('Error adding product:', error);
            return false;
        }
    }

    async updateProduct(productId, updates) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index === -1) return false;
        
        products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.PRODUCTS,
            products,
            `Update product: ${products[index].name}`
        );

        if (success) {
            this.cache.products = products;
        }
        return success;
    }

    async deleteProduct(productId) {
        const products = await this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        
        if (filtered.length === products.length) return false;
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.PRODUCTS,
            filtered,
            `Delete product: ${productId}`
        );

        if (success) {
            this.cache.products = filtered;
        }
        return success;
    }

    // Orders
    async getOrders() {
        try {
            console.log('Getting orders...');
            if (!this.cache.orders) {
                this.cache.orders = await githubAPI.getFile(config.DATA_FILES.ORDERS);
            }
            return this.cache.orders || [];
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }

    async addOrder(order) {
        const orders = await this.getOrders();
        order.id = this.generateId();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.push(order);
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.ORDERS,
            orders,
            `Add order: ${order.id}`
        );

        if (success) {
            this.cache.orders = orders;
        }
        return success;
    }

    async updateOrderStatus(orderId, status) {
        const orders = await this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        
        if (index === -1) return false;
        
        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.ORDERS,
            orders,
            `Update order status: ${orderId} to ${status}`
        );

        if (success) {
            this.cache.orders = orders;
        }
        return success;
    }

    // Messages
    async getMessages() {
        try {
            console.log('Getting messages...');
            if (!this.cache.messages) {
                this.cache.messages = await githubAPI.getFile(config.DATA_FILES.MESSAGES);
            }
            return this.cache.messages || [];
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    }

    async addMessage(message) {
        const messages = await this.getMessages();
        message.id = this.generateId();
        message.createdAt = new Date().toISOString();
        message.status = 'unread';
        messages.push(message);
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.MESSAGES,
            messages,
            `Add message from: ${message.name}`
        );

        if (success) {
            this.cache.messages = messages;
        }
        return success;
    }

    async markMessageAsRead(messageId) {
        const messages = await this.getMessages();
        const index = messages.findIndex(m => m.id === messageId);
        
        if (index === -1) return false;
        
        messages[index].status = 'read';
        messages[index].readAt = new Date().toISOString();
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.MESSAGES,
            messages,
            `Mark message as read: ${messageId}`
        );

        if (success) {
            this.cache.messages = messages;
        }
        return success;
    }

    // Categories
    async getCategories() {
        try {
            console.log('Getting categories...');
            if (!this.cache.categories) {
                this.cache.categories = await githubAPI.getFile(config.DATA_FILES.CATEGORIES);
            }
            return this.cache.categories || [];
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    async addCategory(category) {
        const categories = await this.getCategories();
        category.id = this.generateId();
        category.createdAt = new Date().toISOString();
        categories.push(category);
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.CATEGORIES,
            categories,
            `Add category: ${category.name}`
        );

        if (success) {
            this.cache.categories = categories;
        }
        return success;
    }

    async updateCategory(categoryId, updates) {
        const categories = await this.getCategories();
        const index = categories.findIndex(c => c.id === categoryId);
        
        if (index === -1) return false;
        
        categories[index] = { ...categories[index], ...updates, updatedAt: new Date().toISOString() };
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.CATEGORIES,
            categories,
            `Update category: ${categories[index].name}`
        );

        if (success) {
            this.cache.categories = categories;
        }
        return success;
    }

    async deleteCategory(categoryId) {
        const categories = await this.getCategories();
        const filtered = categories.filter(c => c.id !== categoryId);
        
        if (filtered.length === categories.length) return false;
        
        const success = await githubAPI.updateFile(
            config.DATA_FILES.CATEGORIES,
            filtered,
            `Delete category: ${categoryId}`
        );

        if (success) {
            this.cache.categories = filtered;
        }
        return success;
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    clearCache() {
        this.cache = {
            products: null,
            orders: null,
            customers: null,
            messages: null,
            categories: null
        };
    }
}

export const dataService = new DataService(); 