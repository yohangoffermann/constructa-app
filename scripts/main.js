// main.js

import { TeseManager } from './tese-manager.js';
import { UIManager } from './ui-manager.js';
import { ChartManager } from './chart-manager.js';
import { eventBus } from './event-bus.js';
import { logger } from './logger-service.js';

class App {
    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            // Inicializar gerenciadores
            this.tese = new TeseManager();
            this.ui = new UIManager();
            this.charts = new ChartManager();

            // Setup inicial
            await this.setupApplication();
            
            // Carregar dados iniciais
            this.loadInitialData();
            
            // Setup de eventos
            this.setupEventListeners();

            logger.info('Aplicação inicializada com sucesso');
        } catch (error) {
            logger.error('Erro na inicialização:', error);
            this.handleError(error);
        }
    }

    async setupApplication() {
        // Ativar seção inicial
        this.activateSection('dashboard');
        
        // Renderizar KPIs iniciais
        this.renderInitialKPIs();
        
        // Inicializar gráficos
        this.initializeCharts();
    }

    loadInitialData() {
        const initialState = this.tese.getInitialState();
        this.ui.updateKPIs(initialState.kpis);
        this.charts.initializeCharts(initialState);
    }

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
        const simulationForm = document.getElementById('simulationForm');
        if (simulationForm) {
            simulationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSimulation(e);
            });
        }
    }

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

        // Atualizar dados da seção
        this.updateSectionData(sectionId);
    }

    updateSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'analysis':
                this.updateAnalysis();
                break;
            case 'simulation':
                this.updateSimulation();
                break;
        }
    }

    renderInitialKPIs() {
        const kpiContainer = document.querySelector('.kpi-grid');
        if (kpiContainer) {
            const kpis = this.tese.getKPIs();
            this.ui.renderKPICards(kpiContainer, kpis);
        }
    }

    initializeCharts() {
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            const timelineData = this.tese.getTimelineData();
            this.charts.renderTimeline(timelineContainer, timelineData);
        }

        // Inicializar outros gráficos conforme necessário
        this.initializeAnalysisCharts();
    }

    initializeAnalysisCharts() {
        const analysisData = this.tese.getAnalysisData();
        
        if (document.getElementById('cashFlowChart')) {
            this.charts.initializeCashFlowChart(analysisData.cashFlow);
        }
        
        if (document.getElementById('metricsChart')) {
            this.charts.initializeMetricsChart(analysisData.metrics);
        }
        
        if (document.getElementById('efficiencyChart')) {
            this.charts.initializeEfficiencyChart(analysisData.rentabilizacao);
        }
    }

    async handleSimulation(event) {
        try {
            const formData = new FormData(event.target);
            const data = {
                creditValue: Number(formData.get('creditValue')),
                term: Number(formData.get('term')),
                downPayment: Number(formData.get('downPayment')) / 100
            };

            // Executar simulação
            const result = await this.tese.simulateConsorcio(data);
            
            // Atualizar UI com resultados
            this.ui.updateSimulationResults(result);
            
            // Atualizar gráficos
            this.charts.updateCharts(result);
            
            // Log do sucesso
            logger.info('Simulação realizada com sucesso', { data, result });
        } catch (error) {
            logger.error('Erro na simulação:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        this.ui.showError({
            message: 'Ocorreu um erro na aplicação',
            details: error.message
        });
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
