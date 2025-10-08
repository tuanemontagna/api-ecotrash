import { sequelize } from "../config/postgres.js";
import Empresa from "./Empresa.model.js"; 
import Campanha from "./Campanha.model.js";

Empresa.belongsToMany(Campanha, {
    through: 'campanha_empresa', 
    as: 'campanhas',
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id'
    },
    timestamps: false,
});

Campanha.belongsToMany(Empresa, {
    through: 'campanha_empresa',
    as: 'empresasParceiras',
    foreignKey: {
        name: 'campanhaId',
        field: 'campanha_id'
    },
    timestamps: false,
});
