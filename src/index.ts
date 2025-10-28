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
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.json';

const app = express();
const BASE_PATH = '/api/v1';

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
        
        app.use(`${BASE_PATH}/products`, productRoutes(productController));
        app.use(`${BASE_PATH}/promotions`, promotionRoutes(promotionController));
        app.use(`${BASE_PATH}/menu`, menuRoutes(menuController));
        app.listen(config.port, () => {
            console.log(`[Server] Express rodando em http://localhost:${config.port}`);
            console.log(`[Server] Ambiente: ${config.nodeEnv}`);
            console.log(`[Docs] Documentação Swagger em http://localhost:${config.port}${BASE_PATH}/docs`); // Adiciona log
        });
        
        app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    } catch (error) {
        console.error("Falha fatal na inicialização da aplicação:", error);
        process.exit(1); 
    }
}

main();