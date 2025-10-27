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
            if (!promotionData.titulo ||
                !promotionData.descricao ||
                !promotionData.preco_promocional ||
                !promotionData.dia_semana ||
                !promotionData.horario_inicio ||
                !promotionData.horario_fim ||
                !promotionData.product_id) {
                res.status(400).json({ error: "Dados inválidos. Campos obrigatórios faltando (titulo, descricao, preco_promocional, dia_semana, horario_inicio, horario_fim, product_id)." });
                return;
            }

            const newId = await this.promotionService.createPromotion(promotionData);

            res.status(201).json({ id: newId, message: "Promoção criada com sucesso." });

        } catch (error) {
            console.error(error);
            if (error instanceof Error && (error.message.includes("time") || error.message.includes("interval"))) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro interno ao criar promoção." });
        }
    }

    public listAllPromotions = async (req: Request, res: Response): Promise<void> => {
        try {
            const promotions = await this.promotionService.listAllPromotions();
            res.status(200).json(promotions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro interno ao listar promoções." });
        }
    }

    public updatePromotion = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ error: "ID de promoção inválido." });
                return;
            }

            const promotionData: Partial<IPromotionInput> = req.body;

            await this.promotionService.updatePromotion(id, promotionData);

            res.status(200).json({ message: `Promoção ID ${id} atualizada com sucesso.` });

        } catch (error) {
            console.error(error);
            if (error instanceof Error && (error.message.includes("time") || error.message.includes("interval"))) {
                res.status(400).json({ error: error.message });
                return;
            }
            if (error instanceof Error && error.message.includes("not found")) {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro interno ao atualizar promoção." });
        }
    }

    public deletePromotion = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ error: "ID de promoção inválido." });
                return;
            }

            await this.promotionService.deletePromotion(id);

            res.status(200).json({ message: `Promoção ID ${id} deletada com sucesso.` });

        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message.includes("not found")) {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro interno ao deletar promoção." });
        }
    }
}