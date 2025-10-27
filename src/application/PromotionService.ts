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

        let activeDays: DayOfWeek[] = [];

        if (promotion.dia_semana_json && promotion.dia_semana_json.toLowerCase() !== 'undefined') {
            try {
                activeDays = JSON.parse(promotion.dia_semana_json);
            } catch (e) {
                console.error(`[PromotionService] JSON malformado para promoção ID ${promotion.id}:`, promotion.dia_semana_json);
                return false;
            }
        }

        if (!activeDays.includes(currentDay)) {
            return false;
        }

        const startMinutes = TimeUtils.timeToMinutes(promotion.horario_inicio);
        const endMinutes = TimeUtils.timeToMinutes(promotion.horario_fim);

        if (startMinutes > endMinutes) {
            return currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes;
        } else {
            return currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;
        }
    }

    public isPromotionApplicableToProduct(promotion: IPromotionDB, productId: number): boolean {
        const relatedProductIds: number[] = promotion.related_product_ids || [];

        return relatedProductIds.includes(productId);
    }
}