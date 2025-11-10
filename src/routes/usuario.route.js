import usuarioController from "../controllers/usuario.controller.js";
import { checkAuth } from "../middlewares/autenticacaoMiddleware.js";

export default (app) => {
    app.get('/usuarios', usuarioController.get);
    // coloque a rota específica antes da dinâmica
    app.get('/usuarios/me', checkAuth, usuarioController.me);
    app.get('/usuarios/:id', usuarioController.get);
    app.get('/usuarios/:usuarioId/enderecos', usuarioController.listEnderecos);
    app.get('/usuarios/:usuarioId/transacoes-pontos', usuarioController.listarTransacoesPontos);
    app.get('/usuarios/:usuarioId/vouchers-resgatados', usuarioController.listarVouchersResgatados);
    app.get('/usuarios/:usuarioId/campanhas-apoiadas', usuarioController.listarCampanhasApoiadas);
    app.post('/usuarios', usuarioController.persist);
    app.post('/usuarios/:usuarioId/enderecos', usuarioController.addEndereco);
    app.post('/usuarios/:usuarioId/resgatar-voucher', usuarioController.resgatarVoucher);
    app.post('/usuarios/:usuarioId/apoiar-campanha', usuarioController.apoiarCampanha);
    app.post('/usuarios/login', usuarioController.login);
    app.post('/usuario/esqueci-minha-senha', usuarioController.recuperacaoSenha);
    app.post('/usuario/redefinir-senha', usuarioController.redefinirSenha);
    app.post('/usuarios/:usuarioId/resgatar-codigo', usuarioController.resgatarCodigoDiario);
    app.patch('/usuarios/:id', usuarioController.persist);
    app.patch('/usuario/:usuarioId/enderecos/:enderecoId', usuarioController.updateEndereco);
    app.delete('/usuarios/:id', usuarioController.destroy);
    app.delete('/usuario/:usuarioId/enderecos/:enderecoId', usuarioController.destroyEndereco);
    app.delete('/usuarios/:usuarioId/deixar-campanha', usuarioController.deixarCampanha);


}

