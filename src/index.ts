// src/index.ts (Exemplo simplificado)

import express from 'express';
import { config } from './config/env';
import { connectDatabase } from './infrastructure/database/connection';
import { ProductRepository } from './infrastructure/repositories/ProductRepository';
import { PromotionRepository } from './infrastructure/repositories/PromotionRepository';
import { PromotionService } from './application/PromotionService';
import { ProductService } from './application/ProductService';
import { ProductController } from './presentation/controllers/ProductController';
import { PromotionController } from './presentation/controllers/PromotionController';
import { MenuController } from './presentation/controllers/MenuController';
import { productRoutes } from './presentation/routes/productRoutes';
import { promotionRoutes } from './presentation/routes/promotionRoutes';
import { menuRoutes } from './presentation/routes/menuRoutes';

const app = express();

async function main() {
    try {
        await connectDatabase();

        app.use(express.json());

        const productRepo = new ProductRepository();
        const promotionRepo = new PromotionRepository();
        const promotionService = new PromotionService(promotionRepo);
        const productService = new ProductService(productRepo, promotionService);
        const productController = new ProductController(productService);
        const promotionController = new PromotionController(promotionService);
        const menuController = new MenuController(productService); 
        
        app.use('/api/v1/products', productRoutes(productController));
        app.use('/api/v1/promotions', promotionRoutes(promotionController));
        app.use('/api/v1/menu', menuRoutes(menuController));
        app.listen(config.port, () => {
            console.log(`[Server] Express rodando em http://localhost:${config.port}`);
            console.log(`[Server] Ambiente: ${config.nodeEnv}`);
        });
        
    } catch (error) {
        console.error("Falha fatal na inicialização da aplicação:", error);
        process.exit(1); 
    }
}

main();