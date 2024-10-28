export class UIManager {
    constructor() {
        this.formatters = {
            percentage: (value) => `${(value * 100).toFixed(2)}%`,
            currency: (value) => new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value),
            decimal: (value) => value.toFixed(2),
            shortCurrency: (value) => {
                if (value >= 1000000) {
                    return `R$ ${(value / 1000000).toFixed(1)}MM`;
                }
                if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(1)}K`;
                }
                return `R$ ${value.toFixed(2)}`;
            }
        };

        this.tooltips = {};
        this.modals = {};
        this.activeSection = 'dashboard';
    }

    // Renderização de KPIs
    renderKPICards(container, kpis) {
        container.innerHTML = Object.entries(kpis)
            .map(([key, kpi]) => this.createKPICard(key, kpi))
            .join('');
        this.setupKPIInteractions();
    }

    createKPICard(key, kpi) {
        const formattedValue = this.formatters[kpi.format](kpi.value);
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
                    ${kpi.trend !== undefined ? `
                        <div class="kpi-trend ${trendClass}">
                            <i class="fas fa-${trendIcon}"></i>
                            <span>${trendValue}%</span>
                        </div>
                    ` : ''}
                </div>
                <div class="kpi-details hidden">
                    <p>${kpi.details}</p>
                </div>
            </div>
        `;
    }

    // Renderização da Timeline
    renderTimeline(container, timelineData) {
        container.innerHTML = `
            <div class="timeline-wrapper">
                <div class="timeline-header">
                    <h3>Timeline do Projeto</h3>
                    <div class="timeline-controls">
                        <button class="btn-zoom-in"><i class="fas fa-plus"></i></button>
                        <button class="btn-zoom-out"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div class="timeline-content">
                    ${this.createTimelinePhases(timelineData.phases)}
                </div>
                <div class="timeline-events">
                    ${this.createTimelineEvents(timelineData.phases)}
                </div>
            </div>
        `;
        this.setupTimelineInteractions();
    }

    createTimelinePhases(phases) {
        return phases.map(phase => `
            <div class="timeline-phase" 
                 style="--phase-start: ${phase.start}; --phase-end: ${phase.end}">
                <div class="phase-label">${phase.name}</div>
                <div class="phase-duration">${phase.start}-${phase.end}</div>
            </div>
        `).join('');
    }

    createTimelineEvents(phases) {
        const allEvents = phases.flatMap(phase => 
            phase.events.map(event => ({...event, phase: phase.name}))
        );

        return allEvents.map(event => `
            <div class="timeline-event ${event.type}"
                 style="--event-month: ${event.month}">
                <div class="event-marker">
                    <i class="fas fa-${this.getEventIcon(event.type)}"></i>
                </div>
                <div class="event-details">
                    <span class="event-month">Mês ${event.month}</span>
                    <p class="event-description">${event.details}</p>
                </div>
            </div>
        `).join('');
    }

    // Renderização da Análise
    renderAnalysis(container, analysisData) {
        container.innerHTML = `
            <div class="analysis-wrapper">
                <div class="analysis-header">
                    <h3>Análise Financeira</h3>
                    <div class="analysis-controls">
                        <button class="btn-view-mode" data-mode="chart">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                        <button class="btn-view-mode" data-mode="table">
                            <i class="fas fa-table"></i>
                        </button>
                    </div>
                </div>
                <div class="analysis-content">
                    <div class="analysis-charts">
                        ${this.createAnalysisCharts(analysisData)}
                    </div>
                    <div class="analysis-metrics hidden">
                        ${this.createAnalysisMetrics(analysisData.metrics)}
                    </div>
                </div>
            </div>
        `;
        this.setupAnalysisInteractions();
    }

    // Interações e Eventos
    setupInteractions() {
        this.setupKPIInteractions();
        this.setupTimelineInteractions();
        this.setupAnalysisInteractions();
        this.setupNavigationInteractions();
    }

    setupKPIInteractions() {
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('click', () => {
                const kpiType = card.dataset.kpi;
                this.showKPIDetails(kpiType);
            });

            // Tooltip
            const details = card.querySelector('.kpi-details');
            if (details) {
                card.addEventListener('mouseenter', () => {
                    details.classList.remove('hidden');
                });
                card.addEventListener('mouseleave', () => {
                    details.classList.add('hidden');
                });
            }
        });
    }

    setupTimelineInteractions() {
        const timeline = document.querySelector('.timeline-wrapper');
        if (!timeline) return;

        // Zoom controls
        timeline.querySelector('.btn-zoom-in')?.addEventListener('click', () => {
            this.zoomTimeline(1.2);
        });

        timeline.querySelector('.btn-zoom-out')?.addEventListener('click', () => {
            this.zoomTimeline(0.8);
        });

        // Event interactions
        timeline.querySelectorAll('.timeline-event').forEach(event => {
            event.addEventListener('click', () => {
                this.showEventDetails(event.dataset.event);
            });
        });
    }

    setupAnalysisInteractions() {
        const analysis = document.querySelector('.analysis-wrapper');
        if (!analysis) return;

        // View mode toggle
        analysis.querySelectorAll('.btn-view-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.toggleAnalysisView(mode);
            });
        });
    }

    // Utilitários
    getEventIcon(type) {
        const icons = {
            lance: 'money-bill-wave',
            milestone: 'flag',
            exit: 'door-open'
        };
        return icons[type] || 'circle';
    }

    zoomTimeline(factor) {
        const content = document.querySelector('.timeline-content');
        if (!content) return;

        const currentWidth = parseInt(getComputedStyle(content).width);
        content.style.width = `${currentWidth * factor}px`;
    }

    toggleAnalysisView(mode) {
        const charts = document.querySelector('.analysis-charts');
        const metrics = document.querySelector('.analysis-metrics');

        if (mode === 'chart') {
            charts.classList.remove('hidden');
            metrics.classList.add('hidden');
        } else {
            charts.classList.add('hidden');
            metrics.classList.remove('hidden');
        }
    }

    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    // Atualizações
    updateKPIs(kpis) {
        Object.entries(kpis).forEach(([key, kpi]) => {
            const card = document.querySelector(`[data-kpi="${key}"]`);
            if (!card) return;

            const valueElement = card.querySelector('.kpi-value');
            const trendElement = card.querySelector('.kpi-trend');

            if (valueElement) {
                valueElement.textContent = this.formatters[kpi.format](kpi.value);
            }

            if (trendElement && kpi.trend !== undefined) {
                const trendClass = kpi.trend > 0 ? 'positive' : 'negative';
                const trendIcon = kpi.trend > 0 ? 'trending-up' : 'trending-down';
                const trendValue = Math.abs(kpi.trend * 100).toFixed(1);

                trendElement.className = `kpi-trend ${trendClass}`;
                trendElement.innerHTML = `
                    <i class="fas fa-${trendIcon}"></i>
                    <span>${trendValue}%</span>
                `;
            }
        });
    }
}
