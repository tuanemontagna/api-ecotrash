import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import PontoColeta from "./PontoColeta.model.js";

const CodigoDiarioPontoColeta = sequelize.define(
    'codigos_diarios_ponto_coleta',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        dataValidade: {
            field: 'data_validade',
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        pontosValor: {
            field: 'pontos_valor',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false, 
    }
);

CodigoDiarioPontoColeta.belongsTo(PontoColeta, {
    as: 'pontoColeta',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE', 
    foreignKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id',
        allowNull: false,
    }
});

PontoColeta.hasMany(CodigoDiarioPontoColeta, {
    as: 'codigosDiarios',
    foreignKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id'
    }
});

export default CodigoDiarioPontoColeta;
