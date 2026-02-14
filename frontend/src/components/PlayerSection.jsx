import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const styles = {
    container: {
        marginBottom: '60px', borderRadius: '24px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.5s ease',
    },
    containerCinema: {
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh', // На мобилках лучше на весь экран
        zIndex: 10001, margin: 0,
        background: '#000', border: 'none',
        borderRadius: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    headerPanel: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 15px', background: 'rgba(255,255,255,0.03)',
        flexWrap: 'wrap', gap: '10px'
    },
    tabsContainer: { display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' },
    tabBtn: { padding: '6px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontSize: '0.85rem', color: '#fff' },
    actionsGroup: { display: 'flex', gap: '10px' },
    iconBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
        width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '1.1rem'
    },
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    details: { padding: '30px' },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
        fontWeight: '800', margin: '0 0 15px 0', color: '#fff'
    },
    meta: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
    rating: { color: '#000', background: '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.9rem' },
    tag: { padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.9rem' },
    description: { color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem', maxWidth: '900px' }
};

export const PlayerSection = ({ cinemaMode, setCinemaMode, lowGraphics, toggleGraphics, resetSearch }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [item, setItem] = useState(location.state?.item || null);
    const [activePlayer, setActivePlayer] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isFav, setIsFav] = useState(false);

    // Сброс кинорежима и скролл вверх при смене ID
    useEffect(() => {
        window.scrollTo(0, 0);
        setCinemaMode(false);
    }, [id, setCinemaMode]);

    useEffect(() => {
        if (!item) {
            fetch(`${apiUrl}/anime/${id}`)
                .then(res => res.json())
                .then(data => setItem(data))
                .catch(() => navigate('/'));
        }
    }, [id, item, navigate]);

    useEffect(() => {
        if (item) {
            // Принудительное обновление заголовка вкладки
            document.title = `${item.title} | Chilly Anime`;
            setActivePlayer(item.vibixUrl ? 'vibix' : 'kodik');

            const favs = JSON.parse(localStorage.getItem("anime_favorites") || "[]");
            const itemId = item.shikimoriId || item.id;
            setIsFav(!!favs.find(f => (f.shikimoriId || f.id) === itemId));
        }
    }, [item]);

    // Логика кнопки Назад
    const handleBack = () => {
        if (cinemaMode) {
            setCinemaMode(false);
        } else {
            navigate(-1); // Возвращает к сохраненному поиску
        }
    };

    // Логика логотипа (Сброс на главную)
    const handleLogoClick = () => {
        setCinemaMode(false);
        if (resetSearch) resetSearch(); // Функция из App.jsx
        navigate('/');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`https://gochilly.fun/watch/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleFav = () => {
        const favs = JSON.parse(localStorage.getItem("anime_favorites") || "[]");
        const itemId = item.shikimoriId || item.id;
        let updated = isFav ? favs.filter(f => (f.shikimoriId || f.id) !== itemId) : [...favs, item];
        localStorage.setItem("anime_favorites", JSON.stringify(updated));
        setIsFav(!isFav);
    };

    if (!item) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Загрузка...</div>;

    const currentContainerStyle = cinemaMode ? styles.containerCinema : {
        ...styles.container,
        backdropFilter: lowGraphics ? 'none' : 'blur(20px)',
        background: lowGraphics ? 'rgba(15, 15, 25, 0.98)' : 'rgba(20, 20, 30, 0.6)'
    };

    return (
        <>
            <Helmet><title>{item.title} | Chilly Anime</title></Helmet>

            <div style={cinemaMode ? {} : { maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
                {/* Навигационная панель */}
                <div style={{
                    padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: cinemaMode ? 'fixed' : 'relative',
                    top: cinemaMode ? '20px' : '0',
                    left: cinemaMode ? '50%' : '0',
                    transform: cinemaMode ? 'translateX(-50%)' : 'none',
                    width: cinemaMode ? '95vw' : '100%',
                    zIndex: 10005,
                    transition: 'all 0.3s ease'
                }}>
                    <div
                        onClick={handleLogoClick}
                        style={{
                            fontSize: '1.4rem', fontWeight: '800', color: '#fff', cursor: 'pointer',
                            display: cinemaMode ? 'none' : 'block'
                        }}
                    >
                        CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: cinemaMode ? 'auto' : '0' }}>
                        {!cinemaMode && (
                            <button onClick={toggleGraphics} style={{ background: lowGraphics ? '#F43F5E' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}>⚡ {lowGraphics ? 'BOOST' : 'ECO'}</button>
                        )}
                        <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '6px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(10px)' }}>Назад</button>
                    </div>
                </div>

                <div style={currentContainerStyle}>
                    <div style={{ ...styles.headerPanel, display: cinemaMode ? 'none' : 'flex' }}>
                        <div style={styles.tabsContainer}>
                            {item.vibixUrl && (
                                <button
                                    onClick={() => setActivePlayer('vibix')}
                                    style={{ ...styles.tabBtn, background: activePlayer === 'vibix' ? '#F43F5E' : 'transparent' }}
                                >
                                    Vibix
                                </button>
                            )}
                            {item.kodikUrl && (
                                <button
                                    onClick={() => setActivePlayer('kodik')}
                                    style={{ ...styles.tabBtn, background: activePlayer === 'kodik' ? '#3B82F6' : 'transparent' }}
                                >
                                    Kodik
                                </button>
                            )}
                        </div>
                        <div style={styles.actionsGroup}>
                            <button onClick={handleShare} style={styles.iconBtn}>{copied ? '✓' : '🔗'}</button>
                            <button onClick={toggleFav} style={{ ...styles.iconBtn, color: isFav ? '#F43F5E' : '#fff' }}>{isFav ? '❤️' : '🤍'}</button>
                            <button onClick={() => setCinemaMode(!cinemaMode)} style={{ ...styles.iconBtn, background: cinemaMode ? '#F43F5E' : 'rgba(255,255,255,0.05)' }}>💡</button>
                        </div>
                    </div>

                    <div style={cinemaMode ? { ...styles.videoBox, height: '100%', aspectRatio: 'auto' } : styles.videoBox}>
                        <iframe
                            src={activePlayer === 'vibix' ? item.vibixUrl : item.kodikUrl}
                            style={styles.iframe}
                            allowFullScreen
                            title="player"
                        />
                    </div>

                    {!cinemaMode && (
                        <div style={styles.details}>
                            <h2 style={styles.title}>{item.title}</h2>
                            <div style={styles.meta}>
                                <span style={styles.rating}>{item.rating}</span>
                                <span style={styles.tag}>{item.year}</span>
                                <span style={styles.tag}>{item.status}</span>
                            </div>
                            <p style={styles.description}>{item.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};