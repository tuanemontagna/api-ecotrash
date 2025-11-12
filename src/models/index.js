
import Usuario from './Usuario.model.js';
import Endereco from './Endereco.model.js';
import Empresa from './Empresa.model.js';
import PontoColeta from './PontoColeta.model.js';
import TipoResiduo from './TipoResiduo.model.js';
import AgendamentoColeta from './AgendamentoColeta.model.js';
import ItemAgendamento from './ItemAgendamento.model.js';
import CodigoDiarioPontoColeta from './CodigoDiarioPontoColeta.model.js';
import ResgateUsuario from './ResgateUsuario.model.js';
import Voucher from './Voucher.model.js';
import UsuarioVoucher from './UsuarioVoucher.model.js';
import TransacaoPontos from './TransacaoPontos.model.js';
import Artigo from './Artigo.model.js';
import Campanha from './Campanha.model.js';
import './UsuarioEndereco.model.js';
import './UsuarioCampanha.model.js';
import './CampanhaEmpresa.model.js';
import './CampanhaPontoColeta.model.js';
import './PontoColetaResiduo.model.js';
import './EmpresaAceitaResiduo.model.js';
import { sequelize } from '../config/postgres.js';

(async () => {
    // Para sincronizar todas as tabelas de uma vez, descomente a linha abaixo em seu arquivo de conexão principal
    //await sequelize.sync({ force: true });

    // Ou para sincronizar individualmente:
    // await Usuario.sync({ force: true });
    // await Endereco.sync({ force: true });
    // await Empresa.sync({ force: true });
    // ... e assim por diante para cada model.
})();

