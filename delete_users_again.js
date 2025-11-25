import { sequelize } from "./src/config/postgres.js";
import Usuario from "./src/models/Usuario.model.js";
import Empresa from "./src/models/Empresa.model.js";

async function run() {
    try {
        console.log('Deleting users 47 and 48...');
        
        // Delete companies first (if any)
        await Empresa.destroy({ where: { usuarioId: [47, 48] } });
        
        // Delete users
        await Usuario.destroy({ where: { id: [47, 48] } });
        
        console.log('Users deleted.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
