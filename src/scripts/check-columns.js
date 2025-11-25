import 'dotenv/config';
import { sequelize } from '../config/postgres.js';

(async () => {
    try {
        const [results, metadata] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios';");
        console.log('Columns in usuarios table:', results.map(r => r.column_name));
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await sequelize.close();
    }
})();
