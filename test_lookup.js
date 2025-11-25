import { sequelize } from './src/config/postgres.js';
import CodigoDiarioPontoColeta from './src/models/CodigoDiarioPontoColeta.model.js';

async function testLookup() {
    try {
        await sequelize.authenticate();
        const hoje = new Date().toISOString().slice(0, 10);
        console.log(`Data usada: ${hoje}`);

        const codigo = await CodigoDiarioPontoColeta.findOne({
            where: {
                pontoColetaId: 1, // Usando ID 1 como teste
                dataValidade: hoje
            }
        });

        console.log('Resultado:', codigo ? codigo.toJSON() : 'Nulo');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

testLookup();
