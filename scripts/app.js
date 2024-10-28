// Versão standalone para GitHub Pages
const APP = {
    // Configurações
    config: {
        debug: true,
        colors: {
            primary: '#0068C9',
            secondary: '#29B09D',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444'
        },
        validation: {
            credit: {
                min: 200000,
                max: 10000000,
                step: 10000
            },
            term: {
                min: 24,
                max: 240,
                step: 12
            },
            downPayment: {
                min: 20,
                max: 70,
                step: 1
            }
        }
    },

    // Estado da aplicação
    state: {
        currentSection: 'dashboard',
        charts: {},
        kpis: {
            pcRatio: {
                label: 'P/C Ratio',
                value: 0.0055,
                trend: -0.02,
                icon: 'chart-line',
                description: 'Relação Parcela/Crédito'
            },
            roe: {
                label: 'ROE Projetado',
                value: 0.24,
                trend: 0.05,
                icon: 'chart-pie',
                description: 'Retorno sobre Patrimônio'
            },
            exposure: {
                label: 'Exposição Máxima',
                value: 0.33,
                trend: -0.01,
                icon: 'shield',
                description: 'Exposição de Capital'
            },
            efficiency: {
                label: 'Eficiência',
                value: 0.92,
                trend: 0.03,
                icon: 'bolt',
                description: 'Índice de Eficiência'
            }
        }
    },

    // Inicialização
    init() {
        console.log('Constructa App iniciado');
        this.setupEventListeners();
        this.renderKPIs();
        this.setupCharts();
        this.activateSection('dashboard');
    },

    // Event Listeners
    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-items a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.activateSection(section);
            });
        });

        // Formulário de simulação
        const form = document.getElementById('simulationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSimulation(e));
        }

        // Controles de visualização
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.btn-view').dataset.view;
                this.toggleView(e.target.closest('.analysis-card'), view);
            });
        });
    },

    // Navegação
    activateSection(sectionId) {
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

        this.state.currentSection = sectionId;
        this.updateSection(sectionId);
    },

    // KPIs
    renderKPIs() {
        const container = document.querySelector('.kpi-grid');
        if (!container) return;

        container.innerHTML = Object.entries(this.state.kpis)
            .map(([key, kpi]) => this.createKPICard(key, kpi))
            .join('');
    },

    createKPICard(key, kpi) {
        const trendClass = kpi.trend > 0 ? 'positive' : 'negative';
        const trendIcon = kpi.trend > 0 ? 'trending-up' : 'trending-down';
        const value = this.formatValue(kpi.value);

        return `
            <div class="kpi-card" data-kpi="${key}">
                <div class="kpi-icon">
                    <i class="fas fa-${kpi.icon}"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-label">${kpi.label}</h3>
                    <p class="kpi-value">${value}</p>
                    <div class="kpi-trend ${trendClass}">
                        <i class="fas fa-${trendIcon}"></i>
                        <span>${Math.abs(kpi.trend * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="kpi-description">${kpi.description}</div>
            </div>
        `;
    },

    // Charts
    setupCharts() {
        if (window.ApexCharts) {
            this.setupTimelineChart();
            this.setupCashFlowChart();
            this.setupEfficiencyChart();
            this.setupExposureChart();
        }
    },

    setupTimelineChart() {
        const element = document.querySelector('.timeline-container');
        if (!element) return;

        const options = {
            chart: {
                type: 'rangeBar',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '80%',
                    rangeBarGroupRows: true
                }
            },
            colors: [
                this.config.colors.primary,
                this.config.colors.secondary,
                this.config.colors.success
            ],
            series: [{
                name: 'Timeline',
                data: [
                    {
                        x: 'Entrada',
                        y: [1, 9],
                        fillColor: this.config.colors.primary
                    },
                    {
                        x: 'Execução',
                        y: [10, 36],
                        fillColor: this.config.colors.secondary
                    },
                    {
                        x: 'Saída',
                        y: [37, 48],
                        fillColor: this.config.colors.success
                    }
                ]
            }],
            xaxis: {
                type: 'numeric',
                min: 1,
                max: 48,
                title: {
                    text: 'Meses'
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#666'
                    }
                }
            }
        };

        this.state.charts.timeline = new ApexCharts(element, options);
        this.state.charts.timeline.render();
    },

    setupCashFlowChart() {
        const element = document.getElementById('cashFlowChart');
        if (!element) return;

        const options = {
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Entradas',
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
            }, {
                name: 'Saídas',
                data: [20, 35, 40, 45, 39, 52, 65, 85, 110]
            }],
            xaxis: {
                categories: ['M1', 'M6', 'M12', 'M18', 'M24', 'M30', 'M36', 'M42', 'M48']
            },
            colors: [this.config.colors.success, this.config.colors.danger],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3
                }
            }
        };

        this.state.charts.cashFlow = new ApexCharts(element, options);
        this.state.charts.cashFlow.render();
    },

    setupEfficiencyChart() {
        const element = document.getElementById('efficiencyChart');
        if (!element) return;

        const options = {
            chart: {
                type: 'radialBar',
                height: 350
            },
            series: [92],
            labels: ['Eficiência'],
            colors: [this.config.colors.primary],
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '70%'
                    },
                    dataLabels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: this.config.colors.primary
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 700,
                            formatter: function (val) {
                                return val + '%';
                            }
                        }
                    }
                }
            }
        };

        this.state.charts.efficiency = new ApexCharts(element, options);
        this.state.charts.efficiency.render();
    },

    setupExposureChart() {
        const element = document.getElementById('exposureChart');
        if (!element) return;

        const options = {
            chart: {
                type: 'line',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Exposição',
                data: [33, 35, 30, 25, 20, 15, 10, 5, 0]
            }],
            xaxis: {
                categories: ['M1', 'M6', 'M12', 'M18', 'M24', 'M30', 'M36', 'M42', 'M48']
            },
            colors: [this.config.colors.warning],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 4
            }
        };

        this.state.charts.exposure = new ApexCharts(element, options);
        this.state.charts.exposure.render();
    },

    // Simulação
    handleSimulation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const data = {
            creditValue: Number(formData.get('creditValue')),
            term: Number(formData.get('term')),
            downPayment: Number(formData.get('downPayment'))
        };

        if (this.validateSimulation(data)) {
            this.calculateSimulation(data);
        }
    },

    validateSimulation(data) {
        const { creditValue, term, downPayment } = data;
        const validation = this.config.validation;

        if (creditValue < validation.credit.min || creditValue > validation.credit.max) {
            this.showError(`Valor deve estar entre ${this.formatCurrency(validation.credit.min)} e ${this.formatCurrency(validation.credit.max)}`);
            return false;
        }

        if (term < validation.term.min || term > validation.term.max) {
            this.showError(`Prazo deve estar entre ${validation.term.min} e ${validation.term.max} meses`);
            return false;
        }

        if (downPayment < validation.downPayment.min || downPayment > validation.downPayment.max) {
            this.showError(`Lance deve estar entre ${validation.downPayment.min}% e ${validation.downPayment.max}%`);
            return false;
        }

        return true;
    },

    calculateSimulation(data) {
        const results = {
            parcela: (data.creditValue * (1 - data.downPayment/100)) / data.term,
            totalPago: 0,
            economiaTotal: 0
        };

        results.totalPago = results.parcela * data.term;
        results.economiaTotal = data.creditValue - results.totalPago;

        this.showResults(results);
    },

    // Utilitários
    formatValue(value) {
        return (value * 100).toFixed(2) + '%';
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    showError(message) {
        alert(message);
    },

    showResults(results) {
        const container = document.getElementById('simulationResults');
        if (!container) return;

        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="results-card">
                <h3>Resultados da Simulação</h3>
                <div class="results-grid">
                    <div class="result-item">
                        <label>Parcela Mensal:</label>
                        <span>${this.formatCurrency(results.parcela)}</span>
                    </div>
                    <div class="result-item">
                        <label>Total Pago:</label>
                        <span>${this.formatCurrency(results.totalPago)}</span>
                    </div>
                    <div class="result-item">
                        <label>Economia Total:</label>
                        <span>${this.formatCurrency(results.economiaTotal)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    toggleView(card, view) {
        const chartContainer = card.querySelector('.chart-container');
        const tableContainer = card.querySelector('.table-container');

        if (view === 'chart') {
            chartContainer?.classList.remove('hidden');
            tableContainer?.classList.add('hidden');
        } else {
            chartContainer?.classList.add('hidden');
            tableContainer?.classList.remove('hidden');
        }
    },

    updateSection(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.renderKPIs();
                break;
            case 'analysis':
                // Atualizar análises
                break;
            case 'simulation':
                // Reset formulário
                document.getElementById('simulationForm')?.reset();
                document.getElementById('simulationResults')?.classList.add('hidden');
                break;
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => APP.init());
