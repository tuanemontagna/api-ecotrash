import authController from '../controllers/auth.controller.js';
import { checkAuth } from '../middlewares/autenticacaoMiddleware.js';

export default (app) => {
  app.post('/auth/login', authController.login);
  app.post('/auth/refresh', authController.refresh);
  app.get('/auth/me', checkAuth, authController.me);
  app.post('/auth/recuperar', authController.solicitarRecuperacaoSenha);
  app.post('/auth/redefinir', authController.redefinirSenha);
};
