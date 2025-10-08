import artigoController from "../controllers/artigo.controller.js";

export default (app) => {
    app.get('/artigos', artigoController.get);
    app.get('/artigos/:id', artigoController.get);
    app.post('/artigos', artigoController.persist);
    app.patch('/artigos/:id', artigoController.persist);
    app.delete('/artigos/:id', artigoController.destroy);
}