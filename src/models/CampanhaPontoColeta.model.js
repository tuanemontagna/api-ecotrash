import { sequelize } from "../config/postgres.js";
import PontoColeta from "./PontoColeta.model.js"; 
import Campanha from "./Campanha.model.js";

PontoColeta.belongsToMany(Campanha, {
    through: 'campanha_ponto_coleta',
    as: 'campanhas',
    foreignKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id'
    },
    timestamps: false,
});

Campanha.belongsToMany(PontoColeta, {
    through: 'campanha_ponto_coleta',
    as: 'pontosDeColetaAssociados',
    foreignKey: {
        name: 'campanhaId',
        field: 'campanha_id'
    },
    timestamps: false,
});
