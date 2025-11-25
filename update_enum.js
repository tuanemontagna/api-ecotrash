import { sequelize } from "./src/config/postgres.js";

async function run() {
    try {
        console.log('Adding GANHO_COLETA to enum...');
        await sequelize.query(`ALTER TYPE "tipo_transacao_enum" ADD VALUE 'GANHO_COLETA';`);
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error.message);
        // If it fails, it might be because it already exists or the name is different.
        // Let's try to list enums if it fails.
    } finally {
        await sequelize.close();
    }
}

run();
