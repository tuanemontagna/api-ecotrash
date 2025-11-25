import 'dotenv/config';
import { sequelize } from '../config/postgres.js';
import Usuario from '../models/Usuario.model.js';

(async () => {
    try {
        console.log('Syncing Usuario model...');
        await Usuario.sync({ alter: true });
        console.log('Usuario model synced successfully.');
    } catch (error) {
        console.error('Error syncing Usuario model:', error);
    } finally {
        await sequelize.close();
    }
})();
