import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import Voucher from "./Voucher.model.js";

const UsuarioVoucher = sequelize.define(
    'usuario_vouchers',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        pontosGastos: {
            field: 'pontos_gastos',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        codigoVoucherGerado: {
            field: 'codigo_voucher_gerado',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        utilizado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_resgate', 
        updatedAt: false, 
    }
);

UsuarioVoucher.belongsTo(Usuario, {
    as: 'usuario',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE', 
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id',
        allowNull: false,
    }
});

UsuarioVoucher.belongsTo(Voucher, {
    as: 'voucher',
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT', 
    foreignKey: {
        name: 'voucherId',
        field: 'voucher_id',
        allowNull: false,
    }
});

export default UsuarioVoucher;
