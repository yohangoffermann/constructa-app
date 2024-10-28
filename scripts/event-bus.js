// event-bus.js

class EventBus {
    constructor() {
        this.events = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.debug = false;
    }

    // Registro de eventos
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }

        const eventData = {
            callback,
            once: options.once || false,
            priority: options.priority || 0
        };

        this.events.get(eventName).add(eventData);

        // Retorna função para remover listener
        return () => this.off(eventName, callback);
    }

    // Registro de evento único
    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }

    // Remoção de evento
    off(eventName, callback) {
        if (!this.events.has(eventName)) return false;

        if (callback) {
            const events = this.events.get(eventName);
            events.forEach(eventData => {
                if (eventData.callback === callback) {
                    events.delete(eventData);
                }
            });
        } else {
            this.events.delete(eventName);
        }

        return true;
    }

    // Disparo de eventos
    emit(eventName, data = null) {
        if (this.debug) {
            console.log(`[EventBus] Emitting: ${eventName}`, data);
        }

        this.logEvent(eventName, data);

        if (!this.events.has(eventName)) return false;

        const events = Array.from(this.events.get(eventName))
            .sort((a, b) => b.priority - a.priority);

        events.forEach(eventData => {
            try {
                eventData.callback(data);
                
                if (eventData.once) {
                    this.off(eventName, eventData.callback);
                }
            } catch (error) {
                console.error(`Error in event ${eventName}:`, error);
            }
        });

        return true;
    }

    // Emissão assíncrona
    async emitAsync(eventName, data = null) {
        if (!this.events.has(eventName)) return false;

        const events = Array.from(this.events.get(eventName))
            .sort((a, b) => b.priority - a.priority);

        const promises = events.map(eventData => {
            return new Promise(async (resolve) => {
                try {
                    await eventData.callback(data);
                    
                    if (eventData.once) {
                        this.off(eventName, eventData.callback);
                    }
                    
                    resolve();
                } catch (error) {
                    console.error(`Error in async event ${eventName}:`, error);
                    resolve();
                }
            });
        });

        await Promise.all(promises);
        return true;
    }

    // Histórico de eventos
    logEvent(eventName, data) {
        this.eventHistory.push({
            eventName,
            data,
            timestamp: new Date().toISOString()
        });

        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    getEventHistory() {
        return [...this.eventHistory];
    }

    // Utilitários
    hasListeners(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).size > 0;
    }

    getListenerCount(eventName) {
        if (!this.events.has(eventName)) return 0;
        return this.events.get(eventName).size;
    }

    getAllEvents() {
        return Array.from(this.events.keys());
    }

    // Debug
    enableDebug() {
        this.debug = true;
    }

    disableDebug() {
        this.debug = false;
    }

    // Eventos do sistema
    setupSystemEvents() {
        // Evento de erro
        this.on('error', (error) => {
            console.error('[System Error]:', error);
        });

        // Evento de warning
        this.on('warning', (warning) => {
            console.warn('[System Warning]:', warning);
        });

        // Evento de log
        this.on('log', (message) => {
            if (this.debug) {
                console.log('[System Log]:', message);
            }
        });
    }

    // Grupos de eventos
    createEventGroup(groupName, events) {
        events.forEach(event => {
            const fullEventName = `${groupName}:${event}`;
            this.events.set(fullEventName, new Set());
        });
    }

    emitToGroup(groupName, data) {
        const groupEvents = Array.from(this.events.keys())
            .filter(event => event.startsWith(`${groupName}:`));

        groupEvents.forEach(event => this.emit(event, data));
    }

    // Limpeza
    clear() {
        this.events.clear();
        this.eventHistory = [];
        this.setupSystemEvents();
    }

    // Middleware
    use(middleware) {
        const originalEmit = this.emit.bind(this);
        this.emit = (eventName, data) => {
            middleware(eventName, data, () => {
                originalEmit(eventName, data);
            });
        };
    }
}

// Eventos predefinidos do sistema
export const SystemEvents = {
    ERROR: 'system:error',
    WARNING: 'system:warning',
    LOG: 'system:log',
    STATE_CHANGE: 'system:stateChange',
    NAVIGATION: 'system:navigation',
    USER_ACTION: 'system:userAction'
};

// Export singleton instance
export const eventBus = new EventBus();

// Setup inicial
eventBus.setupSystemEvents();

// Exemplo de middleware de logging
eventBus.use((eventName, data, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Event: ${eventName}`);
    next();
});
