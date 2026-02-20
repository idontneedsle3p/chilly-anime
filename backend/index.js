import express from "express";
import http from 'http';
import cors from "cors";
import 'dotenv/config';
import { loadDb } from './src/db/database.js';
import animeRoutes from './src/routes/anime.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*', credentials: true }));

// Подключаем все наши маршруты
app.use('/', animeRoutes);

const server = http.createServer(app);

// Функция для безопасного старта: сначала грузим БД, потом слушаем порты
const startServer = async () => {
    await loadDb();
    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер запущен на ${PORT}`));
};

startServer();