import express from "express";
import cors from "cors";
import { SmotretAnimeAPI } from "anime365wrapper";
import fetch from "node-fetch";

const app = express();
app.use(cors());
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
                poster: `http://localhost:4000/proxy-image?url=${encodeURIComponent(poster)}`
            };
        });
        return res.json(results);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.listen(4000, () => console.log("🚀 Бэкенд запущен на порту 4000"));