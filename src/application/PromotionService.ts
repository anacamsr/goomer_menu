import { IPromotionInput, IPromotionDB, DayOfWeek } from '../domain/Promotion';
import { PromotionRepository } from '../infrastructure/repositories/PromotionRepository';
import { TimeUtils } from '../utils/TimeUtils';

export class PromotionService {
    private promotionRepository: PromotionRepository;

    constructor(promotionRepository: PromotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    private validatePromotionData(promotionData: Partial<IPromotionInput>): void {

        if (promotionData.horario_inicio !== undefined) {
            this.validateTimeFormat(promotionData.horario_inicio, 'início');
        }
        if (promotionData.horario_fim !== undefined) {
            this.validateTimeFormat(promotionData.horario_fim, 'fim');
        }

        if (promotionData.horario_inicio && promotionData.horario_fim) {
            if (!TimeUtils.isValidTimeInterval(promotionData.horario_inicio, promotionData.horario_fim)) {
                throw new Error("O intervalo de horário da promoção é inválido.");
            }
        }
    }

    private validateTimeFormat(timeString: string, field: string): void {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!regex.test(timeString)) {
            throw new Error(`O horário de ${field} deve estar no formato HH:mm (24h).`);
        }

        const minutes = parseInt(timeString.split(':')[1], 10);
        if (minutes % 15 !== 0) {
            throw new Error(`Os minutos no horário de ${field} devem ter intervalo mínimo de 15 minutos (00, 15, 30, 45).`);
        }
    }

    public async createPromotion(promotionData: IPromotionInput): Promise<number> {
        this.validatePromotionData(promotionData);

        return this.promotionRepository.create(promotionData);
    }

    public async listAllPromotions(): Promise<IPromotionDB[]> {
        return this.promotionRepository.findAll();
    }

    public async updatePromotion(id: number, promotionData: Partial<IPromotionInput>): Promise<boolean> {
        if (!id) {
            throw new Error("ID da promoção é obrigatório para atualização.");
        }

        this.validatePromotionData(promotionData);

        const success = await this.promotionRepository.update(id, promotionData);
        return success;
    }

    public async deletePromotion(id: number): Promise<boolean> {
        if (!id) {
            throw new Error("ID da promoção é obrigatório para exclusão.");
        }

        const success = await this.promotionRepository.delete(id);
        return success;
    }

    public isPromotionActiveNow(promotion: IPromotionDB, timezone?: string): boolean {
        const { currentDay, currentTimeMinutes } = TimeUtils.getCurrentDayAndTime(timezone);

        console.log(`[PromotionService] Verificando promoção: ${promotion.descricao}`);
        console.log(`Dia atual: ${currentDay} | Dias ativos: ${promotion.dia_semana}`);
        console.log(`Hora atual: ${currentTimeMinutes} min | Início: ${promotion.horario_inicio} | Fim: ${promotion.horario_fim}`);

        let activeDays: DayOfWeek[] = [];

        const diaSemanaField = (promotion as any).dia_semana_json || (promotion as any).dia_semana;

        if (diaSemanaField && diaSemanaField.toLowerCase() !== 'undefined') {
            try {
                // Se for um JSON válido (ex: ["MONDAY","TUESDAY"])
                if (diaSemanaField.trim().startsWith('[')) {
                    activeDays = JSON.parse(diaSemanaField);
                } else {
                    // Se for apenas um dia simples (ex: "MONDAY")
                    activeDays = [diaSemanaField.toUpperCase()];
                }
            } catch (e) {
                console.error(`[PromotionService] Erro ao interpretar dia_semana para promoção ID ${promotion.id}:`, diaSemanaField);
                return false;
            }
        }

        if (!activeDays.includes(currentDay)) {
            console.log("⛔ Promoção inativa: dia não incluso.");
            return false;
        }

        const startMinutes = TimeUtils.timeToMinutes(promotion.horario_inicio);
        const endMinutes = TimeUtils.timeToMinutes(promotion.horario_fim);

        const isActive = startMinutes > endMinutes
            ? currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes
            : currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;

        console.log(isActive ? "✅ Promoção ativa!" : "⛔ Fora do horário.");

        return isActive;
    }

    public isPromotionApplicableToProduct(promotion: IPromotionDB, productId: number): boolean {
        if (promotion.product_id && Number(promotion.product_id) === productId) {
            console.log(`✅ Produto ${productId} vinculado à promoção ${promotion.descricao}`);
            return true;
        }
        console.log(`⛔ Produto ${productId} não faz parte da promoção ${promotion.descricao}`);
        return false;
    }
    
}