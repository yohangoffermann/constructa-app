// Configurações globais
const CONFIG = {
    APP: {
        VERSION: '1.0.0',
        NAME: 'Constructa App',
        DEBUG: true
    },
    CHARTS: {
        DEFAULT_HEIGHT: 350,
        COLORS: ['#0068C9', '#29B09D', '#F59E0B', '#EF4444', '#10B981']
    },
    VALIDATION: {
        CREDIT: {
            MIN: 200000,
            MAX: 10000000,
            STEP: 10000
        },
        TERM: {
            MIN: 24,
            MAX: 240,
            STEP: 12
        },
        DOWN_PAYMENT: {
            MIN: 20,
            MAX: 70,
            STEP: 1
        }
    }
};

// Estado global da aplicação
const STATE = {
    currentSection: 'dashboard',
    simulation: null,
    charts: {},
    kpis: {
        pcRatio: {
            label: 'P/C Ratio',
            value: 0.0055,
            trend: -0.02,
            format: 'percentage',
            icon: 'chart-line'
        },
        roe: {
            label: 'ROE Projetado',
            value: 0.24,
            trend: 0.05,
            format: 'percentage',
            icon: 'chart-pie'
        },
        exposure: {
            label: 'Exposição Máxima',
            value: 0.33,
            trend: -0.01,
            format: 'percentage',
            icon: 'shield'
        },
        efficiency: {
            label: 'Eficiência',
            value: 0.92,
            trend: 0.03,
            format: 'percentage',
            icon: 'bolt'
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('Constructa App iniciado');
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    renderKPIs();
    setupCharts();
    setupSimulationForm();
    activateSection('dashboard');
}

// Navegação
function setupNavigation() {
    document.querySelectorAll('.nav-items a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            activateSection(targetId);
        });
    });
}

function activateSection(sectionId) {
    // Atualizar navegação
    document.querySelectorAll('.nav-items a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    // Atualizar seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    STATE.currentSection = sectionId;
    updateSectionData(sectionId);
}

function updateSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'analysis':
            updateAnalysis();
            break;
        case 'simulation':
            updateSimulation();
            break;
    }
}

// KPIs
function renderKPIs() {
    const kpiContainer = document.querySelector('.kpi-grid');
    if (!kpiContainer) return;

    kpiContainer.innerHTML = Object.entries(STATE.kpis)
        .map(([key, kpi]) => createKPICard(key, kpi))
        .join('');
}

function createKPICard(key, kpi) {
    const formattedValue = formatValue(kpi.value, kpi.format);
    const trendClass = kpi.trend > 0 ? 'positive' : 'negative';
    const trendIcon = kpi.trend > 0 ? 'trending-up' : 'trending-down';
    const trendValue = Math.abs(kpi.trend * 100).toFixed(1);

    return `
        <div class="kpi-card" data-kpi="${key}">
            <div class="kpi-icon">
                <i class="fas fa-${kpi.icon}"></i>
            </div>
            <div class="kpi-content">
                <h3 class="kpi-label">${kpi.label}</h3>
                <p class="kpi-value">${formattedValue}</p>
                <div class="kpi-trend ${trendClass}">
                    <i class="fas fa-${trendIcon}"></i>
                    <span>${trendValue}%</span>
                </div>
            </div>
        </div>
    `;
}

// Charts
function setupCharts() {
    if (window.ApexCharts) {
        initializeTimelineChart();
        initializeCashFlowChart();
        initializeMetricsChart();
    }
}

function initializeTimelineChart() {
    const element = document.querySelector('.timeline-container');
    if (!element) return;

    const options = {
        chart: {
            type: 'rangeBar',
            height: 250
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '80%'
            }
        },
        series: [{
            name: 'Timeline',
            data: [
                {
                    x: 'Entrada',
                    y: [1, 9]
                },
                {
                    x: 'Execução',
                    y: [10, 36]
                },
                {
                    x: 'Saída',
                    y: [37, 48]
                }
            ]
        }],
        colors: CONFIG.CHARTS.COLORS
    };

    STATE.charts.timeline = new ApexCharts(element, options);
    STATE.charts.timeline.render();
}

// Simulação
function setupSimulationForm() {
    const form = document.getElementById('simulationForm');
    if (!form) return;

    form.addEventListener('submit', handleSimulation);
}

function handleSimulation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const simulation = {
        creditValue: Number(formData.get('creditValue')),
        term: Number(formData.get('term')),
        downPayment: Number(formData.get('downPayment')) / 100
    };

    if (validateSimulation(simulation)) {
        calculateSimulation(simulation);
    }
}

function validateSimulation(data) {
    const { creditValue, term, downPayment } = data;
    const validation = CONFIG.VALIDATION;

    if (creditValue < validation.CREDIT.MIN || creditValue > validation.CREDIT.MAX) {
        showError('Valor do crédito inválido');
        return false;
    }

    if (term < validation.TERM.MIN || term > validation.TERM.MAX) {
        showError('Prazo inválido');
        return false;
    }

    if (downPayment < validation.DOWN_PAYMENT.MIN/100 || downPayment > validation.DOWN_PAYMENT.MAX/100) {
        showError('Percentual de lance inválido');
        return false;
    }

    return true;
}

function calculateSimulation(data) {
    // Implementar cálculos
    console.log('Calculando simulação:', data);
    
    // Atualizar UI com resultados
    updateSimulationResults(data);
}

// Utilitários
function formatValue(value, format) {
    switch(format) {
        case 'percentage':
            return `${(value * 100).toFixed(2)}%`;
        case 'currency':
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        default:
            return value.toString();
    }
}

function showError(message) {
    alert(message); // Implementar melhor feedback visual
}

// Updates específicos
function updateDashboard() {
    renderKPIs();
    // Atualizar outros elementos do dashboard
}

function updateAnalysis() {
    // Atualizar elementos da análise
}

function updateSimulation() {
    // Atualizar elementos da simulação
}

function updateSimulationResults(data) {
    const resultsContainer = document.getElementById('simulationResults');
    if (!resultsContainer) return;

    resultsContainer.classList.remove('hidden');
    // Implementar exibição dos resultados
}
