import fs from "fs/promises";

const DB_PATH = "./db.json";

export let dbCache = [];
export let dbMap = {};

export const loadDb = async () => {
    try {
        const raw = await fs.readFile(DB_PATH, "utf-8");
        dbMap = JSON.parse(raw);
        dbCache = Object.values(dbMap);
        console.log(`📦 База загружена: ${dbCache.length} аниме`);
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("⚠️ db.json не найден, создаем пустой.");
            await fs.writeFile(DB_PATH, "{}");
            dbMap = {};
            dbCache = [];
        } else {
            console.error("Ошибка чтения БД:", e);
        }
    }
};

export const saveToDb = async (newItem) => {
    try {
        dbMap[newItem.id] = newItem;
        if (!dbCache.find(x => x.id === newItem.id)) {
            dbCache.push(newItem);
        }
        await fs.writeFile(DB_PATH, JSON.stringify(dbMap, null, 2));
    } catch (e) {
        console.error("Ошибка записи:", e);
    }
};