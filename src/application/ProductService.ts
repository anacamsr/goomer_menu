import { IProductInput, IProductDB } from '../domain/Product';
import { ProductRepository } from '../infrastructure/repositories/ProductRepository';
import { PromotionService } from './PromotionService';
import { IMenuItem } from '../domain/Menu';
import { IPromotionDB } from '../domain/Promotion';

export class ProductService {
    private productRepository: ProductRepository;
    private promotionService: PromotionService;

    constructor(
        productRepository: ProductRepository,
        promotionService: PromotionService
    ) {
        this.productRepository = productRepository;
        this.promotionService = promotionService;
    }

    public async createProduct(productData: IProductInput): Promise<number> {
        if (productData.preco <= 0) {
            throw new Error("O preço do produto deve ser positivo.");
        }
        return this.productRepository.create(productData);
    }

    public async listAllProducts(): Promise<IProductDB[]> {
        return this.productRepository.findAll();
    }

    public async updateProduct(id: number, productData: Partial<IProductInput>): Promise<boolean> {
        return this.productRepository.update(id, productData);
    }

    public async deleteProduct(id: number): Promise<boolean> {
        return this.productRepository.delete(id);
    }

    public async getConsolidatedMenu(timezone?: string): Promise<IMenuItem[]> {
        const visibleProducts = await this.productRepository.findVisible();

        if (visibleProducts.length === 0) {
            return [];
        }

        const promotions = await this.promotionService.listAllPromotions();

        const activePromotions = promotions.filter(p => 
            this.promotionService.isPromotionActiveNow(p, timezone)
        );

        const menu: IMenuItem[] = visibleProducts.map(product => {
            const applicablePromotion: IPromotionDB | undefined = activePromotions.find(promo => 
                this.promotionService.isPromotionApplicableToProduct(promo, product.id)
            );
            
            return {
                id: product.id,
                nome: product.nome,
                categoria: product.categoria,
                precoBase: product.preco,
                precoFinal: applicablePromotion ? applicablePromotion.preco_promocional : product.preco,
                promocaoAtiva: applicablePromotion ? {
                    descricao: applicablePromotion.descricao,
                    precoPromocional: applicablePromotion.preco_promocional
                } : undefined,
                ordem: product.ordem
            };
        });

        menu.sort((a, b) => a.ordem - b.ordem);

        return menu;
    }
}