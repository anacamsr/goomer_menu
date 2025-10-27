// src/presentation/routes/productRoutes.ts

import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

/**
 * Cria e retorna o Router do Express para a entidade Produto.
 * @param productController - Instância do ProductController injetada (dependência).
 * @returns O objeto Router do Express.
 */
export function productRoutes(productController: ProductController): Router {
    const router = Router();

    router.post('/', productController.createProduct);
    router.get('/', productController.listProducts);
    router.put('/:id', productController.updateProduct);     
    router.delete('/:id', productController.deleteProduct);

    return router;
}