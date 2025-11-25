import { sequelize } from "./src/config/postgres.js";
import AgendamentoColeta from "./src/models/AgendamentoColeta.model.js";
import ItemAgendamento from "./src/models/ItemAgendamento.model.js";
import TipoResiduo from "./src/models/TipoResiduo.model.js";
import Usuario from "./src/models/Usuario.model.js";

// Ensure associations are loaded
import "./src/models/index.js";

async function run() {
    try {
        console.log('Checking agendamentos...');
        
        // Find one agendamento
        const agendamento = await AgendamentoColeta.findOne({
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['id', 'nome'] },
                { 
                    model: ItemAgendamento, 
                    as: 'itens',
                    include: [{ model: TipoResiduo, as: 'tipoResiduo', attributes: ['nome'] }]
                }
            ]
        });

        if (agendamento) {
            console.log('Agendamento found:', JSON.stringify(agendamento.toJSON(), null, 2));
        } else {
            console.log('No agendamentos found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
