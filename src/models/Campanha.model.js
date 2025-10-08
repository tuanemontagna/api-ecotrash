import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const Campanha = sequelize.define(
    'campanhas',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dataInicio: {
            field: 'data_inicio',
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        dataFim: {
            field: 'data_fim',
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        ativa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        pontosPorAdesao: {
            field: 'pontos_por_adesao',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Campanha;
