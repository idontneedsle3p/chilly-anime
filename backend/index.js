import express from "express";
import fs from "fs";
import http from 'http'; // Импорт https удалили, он не нужен
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();
// Жестко ставим порт 80 для Cloudflare
const PORT = 80;
const DB_PATH = "./db.json";

// Для формирования ссылок на картинки оставляем https, так как юзеры видят сайт через Cloudflare
const BACKEND_URL = 'https://api.gochilly.fun';

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
    // Берем только "хвост" ссылки, например: /system/animes/original/123.jpg
    const rawShikiPath = shikiItem.image?.original || '/assets/globals/missing_original.jpg';

    // Формируем безопасную ссылку через параметр path
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

        // Сервер сам знает, что картинки лежат на Шикимори
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
        // Кэшируем картинку в браузере и Cloudflare на 7 дней
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");

        response.body.pipe(res);
    } catch (e) {
        console.error("Proxy error:", e.message);
        res.redirect("https://via.placeholder.com/225x320?text=Error");
    }
});

async function fetchWithPlayer(data, VIBIX_TOKEN) {
    const results = [];
    const cache = getCache();
    let cacheChanged = false;

    for (const item of data) {
        const sId = String(item.id);

        if (cache[sId] && cache[sId].title) {
            results.push(cache[sId]);
            continue;
        }

        console.log(`\n--- Обработка: ${item.russian || item.name} ---`);

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
            console.error(`[!] Ошибка Vibix API:`, e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 250));

        cache[sId] = enriched;
        results.push(enriched);
        cacheChanged = true;
    }

    if (cacheChanged) saveCache(cache);
    return results;
}

app.get("/popular", async (req, res) => {
    try {
        const response = await fetch("https://shikimori.one/api/animes?limit=20&order=ranked&status=ongoing&kind=tv&censored=true");
        let data = await response.json();
        if (!Array.isArray(data)) return res.json([]);
        data = data.filter(item => item.rating !== 'rx');
        const results = await fetchWithPlayer(data, process.env.VITE_VIBIX_TOKEN || process.env.VIBIX_TOKEN);
        res.json(results);
    } catch (e) { res.status(500).json([]); }
});

app.get("/search", async (req, res) => {
    try {
        const { q, genre, kind } = req.query;
        const shikiParams = new URLSearchParams({
            limit: 15, order: "popularity", search: q || "", censored: "true"
        });
        if (genre) shikiParams.append("genre", genre);
        if (kind) shikiParams.append("kind", kind);

        const response = await fetch(`https://shikimori.one/api/animes?${shikiParams.toString()}`);
        let data = await response.json();
        if (!Array.isArray(data)) return res.json([]);
        data = data.filter(item => item.rating !== 'rx');

        const results = await fetchWithPlayer(data, process.env.VITE_VIBIX_TOKEN || process.env.VIBIX_TOKEN);
        res.json(results);
    } catch (e) { res.status(500).json([]); }
});

// === ВОТ САМОЕ ВАЖНОЕ ИСПРАВЛЕНИЕ ===
// Мы используем http.createServer и слушаем порт 80
// Никакого https модуля, никаких сертификатов.
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен. Порт: ${PORT}. Режим: Cloudflare HTTP`);
});