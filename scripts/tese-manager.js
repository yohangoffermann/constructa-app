export class TeseManager {
    constructor() {
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            // Configurações Globais
            config: {
                creditoTotal: 50000000,    // R$ 50MM
                numeroCotasTotal: 5,       // 5 cotas
                valorCota: 10000000,       // R$ 10MM cada
                parcelaMensal: 38500,      // Por cota
                parcelaTotal: 192500,      // Total mensal
                prazoTotal: 240,           // meses
                taxaAdmin: 0.012,          // 1.2% a.a.
                percentualLance: 0.30,     // 30%
                valorLanceTotal: 15000000, // R$ 15MM
                tlr: 0.0860                // 8.60% a.a.
            },

            // KPIs Principais
            kpis: {
                pcRatio: {
                    label: 'P/C Ratio',
                    value: 0.0055,
                    format: 'percentage',
                    icon: 'chart-line',
                    trend: -0.02,
                    details: 'Relação parcela/crédito atual'
                },
                roe: {
                    label: 'ROE Projetado',
                    value: 0.24,
                    format: 'percentage',
                    icon: 'chart-pie',
                    trend: 0.05,
                    details: 'Retorno sobre patrimônio anualizado'
                },
                exposure: {
                    label: 'Exposição Máxima',
                    value: 0.33,
                    format: 'percentage',
                    icon: 'shield',
                    trend: -0.01,
                    details: 'Exposição máxima de capital'
                },
                efficiency: {
                    label: 'Eficiência',
                    value: 0.92,
                    format: 'percentage',
                    icon: 'bolt',
                    trend: 0.03,
                    details: 'Índice de eficiência operacional'
                }
            },

            // Timeline do Projeto
            timeline: {
                phases: [
                    {
                        name: 'Entrada',
                        start: 1,
                        end: 9,
                        events: [
                            {
                                month: 1,
                                type: 'lance',
                                value: 2,
                                details: 'Contemplação cotas 1 e 2'
                            },
                            {
                                month: 4,
                                type: 'lance',
                                value: 2,
                                details: 'Contemplação cotas 3 e 4'
                            },
                            {
                                month: 7,
                                type: 'lance',
                                value: 1,
                                details: 'Contemplação cota 5'
                            }
                        ]
                    },
                    {
                        name: 'Execução',
                        start: 10,
                        end: 36,
                        events: [
                            {
                                month: 12,
                                type: 'milestone',
                                details: 'Primeira correção INCC'
                            },
                            {
                                month: 24,
                                type: 'milestone',
                                details: 'Segunda correção INCC'
                            },
                            {
                                month: 36,
                                type: 'milestone',
                                details: 'Terceira correção INCC'
                            }
                        ]
                    },
                    {
                        name: 'Saída',
                        start: 37,
                        end: 48,
                        events: [
                            {
                                month: 42,
                                type: 'exit',
                                details: 'Início processo de saída'
                            },
                            {
                                month: 48,
                                type: 'exit',
                                details: 'Conclusão do ciclo'
                            }
                        ]
                    }
                ]
            },

            // Análise Financeira
            analysis: {
                cashFlow: this.generateCashFlow(),
                metrics: this.calculateMetrics(),
                rentabilizacao: {
                    saldoMedio: 15000000,
                    rendimentoAcumulado: 1290000,
                    coberturaParcelas: 0.55
                }
            }
        };
    }

    generateCashFlow() {
        const cashFlow = [];
        const config = this.state.config;

        for (let mes = 1; mes <= 48; mes++) {
            let entrada = 0;
            let saida = config.parcelaTotal;
            
            // Lances
            if (mes === 1) saida += config.valorLanceTotal * 0.4;
            if (mes === 4) saida += config.valorLanceTotal * 0.4;
            if (mes === 7) saida += config.valorLanceTotal * 0.2;

            // Rentabilização média
            entrada += (15000000 * config.tlr) / 12;

            cashFlow.push({
                mes,
                entrada,
                saida,
                saldo: entrada - saida,
                saldoAcumulado: mes === 1 ? (entrada - saida) : 
                    (cashFlow[mes-2].saldoAcumulado + entrada - saida)
            });
        }

        return cashFlow;
    }

    calculateMetrics() {
        const config = this.state.config;
        
        return {
            pcRatio: {
                current: config.parcelaTotal / (config.creditoTotal - config.valorLanceTotal),
                historical: [],
                projection: []
            },
            roe: {
                current: 0.24,
                historical: [],
                projection: []
            },
            exposure: {
                current: 0.33,
                max: 0.35,
                min: 0.30
            },
            efficiency: {
                operational: 0.92,
                financial: 0.88,
                combined: 0.90
            }
        };
    }

    // Getters
    getKPIs() {
        return this.state.kpis;
    }

    getTimelineData() {
        return this.state.timeline;
    }

    getAnalysisData() {
        return this.state.analysis;
    }

    getCashFlow() {
        return this.state.analysis.cashFlow;
    }

    getConfig() {
        return this.state.config;
    }

    // Métodos de Atualização
    updateKPI(key, value) {
        if (this.state.kpis[key]) {
            this.state.kpis[key].value = value;
            this.state.kpis[key].trend = this.calculateTrend(key, value);
        }
    }

    calculateTrend(key, newValue) {
        const oldValue = this.state.kpis[key].value;
        return (newValue - oldValue) / oldValue;
    }

    // Métodos de Análise
    analyzeEfficiency() {
        const cashFlow = this.state.analysis.cashFlow;
        const rentabilizacao = this.state.analysis.rentabilizacao;
        
        return {
            coverageRatio: rentabilizacao.rendimentoAcumulado / 
                          (this.state.config.parcelaTotal * 48),
            averageBalance: rentabilizacao.saldoMedio,
            efficiency: rentabilizacao.coberturaParcelas
        };
    }
}
