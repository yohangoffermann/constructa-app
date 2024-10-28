// validation-service.js

import { CONFIG } from './config.js';
import { errorHandler } from './utils.js';

class ValidationService {
    constructor() {
        this.rules = {
            credit: {
                min: CONFIG.VALIDATION.CREDIT.MIN,
                max: CONFIG.VALIDATION.CREDIT.MAX,
                step: CONFIG.VALIDATION.CREDIT.STEP
            },
            prazo: {
                min: CONFIG.VALIDATION.PRAZO.MIN,
                max: CONFIG.VALIDATION.PRAZO.MAX,
                step: CONFIG.VALIDATION.PRAZO.STEP
            },
            lance: {
                min: CONFIG.VALIDATION.LANCE.MIN,
                max: CONFIG.VALIDATION.LANCE.MAX,
                step: CONFIG.VALIDATION.LANCE.STEP
            }
        };
    }

    // Validação principal de simulação
    validateSimulation(data) {
        const errors = [];

        // Validar crédito
        if (!this.validateCredit(data.credit)) {
            errors.push({
                field: 'credit',
                message: `Crédito deve estar entre ${this.formatCurrency(this.rules.credit.min)} e ${this.formatCurrency(this.rules.credit.max)}`
            });
        }

        // Validar prazo
        if (!this.validatePrazo(data.prazo)) {
            errors.push({
                field: 'prazo',
                message: `Prazo deve estar entre ${this.rules.prazo.min} e ${this.rules.prazo.max} meses`
            });
        }

        // Validar lance
        if (!this.validateLance(data.lance)) {
            errors.push({
                field: 'lance',
                message: `Lance deve estar entre ${this.formatPercentage(this.rules.lance.min)} e ${this.formatPercentage(this.rules.lance.max)}`
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validações específicas
    validateCredit(value) {
        return this.isNumber(value) &&
               value >= this.rules.credit.min &&
               value <= this.rules.credit.max &&
               value % this.rules.credit.step === 0;
    }

    validatePrazo(value) {
        return this.isNumber(value) &&
               value >= this.rules.prazo.min &&
               value <= this.rules.prazo.max &&
               value % this.rules.prazo.step === 0;
    }

    validateLance(value) {
        return this.isNumber(value) &&
               value >= this.rules.lance.min &&
               value <= this.rules.lance.max;
    }

    // Validação de grupo
    validateGroup(group) {
        const errors = [];

        // Validar número de participantes
        if (!this.validateParticipants(group.participants)) {
            errors.push({
                field: 'participants',
                message: 'Número inválido de participantes'
            });
        }

        // Validar distribuição de créditos
        if (!this.validateCreditDistribution(group.credits)) {
            errors.push({
                field: 'credits',
                message: 'Distribuição de créditos inválida'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validação de dados de entrada
    validateInput(value, rules) {
        if (!rules) return true;

        const errors = [];

        // Required
        if (rules.required && !value) {
            errors.push('Campo obrigatório');
        }

        // Min/Max
        if (rules.min !== undefined && value < rules.min) {
            errors.push(`Valor mínimo: ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
            errors.push(`Valor máximo: ${rules.max}`);
        }

        // Pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push('Formato inválido');
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customError = rules.validate(value);
            if (customError) errors.push(customError);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validações de negócio
    validateBusinessRules(data) {
        const errors = [];

        // Validar relação parcela/crédito
        if (!this.validatePCRatio(data.parcela, data.credito)) {
            errors.push({
                rule: 'pc_ratio',
                message: 'Relação parcela/crédito inválida'
            });
        }

        // Validar exposição
        if (!this.validateExposure(data.exposure)) {
            errors.push({
                rule: 'exposure',
                message: 'Exposição acima do limite permitido'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Utilitários
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatPercentage(value) {
        return `${(value * 100).toFixed(1)}%`;
    }

    // Validações específicas de negócio
    validatePCRatio(parcela, credito) {
        const ratio = parcela / credito;
        return ratio <= 0.01; // 1% máximo
    }

    validateExposure(exposure) {
        return exposure <= 0.35; // 35% máximo
    }

    validateParticipants(participants) {
        return participants >= 100 && participants <= 5000;
    }

    validateCreditDistribution(credits) {
        const total = credits.reduce((sum, credit) => sum + credit, 0);
        const average = total / credits.length;
        
        // Verifica se não há concentração excessiva
        return credits.every(credit => credit <= average * 2);
    }

    // Handler de erros
    handleValidationError(error) {
        return errorHandler.handleError(error, 'Validation');
    }
}

// Export singleton instance
export const validationService = new ValidationService();
