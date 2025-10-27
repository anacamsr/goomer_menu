import { Request, Response } from 'express';
import { ProductService } from '../../application/ProductService';
import { IProductInput } from '../../domain/Product';

export class ProductController {
    private productService: ProductService;

    constructor(productService: ProductService) {
        this.productService = productService;
    }

    public createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const productData: IProductInput = req.body;
            if (!productData.nome || !productData.preco || !productData.categoria) {
                res.status(400).json({ error: "Dados inválidos. Nome, preço e categoria são obrigatórios." });
                return;
            }
            const newId = await this.productService.createProduct(productData);
            res.status(201).json({ id: newId, message: "Produto criado com sucesso." });
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message.includes("preço do produto")) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro interno ao criar produto." });
        }
    }

    public getConsolidatedMenu = async (req: Request, res: Response): Promise<void> => {
        try {
            const timezone = req.query.timezone as string | undefined;
            const menu = await this.productService.getConsolidatedMenu(timezone);

            res.status(200).json(menu);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro interno ao carregar o cardápio." });
        }
    }

    public listProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await this.productService.listAllProducts();
            res.status(200).json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro interno ao listar produtos." });
        }
    }

    public updateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const productData: Partial<IProductInput> = req.body;

            if (isNaN(id)) {
                res.status(400).json({ error: "ID inválido." });
                return;
            }

            const updated = await this.productService.updateProduct(id, productData);

            if (updated) {
                res.status(200).json({ message: "Produto atualizado com sucesso." });
            } else {
                res.status(404).json({ error: "Produto não encontrado ou nenhum campo para atualizar." });
            }

        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Erro interno ao atualizar produto." });
        }
    }

    public deleteProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                res.status(400).json({ error: "ID inválido." });
                return;
            }

            const deleted = await this.productService.deleteProduct(id);

            if (deleted) {
                res.status(200).json({ message: "Produto excluído (ocultado) com sucesso." });
            } else {
                res.status(404).json({ error: "Produto não encontrado." });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro interno ao excluir produto." });
        }
    }
}