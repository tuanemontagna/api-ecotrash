import tipoResiduoController from "../controllers/tipoResiduo.controller.js";

export default (app) => {
    app.get('/tipos-residuo', tipoResiduoController.get);
    app.get('/tipos-residuo/:id', tipoResiduoController.get);
    app.post('/tipos-residuo', tipoResiduoController.persist);
    app.patch('/tipos-residuo/:id', tipoResiduoController.persist);
    app.delete('/tipos-residuo/:id', tipoResiduoController.destroy);
}
