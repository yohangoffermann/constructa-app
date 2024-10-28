// utils.js

export const formatters = {
    // Formatação de moeda
    currency: (value, options = {}) => {
        const defaults = {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        return new Intl.NumberFormat('pt-BR', {...defaults, ...options}).format(value);
    },

    // Formatação de moeda compacta (K, M, B)
    compactCurrency: (value) => {
        if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `R$ ${(value / 1e3).toFixed(1)}K`;
        return `R$ ${value.toFixed(0)}`;
    },

    // Formatação de percentual
    percentage: (value, decimals = 2) => {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    // Formatação de data
    date: (date) => {
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }
};

export const calculators = {
    // Cálculo de P/C
    calculatePC: (parcela, credito) => {
        return parcela / (credito || 1);
    },

    // Cálculo de ROE
    calculateROE: (lucro, patrimonioLiquido) => {
        return lucro / (patrimonioLiquido || 1);
    },

    // Valor Presente
    calculatePV: (fv, rate, periods) => {
        return fv / Math.pow(1 + rate, periods);
    },

    // Valor Futuro
    calculateFV: (pv, rate, periods) => {
        return pv * Math.pow(1 + rate, periods);
    }
};

export const validators = {
    // Validação de números
    isValidNumber: (value) => {
        return !isNaN(value) && isFinite(value);
    },

    // Validação de percentual
    isValidPercentage: (value) => {
        return value >= 0 && value <= 1;
    },

    // Validação de data
    isValidDate: (date) => {
        return date instanceof Date && !isNaN(date);
    }
};

export const helpers = {
    // Debounce para funções
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para funções
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone de objetos
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Gerador de IDs únicos
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    }
};

export const analytics = {
    // Tracking de eventos
    trackEvent: (category, action, label = '', value = 0) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    },

    // Tracking de página
    trackPage: (pageName) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: pageName
            });
        }
    }
};

export const errorHandler = {
    // Handler global de erros
    handleError: (error, context = '') => {
        console.error(`[${context}] Error:`, error);
        
        // Log para analytics
        analytics.trackEvent('Error', error.message, context);
        
        // Retornar erro amigável
        return {
            message: 'Ocorreu um erro inesperado',
            details: error.message,
            context: context
        };
    }
};

export const storage = {
    // Local Storage
    local: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                errorHandler.handleError(error, 'LocalStorage:set');
                return false;
            }
        },
        
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                errorHandler.handleError(error, 'LocalStorage:get');
                return null;
            }
        }
    },

    // Session Storage
    session: {
        set: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                errorHandler.handleError(error, 'SessionStorage:set');
                return false;
            }
        },
        
        get: (key) => {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                errorHandler.handleError(error, 'SessionStorage:get');
                return null;
            }
        }
    }
};
