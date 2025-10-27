import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';

export function menuRoutes(menuController: MenuController): Router {
    const router = Router();
    router.get('/', menuController.getConsolidatedMenu);
    
    return router;
}