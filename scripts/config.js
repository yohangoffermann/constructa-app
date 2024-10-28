// config.js

export const CONFIG = {
    // Configurações da Aplicação
    APP: {
        VERSION: '1.0.0',
        NAME: 'Constructa App',
        ENV: 'production', // 'development', 'staging', 'production'
        DEBUG: false
    },

    // Configurações do Consórcio
    CONSORCIO: {
        TAXA_ADMIN: 0.012, // 1.2% a.a.
        PRAZO_MAXIMO: 240, // meses
        LANCE_MINIMO: 0.20, // 20%
        LANCE_MAXIMO: 0.70, // 70%
        CORRECTION_PERIOD: 12, // meses
        MIN_CREDIT: 200000, // R$ 200.000
        MAX_CREDIT: 10000000, // R$ 10.000.000
    },

    // Configurações de API
    API: {
        BASE_URL: 'https://api.constructa.com',
        TIMEOUT: 30000, // 30 segundos
        RETRY_ATTEMPTS: 3,
        ENDPOINTS: {
            AUTH: '/auth',
            GROUPS: '/groups',
            SIMULATIONS: '/simulations',
            ANALYTICS: '/analytics'
        }
    },

    // Configurações de UI
    UI: {
        THEME: {
            PRIMARY_COLOR: '#0068C9',
            SECONDARY_COLOR: '#29B09D',
            SUCCESS_COLOR: '#10B981',
            WARNING_COLOR: '#F59E0B',
            DANGER_COLOR: '#EF4444',
            BACKGROUND: '#F7F9FC',
            TEXT: '#1A1F36'
        },
        ANIMATION: {
            DURATION: 300, // ms
            EASING: 'ease-in-out'
        },
        BREAKPOINTS: {
            MOBILE: 480,
            TABLET: 768,
            DESKTOP: 1024,
            WIDE: 1200
        }
    },

    // Configurações de Charts
    CHARTS: {
        DEFAULT_HEIGHT: 350,
        COLORS: [
            '#0068C9',
            '#29B09D',
            '#F59E0B',
            '#EF4444',
            '#10B981'
        ],
        ANIMATION_SPEED: 800,
        TOOLTIP_DELAY: 100
    },

    // Configurações de Cache
    CACHE: {
        ENABLED: true,
        TTL: 3600, // 1 hora
        PREFIX: 'constructa_',
        KEYS: {
            USER_PREFERENCES: 'user_prefs',
            LAST_SIMULATION: 'last_sim',
            SAVED_GROUPS: 'saved_groups'
        }
    },

    // Configurações de Analytics
    ANALYTICS: {
        ENABLED: true,
        TRACKING_ID: 'UA-XXXXXXXXX-X',
        EVENTS: {
            SIMULATION_CREATED: 'simulation_created',
            GROUP_VIEWED: 'group_viewed',
            CALCULATION_PERFORMED: 'calculation_performed'
        }
    },

    // Configurações de Validação
    VALIDATION: {
        CREDIT: {
            MIN: 200000,
            MAX: 10000000,
            STEP: 10000
        },
        PRAZO: {
            MIN: 24,
            MAX: 240,
            STEP: 12
        },
        LANCE: {
            MIN: 0.20,
            MAX: 0.70,
            STEP: 0.01
        }
    },

    // Configurações de Erro
    ERROR: {
        RETRY_DELAY: 1000, // 1 segundo
        MAX_RETRIES: 3,
        LOG_LEVEL: 'error', // 'debug', 'info', 'warn', 'error'
        MESSAGES: {
            DEFAULT: 'Ocorreu um erro inesperado',
            NETWORK: 'Erro de conexão',
            VALIDATION: 'Dados inválidos',
            AUTH: 'Erro de autenticação'
        }
    },

    // Configurações de Performance
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300, // ms
        THROTTLE_DELAY: 500, // ms
        MAX_CACHED_ITEMS: 100,
        LAZY_LOAD_OFFSET: 200 // px
    },

    // Getters para valores calculados
    getters: {
        isProd: () => CONFIG.APP.ENV === 'production',
        isDev: () => CONFIG.APP.ENV === 'development',
        isDebug: () => CONFIG.APP.DEBUG,
        isMobile: () => window.innerWidth <= CONFIG.UI.BREAKPOINTS.MOBILE,
        isTablet: () => window.innerWidth <= CONFIG.UI.BREAKPOINTS.TABLET,
        isDesktop: () => window.innerWidth > CONFIG.UI.BREAKPOINTS.TABLET
    }
};

// Freeze para prevenir modificações
Object.freeze(CONFIG);

export default CONFIG;
