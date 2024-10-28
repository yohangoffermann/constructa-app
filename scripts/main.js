import { TeseManager } from './tese-manager.js';
import { UIManager } from './ui-manager.js';
import { ChartManager } from './chart-manager.js';

class App {
    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            // Inicialização dos gerenciadores
            this.tese = new TeseManager();
            this.ui = new UIManager();
            this.charts = new ChartManager();

            // Setup inicial
            await this.setupApplication();
            
            // Carregar dados iniciais
            this.loadInitialData();
            
            // Setup de eventos
            this.setupEventListeners();
            
            // Renderizar dashboard
            this.renderDashboard();

            console.log('Aplicação inicializada com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.handleError(error);
        }
    }

    async setupApplication() {
        // Configuração inicial da aplicação
        document.body.classList.add('loading');
        
        // Verificar dependências
        this.checkDependencies();
        
        // Setup do tema
        this.setupTheme();
        
        // Remover loading
        document.body.classList.remove('loading');
    }

    checkDependencies() {
        // Verificar se todas as dependências necessárias estão carregadas
        const required = ['ApexCharts', 'FontAwesome'];
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            throw new Error(`Dependências faltando: ${missing.join(', ')}`);
        }
    }

    setupTheme() {
        // Configurar tema baseado nas preferências do usuário
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    loadInitialData() {
        // Carregar dados iniciais
        const initialState = this.tese.getInitialState();
        
        // Atualizar UI com dados iniciais
        this.ui.updateKPIs(initialState.kpis);
        
        // Inicializar gráficos
        this.charts.initializeCharts(initialState);
    }

    setupEventListeners() {
        // Eventos globais
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Eventos de navegação
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        // Eventos de interação
        this.setupInteractionEvents();
        
        // Eventos de atualização
        this.setupUpdateEvents();
    }

    setupInteractionEvents() {
        // Eventos de interação com KPIs
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleKPIClick(e));
        });

        // Eventos de interação com timeline
        document.querySelector('.timeline-container')?.addEventListener('scroll', 
            this.handleTimelineScroll.bind(this));

        // Eventos de interação com gráficos
        document.querySelectorAll('.chart-container').forEach(container => {
            container.addEventListener('click', this.handleChartClick.bind(this));
        });
    }

    setupUpdateEvents() {
        // Atualização periódica de dados
        setInterval(() => this.updateData(), 60000); // Atualizar a cada minuto
        
        // Observer para elementos visíveis
        this.setupVisibilityObserver();
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.updateVisibleSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        // Observar seções principais
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    renderDashboard() {
        this.renderKPIs();
        this.renderTimeline();
        this.renderAnalysis();
    }

    renderKPIs() {
        const kpiContainer = document.querySelector('.kpi-grid');
        const kpis = this.tese.getKPIs();
        this.ui.renderKPICards(kpiContainer, kpis);
    }

    renderTimeline() {
        const timelineContainer = document.querySelector('.timeline-container');
        const timelineData = this.tese.getTimelineData();
        this.ui.renderTimeline(timelineContainer, timelineData);
    }

    renderAnalysis() {
        const analysisContainer = document.querySelector('.analysis-grid');
        const analysisData = this.tese.getAnalysisData();
        this.ui.renderAnalysis(analysisContainer, analysisData);
    }

    // Event Handlers
    handleNavigation(event) {
        event.preventDefault();
        const target = event.target.getAttribute('href').substring(1);
        this.navigateToSection(target);
    }

    handleResize() {
        this.charts.handleResize();
    }

    handleKPIClick(event) {
        const kpiType = event.currentTarget.dataset.kpi;
        this.showKPIDetails(kpiType);
    }

    handleTimelineScroll(event) {
        // Implementar lógica de scroll da timeline
    }

    handleChartClick(event) {
        // Implementar lógica de interação com gráficos
    }

    // Navigation
    navigateToSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
        
        this.updateVisibleSection(sectionId);
    }

    // Updates
    async updateData() {
        try {
            const updatedData = await this.tese.getUpdatedData();
            this.ui.updateKPIs(updatedData.kpis);
            this.charts.updateCharts(updatedData);
        } catch (error) {
            console.error('Erro na atualização:', error);
            this.handleError(error);
        }
    }

    updateVisibleSection(sectionId) {
        // Atualizar seção visível e dados relacionados
        this.ui.updateActiveSection(sectionId);
        this.updateSectionData(sectionId);
    }

    updateSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboardData();
                break;
            case 'analysis':
                this.updateAnalysisData();
                break;
            // Adicionar outros casos conforme necessário
        }
    }

    // Error Handling
    handleError(error) {
        console.error('Erro na aplicação:', error);
        
        // Mostrar mensagem de erro para o usuário
        this.ui.showError({
            message: 'Ocorreu um erro na aplicação',
            details: error.message,
            type: 'error'
        });
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
