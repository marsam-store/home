const config = {
    GITHUB_TOKEN: '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',
    GITHUB_USERNAME: 'marsam-store',
    GITHUB_REPO: 'home',
    GITHUB_BRANCH: 'main',
    API_BASE_URL: 'https://api.github.com',
    
    // Data file paths in the repository
    DATA_FILES: {
        PRODUCTS: 'data/products.json',
        ORDERS: 'data/orders.json',
        CUSTOMERS: 'data/customers.json',
        MESSAGES: 'data/messages.json',
        CATEGORIES: 'data/categories.json'
    }
};

// GitHub API helper functions
const githubAPI = {
    get headers() {
        return {
            'Authorization': `token ${config.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
    },

    async getFile(path) {
        try {
            const response = await fetch(`${config.API_BASE_URL}/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${path}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get file: ${path}`);
            }
            
            const data = await response.json();
            if (data.content) {
                return JSON.parse(atob(data.content));
            }
            return null;
        } catch (error) {
            console.error('Error fetching file:', error);
            return null;
        }
    },

    async updateFile(path, content, message = 'Update data') {
        try {
            // First get the current file to get its SHA
            const currentFile = await fetch(`${config.API_BASE_URL}/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${path}`, {
                headers: this.headers
            }).then(res => res.json());

            if (!currentFile || !currentFile.sha) {
                throw new Error(`File not found: ${path}`);
            }

            const response = await fetch(`${config.API_BASE_URL}/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${path}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    message,
                    content: btoa(JSON.stringify(content, null, 2)),
                    sha: currentFile.sha,
                    branch: config.GITHUB_BRANCH
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update file: ${path}`);
            }

            return true;
        } catch (error) {
            console.error('Error updating file:', error);
            return false;
        }
    },

    async createFile(path, content, message = 'Create data file') {
        try {
            const response = await fetch(`${config.API_BASE_URL}/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${path}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    message,
                    content: btoa(JSON.stringify(content, null, 2)),
                    branch: config.GITHUB_BRANCH
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create file: ${path}`);
            }

            return true;
        } catch (error) {
            console.error('Error creating file:', error);
            return false;
        }
    }
};

export { config, githubAPI }; 