import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = (isLow) => `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');
  
  body {
    font-family: 'Manrope', sans-serif;
    background: #020305;
    margin: 0;
    overflow-x: hidden;
    color: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }
  
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0b0c15; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #F43F5E; }

  /* ФОН И ЗВЕЗДЫ */
  .space-bg {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 70%);
    z-index: -10; pointer-events: none;
  }

  .stars-lg, .stars-sm {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-repeat: repeat;
    animation: ${isLow ? 'none' : 'drift'} 100s linear infinite;
  }

  .stars-lg {
    background-image: 
        radial-gradient(2.5px 2.5px at 50px 50px, #fff, transparent),
        radial-gradient(2px 2px at 150px 250px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 300px 100px, rgba(255,255,255,0.9), transparent);
    background-size: 500px 500px;
    opacity: 0.9;
  }

  .stars-sm {
    background-image: 
        radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 90px 80px, rgba(255,255,255,0.7), transparent);
    background-size: 500px 500px;
    opacity: 0.5;
    animation-duration: 150s;
  }

  @keyframes drift {
    from { background-position: 0 0; }
    to { background-position: 500px 500px; }
  }

  .horizontal-scroll-container {
    display: flex; gap: 20px; overflow-x: auto; padding: 10px 0 20px 0;
    scrollbar-width: none;
  }
  .horizontal-scroll-container::-webkit-scrollbar { display: none; }

  .load-more-btn {
    display: block; margin: 50px auto; padding: 14px 50px;
    background: transparent; color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px; font-weight: 700; cursor: pointer;
    transition: all 0.3s ease;
  }
  .load-more-btn:hover {
    background: #fff; color: #000; border-color: #fff;
    transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255,255,255,0.1);
  }
  
  .fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const Home = ({ onCardClick, lowGraphics, toggleGraphics, searchState }) => {
  const {
    query, setQuery, filters, setFilters, animeList, setAnimeList,
    hasSearched, setHasSearched, popularList, setPopularList, page, setPage,
    sortType, setSortType
  } = searchState;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const resultsRef = useRef(null);

  const favorites = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("chilly_favs") || "[]"); } catch { return []; }
  }, []);

  const fetchData = useCallback(async (pageNum = 1, isNewSearch = false, currentSort = sortType) => {
    if (isNewSearch) {
      setLoading(true);
      if (!hasSearched && query.trim() === "") setPopularList([]);
    } else {
      setLoadingMore(true);
    }

    const endpoint = hasSearched || (isNewSearch && query.trim())
      ? `${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}&page=${pageNum}`
      : `${apiUrl}/popular?sort=${currentSort}&page=${pageNum}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const newData = Array.isArray(data) ? data : [];

      if (hasSearched || (isNewSearch && query.trim())) {
        setAnimeList(prev => pageNum === 1 ? newData : [...prev, ...newData]);
        if (isNewSearch) setHasSearched(true);
      } else {
        setPopularList(prev => pageNum === 1 ? newData : [...prev, ...newData]);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, filters, hasSearched, sortType, setAnimeList, setPopularList, setHasSearched]);

  useEffect(() => {
    if (popularList.length === 0 && !hasSearched) {
      fetchData(1, true);
    }
  }, [sortType, hasSearched, fetchData, popularList.length]);

  const handleSortChange = (type) => {
    setSortType(type);
    setPage(1);
    fetchData(1, true, type);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };

  const displayedList = hasSearched ? animeList : popularList;

  return (
    <>
      <Helmet><title>Chilly Anime — Смотри аниме онлайн</title></Helmet>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 25px', zIndex: 1, position: 'relative' }}>
        <SearchHeader
          query={query} setQuery={setQuery}
          onSearch={() => { setPage(1); fetchData(1, true); }}
          filters={filters} setFilters={setFilters}
          onGoHome={() => { setHasSearched(false); setQuery(""); setFilters({ genre: "" }); setPage(1); setSortType('popularity'); }}
          lowGraphics={lowGraphics} toggleGraphics={toggleGraphics}
        />

        <section ref={resultsRef} style={{ marginTop: '30px', position: 'relative', zIndex: 2, paddingBottom: '60px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ border: '4px solid rgba(255, 255, 255, 0.1)', borderTop: `4px solid ${sortType === 'trending' ? '#3B82F6' : '#F43F5E'}`, borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : (
            <>
              {favorites.length > 0 && !hasSearched && (
                <div style={{ marginBottom: '60px' }} className="fade-in">
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700', color: '#e2e8f0' }}>❤️ Избранное</h2>
                  <div className="horizontal-scroll-container">
                    {favorites.map((item, idx) => (
                      <div key={`fav-${item.id}-${idx}`} style={{ minWidth: '180px', maxWidth: '180px', flexShrink: 0 }}>
                        <Card item={item} onClick={onCardClick} lowGraphics={lowGraphics} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasSearched && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                  <button
                    onClick={() => handleSortChange('popularity')}
                    style={{
                      padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                      background: sortType === 'popularity' ? '#F43F5E' : 'rgba(255,255,255,0.05)',
                      color: '#fff', transition: '0.3s',
                      boxShadow: sortType === 'popularity' ? '0 8px 20px -5px rgba(244, 63, 94, 0.4)' : 'none'
                    }}
                  >🏆 Самое популярное за все время</button>
                  <button
                    onClick={() => handleSortChange('trending')}
                    style={{
                      padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                      background: sortType === 'trending' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                      color: '#fff', transition: '0.3s',
                      boxShadow: sortType === 'trending' ? '0 8px 20px -5px rgba(59, 130, 246, 0.4)' : 'none'
                    }}
                  >🔥 Сейчас в тренде</button>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '24px',
                width: '100%'
              }} className="fade-in">
                {displayedList.map((item, idx) => (
                  <Card key={`${item.id}-${idx}`} item={item} onClick={onCardClick} lowGraphics={lowGraphics} />
                ))}
              </div>

              {displayedList.length > 0 && (
                <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Загрузка...' : 'Показать еще'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

function AppContent() {
  const navigate = useNavigate();
  const [cinemaMode, setCinemaMode] = useState(false);
  const [lowGraphics, setLowGraphics] = useState(() => localStorage.getItem("low_graphics") === "true");

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState('popularity');

  const toggleGraphics = () => {
    const newVal = !lowGraphics;
    setLowGraphics(newVal);
    localStorage.setItem("low_graphics", newVal.toString());
  };

  const resetSearch = () => {
    setHasSearched(false); setQuery(""); setFilters({ genre: "" }); setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles(lowGraphics)}</style>

      <div className="space-bg">
        <div className="stars-lg"></div>
        <div className="stars-sm"></div>
      </div>

      <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={
            <Home
              onCardClick={(item) => navigate(`/watch/${item.shikimoriId || item.id}`, { state: { item } })}
              lowGraphics={lowGraphics}
              toggleGraphics={toggleGraphics}
              searchState={{
                query, setQuery, filters, setFilters,
                animeList, setAnimeList, popularList, setPopularList,
                hasSearched, setHasSearched, page, setPage,
                sortType, setSortType
              }}
            />
          } />
          <Route path="/watch/:id" element={
            <PlayerSection
              cinemaMode={cinemaMode}
              setCinemaMode={setCinemaMode}
              lowGraphics={lowGraphics}
              toggleGraphics={toggleGraphics}
              resetSearch={resetSearch}
            />
          } />
        </Routes>
      </div>

      <footer style={{
        textAlign: 'center', padding: '40px 20px', marginTop: 'auto',
        background: 'linear-gradient(0deg, #020305 30%, transparent 100%)',
        color: '#64748b', position: 'relative', zIndex: 10,
        opacity: cinemaMode ? 0 : 1, transition: 'opacity 0.5s'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.8 }}>⚡ Alpha Build</div>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: '600' }}>Chilly Anime © 2026</p>
        <div><a href="https://t.me/chilly_anime" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>Telegram</a></div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}