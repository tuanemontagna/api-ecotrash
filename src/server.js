import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import {dirname} from 'node:path';
import { fileURLToPath } from 'node:url';
import './models/index.js';

import Routes from './routes/index.js';
import {sequelize} from './config/postgres.js';
import cronService from './services/cron.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const logStream = fs.createWriteStream(
    path.join(__dirname, '../acess.log'),
    { flags: 'a'},
);

const corsOptions = {
    origin(origin, callback) {
        callback(null, true);
    },
    methods: 'GET, PUT, PATCH, DELETE, POST',
    credentials: true,
}

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: logStream }));
app.use(express.json({limit: '50mb'})); //tamanho do corpo
app.use(express.urlencoded({extended: true, limit: '50mb'})); //tamanho da rota 

Routes(app);
app.use((req, res) => {
    res.status(404).send('404 - página não encontrada');
});

sequelize.authenticate()
    .then(() => {
        console.log('deu boa');
        cronService.initCron();
        // Gera códigos para hoje se ainda não existirem (útil na primeira execução)
        cronService.gerarCodigosDiarios();
    });

app.listen(process.env.API_PORT, (e) => {
    if(e) {
        return console.log(e);
    }
    console.log(`rodando na url http://localhost:${process.env.API_PORT}`);
});