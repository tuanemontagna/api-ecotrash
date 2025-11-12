import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Empresa from "./Empresa.model.js";
import TipoResiduo from "./TipoResiduo.model.js";

const EmpresaAceitaResiduo = sequelize.define(
    'empresa_aceita_residuo',
    {
        empresaId: {
            field: 'empresa_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        tipoResiduoId: {
            field: 'tipo_residuo_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Empresa.belongsToMany(TipoResiduo, {
    through: EmpresaAceitaResiduo,
    as: 'tiposResiduosAceitos',
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id'
    }
});

TipoResiduo.belongsToMany(Empresa, {
    through: EmpresaAceitaResiduo,
    as: 'empresasQueAceitam',
    foreignKey: {
        name: 'tipoResiduoId',
        field: 'tipo_residuo_id'
    }
});

export default EmpresaAceitaResiduo;
