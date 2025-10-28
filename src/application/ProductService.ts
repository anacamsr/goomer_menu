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
        // 1️⃣ Buscar todos os produtos visíveis
        const visibleProducts = await this.productRepository.findVisible();

        if (visibleProducts.length === 0) {
            return [];
        }

        // 2️⃣ Buscar todas as promoções existentes
        const promotions = await this.promotionService.listAllPromotions();

        // 3️⃣ Filtrar promoções ativas (respeitando timezone se houver)
        const activePromotions = promotions.filter(p =>
            this.promotionService.isPromotionActiveNow(p, timezone)
        );

        // 4️⃣ Montar o menu consolidado
        const menu: IMenuItem[] = visibleProducts.map(product => {
            const applicablePromotion: IPromotionDB | undefined = activePromotions.find(promo =>
                this.promotionService.isPromotionApplicableToProduct(promo, product.id)
            );

            // Construir item do menu
            const precoBase = product.preco;
            const precoPromocional = applicablePromotion?.preco_promocional ?? precoBase;

            return {
                id: product.id,
                nome: product.nome,
                categoria: product.categoria,
                precoBase,
                precoFinal: precoPromocional,
                promocaoAtiva: applicablePromotion
                    ? {
                        descricao: applicablePromotion.descricao,
                        precoPromocional: applicablePromotion.preco_promocional,
                        inicio: applicablePromotion.horario_inicio,
                        fim: applicablePromotion.horario_fim
                    }
                    : undefined,
                ordem: product.ordem
            };
        });

        // 5️⃣ Ordenar o cardápio pela ordem configurada
        menu.sort((a, b) => a.ordem - b.ordem);

        return menu;
    }
}