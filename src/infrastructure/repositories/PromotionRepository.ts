import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { dbPool } from '../database/connection';
import { IPromotionInput, IPromotionDB } from '../../domain/Promotion';

interface PromotionRow extends RowDataPacket, Omit<IPromotionDB, 'related_product_ids'> {}

export class PromotionRepository {
    
    public async create(promotionData: IPromotionInput, productIds: number[]): Promise<number> {
        const connection = await dbPool.getConnection();
        let promotionId = 0;

        try {
            await connection.beginTransaction();

            const promotionSql = `
                INSERT INTO promocoes (descricao, preco_promocional, dia_semana_json, horario_inicio, horario_fim)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const [promotionResult] = await connection.execute<ResultSetHeader>(promotionSql, [
                promotionData.descricao,
                promotionData.preco_promocional,
                promotionData.dia_semana_json,
                promotionData.horario_inicio,
                promotionData.horario_fim
            ]);
            promotionId = promotionResult.insertId;

            if (productIds.length > 0) {
                const relationSql = `
                    INSERT INTO produto_promocao (produto_id, promocao_id)
                    VALUES ${productIds.map(() => '(?, ?)').join(', ')}
                `;
                
                const relationValues = productIds.flatMap(productId => [productId, promotionId]);
                await connection.execute(relationSql, relationValues);
            }

            await connection.commit();
            return promotionId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    public async findAll(): Promise<IPromotionDB[]> {
        const sql = `
            SELECT 
                p.id, 
                p.descricao, 
                p.preco_promocional, 
                p.dia_semana_json, 
                p.horario_inicio, 
                p.horario_fim,
                -- Agrega os IDs dos produtos relacionados em um array JSON
                JSON_ARRAYAGG(pp.produto_id) AS related_product_ids_json
            FROM promocoes p
            LEFT JOIN produto_promocao pp ON p.id = pp.promocao_id
            GROUP BY p.id
            ORDER BY p.id ASC
        `;

        const [rows] = await dbPool.execute<PromotionRow[]>(sql);

        return rows.map(row => {
            const rawIds = row.related_product_ids_json ? JSON.parse(row.related_product_ids_json as string) : null;
            const relatedProductIds: (number | null)[] = Array.isArray(rawIds) ? rawIds : [];
            
            return {
                id: row.id,
                descricao: row.descricao,
                horario_fim: row.horario_fim,
                related_product_ids: relatedProductIds.filter((id: number | null) => id !== null) as number[]
            } as IPromotionDB;
        });
    
    }

    // ... Outros métodos ...
}