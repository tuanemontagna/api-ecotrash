import { sequelize } from "./src/config/postgres.js";
import Empresa from "./src/models/Empresa.model.js";
import Usuario from "./src/models/Usuario.model.js";

async function run() {
    try {
        const usuarioId = 45;
        console.log(`Checking data for usuarioId: ${usuarioId}`);

        const usuario = await Usuario.findByPk(usuarioId);
        console.log('Usuario:', usuario ? usuario.toJSON() : 'Not found');

        const empresas = await Empresa.findAll({
            where: { usuarioId: usuarioId }
        });
        console.log('Empresas found via Sequelize (where usuarioId=45):', empresas.map(e => e.toJSON()));

        // Raw query to be absolutely sure
        const [results, metadata] = await sequelize.query(`SELECT * FROM empresas WHERE usuario_id = ${usuarioId}`);
        console.log('Empresas found via Raw Query (where usuario_id=45):', results);

        // Check all companies to see if any have this user id in a different way or if there are companies with null user_id
        const [allEmpresas] = await sequelize.query(`SELECT * FROM empresas ORDER BY id DESC LIMIT 5`);
        console.log('Last 5 companies created:', allEmpresas);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
