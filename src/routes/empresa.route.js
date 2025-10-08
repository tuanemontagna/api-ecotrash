import empresaController from "../controllers/empresa.controller.js";

export default (app) => {
    app.get('/empresas', empresaController.get);
    app.get('/empresas/:id', empresaController.get);
    app.post('/empresas', empresaController.persist);
    app.post('/empresas/:empresaId/tipos-residuo', empresaController.associarTipoResiduo);
    app.post('/empresas/:empresaId/campanhas', empresaController.associarCampanha);
    app.patch('/empresas/:id', empresaController.persist);
    app.delete('/empresas/:id', empresaController.destroy);
}