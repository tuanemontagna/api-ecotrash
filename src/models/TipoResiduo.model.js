import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const TipoResiduo = sequelize.define(
    'tipos_residuos',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false, 
    }
);

export default TipoResiduo;
