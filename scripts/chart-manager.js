export class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#0068C9',
            secondary: '#29B09D',
            tertiary: '#F59E0B',
            danger: '#EF4444',
            success: '#10B981',
            background: '#F7F9FC',
            text: '#1A1F36'
        };
        this.chartDefaults = {
            chart: {
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            theme: {
                mode: 'light'
            }
        };
    }

    initializeCharts(data) {
        this.initializeTimelineChart(data.timeline);
        this.initializeCashFlowChart(data.analysis.cashFlow);
        this.initializeMetricsChart(data.analysis.metrics);
        this.initializeEfficiencyChart(data.analysis.rentabilizacao);
    }

    initializeTimelineChart(timelineData) {
        const options = {
            ...this.chartDefaults,
            chart: {
                ...this.chartDefaults.chart,
                type: 'rangeBar',
                height: 250
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '80%',
                    rangeBarGroupRows: true
                }
            },
            xaxis: {
                type: 'numeric',
                min: 0,
                max: 48,
                title: {
                    text: 'Meses'
                }
            },
            yaxis: {
                labels: {
                    formatter: (value) => value
                }
            },
            colors: [
                this.colors.primary,
                this.colors.secondary,
                this.colors.tertiary
            ],
            legend: {
                position: 'top'
            },
            tooltip: {
                custom: ({seriesIndex, dataPointIndex, w}) => {
                    const phase = timelineData.phases[seriesIndex];
                    const events = phase.events.filter(event => 
                        event.month >= w.config.series[seriesIndex].data[dataPointIndex].x &&
                        event.month <= w.config.series[seriesIndex].data[dataPointIndex].y
                    );
                    
                    return `
                        <div class="timeline-tooltip">
                            <div class="tooltip-header">${phase.name}</div>
                            <div class="tooltip-content">
                                <div>Mês ${w.config.series[seriesIndex].data[dataPointIndex].x} - 
                                     Mês ${w.config.series[seriesIndex].data[dataPointIndex].y}</div>
                                ${events.map(event => `
                                    <div class="event-item">
                                        <span class="event-month">Mês ${event.month}:</span>
                                        <span class="event-detail">${event.details}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
        };

        const series = timelineData.phases.map(phase => ({
            name: phase.name,
            data: [{
                x: phase.start,
                y: phase.end
            }]
        }));

        this.charts.timeline = new ApexCharts(
            document.querySelector('#timelineChart'),
            {...options, series}
        );
        this.charts.timeline.render();
    }

    initializeCashFlowChart(cashFlowData) {
        const options = {
            ...this.chartDefaults,
            chart: {
                ...this.chartDefaults.chart,
                type: 'area',
                height: 350,
                stacked: true
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: [2, 2],
                dashArray: [0, 0]
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.6,
                    opacityTo: 0.1
                }
            },
            xaxis: {
                type: 'numeric',
                title: {
                    text: 'Meses'
                },
                tickAmount: 12
            },
            yaxis: {
                title: {
                    text: 'Valor (R$)'
                },
                labels: {
                    formatter: (value) => this.formatCurrency(value)
                }
            },
            colors: [this.colors.success, this.colors.danger],
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: (value) => this.formatCurrency(value)
                }
            }
        };

        const series = [
            {
                name: 'Entradas',
                data: cashFlowData.map(item => ({
                    x: item.mes,
                    y: item.entrada
                }))
            },
            {
                name: 'Saídas',
                data: cashFlowData.map(item => ({
                    x: item.mes,
                    y: -item.saida
                }))
            }
        ];

        this.charts.cashFlow = new ApexCharts(
            document.querySelector('#cashFlowChart'),
            {...options, series}
        );
        this.charts.cashFlow.render();
    }

    initializeMetricsChart(metricsData) {
        const options = {
            ...this.chartDefaults,
            chart: {
                ...this.chartDefaults.chart,
                type: 'radar',
                height: 300
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: this.colors.background,
                        fill: {
                            colors: [this.colors.background]
                        }
                    }
                }
            },
            stroke: {
                width: 2
            },
            fill: {
                opacity: 0.5
            },
            markers: {
                size: 4
            },
            xaxis: {
                categories: ['P/C Ratio', 'ROE', 'Exposição', 'Eficiência']
            },
            yaxis: {
                show: false
            },
            colors: [this.colors.primary]
        };

        const series = [{
            name: 'Métricas',
            data: [
                metricsData.pcRatio.current * 100,
                metricsData.roe.current * 100,
                metricsData.exposure.current * 100,
                metricsData.efficiency.combined * 100
            ]
        }];

        this.charts.metrics = new ApexCharts(
            document.querySelector('#metricsChart'),
            {...options, series}
        );
        this.charts.metrics.render();
    }

    initializeEfficiencyChart(rentabilizacaoData) {
        const options = {
            ...this.chartDefaults,
            chart: {
                ...this.chartDefaults.chart,
                type: 'donut',
                height: 300
            },
            labels: ['Cobertura de Parcelas', 'Saldo Disponível'],
            colors: [this.colors.success, this.colors.primary],
            tooltip: {
                y: {
                    formatter: (value) => `${value}%`
                }
            },
            legend: {
                position: 'bottom'
            }
        };

        const series = [
            rentabilizacaoData.coberturaParcelas * 100,
            (1 - rentabilizacaoData.coberturaParcelas) * 100
        ];

        this.charts.efficiency = new ApexCharts(
            document.querySelector('#efficiencyChart'),
            {...options, series}
        );
        this.charts.efficiency.render();
    }

    updateCharts(data) {
        if (this.charts.timeline) {
            this.updateTimelineChart(data.timeline);
        }
        if (this.charts.cashFlow) {
            this.updateCashFlowChart(data.analysis.cashFlow);
        }
        if (this.charts.metrics) {
            this.updateMetricsChart(data.analysis.metrics);
        }
        if (this.charts.efficiency) {
            this.updateEfficiencyChart(data.analysis.rentabilizacao);
        }
    }

    // Utilitários
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Métodos de atualização individual
    updateTimelineChart(timelineData) {
        if (!this.charts.timeline) return;
        
        const series = timelineData.phases.map(phase => ({
            name: phase.name,
            data: [{
                x: phase.start,
                y: phase.end
            }]
        }));

        this.charts.timeline.updateSeries(series);
    }

    updateCashFlowChart(cashFlowData) {
        if (!this.charts.cashFlow) return;

        const series = [
            {
                name: 'Entradas',
                data: cashFlowData.map(item => ({
                    x: item.mes,
                    y: item.entrada
                }))
            },
            {
                name: 'Saídas',
                data: cashFlowData.map(item => ({
                    x: item.mes,
                    y: -item.saida
                }))
            }
        ];

        this.charts.cashFlow.updateSeries(series);
    }

    updateMetricsChart(metricsData) {
        if (!this.charts.metrics) return;

        const series = [{
            name: 'Métricas',
            data: [
                metricsData.pcRatio.current * 100,
                metricsData.roe.current * 100,
                metricsData.exposure.current * 100,
                metricsData.efficiency.combined * 100
            ]
        }];

        this.charts.metrics.updateSeries(series);
    }

    updateEfficiencyChart(rentabilizacaoData) {
        if (!this.charts.efficiency) return;

        const series = [
            rentabilizacaoData.coberturaParcelas * 100,
            (1 - rentabilizacaoData.coberturaParcelas) * 100
        ];

        this.charts.efficiency.updateSeries(series);
    }
}
