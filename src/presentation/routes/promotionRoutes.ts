import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController';

export function promotionRoutes(controller: PromotionController): Router {
    const router = Router();

    router.post('/', controller.createPromotion);

    return router;
}