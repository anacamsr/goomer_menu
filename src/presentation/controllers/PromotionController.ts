import { Request, Response } from 'express';
import { PromotionService } from '../../application/PromotionService';
import { IPromotionInput } from '../../domain/Promotion';

export class PromotionController {
    private promotionService: PromotionService;

    constructor(promotionService: PromotionService) {
        this.promotionService = promotionService;
    }

    public createPromotion = async (req: Request, res: Response): Promise<void> => {
        try {
            const promotionData: IPromotionInput = req.body;
            if (!promotionData.descricao || !promotionData.preco_promocional || !promotionData.horario_inicio || !promotionData.horario_fim) {
                res.status(400).json({ error: "Dados inválidos. Campos obrigatórios faltando." });
                return;
            }
            const newId = await this.promotionService.createPromotion(promotionData, promotionData.product_ids);

            res.status(201).json({ id: newId, message: "Promoção criada com sucesso." });

        } catch (error) {
            console.error(error);
            if (error instanceof Error && (error.message.includes("formato HH:mm") || error.message.includes("intervalo de 15 minutos"))) {
                 res.status(400).json({ error: error.message });
                 return;
            }
            res.status(500).json({ error: "Erro interno ao criar promoção." });
        }
    }

    // ... Outros métodos como listAll, update, delete ...
}