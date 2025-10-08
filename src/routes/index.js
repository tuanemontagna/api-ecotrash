import usuarioRoute from "./usuario.route.js";
import campanhaRoute from "./campanha.route.js";
import empresaRoute from "./empresa.route.js";
import pontoColetaRoute from "./pontoColeta.route.js";
import voucherRoute from "./voucher.route.js";
import artigoRoute from "./artigo.route.js";
import tipoResiduoRoute from "./tipoResiduo.route.js";
import agendamentoRoute from "./agendamento.route.js";

function Routes(app) {
    usuarioRoute(app);
    campanhaRoute(app);
    empresaRoute(app);
    pontoColetaRoute(app);
    voucherRoute(app);
    artigoRoute(app);
    tipoResiduoRoute(app);
    agendamentoRoute(app);

}


export default Routes;