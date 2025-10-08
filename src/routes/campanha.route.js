import campanhaController from "../controllers/campanha.controller.js";

export default (app) => {
    app.get('/campanhas', campanhaController.get);
    app.get('/campanhas/:id', campanhaController.get);
    app.post('/campanhas', campanhaController.persist);
    app.post('/campanhas/:campanhaId/associar-empresa', campanhaController.addEmpresa);
    app.post('/campanhas/:campanhaId/associar-ponto-coleta', campanhaController.addPontoColeta);
    app.patch('/campanhas/:id', campanhaController.persist);
    app.delete('/campanhas/:id', campanhaController.destroy);
}
