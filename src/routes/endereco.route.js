import enderecoController from "../controllers/endereco.controller.js";

export default (app) => {
    app.get('/enderecos', enderecoController.getAll);
    app.get('/enderecos/:id', enderecoController.getById);
    app.patch('/enderecos/:id', enderecoController.update);
    app.delete('/enderecos/:id', enderecoController.destroy);
};
