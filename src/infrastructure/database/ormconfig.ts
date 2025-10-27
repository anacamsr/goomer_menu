import { DataSource } from 'typeorm';
import { config } from '../../config/env'; 
import * as path from 'path';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    synchronize: false,
    logging: false,    
    migrations: [path.join(__dirname, 'migrations', '*.ts')], 
    
});

AppDataSource.initialize()
    .then(() => {
        console.log("TypeORM DataSource inicializado para migrations.");
    })
    .catch((error) => console.error("Erro ao inicializar TypeORM DataSource:", error));