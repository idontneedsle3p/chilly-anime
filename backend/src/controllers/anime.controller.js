import fetch from "node-fetch";
import { dbCache, dbMap, saveToDb } from "../db/database.js";
import { searchVibixLive } from "../services/vibix.service.js";

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.gochilly.fun';

export const proxyImage = async (req, res) => {
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
    } catch (e) {
        res.redirect("https://via.placeholder.com/225x320");
    }
};

export const getPopular = async (req, res) => {
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
};

export const searchAnime = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const lowerQ = q.toLowerCase();

    // Ищем в нашем локальном кэше
    const localResults = dbCache.filter(item =>
        (item.title && item.title.toLowerCase().includes(lowerQ)) ||
        (item.originalTitle && item.originalTitle.toLowerCase().includes(lowerQ))
    );

    try {
        const BACKEND_URL = process.env.BACKEND_URL || 'https://api.gochilly.fun';

        // 🔥 Увеличили limit до 50, чтобы ни один сезон не потерялся
        const remoteRes = await fetch(`https://shikimori.one/api/animes?search=${encodeURIComponent(q)}&limit=50&censored=true`, {
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
        // Отдаем на фронтенд до 50 результатов вместо старых 20
        res.json(finalResults.slice(0, 50));

    } catch (e) {
        res.json(localResults);
    }
};

export const getAnimeById = async (req, res) => {
    const { id } = req.params;

    if (dbMap[id]) return res.json(dbMap[id]);

    try {
        const resp = await fetch(`https://shikimori.one/api/animes/${id}`, {
            headers: { 'User-Agent': 'ChillyAnime/1.0' }
        });
        if (!resp.ok) return res.status(404).json({ error: "Not found" });
        const data = await resp.json();

        const year = data.aired_on ? data.aired_on.split('-')[0] : null;

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
            vibixUrl: vibixResult ? vibixResult.iframe_url : null,
            vibixSdkParams: vibixResult ? vibixResult.sdkParams : null,
            kodikUrl: `https://kodik.info/find-player?shikimoriID=${data.id}`
        };

        // Заменили на асинхронное сохранение
        await saveToDb(newItem);
        return res.json(newItem);
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
};