import resgateController from "../controllers/resgate.controller.js";
import { checkAuth } from "../middlewares/autenticacaoMiddleware.js";

export default (app) => {
  app.post('/vouchers/:id/resgates', checkAuth, resgateController.resgatar);
};
