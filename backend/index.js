import express from "express";
import fs from "fs";
import https from 'https';
import http from 'http'; // Для локального запуска
import cors from "cors";
import { SmotretAnimeAPI } from "anime365wrapper";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;
const api = new SmotretAnimeAPI();

app.use(cors({
    origin: [
        'https://gochilly.fun',
        'https://www.gochilly.fun',
        'http://localhost:5173', // Добавил порт Vite по умолчанию
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Прокси для картинок (чтобы обходить защиту Anime365)
app.get("/proxy-image", async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const response = await fetch(imageUrl, {
            headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://anime365.ru/" }
        });
        res.setHeader("Content-Type", response.headers.get("content-type"));
        response.body.pipe(res);
    } catch (e) {
        res.redirect("https://via.placeholder.com/225x320?text=No+Image");
    }
});

app.get("/popular", async (req, res) => {
    try {
        // Мы ищем аниме со статусом 'ongoing' (выходит сейчас) 
        // или те, что недавно завершились, сортируя по рейтингу и популярности
        const response = await fetch("https://shikimori.one/api/animes?limit=15&order=ranked&status=ongoing&kind=tv");
        let data = await response.json();

        // Если новинок-онгоингов мало, добавим просто популярные за этот год
        if (data.length < 5) {
            const extra = await fetch("https://shikimori.one/api/animes?limit=10&order=popularity&season=2023_2024&kind=tv");
            const extraData = await extra.json();
            data = [...data, ...extraData];
        }

        const results = data.map(item => {
            let poster = item.image.original || "";
            if (poster.startsWith("/")) poster = "https://shikimori.one" + poster;

            return {
                id: `shiki-${item.id}`,
                shikimoriId: item.id,
                title: item.russian || item.name,
                originalTitle: item.name,
                year: item.aired_on ? item.aired_on.split('-')[0] : "—",
                poster: `/proxy-image?url=${encodeURIComponent(poster)}`,
                rating: item.score || "—",
                status: item.status === "released" ? "Завершен" : "Выходит",
                genres: []
            };
        });

        // Убираем дубликаты, если они появились при склейке
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.shikimoriId === v.shikimoriId) === i);

        res.json(uniqueResults);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/search", async (req, res) => {
    try {
        const { q, genre, kind, year } = req.query;
        let finalResults = [];

        // Добавляем заголовки, чтобы API нас не забанил
        const headers = { "User-Agent": "ChillyAnimeApp/1.0" };

        if (genre || kind || year || q) {
            const shikiParams = new URLSearchParams({
                limit: 50,
                order: "popularity", // Лучше искать по популярности при поиске
                search: q || ""
            });
            if (genre) shikiParams.append("genre", genre);
            if (kind) shikiParams.append("kind", kind);
            if (year) shikiParams.append("season", year);

            const response = await fetch(`https://shikimori.one/api/animes?${shikiParams.toString()}`, { headers });
            const data = await response.json();

            if (Array.isArray(data)) {
                finalResults = data.map(item => ({
                    id: `shiki-${item.id}`,
                    shikimoriId: item.id,
                    title: item.russian || item.name,
                    originalTitle: item.name,
                    // Проверка на наличие даты, чтобы не было NaN
                    year: item.aired_on ? parseInt(item.aired_on.split('-')[0]) : 0,
                    poster: `/proxy-image?url=${encodeURIComponent("https://shikimori.one" + item.image.original)}`,
                    rating: item.score || "—",
                    status: item.status === "released" ? "Завершен" : "Выходит"
                }));
            }
        }

        // Если результаты есть, сортируем их по году (свежие выше)
        if (finalResults.length > 0) {
            finalResults.sort((a, b) => b.year - a.year);
        }

        res.json(finalResults);
    } catch (e) {
        console.error("Search Error:", e);
        res.status(500).json({ error: "Ошибка при поиске" });
    }
});

if (isProd) {
    // На сервере (Beget)
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/api.gochilly.fun/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/api.gochilly.fun/fullchain.pem')
    };
    https.createServer(options, app).listen(PORT, () => {
        console.log(`🚀 PROD: HTTPS Server running on port ${PORT}`);
    });
} else {
    // На локалке (Твой ПК)
    http.createServer(app).listen(PORT, () => {
        console.log(`🛠️  DEV: HTTP Server running on http://localhost:${PORT}`);
    });
}