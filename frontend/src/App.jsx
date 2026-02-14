import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');
  
  body {
    font-family: 'Manrope', sans-serif;
    background: #020305;
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
    background: radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 70%);
    z-index: -10; pointer-events: none;
  }

  .stars-lg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
        radial-gradient(2.5px 2.5px at 50px 50px, #fff, transparent),
        radial-gradient(2px 2px at 150px 250px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 300px 100px, rgba(255,255,255,0.9), transparent),
        radial-gradient(2px 2px at 450px 50px, #fff, transparent),
        radial-gradient(2px 2px at 350px 350px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 100px 400px, #fff, transparent),
        radial-gradient(2px 2px at 250px 450px, rgba(255,255,255,0.8), transparent),
        radial-gradient(2px 2px at 480px 480px, #fff, transparent);
    background-size: 500px 500px;
    background-repeat: repeat;
    animation: drift 100s linear infinite;
    opacity: 0.95;
  }

  .stars-sm {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
        radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 90px 80px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1.5px 1.5px at 200px 20px, rgba(255,255,255,0.6), transparent),
        radial-gradient(1px 1px at 240px 180px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 300px 250px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 380px 10px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1.5px 1.5px at 400px 300px, rgba(255,255,255,0.6), transparent),
        radial-gradient(1px 1px at 450px 150px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 50px 350px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 120px 450px, rgba(255,255,255,0.7), transparent);
    background-size: 500px 500px;
    background-repeat: repeat;
    animation: drift 150s linear infinite;
    opacity: 0.6;
  }

  @keyframes drift {
    from { background-position: 0 0; }
    to { background-position: 500px 500px; }
  }

  .load-more-btn {
    display: block; margin: 40px auto; padding: 12px 40px;
    background: transparent; color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 30px; font-weight: 700; cursor: pointer;
    transition: all 0.3s ease;
  }
  .load-more-btn:hover {
    background: #fff; color: #000; border-color: #fff;
    box-shadow: 0 0 20px rgba(255,255,255,0.3);
  }
  .load-more-btn:disabled {
    opacity: 0.5; cursor: not-allowed;
  }
`;

const Home = ({ onCardClick }) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ПАГИНАЦИЯ
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const favorites = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("anime_favorites") || "[]"); } catch { return []; }
  }, []);
  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("anime_history") || "[]"); } catch { return []; }
  }, []);

  const resultsRef = useRef(null);

  // Загрузка популярных (первая страница)
  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/popular?page=1`)
      .then(res => res.json())
      .then(data => {
        setPopularList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Сброс при смене фильтра/поиска
  useEffect(() => {
    if (filters.genre) {
      setPage(1);
      search(1, true);
    }
  }, [filters.genre]);

  const search = async (pageNum = 1, isNewSearch = false) => {
    if (!query.trim() && !filters.genre) return;
    if (isNewSearch) {
      setLoading(true);
      setHasSearched(true);
      setAnimeList([]); // Очищаем список при новом поиске
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}&page=${pageNum}`);
      const data = await res.json();
      const newData = Array.isArray(data) ? data : [];

      if (isNewSearch) {
        setAnimeList(newData);
        if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        setAnimeList(prev => [...prev, ...newData]);
      }

    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Функция загрузки следующей страницы
  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);

    const endpoint = hasSearched
      ? `${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}&page=${nextPage}`
      : `${apiUrl}/popular?page=${nextPage}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const newData = Array.isArray(data) ? data : [];

      if (hasSearched) {
        setAnimeList(prev => [...prev, ...newData]);
      } else {
        setPopularList(prev => [...prev, ...newData]);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  };

  const displayedList = hasSearched ? animeList : popularList;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', zIndex: 1, position: 'relative' }}>
      <SearchHeader
        query={query}
        setQuery={setQuery}
        onSearch={() => { setPage(1); search(1, true); }}
        filters={filters}
        setFilters={setFilters}
        onGoHome={() => window.location.reload()}
      />

      <section ref={resultsRef} style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>

        {favorites.length > 0 && !hasSearched && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#F43F5E' }}>❤️</span> Избранное
            </h2>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }} className="hide-scroll">
              {favorites.map((item, idx) => (
                <div key={`fav-${item.id || idx}`} style={{ minWidth: '180px', maxWidth: '180px' }}>
                  <Card item={item} onClick={onCardClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
          {hasSearched ? `Результаты поиска` : (
            <><span style={{ width: '12px', height: '12px', background: '#F43F5E', borderRadius: '50%', boxShadow: '0 0 15px #F43F5E' }}></span> В тренде</>
          )}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Загрузка...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
              {displayedList.map((item, idx) => (
                <Card key={`${item.id}-${idx}`} item={item} onClick={onCardClick} />
              ))}
            </div>

            {/* Кнопка "Показать еще" */}
            {displayedList.length > 0 && (
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Загрузка...' : 'Показать еще'}
              </button>
            )}
          </>
        )}
      </section>

      {history.length > 0 && (
        <section style={{ marginTop: '80px', padding: '40px 0' }}>
          <h3 style={{ color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px', fontWeight: '800', letterSpacing: '2px' }}>История</h3>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }} className="hide-scroll">
            {history.map((item, idx) => (
              <div key={`hist-${item.id || idx}`} style={{ minWidth: '180px', maxWidth: '180px' }}>
                <Card item={item} onClick={onCardClick} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [cinemaMode, setCinemaMode] = useState(false);

  const handleCardClick = (item) => {
    const id = item.shikimoriId || item.id;
    navigate(`/watch/${id}`, { state: { item } });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles}</style>

      <div className="space-bg">
        <div className="stars-lg"></div>
        <div className="stars-sm"></div>
      </div>

      <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Home onCardClick={handleCardClick} />} />
          <Route
            path="/watch/:id"
            element={<PlayerSection cinemaMode={cinemaMode} setCinemaMode={setCinemaMode} />}
          />
        </Routes>
      </div>

      <footer style={{
        textAlign: 'center', padding: '80px 20px 40px', marginTop: 'auto',
        background: 'linear-gradient(0deg, #020305 30%, transparent 100%)',
        color: '#64748b', position: 'relative', zIndex: 10,
        opacity: cinemaMode ? 0 : 1, transition: 'opacity 0.5s',
        pointerEvents: cinemaMode ? 'none' : 'auto'
      }}>
        <div style={{ marginBottom: '15px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.8 }}>
          ⚡ Alpha Build
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '600' }}>
          Chilly Anime © 2026
        </p>
        <div>
          <a href="https://t.me/chilly_anime" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700' }}>Telegram</a>
        </div>
      </footer>
    </div>
  );
}