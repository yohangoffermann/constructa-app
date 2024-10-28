// api-service.js

import { CONFIG } from './config.js';
import { errorHandler } from './utils.js';

class ApiService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
    }

    // Configuração do Fetch com timeout
    async fetchWithTimeout(resource, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    // Método GET genérico com retry
    async get(endpoint, params = {}, attempts = 0) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;

            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempts < this.retryAttempts) {
                await this.delay(1000 * (attempts + 1));
                return this.get(endpoint, params, attempts + 1);
            }
            throw error;
        }
    }

    // Método POST genérico
    async post(endpoint, data = {}) {
        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw errorHandler.handleError(error, 'ApiService:post');
        }
    }

    // Headers padrão
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Adicionar outros headers necessários (ex: Authorization)
        };
    }

    // Métodos específicos para Consórcio
    async getGroups(filters = {}) {
        return this.get(CONFIG.API.ENDPOINTS.GROUPS, filters);
    }

    async simulateConsorcio(params) {
        return this.post(CONFIG.API.ENDPOINTS.SIMULATIONS, params);
    }

    async getAnalytics(period) {
        return this.get(CONFIG.API.ENDPOINTS.ANALYTICS, { period });
    }

    // Cache handling
    async getCachedData(key, fetchFunction) {
        if (!CONFIG.CACHE.ENABLED) {
            return fetchFunction();
        }

        const cached = localStorage.getItem(CONFIG.CACHE.PREFIX + key);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CONFIG.CACHE.TTL * 1000) {
                return data;
            }
        }

        const data = await fetchFunction();
        localStorage.setItem(CONFIG.CACHE.PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        return data;
    }

    // Utility methods
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Error handling
    handleApiError(error) {
        // Log error
        console.error('API Error:', error);

        // Track error in analytics
        if (CONFIG.ANALYTICS.ENABLED) {
            // Implement analytics tracking
        }

        // Return user-friendly error
        return {
            success: false,
            error: CONFIG.ERROR.MESSAGES.DEFAULT,
            details: CONFIG.APP.ENV === 'development' ? error.message : null
        };
    }

    // Websocket connection (if needed)
    setupWebSocket() {
        // Implement WebSocket connection
    }

    // Batch requests
    async batchRequests(requests) {
        try {
            const promises = requests.map(request => {
                if (request.method === 'GET') {
                    return this.get(request.endpoint, request.params);
                }
                return this.post(request.endpoint, request.data);
            });

            return await Promise.all(promises);
        } catch (error) {
            throw errorHandler.handleError(error, 'ApiService:batchRequests');
        }
    }

    // File upload handling
    async uploadFile(endpoint, file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw errorHandler.handleError(error, 'ApiService:uploadFile');
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();
