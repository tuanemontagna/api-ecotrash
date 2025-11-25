import { sequelize } from "./src/config/postgres.js";
import Usuario from "./src/models/Usuario.model.js";
import Empresa from "./src/models/Empresa.model.js";

async function run() {
    try {
        console.log('Deleting users 45 and 46...');
        
        // Delete companies first (if any)
        await Empresa.destroy({ where: { usuarioId: [45, 46] } });
        
        // Delete users
        await Usuario.destroy({ where: { id: [45, 46] } });
        
        console.log('Users deleted.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
