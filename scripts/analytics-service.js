// analytics-service.js

import { CONFIG } from './config.js';
import { storage } from './utils.js';

class AnalyticsService {
    constructor() {
        this.enabled = CONFIG.ANALYTICS.ENABLED;
        this.trackingId = CONFIG.ANALYTICS.TRACKING_ID;
        this.events = CONFIG.ANALYTICS.EVENTS;
        this.sessionId = this.generateSessionId();
        this.metrics = {
            interactions: 0,
            calculations: 0,
            errors: 0,
            loadTime: 0
        };
    }

    // Inicialização
    init() {
        if (!this.enabled) return;

        this.startTracking();
        this.trackPageLoad();
        this.setupPerformanceTracking();
    }

    // Geração de ID de sessão
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Tracking de eventos
    trackEvent(category, action, label = null, value = null) {
        if (!this.enabled) return;

        const event = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        this.logEvent(event);
        this.updateMetrics(category);
        
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }

    // Tracking específico para consórcio
    trackConsorcioInteraction(type, data) {
        this.trackEvent('consorcio', type, JSON.stringify(data));
    }

    trackCalculation(inputData, result) {
        this.trackEvent('calculation', 'perform', null, {
            input: inputData,
            output: result
        });
        this.metrics.calculations++;
    }

    trackError(error, context) {
        this.trackEvent('error', context, error.message);
        this.metrics.errors++;
    }

    // Performance tracking
    setupPerformanceTracking() {
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    this.trackPerformanceMetric(entry);
                });
            });

            observer.observe({ entryTypes: ['navigation', 'resource', 'longtask'] });
        }
    }

    trackPerformanceMetric(entry) {
        const metric = {
            type: entry.entryType,
            name: entry.name,
            duration: entry.duration,
            timestamp: new Date().toISOString()
        };

        this.logPerformance(metric);
    }

    // User behavior tracking
    trackUserBehavior() {
        let lastActivity = Date.now();
        let scrollDepth = 0;

        document.addEventListener('mousemove', () => {
            const now = Date.now();
            if (now - lastActivity > 1000) {
                this.trackEvent('user', 'activity', 'mouse_move');
                lastActivity = now;
            }
        });

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const newScrollDepth = Math.round((currentScroll / pageHeight) * 100);

            if (newScrollDepth > scrollDepth) {
                scrollDepth = newScrollDepth;
                this.trackEvent('user', 'scroll_depth', null, scrollDepth);
            }
        });
    }

    // Métricas de negócio
    trackBusinessMetrics(data) {
        const metrics = {
            pcRatio: data.pcRatio,
            roe: data.roe,
            efficiency: data.efficiency,
            timestamp: new Date().toISOString()
        };

        this.logBusinessMetrics(metrics);
    }

    // Logging
    logEvent(event) {
        const events = storage.local.get('analytics_events') || [];
        events.push(event);
        storage.local.set('analytics_events', events);
    }

    logPerformance(metric) {
        const metrics = storage.local.get('performance_metrics') || [];
        metrics.push(metric);
        storage.local.set('performance_metrics', metrics);
    }

    logBusinessMetrics(metrics) {
        const allMetrics = storage.local.get('business_metrics') || [];
        allMetrics.push(metrics);
        storage.local.set('business_metrics', allMetrics);
    }

    // Relatórios
    generateReport(startDate, endDate) {
        const events = storage.local.get('analytics_events') || [];
        const metrics = storage.local.get('performance_metrics') || [];
        const businessMetrics = storage.local.get('business_metrics') || [];

        return {
            period: {
                start: startDate,
                end: endDate
            },
            summary: {
                totalEvents: events.length,
                calculations: this.metrics.calculations,
                errors: this.metrics.errors,
                averageLoadTime: this.calculateAverageLoadTime(metrics)
            },
            events: this.filterByDate(events, startDate, endDate),
            performance: this.filterByDate(metrics, startDate, endDate),
            business: this.filterByDate(businessMetrics, startDate, endDate)
        };
    }

    // Utilitários
    calculateAverageLoadTime(metrics) {
        const loadTimes = metrics
            .filter(m => m.type === 'navigation')
            .map(m => m.duration);

        return loadTimes.length ? 
            loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 
            0;
    }

    filterByDate(array, startDate, endDate) {
        return array.filter(item => {
            const date = new Date(item.timestamp);
            return date >= startDate && date <= endDate;
        });
    }

    // Limpeza
    cleanup() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias
        const now = Date.now();

        ['analytics_events', 'performance_metrics', 'business_metrics'].forEach(key => {
            const items = storage.local.get(key) || [];
            const filtered = items.filter(item => 
                now - new Date(item.timestamp).getTime() < maxAge
            );
            storage.local.set(key, filtered);
        });
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
