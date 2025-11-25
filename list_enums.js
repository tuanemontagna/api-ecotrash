import { sequelize } from "./src/config/postgres.js";

async function run() {
    try {
        console.log('Listing enums...');
        const [results] = await sequelize.query(`
            SELECT t.typname
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            GROUP BY t.typname
        `);
        console.log('Enums found:', results);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
