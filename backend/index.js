import express from "express";
import fs from "fs";
import http from 'http';
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = "./db.json";
const BACKEND_URL = 'https://api.gochilly.fun'; // Твой домен

// Токен
const VIBIX_TOKEN = process.env.VIBIX_TOKEN || process.env.VITE_VIBIX_TOKEN;

app.use(cors({ origin: '*', credentials: true }));

// === 1. ЗАГРУЗКА БАЗЫ ===
let dbCache = [];
let dbMap = {};

const loadDb = () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const raw = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
            dbMap = raw;
            dbCache = Object.values(raw);
            console.log(`📦 База загружена: ${dbCache.length} аниме`);
        } else {
            console.log("⚠️ db.json не найден, создаем пустой.");
            fs.writeFileSync(DB_PATH, "{}");
        }
    } catch (e) { console.error("Ошибка БД:", e); }
};

const saveToDb = (newItem) => {
    try {
        dbMap[newItem.id] = newItem;
        if (!dbCache.find(x => x.id === newItem.id)) {
            dbCache.push(newItem);
        }
        const currentDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        currentDb[newItem.id] = newItem;
        fs.writeFileSync(DB_PATH, JSON.stringify(currentDb, null, 2));
    } catch (e) { console.error("Ошибка записи:", e); }
};

loadDb();

// === УМНЫЙ ПОИСК VIBIX (С ПРОВЕРКОЙ ГОДА) ===
async function searchVibixLive(title, shikiKind, targetYear) {
    if (!title || !VIBIX_TOKEN) return null;
    try {
        // Берем 50 результатов, чтобы найти нужный год
        const url = `https://vibix.org/api/v1/publisher/videos/search?name=${encodeURIComponent(title)}&page=1&limit=50`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${VIBIX_TOKEN}` }
        });
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return null;

        const json = await res.json();

        if (json.data && json.data.length > 0) {
            const needSerial = (shikiKind === 'tv' || shikiKind === 'ona');
            const requiredType = needSerial ? 'serial' : 'movie';

            // Ищем совпадение
            const bestMatch = json.data.find(item => {
                // 1. Тип должен совпадать
                if (item.type !== requiredType) return false;

                // 2. Год должен совпадать (допуск +/- 1 год)
                if (targetYear && item.year) {
                    const diff = Math.abs(parseInt(item.year) - parseInt(targetYear));
                    if (diff > 1) return false;
                }
                return true;
            });

            // Если не нашли подходящего по году — возвращаем null (пусть будет Kodik)
            if (!bestMatch) return null;

            const typeMatch = bestMatch.embed_code.match(/data-type="([^"]+)"/);
            const idMatch = bestMatch.embed_code.match(/data-id="(\d+)"/);

            return {
                iframe_url: bestMatch.iframe_url,
                poster_url: bestMatch.poster_url,
                sdkParams: {
                    type: typeMatch ? typeMatch[1] : (bestMatch.type === 'serial' ? 'series' : 'movie'),
                    id: idMatch ? idMatch[1] : bestMatch.id
                }
            };
        }
    } catch (e) { }
    return null;
}

// === РОУТЫ ===

app.get("/proxy-image", async (req, res) => {
    try {
        const imagePath = req.query.path;
        if (!imagePath) return res.status(404).send('No path');

        const response = await fetch(`https://shikimori.one${imagePath}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        res.setHeader("Cache-Control", "public, max-age=86400");
        response.body.pipe(res);
    } catch (e) { res.redirect("https://via.placeholder.com/225x320"); }
});

