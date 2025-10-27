import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController';

export function promotionRoutes(controller: PromotionController): Router {
    const router = Router();

    router.post('/', controller.createPromotion);
    router.get('/', controller.listAllPromotions);
    router.put('/:id', controller.updatePromotion);
    router.delete('/:id', controller.deletePromotion);
    
    return router;
}