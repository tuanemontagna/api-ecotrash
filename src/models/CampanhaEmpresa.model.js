import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Empresa from "./Empresa.model.js"; 
import Campanha from "./Campanha.model.js";

const CampanhaEmpresa = sequelize.define(
    'campanha_empresa',
    {
        empresaId: {
            field: 'empresa_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: Empresa,
                key: 'id'
            }
        },
        campanhaId: {
            field: 'campanha_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: Campanha,
                key: 'id'
            }
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Empresa.belongsToMany(Campanha, {
    through: CampanhaEmpresa, 
    as: 'campanhas',
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id'
    },
    otherKey: {
        name: 'campanhaId',
        field: 'campanha_id'
    }
});

Campanha.belongsToMany(Empresa, {
    through: CampanhaEmpresa,
    as: 'empresasParceiras',
    foreignKey: {
        name: 'campanhaId',
        field: 'campanha_id'
    },
    otherKey: {
        name: 'empresaId',
        field: 'empresa_id'
    }
});

export default CampanhaEmpresa;