app.get("/popular", async (req, res) => {
    const { sort, page = 1 } = req.query;
    const limit = 30;

    if (sort !== 'trending') {
        const start = (parseInt(page) - 1) * limit;
        return res.json(dbCache.slice(start, start + limit));
    }

    try {
        const response = await fetch(
            `https://shikimori.one/api/animes?limit=${limit}&order=popularity&status=ongoing&censored=true&page=${page}`,
            { headers: { 'User-Agent': 'ChillyAnime/1.0' } }
        );

        if (!response.ok) return res.json([]);
        const data = await response.json();

        const trendingData = data.map(item => {
            const cachedItem = dbMap[item.id];
            if (cachedItem) return cachedItem;

            return {
                id: item.id,
                shikimoriId: item.id,
                title: item.russian || item.name,
                originalTitle: item.name,
                poster: `${BACKEND_URL}/proxy-image?path=${encodeURIComponent(item.image.original)}`,
                rating: String(item.score || "0.0"),
                year: item.aired_on ? item.aired_on.split('-')[0] : "—",
                description: "Описание загрузится при клике",
                status: "Сейчас выходит",
            };
        });

        res.json(trendingData);
    } catch (e) {
        res.status(500).json([]);
    }
});

// ГИБРИДНЫЙ ПОИСК
app.get("/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const lowerQ = q.toLowerCase();

    // 1. Локально
    const localResults = dbCache.filter(item =>
        (item.title && item.title.toLowerCase().includes(lowerQ)) ||
        (item.originalTitle && item.originalTitle.toLowerCase().includes(lowerQ))
    );

    // 2. Shikimori (с цензурой)
    try {
        const remoteRes = await fetch(`https://shikimori.one/api/animes?search=${encodeURIComponent(q)}&limit=20&censored=true`, {
            headers: { 'User-Agent': 'ChillyAnime/1.0' }
        });

        let remoteResults = [];
        if (remoteRes.ok) {
            const data = await remoteRes.json();

            remoteResults = data.map(item => {
                if (dbMap[item.id]) return null;
                if (item.rating === 'rx') return null;

                return {
                    id: item.id,
                    shikimoriId: item.id,
                    title: item.russian || item.name,
                    originalTitle: item.name,
                    poster: `${BACKEND_URL}/proxy-image?path=${encodeURIComponent(item.image.original)}`,
                    rating: String(item.score || "0.0"),
                    year: item.aired_on ? item.aired_on.split('-')[0] : "—",
                    description: "Описание загрузится при клике",
                    status: item.status === 'released' ? "Завершен" : "Онгоинг"
                };
            }).filter(Boolean);
        }

        const finalResults = [...localResults, ...remoteResults];
        res.json(finalResults.slice(0, 50));

    } catch (e) {
        res.json(localResults);
    }
});

// ПОЛУЧЕНИЕ АНИМЕ (С УМНЫМ ПОИСКОМ)
app.get("/anime/:id", async (req, res) => {
    const { id } = req.params;

    if (dbMap[id]) return res.json(dbMap[id]);

    try {
        const resp = await fetch(`https://shikimori.one/api/animes/${id}`, {
            headers: { 'User-Agent': 'ChillyAnime/1.0' }
        });
        if (!resp.ok) return res.status(404).json({ error: "Not found" });
        const data = await resp.json();

        // 1. Определяем год (например 2024)
        const year = data.aired_on ? data.aired_on.split('-')[0] : null;

        // 2. Передаем ГОД и ТИП в поиск
        let vibixResult = await searchVibixLive(data.russian, data.kind, year);
        if (!vibixResult && data.name) {
            vibixResult = await searchVibixLive(data.name, data.kind, year);
        }

        const bestPoster = (vibixResult && vibixResult.poster_url)
            ? vibixResult.poster_url
            : `${BACKEND_URL}/proxy-image?path=${encodeURIComponent(data.image.original)}`;

        const newItem = {
            id: data.id,
            shikimoriId: data.id,
            title: data.russian || data.name,
            originalTitle: data.name,
            year: year || "—",
            poster: bestPoster,
            rating: String(data.score || "0.0"),
            description: data.description || "Описание отсутствует",
            status: data.status === 'released' ? "Завершен" : "Онгоинг",
            // Если Vibix не прошел проверку по году, тут будет null и включится Kodik
            vibixUrl: vibixResult ? vibixResult.iframe_url : null,
            vibixSdkParams: vibixResult ? vibixResult.sdkParams : null,
            kodikUrl: `https://kodik.info/find-player?shikimoriID=${data.id}`
        };

        saveToDb(newItem);
        return res.json(newItem);
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
});

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер запущен на ${PORT}`));