import agendamentoController from "../controllers/agendamento.controller.js";

export default (app) => {
    app.post('/agendamentos', agendamentoController.create);
    app.get('/agendamentos/:id', agendamentoController.getById);
    app.patch('/agendamentos/:id/status', agendamentoController.updateStatus);
    app.delete('/agendamentos/:id', agendamentoController.destroy);
    app.get('/usuarios/:usuarioId/agendamentos', agendamentoController.listByUser);
    app.get('/empresas/:empresaId/agendamentos', agendamentoController.listByEmpresa);
}
