import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { dbPool } from '../database/connection';
import { IPromotionInput, IPromotionDB } from '../../domain/Promotion'; 

interface PromotionRow extends RowDataPacket {
    id: number;
    titulo: string;
    descricao: string;
    dia_semana: string;
    horario_inicio: string;
    horario_fim: string;
    product_id: number;
}

export class PromotionRepository {
    
    public async create(promotionData: IPromotionInput): Promise<number> {
        const sql = `
            INSERT INTO promocoes (titulo, descricao, preco_promocional, dia_semana, horario_inicio, horario_fim, product_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await dbPool.execute<ResultSetHeader>(sql, [
            promotionData.titulo,
            promotionData.descricao,
            promotionData.preco_promocional,
            promotionData.dia_semana,
            promotionData.horario_inicio,
            promotionData.horario_fim,
            promotionData.product_id
        ]);
    
        return result.insertId;
    }

    public async findAll(): Promise<IPromotionDB[]> {
        const sql = `
            SELECT id, titulo, descricao, dia_semana, horario_inicio, horario_fim, product_id
            FROM promocoes
            ORDER BY product_id, dia_semana, horario_inicio ASC
        `;
        
        const [rows] = await dbPool.execute<PromotionRow[]>(sql);
        
        return rows.map(row => ({
            id: row.id,
            titulo: row.titulo,
            descricao: row.descricao,
            dia_semana: row.dia_semana as any,
            horario_inicio: row.horario_inicio,
            horario_fim: row.horario_fim,
            product_id: row.product_id
        })) as unknown as IPromotionDB[];
    }
    
    public async update(id: number, promotionData: Partial<IPromotionInput>): Promise<boolean> {
        const updates: string[] = [];
        const values: (string | number)[] = [];

        for (const key in promotionData) {
            if (Object.prototype.hasOwnProperty.call(promotionData, key)) {
                const column = key.replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`);
                updates.push(`${column} = ?`);
                
                values.push((promotionData as any)[key]);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        const sql = `
            UPDATE promocoes
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        values.push(id);
        
        const [result] = await dbPool.execute<ResultSetHeader>(sql, values);

        return result.affectedRows > 0;
    }

    public async delete(id: number): Promise<boolean> {
        const sql = `
            DELETE FROM promocoes
            WHERE id = ?
        `;
        
        const [result] = await dbPool.execute<ResultSetHeader>(sql, [id]);

        return result.affectedRows > 0;
    }
}