import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const Endereco = sequelize.define(
    'enderecos',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cep: {
            type: DataTypes.STRING(9),
            allowNull: false,
        },
        logradouro: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numero: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        complemento: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bairro: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cidade: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false, 
    }
);

export default Endereco;
