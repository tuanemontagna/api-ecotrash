import cron from 'node-cron';
import { sequelize } from '../config/postgres.js';
import PontoColeta from '../models/PontoColeta.model.js';
import CodigoDiarioPontoColeta from '../models/CodigoDiarioPontoColeta.model.js';

// Função para gerar código aleatório (ex: ECO-X92A)
function gerarCodigoAleatorio() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ECO-';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const gerarCodigosDiarios = async () => {
    console.log('Iniciando geração de códigos diários...');
    const t = await sequelize.transaction();
    try {
        // Busca todos os pontos de coleta ativos
        const pontos = await PontoColeta.findAll({ where: { ativo: true } });
        
        const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        let count = 0;
        for (const ponto of pontos) {
            // Verifica se já existe código para hoje (para evitar duplicidade se rodar 2x)
            const existe = await CodigoDiarioPontoColeta.findOne({
                where: {
                    pontoColetaId: ponto.id,
                    dataValidade: hoje
                },
                transaction: t
            });

            if (!existe) {
                const codigo = gerarCodigoAleatorio();
                await CodigoDiarioPontoColeta.create({
                    pontoColetaId: ponto.id,
                    codigo: codigo,
                    dataValidade: hoje,
                    pontosValor: 50 // Valor padrão de pontos por visita
                }, { transaction: t });
                count++;
            }
        }

        await t.commit();
        console.log(`Geração concluída. ${count} novos códigos gerados para ${pontos.length} pontos ativos.`);
    } catch (error) {
        await t.rollback();
        console.error('Erro ao gerar códigos diários:', error);
    }
};

const initCron = () => {
    // Agendar para rodar todo dia à meia-noite (00:00)
    cron.schedule('0 0 * * *', () => {
        gerarCodigosDiarios();
    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    
    console.log('Cron job de códigos diários inicializado.');
    
    // Opcional: Rodar imediatamente ao iniciar se não houver códigos para hoje (para dev)
    // gerarCodigosDiarios(); 
};

export default {
    initCron,
    gerarCodigosDiarios // Exportando para poder chamar manualmente se precisar
};
