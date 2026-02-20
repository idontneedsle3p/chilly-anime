import fetch from "node-fetch";

const VIBIX_TOKEN = process.env.VIBIX_TOKEN || process.env.VITE_VIBIX_TOKEN;

export const searchVibixLive = async (title, shikiKind, targetYear) => {
    if (!title || !VIBIX_TOKEN) return null;
    try {
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

            // СТРОГИЙ ПОИСК: без догадок и приблизительных совпадений
            const bestMatch = json.data.find(item => {
                // 1. Совпадение типа (сериал или фильм)
                if (item.type !== requiredType) return false;

                // 2. Строгое совпадение названия (без учета регистра)
                const isNameMatch = item.name && item.name.toLowerCase() === title.toLowerCase();
                if (!isNameMatch) return false;

                // 3. Строгое совпадение года (разница > 0 теперь не допускается)
                if (targetYear && item.year) {
                    if (parseInt(item.year) !== parseInt(targetYear)) return false;
                }

                return true;
            });

            // Если идеального совпадения нет — просто возвращаем null (останется только Kodik)
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
    } catch (e) {
        console.error("Ошибка Vibix:", e);
    }
    return null;
}