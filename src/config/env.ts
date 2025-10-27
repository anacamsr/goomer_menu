import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
    nodeEnv: string;
    port: number;
    db: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
    defaultTimezone: string;
}

function loadConfig(): IConfig {
    
    const getEnv = (key: string, defaultValue?: string): string => {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(`Variável de ambiente ${key} não definida.`);
        }
        return value;
    };

    const config: IConfig = {
        nodeEnv: getEnv('NODE_ENV', 'development'),
        port: parseInt(getEnv('PORT', '3000'), 10),

        db: {
            host: getEnv('DB_HOST'),
            user: getEnv('DB_USER'),
            password: getEnv('DB_PASSWORD'),
            database: getEnv('DB_DATABASE'),
            port: parseInt(getEnv('DB_PORT', '3306'), 10),
        },
        
        defaultTimezone: getEnv('DEFAULT_TIMEZONE', 'America/Sao_Paulo'),
    };
    
    if (isNaN(config.port) || config.port <= 0 || config.port > 65535) {
        throw new Error("PORT deve ser um número válido entre 1 e 65535.");
    }
    if (isNaN(config.db.port)) {
        throw new Error("DB_PORT deve ser um número válido.");
    }

    return config;
}

export const config: IConfig = loadConfig();