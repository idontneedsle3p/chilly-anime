import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [query, setQuery] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [playerUrl, setPlayerUrl] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const search = async () => {
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    setPlayerUrl("");
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAnimeList(data);
    } catch (e) {
      alert("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setHasSearched(false);
    setAnimeList([]);
    setPlayerUrl("");
    setQuery("");
  };

  return (
    <div style={styles.container}>
      <Analytics />
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* КАРТИНКА-ЛОГОТИП (ТЕПЕРЬ ПРОСТО ДЕКОР ИЛИ ДЛЯ СТИЛЯ) */}
      <div style={styles.isolatedLogoWrapper}>
        <img src="/chillyanime.png" alt="Logo Decor" style={styles.isolatedLogo} />
      </div>

      <header style={styles.header}>
        <div style={styles.navContent}>

          {/* КНОПКА ДОМОЙ ВЕРНУЛАСЬ СЮДА */}
          <div style={styles.logoWrapper} onClick={goHome}>
            <h1 style={styles.logoText}>
              CHILLY<span style={styles.logoAccent}>ANIME</span>
            </h1>
            <div style={styles.logoDot}></div>
          </div>

          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.input}
              placeholder="Найти аниме..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button
              style={styles.searchBtn}
              onClick={search}
              disabled={loading}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ff6b81"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff4757"}
            >
              {loading ? "..." : "Поиск"}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {playerUrl ? (
          <div style={styles.playerSection}>
            <div style={styles.playerHeader}>
              <button style={styles.backBtn} onClick={() => setPlayerUrl("")}>← Назад</button>
              <h2 style={styles.activeTitle}>{activeItem?.title}</h2>
            </div>
            <div style={styles.videoCard}>
              <iframe src={playerUrl} style={styles.iframe} frameBorder="0" allowFullScreen title="player" />
            </div>
          </div>
        ) : (
          <>
            {!hasSearched && (
              <div style={styles.hero}>
                <h2 style={styles.heroTitle}>Твой уютный уголок аниме</h2>
                <p style={styles.heroSub}>Введи название в поиске выше, чтобы начать просмотр</p>
              </div>
            )}

            {loading ? (
              <div style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} style={styles.skeletonCard}></div>
                ))}
              </div>
            ) : (
              <div style={styles.grid}>
                {animeList.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ ...styles.card, animation: `fadeInUp 0.5s ease forwards ${index * 0.05}s`, opacity: 0 }}
                    onClick={() => {
                      setActiveItem(item);
                      const params = new URLSearchParams({
                        shikimori_id: item.shikimoriId || "",
                        title: item.originalTitle || item.title,
                        types: "anime-serial,anime"
                      });
                      setPlayerUrl(`https://kodik.info/find-player?${params.toString()}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div style={styles.posterBox}>
                      <img src={item.poster.startsWith('http') ? item.poster : `${apiUrl}${item.poster}`} alt={item.title} style={styles.posterImg} />
                      <div style={styles.cardOverlay}><div style={styles.playIcon}>▶</div></div>
                      <div style={styles.badge}>{item.year}</div>
                    </div>
                    <div style={styles.cardInfo}>
                      <h3 style={styles.cardTitle}>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerItem}>ALPHA VERSION 0.0.1</span>
          <span style={styles.footerDivider}></span>
          <a href="https://t.me/chilly_anime" target="_blank" rel="noreferrer" style={styles.footerItem}>✈ TELEGRAM</a>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        body { margin: 0; background: #08080a; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: "#08080a", color: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', 'Segoe UI', sans-serif", position: "relative", overflowX: "hidden" },
  blob1: { position: "fixed", top: "-10%", left: "-5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255, 71, 87, 0.1) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 },
  blob2: { position: "fixed", bottom: "0%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(64, 115, 255, 0.05) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 },

  isolatedLogoWrapper: {
    position: "absolute",
    bottom: "20px",
    right: "3%",
    zIndex: 1000,
    pointerEvents: "none", // Чтобы не мешало кликам, если перекроет что-то
  },
  isolatedLogo: {
    width: "160px",
    height: "auto",
    filter: "drop-shadow(0 0 20px rgba(255, 71, 87, 0.4))",
    transform: "rotate(-5deg)", // Сделал наклон посильнее, как ты хотел
  },

  header: {
    position: "sticky",
    top: "15px",
    zIndex: 100,
    margin: "0 auto",
    width: "95%",
    maxWidth: "1200px",
    borderRadius: "20px",
    backdropFilter: "blur(25px)",
    backgroundColor: "rgba(15, 15, 20, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "12px 25px",
    boxSizing: "border-box"
  },
  navContent: { display: "flex", justifyContent: "space-between", alignItems: "center" },

  logoWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1px",
    color: "#ffffff" // Чистый белый для CHILLY
  },
  logoAccent: { color: "#ff4757" }, // Красный для ANIME
  logoDot: { width: "6px", height: "6px", backgroundColor: "#ff4757", borderRadius: "50%", boxShadow: "0 0 10px #ff4757" },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2px 2px 2px 15px",
    width: "100%",
    maxWidth: "380px"
  },
  searchIcon: { opacity: 0.5 },
  input: { background: "none", border: "none", padding: "10px 12px", color: "#fff", outline: "none", flex: 1, fontSize: "0.9rem" },
  searchBtn: {
    background: "#ff4757",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "background 0.2s"
  },

  main: { maxWidth: "1200px", width: "100%", margin: "40px auto", padding: "0 20px", position: "relative", zIndex: 1, flex: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "30px" },
  hero: { textAlign: "center", marginTop: "100px", opacity: 0.8 },
  heroTitle: { fontSize: "2.5rem", fontWeight: "800", marginBottom: "10px" },
  heroSub: { fontSize: "1.1rem", color: "rgba(255,255,255,0.5)" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "20px", overflow: "hidden", cursor: "pointer", transition: "0.4s", border: "1px solid rgba(255, 255, 255, 0.05)" },
  skeletonCard: { aspectRatio: "2/3", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", animation: "pulse 1.5s infinite" },
  posterBox: { position: "relative", aspectRatio: "2/3" },
  posterImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.3s" },
  playIcon: { width: "50px", height: "50px", background: "#ff4757", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" },
  badge: { position: "absolute", top: "15px", right: "15px", background: "rgba(8,8,10,0.8)", padding: "5px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800" },
  cardTitle: { padding: "15px", margin: 0, fontSize: "0.95rem", textAlign: "center" },

  playerSection: { width: "100%" },
  playerHeader: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: "12px", cursor: "pointer" },
  activeTitle: { fontSize: "1.5rem" },
  videoCard: { width: "100%", aspectRatio: "16/9", borderRadius: "24px", overflow: "hidden", background: "#000" },
  iframe: { width: "100%", height: "100%" },

  footer: { padding: "40px 0", display: "flex", justifyContent: "center" },
  footerContent: { display: "flex", alignItems: "center", gap: "20px", padding: "8px 20px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "100px", border: "1px solid rgba(255, 255, 255, 0.05)" },
  footerItem: { fontSize: "0.7rem", fontWeight: "800", color: "rgba(255, 255, 255, 0.4)", textDecoration: "none" },
  footerDivider: { width: "1px", height: "12px", background: "rgba(255, 255, 255, 0.1)" }
};