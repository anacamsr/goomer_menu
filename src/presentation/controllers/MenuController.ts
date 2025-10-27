import { Request, Response } from 'express';
import { ProductService } from '../../application/ProductService';

export class MenuController {
    private productService: ProductService;
    constructor(productService: ProductService) {
        this.productService = productService;
    }
    
    public getConsolidatedMenu = async (req: Request, res: Response): Promise<void> => {
        try {
            const timezone = req.query.timezone as string | undefined;
            const menu = await this.productService.getConsolidatedMenu(timezone);
            res.status(200).json(menu);

        } catch (error) {
            console.error('[MenuController] Erro ao obter cardápio consolidado:', error);
            res.status(500).json({ 
                error: "Ocorreu um erro ao processar o cardápio. Tente novamente mais tarde." 
            });
        }
    }
}