import pontoColetaController from "../controllers/pontoColeta.controller.js";

export default (app) => {
    app.get('/empresas/:empresaId/pontos-coleta', pontoColetaController.get);
    app.get('/empresas/:empresaId/pontos-coleta/:pontoColetaId', pontoColetaController.get);
    app.post('/empresas/:empresaId/pontos-coleta', pontoColetaController.persist);
    app.patch('/empresas/:empresaId/pontos-coleta/:pontoColetaId', pontoColetaController.persist);
    app.delete('/empresas/:empresaId/pontos-coleta/:pontoColetaId', pontoColetaController.destroy);
}
