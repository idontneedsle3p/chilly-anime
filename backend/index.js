import express from "express";
import fs from "fs";
import https from 'https';
import http from 'http'; // Для локального запуска
import cors from "cors";
import { SmotretAnimeAPI } from "anime365wrapper";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();

// Проверка среды
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;

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

const api = new SmotretAnimeAPI();

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

app.get("/search", async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.json([]);
        const list = await api.getSeriesList({ query: q, limit: 15 });

        const results = list.map(item => {
            let poster = item.posterUrl || "";
            if (poster.startsWith("/")) poster = "https://anime365.ru" + poster;

            return {
                id: item.id,
                title: item.title.split('/')[0].trim(),
                originalTitle: item.title.split('/')[1] ? item.title.split('/')[1].trim() : "",
                shikimoriId: item.shikimoriId || 0,
                year: item.year,
                poster: `/proxy-image?url=${encodeURIComponent(poster)}`
            };
        });
        return res.json(results);
    } catch (e) {
        return res.status(500).json({ error: e.message });
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