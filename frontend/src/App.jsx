import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');
  
  body {
    font-family: 'Manrope', sans-serif;
    background: #000000;
    margin: 0;
    overflow-x: hidden;
    color: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #F43F5E; }

  .space-bg {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #020308;
    z-index: -10; pointer-events: none;
    overflow: hidden;
    /* Убираем размытие с контейнера для производительности */
    transform: translateZ(0);
  }

  .stars { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    /* Важно: повторяем паттерн по всему экрану */
    background-repeat: repeat;
  }
  
  /* СЛОЙ 1: Близкие яркие звезды 
     Плотный паттерн, звезды есть и в начале (0%), и в конце (90%+) координат
  */
  .star-layer-1 {
    background-image: 
      radial-gradient(2px 2px at 10% 10%, #ffffff, transparent),
      radial-gradient(2px 2px at 90% 90%, #ffffff, transparent), /* Заполняет правый нижний угол */
      radial-gradient(2px 2px at 30% 40%, rgba(255,255,255,0.9), transparent),
      radial-gradient(2px 2px at 70% 80%, rgba(255,255,255,0.9), transparent),
      radial-gradient(2.5px 2.5px at 50% 50%, #ffffff, transparent),
      radial-gradient(2px 2px at 15% 90%, #ffffff, transparent), /* Заполняет левый низ */
      radial-gradient(2px 2px at 95% 15%, rgba(255,255,255,0.8), transparent), /* Заполняет правый верх */
      
      /* Цветные акценты для глубины */
      radial-gradient(3px 3px at 45% 75%, rgba(59, 130, 246, 1), transparent), 
      radial-gradient(3px 3px at 85% 25%, rgba(244, 63, 94, 0.8), transparent);
      
    background-size: 400px 400px; /* Размер плитки паттерна */
    animation: moveStars 60s linear infinite;
    opacity: 0.9;
    will-change: background-position;
  }
  
  /* СЛОЙ 2: Средние звезды (побольше их, чтобы не было пустот) */
  .star-layer-2 {
    background-image: 
      radial-gradient(1.5px 1.5px at 20% 80%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1.5px 1.5px at 80% 20%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1.5px 1.5px at 10% 30%, #ffffff, transparent),
      radial-gradient(1.5px 1.5px at 90% 70%, #ffffff, transparent),
      radial-gradient(2px 2px at 50% 10%, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 50% 90%, rgba(255,255,255,0.6), transparent);
      
    background-size: 300px 300px;
    animation: moveStars 100s linear infinite;
    opacity: 0.6;
    will-change: background-position;
  }

  /* СЛОЙ 3: Далекая пыль (очень медленная) */
  .star-layer-3 {
    background-image: radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.4), transparent);
    background-size: 100px 100px;
    animation: moveStars 150s linear infinite;
    will-change: background-position;
  }

  /* Анимация двигает ФОН, а не DIV. 
     Благодаря repeat звезды бесконечны.
  */
  @keyframes moveStars {
    from { background-position: 0 0; }
    to { background-position: 1000px 1000px; } /* Двигаем вправо-вниз */
  }

  .cosmic-entity {
    position: absolute; border-radius: 50%;
    filter: blur(120px);
    /* GPU ускорение для пятен света */
    transform: translateZ(0); 
    will-change: transform;
    animation: floatEntity 30s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  }
  .entity-blue { width: 60vw; height: 60vw; background: #0c1b4a; top: -30%; left: -20%; opacity: 0.2; }
  .entity-red { width: 50vw; height: 50vw; background: #4a071c; bottom: -20%; right: -20%; animation-delay: -10s; animation-direction: alternate-reverse; opacity: 0.2; }

  @keyframes floatEntity {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    100% { transform: translate3d(5vw, -5vh, 0) scale(1.1); }
  }

  .glass-card { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease; }
  .glass-card:hover { 
    transform: translateY(-8px) scale(1.01); 
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(244, 63, 94, 0.2); 
    border-color: rgba(244, 63, 94, 0.4) !important; 
    z-index: 10; 
  }
`;

export default function App() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("anime_history") || "[]"); }
    catch (e) { return []; }
  });
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${apiUrl}/popular`)
      .then(res => res.json())
      .then(data => setPopularList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка:", err));
  }, []);

  useEffect(() => { if (filters.genre) search(); }, [filters.genre]);

  const search = async () => {
    if (!query.trim() && !filters.genre) return;
    setLoading(true); setHasSearched(true);
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}`);
      const data = await res.json();
      setAnimeList(Array.isArray(data) ? data : []);
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCardClick = (item) => {
    setActiveItem(item);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    setHistory(prev => {
      const id = item.shikimoriId || item.id;
      const filtered = prev.filter(h => (h.shikimoriId || h.id) !== id);
      const updated = [item, ...filtered].slice(0, 15);
      localStorage.setItem("anime_history", JSON.stringify(updated));
      return updated;
    });
  };

  const goHome = () => {
    setActiveItem(null); setQuery(""); setFilters({ genre: "" }); setHasSearched(false); setAnimeList([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Мемоизация списков для предотвращения лишних ререндеров
  const displayedList = useMemo(() => hasSearched ? animeList : popularList, [hasSearched, animeList, popularList]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles}</style>

      <div className="space-bg">
        <div className="cosmic-entity entity-blue"></div>
        <div className="cosmic-entity entity-red"></div>
        <div className="stars star-layer-3"></div>
        <div className="stars star-layer-2"></div>
        <div className="stars star-layer-1"></div>
      </div>

      <div style={{ flex: 1, zIndex: 1 }}>
        {!activeItem ? (
          <SearchHeader query={query} setQuery={setQuery} onSearch={search} filters={filters} setFilters={setFilters} onGoHome={goHome} />
        ) : (
          <nav style={{
            padding: '20px 4vw',
            display: 'flex', alignItems: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between'
          }}>
            <div onClick={goHome} style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px', cursor: 'pointer', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', padding: '8px 20px', borderRadius: '12px', cursor: 'pointer',
                fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✕ Назад
            </button>
          </nav>
        )}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {activeItem && <div style={{ paddingTop: '20px' }}><PlayerSection item={activeItem} /></div>}

          <section ref={resultsRef} style={{ marginTop: activeItem ? '40px' : '-40px', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {hasSearched ? `Результаты поиска` : (
                <><span style={{ width: '12px', height: '12px', background: '#F43F5E', borderRadius: '50%', boxShadow: '0 0 15px #F43F5E' }}></span> В тренде</>
              )}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#64748b', fontSize: '1.2rem' }}>Загрузка данных...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
                {displayedList.map((item, idx) => (
                  <Card key={item.id || idx} item={item} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </section>

          {history.length > 0 && (
            <section style={{ marginTop: '80px', padding: '40px 0' }}>
              <h3 style={{ color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: '800' }}>История</h3>
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }} className="hide-scroll">
                {history.map((item, idx) => (
                  <div key={`hist-${item.id || idx}`} style={{ minWidth: '180px', maxWidth: '180px' }}>
                    <Card item={item} onClick={handleCardClick} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer style={{
        textAlign: 'center', padding: '60px 20px 40px', marginTop: 'auto',
        background: 'linear-gradient(0deg, #000 20%, transparent 100%)',
        color: '#64748b', position: 'relative', zIndex: 10
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.75rem' }}>⚡ Fast Build</div>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Chilly Anime © 2026</p>
      </footer>
    </div>
  );
}