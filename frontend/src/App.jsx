import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [playerUrl, setPlayerUrl] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Определяем базовый URL бэкенда один раз для всего компонента
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const search = async () => {
    if (!query) return;
    setLoading(true);
    setPlayerUrl("");
    try {
      // Используем переменную apiUrl
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAnimeList(data);
    } catch (e) {
      alert("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const selectAnime = (item) => {
    setActiveItem(item);
    const params = new URLSearchParams({
      shikimori_id: item.shikimoriId || "",
      title: item.originalTitle || item.title,
      types: "anime-serial,anime",
      with_episodes: "true",
      with_translations: "true"
    });
    setPlayerUrl(`https://kodik.info/find-player?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      {/* Декоративные фоновые пятна */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <header style={styles.header}>
        <div style={styles.navContent}>
          <h1 style={styles.logo} onClick={() => window.location.reload()}>
            CHILLY<span>ANIME</span>
          </h1>
          <div style={styles.searchContainer}>
            <input
              style={styles.input}
              placeholder="Найти любимое аниме..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button style={styles.searchBtn} onClick={search} disabled={loading}>
              {loading ? "..." : "Поиск"}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {playerUrl ? (
          <div style={styles.playerSection}>
            <div style={styles.playerHeader}>
              <button style={styles.backBtn} onClick={() => setPlayerUrl("")}>
                <span style={{ marginRight: '8px' }}>←</span> Назад к списку
              </button>
              <h2 style={styles.activeTitle}>{activeItem?.title}</h2>
            </div>
            <div style={styles.videoCard}>
              <iframe src={playerUrl} style={styles.iframe} frameBorder="0" allowFullScreen title="player" />
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {animeList.map((item) => (
              <div key={item.id} style={styles.card} onClick={() => selectAnime(item)}>
                <div style={styles.posterBox}>
                  {/* ИСПРАВЛЕНО: Склеиваем URL бэкенда и путь к картинке */}
                  <img
                    src={item.poster.startsWith('http') ? item.poster : `${apiUrl}${item.poster}`}
                    alt={item.title}
                    style={styles.posterImg}
                  />
                  <div style={styles.cardOverlay}>
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  <div style={styles.badge}>{item.year}</div>
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#08080a",
    color: "#ffffff",
    minHeight: "100vh",
    padding: "0 20px 40px",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
    overflowX: "hidden"
  },
  blob1: { position: "fixed", top: "-10%", left: "-5%", width: "400px", height: "400px", background: "rgba(255, 71, 87, 0.15)", filter: "blur(100px)", borderRadius: "50%", zIndex: 0 },
  blob2: { position: "fixed", bottom: "10%", right: "-5%", width: "300px", height: "300px", background: "rgba(64, 115, 255, 0.1)", filter: "blur(100px)", borderRadius: "50%", zIndex: 0 },

  header: {
    position: "sticky", top: 0, zIndex: 100, padding: "20px 0",
    backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)"
  },
  navContent: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" },
  logo: { fontSize: "1.8rem", fontWeight: "900", cursor: "pointer", margin: 0, letterSpacing: "-1px" },
  searchContainer: { display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", width: "400px" },
  input: { background: "none", border: "none", padding: "12px 20px", color: "#fff", outline: "none", flex: 1, fontSize: "0.95rem" },
  searchBtn: { background: "#ff4757", color: "#fff", border: "none", padding: "0 25px", fontWeight: "700", cursor: "pointer", transition: "0.2s" },

  main: { maxWidth: "1200px", margin: "40px auto", position: "relative", zIndex: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "30px" },

  card: {
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", overflow: "hidden",
    cursor: "pointer", transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  posterBox: { position: "relative", aspectRatio: "2/3", overflow: "hidden" },
  posterImg: { width: "100%", height: "100%", objectFit: "cover", transition: "0.5s" },
  cardOverlay: {
    position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
    display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.3s"
  },
  playIcon: { width: "50px", height: "50px", background: "#ff4757", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 0 20px rgba(255,71,87,0.5)" },
  badge: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", backdropFilter: "blur(5px)" },
  cardInfo: { padding: "15px" },
  cardTitle: { margin: 0, fontSize: "0.95rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" },

  playerSection: { maxWidth: "1000px", margin: "0 auto" },
  playerHeader: { display: "flex", alignItems: "center", gap: "25px", marginBottom: "25px" },
  backBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
    padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "0.9rem", transition: "0.2s"
  },
  activeTitle: { margin: 0, fontSize: "1.6rem", fontWeight: "800" },
  videoCard: {
    width: "100%", aspectRatio: "16/9", borderRadius: "24px", overflow: "hidden",
    boxShadow: "0 30px 60px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", background: "#000"
  },
  iframe: { width: "100%", height: "100%" }
};