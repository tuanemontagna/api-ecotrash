import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";

const TransacaoPontos = sequelize.define(
    'transacoes_pontos',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tipoTransacao: {
            field: 'tipo_transacao',
            type: DataTypes.ENUM('GANHO_CODIGO', 'GASTO_VOUCHER', 'GANHO_CAMPANHA'),
            allowNull: false,
        },
        pontos: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        descricao: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        referenciaId: {
            field: 'referencia_id',
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_transacao',
        updatedAt: false, 
    }
);

TransacaoPontos.belongsTo(Usuario, {
    as: 'usuario',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE', 
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id',
        allowNull: false,
    }
});

Usuario.hasMany(TransacaoPontos, {
    as: 'transacoesPontos',
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id'
    }
});

export default TransacaoPontos;
