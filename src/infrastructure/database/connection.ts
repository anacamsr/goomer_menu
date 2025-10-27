import { createPool, Pool } from 'mysql2/promise';
import { config } from '../../config/env';

let dbPool: Pool;

export async function connectDatabase(): Promise<void> {
    try {
        dbPool = createPool({
            host: config.db.host,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database,
            port: config.db.port,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            namedPlaceholders: false, 
        });

        await dbPool.getConnection();
        console.log('[Database] Conexão com o MySQL bem-sucedida.');
        
    } catch (error) {
        console.error('[Database] ERRO ao conectar ao MySQL:', error);
        throw new Error('Falha ao inicializar a conexão com o banco de dados.');
    }
}

export { dbPool };