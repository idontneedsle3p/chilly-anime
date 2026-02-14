import express from "express";
import fs from "fs";
import http from 'http';
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();
// Берем порт из .env, если его там нет — ставим 4000 по умолчанию
const PORT = process.env.PORT || 4000;
const DB_PATH = "./db.json";
const BACKEND_URL = 'https://api.gochilly.fun';

// Магическое число для красивой сетки (делится на 2, 3, 4, 6)
const GRID_LIMIT = 24;
// Увеличили буфер, чтобы точно заполнить сетку после всех фильтраций
const FETCH_BUFFER = 45;

app.use(cors({
    origin: [
        'https://gochilly.fun',
        'https://www.gochilly.fun',
        'https://chilly-anime.pages.dev',
        'http://localhost:5173'
    ],
    credentials: true
}));

const getCache = () => {
    try {
        if (!fs.existsSync(DB_PATH)) return {};
        return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch (e) { return {}; }
};
const saveCache = (cache) => fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2));

function formatVibixItem(shikiItem, vibixData = {}, kodikUrl = null) {
    const rawShikiPath = shikiItem.image?.original || '/assets/globals/missing_original.jpg';
    const finalPoster = vibixData.poster_url
        ? vibixData.poster_url
        : `${BACKEND_URL}/proxy-image?path=${encodeURIComponent(rawShikiPath)}`;

    return {
        id: shikiItem.id,
        shikimoriId: shikiItem.id,
        title: vibixData.title_ru || shikiItem.russian || shikiItem.name,
        originalTitle: shikiItem.name,
        year: vibixData.year || (shikiItem.aired_on ? shikiItem.aired_on.split('-')[0] : "—"),
        poster: finalPoster,
        rating: vibixData.rating_kp || shikiItem.score || "—",
        description: vibixData.description || "Описание временно отсутствует.",
        status: shikiItem.status === "released" ? "Завершен" : "Выходит",
        vibixUrl: vibixData.iframe_url || null,
        kodikUrl: kodikUrl
    };
}

app.get("/proxy-image", async (req, res) => {
    try {
        const imagePath = req.query.path;
        if (!imagePath) return res.status(404).send('No path provided');
        const targetUrl = `https://shikimori.one${imagePath}`;

        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://shikimori.one/"
            }
        });

        if (!response.ok) {
            return res.redirect("https://via.placeholder.com/225x320?text=No+Image");
        }

        res.setHeader("Content-Type", response.headers.get("content-type"));
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");

        response.body.pipe(res);
    } catch (e) {
        res.redirect("https://via.placeholder.com/225x320?text=Error");
    }
});

async function fetchWithPlayer(data, VIBIX_TOKEN) {
    const results = [];
    const cache = getCache();
    let cacheChanged = false;

    // Гарантируем, что обрабатываем ровно столько, сколько нужно для сетки
    const itemsToProcess = data.slice(0, GRID_LIMIT);

    for (const item of itemsToProcess) {
        const sId = String(item.id);

        if (cache[sId] && cache[sId].title) {
            results.push(cache[sId]);
            continue;
        }

        const currentKodikUrl = `https://kodik.info/find-player?shikimoriID=${item.id}`;
        let enriched = formatVibixItem(item, {}, currentKodikUrl);

        try {
            const extRes = await fetch(`https://shikimori.one/api/animes/${item.id}/external_links`);
            const extLinks = await extRes.json();

            let kpId = null;
            if (Array.isArray(extLinks)) {
                const kpLinkObj = extLinks.find(link => link.kind === 'kinopoisk');
                if (kpLinkObj && kpLinkObj.url) {
                    const match = kpLinkObj.url.match(/(?:film|series)\/(\d+)/);
                    if (match) kpId = match[1];
                }
            }

            if (kpId) {
                const vRes = await fetch(`https://vibix.org/api/v1/publisher/videos/kp/${kpId}`, {
                    headers: { 'Authorization': `Bearer ${VIBIX_TOKEN}` }
                });
                const vData = await vRes.json();

                if (vData?.iframe_url) {
                    enriched = formatVibixItem(item, vData, currentKodikUrl);
                }
            }
        } catch (e) {
            console.error(`[!] API Error:`, e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        cache[sId] = enriched;
        results.push(enriched);
        cacheChanged = true;
    }

    if (cacheChanged) saveCache(cache);
    return results;
}

app.get("/popular", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`https://shikimori.one/api/animes?limit=${FETCH_BUFFER}&page=${page}&order=ranked&status=ongoing&kind=tv&censored=true`);
        let data = await response.json();
        if (!Array.isArray(data)) return res.json([]);

        data = data.filter(item => item.rating !== 'rx');
        data = data.slice(0, GRID_LIMIT);

        const results = await fetchWithPlayer(data, process.env.VITE_VIBIX_TOKEN || process.env.VIBIX_TOKEN);
        res.json(results);
    } catch (e) { res.status(500).json([]); }
});

app.get("/search", async (req, res) => {
    try {
        const { q, genre, kind, page } = req.query;
        const shikiParams = new URLSearchParams({
            limit: FETCH_BUFFER,
            page: page || 1,
            order: "popularity",
            search: q || "",
            censored: "true"
        });
        if (genre) shikiParams.append("genre", genre);
        if (kind) shikiParams.append("kind", kind);

        const response = await fetch(`https://shikimori.one/api/animes?${shikiParams.toString()}`);
        let data = await response.json();
        if (!Array.isArray(data)) return res.json([]);

        data = data.filter(item => item.rating !== 'rx');
        data = data.slice(0, GRID_LIMIT);

        const results = await fetchWithPlayer(data, process.env.VITE_VIBIX_TOKEN || process.env.VIBIX_TOKEN);
        res.json(results);
    } catch (e) { res.status(500).json([]); }
});

app.get("/anime/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const cache = getCache();
        if (cache[id]) return res.json(cache[id]);

        const response = await fetch(`https://shikimori.one/api/animes/${id}`);
        if (!response.ok) return res.status(404).json({ error: "Anime not found" });

        const data = await response.json();
        const results = await fetchWithPlayer([data], process.env.VITE_VIBIX_TOKEN || process.env.VIBIX_TOKEN);
        res.json(results[0]);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер на порту ${PORT}. Сетка: ${GRID_LIMIT} элементов.`);
});