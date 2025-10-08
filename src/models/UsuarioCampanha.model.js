import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import Campanha from "./Campanha.model.js";

const UsuarioCampanha = sequelize.define(
    'usuario_campanha',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_adesao',
        updatedAt: false,
    }
);

Usuario.belongsToMany(Campanha, {
    through: UsuarioCampanha,
    as: 'campanhasApoiadas',
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id'
    },
    onDelete: 'CASCADE',
});

Campanha.belongsToMany(Usuario, {
    through: UsuarioCampanha,
    as: 'apoiadores',
    foreignKey: {
        name: 'campanhaId',
        field: 'campanha_id'
    },
    onDelete: 'CASCADE',
});

export default UsuarioCampanha;
