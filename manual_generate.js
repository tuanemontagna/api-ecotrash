import { sequelize } from './src/config/postgres.js';
import PontoColeta from './src/models/PontoColeta.model.js';
import CodigoDiarioPontoColeta from './src/models/CodigoDiarioPontoColeta.model.js';
import cronService from './src/services/cron.service.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const pontos = await PontoColeta.findAll();
        console.log(`Total de pontos: ${pontos.length}`);
        
        const ativos = pontos.filter(p => p.ativo);
        console.log(`Pontos ativos: ${ativos.length}`);

        if (ativos.length === 0) {
            console.log('Nenhum ponto ativo encontrado. Ative algum ponto para gerar códigos.');
        } else {
            console.log('Gerando códigos...');
            await cronService.gerarCodigosDiarios();
            console.log('Códigos gerados.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
