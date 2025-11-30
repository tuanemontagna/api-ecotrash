import voucherController from "../controllers/voucher.controller.js";
import upload from "../config/multer.js";

export default (app) => {
    app.get('/vouchers', voucherController.get);
    app.get('/vouchers/:id', voucherController.get);
    app.post('/vouchers', upload.single('imagem'), voucherController.persist);
    app.patch('/vouchers/:id', upload.single('imagem'), voucherController.persist);
    app.delete('/vouchers/:id', voucherController.destroy);
}