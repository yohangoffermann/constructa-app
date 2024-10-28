// performance-monitor.js

import { CONFIG } from './config.js';
import { logger } from './logger-service.js';
import { eventBus } from './event-bus.js';

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoads: [],
            apiCalls: [],
            renders: [],
            interactions: [],
            resources: [],
            memory: []
        };

        this.thresholds = {
            pageLoad: 3000,    // 3 segundos
            apiCall: 1000,     // 1 segundo
            render: 100,       // 100ms
            memory: 90         // 90% uso
        };

        this.observers = new Map();
        this.initialize();
    }

    initialize() {
        this.setupPerformanceObservers();
        this.setupMemoryMonitoring();
        this.setupNetworkMonitoring();
        this.setupInteractionMonitoring();
    }

    // Performance Observers
    setupPerformanceObservers() {
        // Navegação/Page Loads
        this.createObserver('navigation', (entries) => {
            entries.forEach(entry => {
                const metric = {
                    type: 'navigation',
                    timestamp: performance.now(),
                    duration: entry.duration,
                    domComplete: entry.domComplete,
                    loadEventEnd: entry.loadEventEnd,
                    domInteractive: entry.domInteractive,
                    firstContentfulPaint: entry.firstContentfulPaint
                };

                this.addMetric('pageLoads', metric);
                this.checkThreshold('pageLoad', entry.duration);
            });
        });

        // Recursos
        this.createObserver('resource', (entries) => {
            entries.forEach(entry => {
                const metric = {
                    type: 'resource',
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize,
                    timestamp: performance.now()
                };

                this.addMetric('resources', metric);
            });
        });

        // Long Tasks
        this.createObserver('longtask', (entries) => {
            entries.forEach(entry => {
                const metric = {
                    type: 'longtask',
                    duration: entry.duration,
                    timestamp: performance.now()
                };

                this.addMetric('renders', metric);
                this.checkThreshold('render', entry.duration);
            });
        });
    }

    // Memory Monitoring
    setupMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const metric = {
                    timestamp: performance.now(),
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };

                this.addMetric('memory', metric);
                this.checkMemoryUsage(metric);
            }, 10000); // Check every 10 seconds
        }
    }

    // Network Monitoring
    setupNetworkMonitoring() {
        if (window.navigator.connection) {
            window.navigator.connection.addEventListener('change', () => {
                this.logNetworkCondition();
            });
        }
    }

    // Interaction Monitoring
    setupInteractionMonitoring() {
        const interactionEvents = ['click', 'input', 'scroll'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const metric = {
                    type: eventType,
                    timestamp: performance.now(),
                    target: event.target.tagName,
                    path: this.getElementPath(event.target)
                };

                this.addMetric('interactions', metric);
            }, { passive: true });
        });
    }

    // API Call Monitoring
    trackApiCall(url, duration) {
        const metric = {
            type: 'api',
            url,
            duration,
            timestamp: performance.now()
        };

        this.addMetric('apiCalls', metric);
        this.checkThreshold('apiCall', duration);
    }

    // Métodos de Análise
    analyzePerformance() {
        return {
            pageLoads: this.analyzePageLoads(),
            apiCalls: this.analyzeApiCalls(),
            renders: this.analyzeRenders(),
            resources: this.analyzeResources(),
            memory: this.analyzeMemory()
        };
    }

    analyzePageLoads() {
        const loads = this.metrics.pageLoads;
        return {
            average: this.calculateAverage(loads, 'duration'),
            max: this.calculateMax(loads, 'duration'),
            min: this.calculateMin(loads, 'duration'),
            p95: this.calculatePercentile(loads, 'duration', 95)
        };
    }

    analyzeApiCalls() {
        const calls = this.metrics.apiCalls;
        return {
            average: this.calculateAverage(calls, 'duration'),
            max: this.calculateMax(calls, 'duration'),
            min: this.calculateMin(calls, 'duration'),
            p95: this.calculatePercentile(calls, 'duration', 95)
        };
    }

    // Utilitários
    addMetric(category, metric) {
        this.metrics[category].push(metric);
        this.trimMetrics(category);
        eventBus.emit('performance:newMetric', { category, metric });
    }

    trimMetrics(category, maxSize = 1000) {
        if (this.metrics[category].length > maxSize) {
            this.metrics[category] = this.metrics[category].slice(-maxSize);
        }
    }

    checkThreshold(type, value) {
        if (value > this.thresholds[type]) {
            logger.warn(`Performance threshold exceeded`, {
                type,
                value,
                threshold: this.thresholds[type]
            });
        }
    }

    checkMemoryUsage(metric) {
        const usagePercent = (metric.usedJSHeapSize / metric.jsHeapSizeLimit) * 100;
        if (usagePercent > this.thresholds.memory) {
            logger.warn(`High memory usage`, {
                usage: usagePercent,
                threshold: this.thresholds.memory
            });
        }
    }

    // Cálculos Estatísticos
    calculateAverage(metrics, key) {
        if (!metrics.length) return 0;
        return metrics.reduce((sum, m) => sum + m[key], 0) / metrics.length;
    }

    calculateMax(metrics, key) {
        if (!metrics.length) return 0;
        return Math.max(...metrics.map(m => m[key]));
    }

    calculateMin(metrics, key) {
        if (!metrics.length) return 0;
        return Math.min(...metrics.map(m => m[key]));
    }

    calculatePercentile(metrics, key, p) {
        if (!metrics.length) return 0;
        const sorted = metrics.map(m => m[key]).sort((a, b) => a - b);
        const pos = (sorted.length - 1) * p / 100;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
    }

    // Exportação de Dados
    exportMetrics() {
        return {
            metrics: this.metrics,
            analysis: this.analyzePerformance(),
            timestamp: new Date().toISOString()
        };
    }

    // Limpeza
    cleanup() {
        Object.keys(this.metrics).forEach(category => {
            this.metrics[category] = [];
        });
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
