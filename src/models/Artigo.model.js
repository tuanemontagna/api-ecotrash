import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";

const Artigo = sequelize.define(
    'artigos',
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
        conteudo: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        publicado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_publicacao',
        updatedAt: 'updated_at',
    }
);

Artigo.belongsTo(Usuario, {
    as: 'autor',
    onUpdate: 'NO ACTION',
    onDelete: 'SET NULL', 
    foreignKey: {
        name: 'autorId',
        field: 'autor_id',
        allowNull: true,
    }
});

export default Artigo;
