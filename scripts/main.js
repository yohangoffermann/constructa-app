import { TeseManager } from './tese-manager.js';
import { UIManager } from './ui-manager.js';
import { ChartManager } from './chart-manager.js';

class App {
    constructor() {
        this.tese = new TeseManager();
        this.ui = new UIManager();
        this.charts = new ChartManager();
        this.initialize();
    }

    initialize() {
        this.loadInitialData();
        this.setupEventListeners();
        this.renderDashboard();
    }

    loadInitialData() {
        const data = this.tese.getInitialState();
        this.ui.updateKPIs(data.kpis);
        this.charts.initializeCharts(data);
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.ui.setupInteractions();
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
        this.charts.renderTimeline(timelineContainer, timelineData);
    }

    renderAnalysis() {
        const analysisContainer = document.querySelector('.analysis-grid');
        const analysisData = this.tese.getAnalysisData();
        this.ui.renderAnalysis(analysisContainer, analysisData);
    }
}

const app = new App();
