import React, { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [query, setQuery] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [playerUrl, setPlayerUrl] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [popularList, setPopularList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ genre: "", kind: "" });

  const resultsRef = useRef(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("anime_history");
    return saved ? JSON.parse(saved) : [];
  });

  const apiUrl = import.meta.env.VITE_API_URL || "https://api.gochilly.fun";

  const genresList = [
    { id: "1", name: "Экшен" }, { id: "4", name: "Комедия" },
    { id: "8", name: "Драма" }, { id: "10", name: "Фэнтези" },
    { id: "22", name: "Романтика" }, { id: "27", name: "Сёнен" }
  ];

  useEffect(() => {
    fetch(`${apiUrl}/popular`)
      .then(res => res.json())
      .then(data => setPopularList(data))
      .catch(e => console.error(e));
  }, []);

  const search = async () => {
    if (!query.trim() && !filters.genre) return;
    setLoading(true);
    setHasSearched(true);
    setPlayerUrl("");

    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const res = await fetch(`${apiUrl}/search?${params.toString()}`);
      const data = await res.json();
      setAnimeList(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCardClick = async (item) => {
    setActiveItem(item);
    const params = new URLSearchParams({
      shikimori_id: item.shikimoriId || "",
      title: item.originalTitle || item.title,
      types: "anime-serial,anime"
    });
    setPlayerUrl(`https://kodik.info/find-player?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      let shikiId = item.shikimoriId;
      if (!shikiId || shikiId === "0") {
        const s = await fetch(`https://shikimori.one/api/animes?search=${encodeURIComponent(item.originalTitle || item.title)}&limit=1`);
        const sd = await s.json();
        if (sd.length) shikiId = sd[0].id;
      }
      if (shikiId) {
        const res = await fetch(`https://shikimori.one/api/animes/${shikiId}`);
        const d = await res.json();
        const fullData = {
          ...item,
          description: d.description?.replace(/\[.*?\]/g, "").replace(/<[^>]*>?/gm, "") || item.description,
          rating: d.score || item.rating,
          status: d.status === "released" ? "Завершен" : "Выходит",
          poster: `https://shikimori.one${d.image.original}`
        };
        setActiveItem(fullData);
        addToHistory(fullData);
      } else {
        addToHistory(item);
      }
    } catch (e) { addToHistory(item); }
  };

  const addToHistory = (anime) => {
    setHistory(prev => {
      const filtered = prev.filter(i => i.id !== anime.id);
      const next = [anime, ...filtered].slice(0, 8);
      localStorage.setItem("anime_history", JSON.stringify(next));
      return next;
    });
  };

  const resetSearch = () => {
    setHasSearched(false);
    setQuery("");
    setPlayerUrl("");
    setFilters({ genre: "", kind: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.page}>
      <Analytics />
      <div style={styles.bgGradientLeft}></div>
      <div style={styles.bgGradientRight}></div>

      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={resetSearch}>
            CHILLY<span style={{ color: "#F43F5E" }}>ANIME</span>
          </div>
          {(hasSearched || playerUrl) && (
            <button style={styles.navSearchBtn} onClick={resetSearch}>🔍 Новый поиск</button>
          )}
        </div>
      </nav>

      <main style={styles.main}>
        {playerUrl ? (
          <div style={styles.playerContainer}>
            <button style={styles.backBtn} onClick={() => setPlayerUrl("")}>← Вернуться</button>
            <div style={styles.iframeWrapper}>
              <iframe src={playerUrl} title="Anime Player" style={styles.iframe} frameBorder="0" allowFullScreen />
            </div>
            <div style={styles.details}>
              <h1 style={styles.detailTitle}>{activeItem?.title}</h1>
              <div style={styles.detailTags}>
                <span style={styles.tagRating}>★ {activeItem?.rating}</span>
                <span style={styles.tagYear}>{activeItem?.year}</span>
                <span style={styles.tagStatus}>{activeItem?.status}</span>
              </div>
              <p style={styles.detailDesc}>{activeItem?.description || "Описание загружается..."}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ ...styles.hero, display: hasSearched ? 'none' : 'flex' }}>
              <h1 style={styles.heroTitle}>Все аниме в одном поиске</h1>
              <p style={styles.heroSubtitle}>Твои любимые тайтлы всегда под рукой. Просто введи название.</p>

              <div style={styles.searchBlock}>
                <div style={styles.inputWrapper}>
                  <span style={styles.searchIcon}>🔎</span>
                  <input
                    style={styles.heroInput}
                    placeholder="Найти аниме..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                  />
                  <button style={styles.heroBtn} onClick={search}>Поиск</button>
                </div>

                <div style={styles.filterRow}>
                  <button style={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                    {showFilters ? "Скрыть фильтры" : "Настройки поиска"}
                  </button>
                  {showFilters && (
                    <div style={styles.filtersBox}>
                      <select style={styles.select} value={filters.genre} onChange={e => setFilters({ ...filters, genre: e.target.value })}>
                        <option value="">Все жанры</option>
                        {genresList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <select style={styles.select} value={filters.kind} onChange={e => setFilters({ ...filters, kind: e.target.value })}>
                        <option value="">Тип</option>
                        <option value="tv">Сериал</option>
                        <option value="movie">Фильм</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* БЛОК ИСТОРИИ */}
            {!hasSearched && history.length > 0 && (
              <div style={styles.historySection}>
                <h3 style={styles.historyHeading}>Вы недавно смотрели</h3>
                <div style={styles.grid}>
                  {history.map(item => (
                    <Card key={`hist-${item.id}`} item={item} onClick={handleCardClick} apiUrl={apiUrl} />
                  ))}
                </div>
              </div>
            )}

            {/* РЕЗУЛЬТАТЫ / ПОПУЛЯРНОЕ */}
            <div ref={resultsRef} style={{ marginTop: hasSearched ? '40px' : '60px' }}>
              <h2 style={styles.sectionTitle}>
                {hasSearched ? "Результаты поиска" : "Популярное сейчас"}
              </h2>
              <div style={styles.grid}>
                {loading ?
                  [...Array(8)].map((_, i) => <div key={`skeleton-${i}`} style={styles.skeleton} />) :
                  (hasSearched ? animeList : popularList).map(item => (
                    <Card key={`main-${item.id}`} item={item} onClick={handleCardClick} apiUrl={apiUrl} />
                  ))
                }
              </div>
            </div>
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div className="footer-capsule" style={styles.footerCapsule}>
            <span style={styles.alphaText}>ALPHA VERSION 0.1.2</span>
            <div style={styles.footerDivider}></div>
            <a
              href="https://t.me/chilly_anime"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={styles.tgLink}
            >
              <span style={styles.tgIcon}>✈</span> TELEGRAM
            </a>
          </div>
          <p style={styles.footerCopyright}>
            © 2026 CHILLY ANIME • Сделано для фанатов
          </p>
        </div>
      </footer>

      <style>{`
        body { margin: 0; background: #09090b; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        * { box-sizing: border-box; outline: none; }
        ::selection { background: #F43F5E; color: white; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .footer-capsule:hover {
          border-color: rgba(244, 63, 94, 0.4) !important;
          box-shadow: 0 0 20px rgba(244, 63, 94, 0.15);
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .footer-link:hover {
          color: #fff !important;
          text-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
        }

        .card-wrapper:hover { transform: scale(1.03); }
        .card-wrapper:hover .card-overlay { opacity: 1; }
      `}</style>
    </div>
  );
}

function Card({ item, onClick, apiUrl }) {
  const poster = item.poster.startsWith('http') ? item.poster : `${apiUrl}${item.poster}`;
  return (
    <div className="card-wrapper" style={styles.card} onClick={() => onClick(item)}>
      <div style={styles.cardImageWrapper}>
        <img src={poster} style={styles.cardImage} alt={item.title} loading="lazy" />
        <div className="card-overlay" style={styles.cardOverlay}>
          <span style={styles.playIcon}>▶</span>
        </div>
        <div style={styles.ratingBadge}>{item.rating}</div>
      </div>
      <div style={styles.cardContent}>
        <div style={styles.cardTitle}>{item.title}</div>
        <div style={styles.cardYear}>{item.year || "—"}</div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" },
  bgGradientLeft: { position: "fixed", top: "-10%", left: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(244,63,94,0.08) 0%, rgba(0,0,0,0) 70%)", zIndex: -1 },
  bgGradientRight: { position: "fixed", bottom: "-10%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 70%)", zIndex: -1 },
  nav: { padding: "24px 0", zIndex: 100 },
  navContent: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: "22px", fontWeight: "900", letterSpacing: "-1px", cursor: "pointer" },
  navSearchBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  main: { flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px" },
  hero: { flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", textAlign: "center", animation: "fadeIn 0.8s ease" },
  heroTitle: { fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px" },
  heroSubtitle: { fontSize: "16px", color: "#71717a", marginBottom: "40px" },
  searchBlock: { width: "100%", maxWidth: "580px" },
  inputWrapper: { display: "flex", alignItems: "center", background: "#111113", border: "1px solid #27272a", borderRadius: "18px", padding: "6px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" },
  searchIcon: { paddingLeft: "16px", opacity: 0.4 },
  heroInput: { flex: 1, background: "none", border: "none", color: "white", padding: "14px", fontSize: "16px" },
  heroBtn: { background: "#F43F5E", color: "white", border: "none", padding: "12px 28px", borderRadius: "14px", fontWeight: "700", cursor: "pointer" },
  filterRow: { marginTop: "16px" },
  filterToggle: { background: "none", border: "none", color: "#52525b", fontSize: "13px", cursor: "pointer", textDecoration: "underline" },
  filtersBox: { display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" },
  select: { background: "#111113", border: "1px solid #27272a", color: "#eee", padding: "8px 12px", borderRadius: "10px", fontSize: "13px" },
  historySection: { marginTop: "40px", animation: "fadeIn 1s ease" },
  historyHeading: { fontSize: "14px", fontWeight: "700", color: "#52525b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "#f4f4f5" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "24px", paddingBottom: "40px" },
  card: { cursor: "pointer", transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
  cardImageWrapper: { position: "relative", aspectRatio: "2/3", borderRadius: "16px", overflow: "hidden", background: "#111113" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.3s" },
  playIcon: { fontSize: "32px" },
  ratingBadge: { position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", backdropFilter: "blur(4px)" },
  cardContent: { paddingTop: "12px" },
  cardTitle: { fontSize: "14px", fontWeight: "600", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardYear: { fontSize: "12px", color: "#52525b" },
  playerContainer: { marginTop: "40px", animation: "fadeIn 0.5s ease" },
  backBtn: { background: "none", border: "1px solid #27272a", color: "#a1a1aa", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", marginBottom: "24px" },
  iframeWrapper: { width: "100%", aspectRatio: "16/9", background: "black", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" },
  iframe: { width: "100%", height: "100%" },
  details: { marginTop: "32px" },
  detailTitle: { fontSize: "28px", fontWeight: "800", marginBottom: "16px" },
  detailTags: { display: "flex", gap: "12px", marginBottom: "20px" },
  tagRating: { color: "#F43F5E", fontWeight: "800" },
  tagStatus: { background: "#18181b", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" },
  tagYear: { color: "#71717a" },
  detailDesc: { lineHeight: "1.6", color: "#a1a1aa", maxWidth: "800px" },
  footer: { padding: "60px 0 40px" },
  footerContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  footerCapsule: { display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.02)", padding: "6px 20px", borderRadius: "100px", border: "1px solid rgba(255, 255, 255, 0.05)", transition: "all 0.4s ease" },
  alphaText: { fontSize: "10px", fontWeight: "800", color: "rgba(255, 255, 255, 0.3)", letterSpacing: "1px" },
  footerDivider: { width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.1)", margin: "0 16px" },
  tgLink: { textDecoration: "none", color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", transition: "0.3s" },
  tgIcon: { marginRight: "6px" },
  footerCopyright: { fontSize: "10px", color: "rgba(255, 255, 255, 0.15)", textTransform: "uppercase", letterSpacing: "1px" },
  skeleton: { aspectRatio: "2/3", background: "#111113", borderRadius: "16px" }
};