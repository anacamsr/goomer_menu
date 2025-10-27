import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialSchema1701388800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                categoria VARCHAR(50) NOT NULL,
                visivel TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0=Invisível, 1=Visível',
                ordem INT NOT NULL DEFAULT 9999,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await queryRunner.query(`
            CREATE TABLE promocoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                descricao VARCHAR(255) NOT NULL,
                preco_promocional DECIMAL(10, 2) NOT NULL,
                -- Armazena um array JSON de números (dias da semana, 1=Segunda, 7=Domingo)
                dia_semana_json TEXT NOT NULL, 
                horario_inicio TIME NOT NULL COMMENT 'Formato HH:mm:ss',
                horario_fim TIME NOT NULL COMMENT 'Formato HH:mm:ss',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        
        await queryRunner.query(`
            CREATE TABLE produto_promocao (
                produto_id INT NOT NULL,
                promocao_id INT NOT NULL,
                
                PRIMARY KEY (produto_id, promocao_id),
                
                FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
                FOREIGN KEY (promocao_id) REFERENCES promocoes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE produto_promocao;
        `);
        await queryRunner.query(`
            DROP TABLE promocoes;
        `);
        await queryRunner.query(`
            DROP TABLE produtos;
        `);
    }
}