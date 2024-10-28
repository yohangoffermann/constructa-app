// state-manager.js

import { CONFIG } from './config.js';
import { storage } from './utils.js';

class StateManager {
    constructor() {
        this.state = {
            simulation: {
                current: null,
                history: [],
                saved: []
            },
            groups: {
                active: [],
                filtered: [],
                selected: null
            },
            ui: {
                currentView: 'dashboard',
                loading: false,
                error: null,
                filters: {},
                sortBy: null,
                theme: 'light'
            },
            user: {
                preferences: {},
                lastAccess: null,
                savedItems: []
            },
            metrics: {
                pcRatio: null,
                roe: null,
                exposure: null,
                efficiency: null
            },
            cache: {
                lastUpdate: null,
                data: {}
            }
        };

        this.listeners = new Map();
        this.initialize();
    }

    // Inicialização
    initialize() {
        this.loadPersistedState();
        this.setupAutoSave();
    }

    // Getters
    getState() {
        return this.state;
    }

    getSimulation() {
        return this.state.simulation.current;
    }

    getGroups() {
        return this.state.groups.active;
    }

    getMetrics() {
        return this.state.metrics;
    }

    // Setters com notificação
    setState(newState, notify = true) {
        this.state = { ...this.state, ...newState };
        if (notify) this.notifyListeners();
    }

    setSimulation(simulation) {
        this.state.simulation.current = simulation;
        this.state.simulation.history.push({
            ...simulation,
            timestamp: new Date().toISOString()
        });
        this.notifyListeners('simulation');
    }

    setGroups(groups) {
        this.state.groups.active = groups;
        this.notifyListeners('groups');
    }

    setMetrics(metrics) {
        this.state.metrics = { ...this.state.metrics, ...metrics };
        this.notifyListeners('metrics');
    }

    // Gestão de UI
    setLoading(loading) {
        this.state.ui.loading = loading;
        this.notifyListeners('ui');
    }

    setError(error) {
        this.state.ui.error = error;
        this.notifyListeners('ui');
    }

    setView(view) {
        this.state.ui.currentView = view;
        this.notifyListeners('ui');
    }

    // Gestão de Filtros
    setFilters(filters) {
        this.state.ui.filters = { ...this.state.ui.filters, ...filters };
        this.applyFilters();
        this.notifyListeners('filters');
    }

    applyFilters() {
        const filters = this.state.ui.filters;
        this.state.groups.filtered = this.state.groups.active.filter(group => {
            return Object.entries(filters).every(([key, value]) => {
                return this.matchFilter(group[key], value);
            });
        });
    }

    matchFilter(value, filter) {
        if (!filter) return true;
        if (typeof filter === 'function') return filter(value);
        return value === filter;
    }

    // Gestão de Cache
    setCacheItem(key, value, ttl = CONFIG.CACHE.TTL) {
        this.state.cache.data[key] = {
            value,
            timestamp: Date.now(),
            ttl
        };
        this.state.cache.lastUpdate = Date.now();
    }

    getCacheItem(key) {
        const item = this.state.cache.data[key];
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl * 1000) {
            delete this.state.cache.data[key];
            return null;
        }
        
        return item.value;
    }

    // Persistência
    loadPersistedState() {
        const savedState = storage.local.get('app_state');
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }
    }

    setupAutoSave() {
        setInterval(() => {
            storage.local.set('app_state', this.state);
        }, 30000); // Auto-save a cada 30 segundos
    }

    // Observer Pattern
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Retorna função de unsubscribe
        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    notifyListeners(key = null) {
        if (key) {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.forEach(callback => callback(this.state));
            }
        } else {
            this.listeners.forEach(listeners => {
                listeners.forEach(callback => callback(this.state));
            });
        }
    }

    // Undo/Redo
    saveSnapshot() {
        const snapshot = JSON.stringify(this.state);
        this.state.simulation.history.push({
            state: snapshot,
            timestamp: Date.now()
        });
    }

    restoreSnapshot(index) {
        const snapshot = this.state.simulation.history[index];
        if (snapshot) {
            this.state = JSON.parse(snapshot.state);
            this.notifyListeners();
        }
    }

    // Utilitários
    reset() {
        this.state = this.getInitialState();
        this.notifyListeners();
    }

    cleanup() {
        // Limpar histórico antigo
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
        const now = Date.now();
        
        this.state.simulation.history = this.state.simulation.history.filter(item =>
            now - new Date(item.timestamp).getTime() < maxAge
        );

        // Limpar cache
        Object.keys(this.state.cache.data).forEach(key => {
            this.getCacheItem(key); // Isso vai limpar itens expirados
        });
    }
}

// Export singleton instance
export const stateManager = new StateManager();
