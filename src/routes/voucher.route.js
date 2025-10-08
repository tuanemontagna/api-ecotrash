import voucherController from "../controllers/voucher.controller.js";

export default (app) => {
    app.get('/vouchers', voucherController.get);
    app.get('/vouchers/:id', voucherController.get);
    app.post('/vouchers', voucherController.persist);
    app.patch('/vouchers/:id', voucherController.persist);
    app.delete('/vouchers/:id', voucherController.destroy);
}