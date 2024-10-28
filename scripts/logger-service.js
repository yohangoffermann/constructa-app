// logger-service.js

import { CONFIG } from './config.js';
import { eventBus } from './event-bus.js';

class LoggerService {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.logLevel = CONFIG.ERROR.LOG_LEVEL;
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        this.initialize();
    }

    initialize() {
        // Configurar listeners de eventos
        eventBus.on('system:error', (error) => this.error(error));
        eventBus.on('system:warning', (warning) => this.warn(warning));
        eventBus.on('system:log', (message) => this.info(message));
        
        // Iniciar worker de persistência
        this.setupPersistence();
    }

    // Métodos principais de logging
    debug(message, context = {}) {
        this.log('debug', message, context);
    }

    info(message, context = {}) {
        this.log('info', message, context);
    }

    warn(message, context = {}) {
        this.log('warn', message, context);
    }

    error(error, context = {}) {
        this.log('error', error.message || error, {
            ...context,
            stack: error.stack,
            name: error.name
        });
    }

    // Método central de logging
    log(level, message, context = {}) {
        if (this.shouldLog(level)) {
            const logEntry = this.createLogEntry(level, message, context);
            this.addLog(logEntry);
            this.processLog(logEntry);
        }
    }

    // Criação de entrada de log
    createLogEntry(level, message, context) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            environment: CONFIG.APP.ENV,
            version: CONFIG.APP.VERSION
        };
    }

    // Processamento de log
    processLog(logEntry) {
        // Console output
        this.consoleOutput(logEntry);
        
        // Enviar para sistema de monitoramento
        if (this.shouldSendToMonitoring(logEntry)) {
            this.sendToMonitoring(logEntry);
        }
        
        // Notificar via eventos
        eventBus.emit('logger:newLog', logEntry);
    }

    // Gestão de armazenamento
    addLog(logEntry) {
        this.logs.push(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    // Persistência
    setupPersistence() {
        setInterval(() => {
            this.persistLogs();
        }, 60000); // Persistir a cada minuto
    }

    persistLogs() {
        try {
            localStorage.setItem('app_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error persisting logs:', error);
        }
    }

    // Recuperação de logs
    getLogs(filters = {}) {
        return this.logs.filter(log => {
            return Object.entries(filters).every(([key, value]) => {
                return log[key] === value;
            });
        });
    }

    // Exportação de logs
    async exportLogs(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.logs, null, 2);
            case 'csv':
                return this.convertToCSV(this.logs);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    // Utilitários
    shouldLog(level) {
        return this.levels[level] >= this.levels[this.logLevel];
    }

    shouldSendToMonitoring(logEntry) {
        return logEntry.level === 'error' || 
               (logEntry.level === 'warn' && CONFIG.APP.ENV === 'production');
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    getUserId() {
        return localStorage.getItem('userId') || 'anonymous';
    }

    consoleOutput(logEntry) {
        const { level, message, context } = logEntry;
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        
        const styles = {
            debug: 'color: gray',
            info: 'color: blue',
            warn: 'color: orange',
            error: 'color: red'
        };

        console.log(
            `%c[${timestamp}] ${level.toUpperCase()}: ${message}`,
            styles[level],
            context
        );
    }

    // Monitoramento
    async sendToMonitoring(logEntry) {
        if (!CONFIG.MONITORING_ENDPOINT) return;

        try {
            await fetch(CONFIG.MONITORING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Error sending log to monitoring:', error);
        }
    }

    // Conversão para CSV
    convertToCSV(logs) {
        const headers = ['timestamp', 'level', 'message', 'context'];
        const rows = logs.map(log => [
            log.timestamp,
            log.level,
            log.message,
            JSON.stringify(log.context)
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    // Limpeza
    cleanup() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.logs = this.logs.filter(log => 
            new Date(log.timestamp).getTime() > oneDayAgo
        );
        this.persistLogs();
    }

    // Configuração
    setLogLevel(level) {
        if (this.levels[level] !== undefined) {
            this.logLevel = level;
        }
    }

    setMaxLogs(max) {
        this.maxLogs = max;
        if (this.logs.length > max) {
            this.logs = this.logs.slice(-max);
        }
    }
}

// Export singleton instance
export const logger = new LoggerService();
