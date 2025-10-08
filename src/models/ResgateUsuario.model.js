import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import CodigoDiarioPontoColeta from "./CodigoDiarioPontoColeta.model.js";

const ResgateUsuario = sequelize.define(
    'resgates_usuario',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_resgate',
        updatedAt: false, 
    }
);

ResgateUsuario.belongsTo(Usuario, {
    as: 'usuario',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE', 
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id',
        allowNull: false,
    }
});


ResgateUsuario.belongsTo(CodigoDiarioPontoColeta, {
    as: 'codigoDiario',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'codigoDiarioId',
        field: 'codigo_diario_id',
        allowNull: false,
    }
});

export default ResgateUsuario;
