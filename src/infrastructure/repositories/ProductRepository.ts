import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { dbPool } from '../database/connection';
import { IProductInput, IProductDB, ProductStatus } from '../../domain/Product'; 

interface ProductRow extends RowDataPacket {
    id: number;
    nome: string;
    preco: number;
    categoria: string;
    visivel: 0 | 1; 
    ordem: number;
    status: ProductStatus;
}

export class ProductRepository {

    public async create(productData: IProductInput): Promise<number> {
        const sql = `
            INSERT INTO produtos (nome, preco, categoria, visivel, ordem, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const isVisible = productData.visivel ? 1 : 0;

        const [result] = await dbPool.execute<ResultSetHeader>(sql, [
            productData.nome, 
            productData.preco, 
            productData.categoria, 
            isVisible,
            productData.ordem || 9999,
            productData.status 
        ]);

        return result.insertId;
    }

    public async findById(id: number): Promise<IProductDB | null> {
        const sql = `
            SELECT id, nome, preco, categoria, visivel, ordem, status
            FROM produtos
            WHERE id = ?
        `;
        
        const [rows] = await dbPool.execute<ProductRow[]>(sql, [id]);
        
        if (rows.length === 0) {
            return null;
        }

        const product = rows[0];
        
        return {
            id: product.id,
            nome: product.nome,
            preco: product.preco,
            categoria: product.categoria,
            visivel: product.visivel === 1, 
            ordem: product.ordem,
            status: product.status
        } as IProductDB;
    }

    public async update(id: number, productData: Partial<IProductInput>): Promise<boolean> {
        const updates: string[] = [];
        const values: (string | number | boolean)[] = [];

        for (const key in productData) {
            if (Object.prototype.hasOwnProperty.call(productData, key)) {
                
                const column = key.replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`);
                updates.push(`${column} = ?`);
                
                let value = (productData as any)[key];
                
                if (key === 'visivel' && typeof value === 'boolean') {
                    value = value ? 1 : 0;
                }
                
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        const sql = `
            UPDATE produtos
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        values.push(id);
        
        const [result] = await dbPool.execute<ResultSetHeader>(sql, values);

        return result.affectedRows > 0;
    }
    
    public async delete(id: number): Promise<boolean> {
        const sql = `
            DELETE FROM produtos
            WHERE id = ?
        `;
        
        const [result] = await dbPool.execute<ResultSetHeader>(sql, [id]);

        return result.affectedRows > 0;
    }

    public async findAll(): Promise<IProductDB[]> {
        const sql = `
            SELECT id, nome, preco, categoria, visivel, ordem, status
            FROM produtos
            ORDER BY ordem ASC
        `;
        
        const [rows] = await dbPool.execute<ProductRow[]>(sql);
        
        return rows.map(row => ({
            id: row.id,
            nome: row.nome,
            preco: row.preco,
            categoria: row.categoria,
            visivel: row.visivel === 1,
            ordem: row.ordem,
            status: row.status 
        })) as IProductDB[];
    }
    
    public async findVisible(): Promise<IProductDB[]> {
        const sql = `
            SELECT id, nome, preco, categoria, visivel, ordem, status
            FROM produtos
            WHERE visivel = 1 AND status = 'disponivel'
            ORDER BY ordem ASC
        `;
        
        const [rows] = await dbPool.execute<ProductRow[]>(sql);
        
        return rows.map(row => ({
            id: row.id,
            nome: row.nome,
            preco: row.preco,
            categoria: row.categoria,
            visivel: true, 
            ordem: row.ordem,
            status: row.status
        })) as IProductDB[]; 
    }
}