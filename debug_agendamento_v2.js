import { sequelize } from "./src/config/postgres.js";
import AgendamentoColeta from "./src/models/AgendamentoColeta.model.js";
import ItemAgendamento from "./src/models/ItemAgendamento.model.js";
import Usuario from "./src/models/Usuario.model.js";
import TipoResiduo from "./src/models/TipoResiduo.model.js";
import Endereco from "./src/models/Endereco.model.js";

async function run() {
    try {
        console.log('Testing Agendamento query...');
        const agendamentos = await AgendamentoColeta.findAll({
            limit: 1,
            order: [['id', 'DESC']],
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['id', 'nome'] },
                { 
                    model: ItemAgendamento, 
                    as: 'itens',
                    include: [{ model: TipoResiduo, as: 'tipoResiduo', attributes: ['nome'] }]
                },
                { model: Endereco, as: 'enderecoColeta' }
            ]
        });

        if (agendamentos.length > 0) {
            console.log('Agendamento found:', JSON.stringify(agendamentos[0].toJSON(), null, 2));
        } else {
            console.log('No agendamento found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
