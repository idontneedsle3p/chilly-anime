import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const styles = {
    // Стиль плеера в ОБЫЧНОМ режиме
    container: {
        marginBottom: '60px', borderRadius: '24px', overflow: 'hidden',
        background: 'rgba(20, 20, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.5s ease',
    },
    // Стиль плеера в КИНОРЕЖИМЕ (фиксированный, на весь экран)
    containerCinema: {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw', height: '90vh', zIndex: 10001, margin: 0,
        background: '#000', border: '1px solid #333',
        boxShadow: '0 0 100px rgba(0,0,0,1)',
        borderRadius: '24px', overflow: 'hidden',
        transition: 'all 0.5s ease'
    },
    headerPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(255,255,255,0.03)' },
    tabsContainer: { display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' },
    tabBtn: { padding: '8px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontSize: '0.9rem' },
    actionsGroup: { display: 'flex', gap: '10px' },
    iconBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
        width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s'
    },
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    noPlayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#64748b' },
    details: { padding: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 20px 0', color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.1)' },
    meta: { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap' },
    rating: { color: '#000', background: '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '1rem' },
    tag: { padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600' },
    description: { color: '#cbd5e1', lineHeight: '1.7', fontSize: '1.1rem', maxWidth: '900px' }
};

export const PlayerSection = ({ cinemaMode, setCinemaMode }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [item, setItem] = useState(location.state?.item || null);
    const [activePlayer, setActivePlayer] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isFav, setIsFav] = useState(false);

    // === ВОТ ЭТО ИСПРАВЛЕНИЕ ===
    // При загрузке страницы или смене ID скроллим в самый верх
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);
    // ===========================

    useEffect(() => {
        const loadAnime = async () => {
            if (!item) {
                try {
                    const res = await fetch(`${apiUrl}/anime/${id}`);
                    if (!res.ok) throw new Error("Not found");
                    const data = await res.json();
                    setItem(data);
                } catch (e) { navigate('/'); }
            }
        };
        loadAnime();
    }, [id, item, navigate]);

    useEffect(() => {
        if (item) {
            if (item.vibixUrl) setActivePlayer('vibix');
            else if (item.kodikUrl) setActivePlayer('kodik');

            const favs = JSON.parse(localStorage.getItem("anime_favorites") || "[]");
            const itemId = item.shikimoriId || item.id;
            setIsFav(!!favs.find(f => (f.shikimoriId || f.id) === itemId));

            const history = JSON.parse(localStorage.getItem("anime_history") || "[]");
            const filtered = history.filter(h => (h.shikimoriId || h.id) !== itemId);
            const updated = [item, ...filtered].slice(0, 15);
            localStorage.setItem("anime_history", JSON.stringify(updated));
        }
    }, [item]);

    const handleShare = () => {
        const text = `Смотрю "${item?.title}" на Chilly Anime! 🍿\nhttps://gochilly.fun/watch/${id}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleFav = () => {
        if (!item) return;
        const favs = JSON.parse(localStorage.getItem("anime_favorites") || "[]");
        const itemId = item.shikimoriId || item.id;
        let updated;
        if (isFav) updated = favs.filter(f => (f.shikimoriId || f.id) !== itemId);
        else updated = [item, ...favs];
        localStorage.setItem("anime_favorites", JSON.stringify(updated));
        setIsFav(!isFav);
    };

    if (!item) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Загрузка...</div>;

    const currentUrl = activePlayer === 'vibix' ? item.vibixUrl : item.kodikUrl;
    const currentContainerStyle = cinemaMode ? styles.containerCinema : styles.container;
    const videoStyle = cinemaMode ? { ...styles.videoBox, height: '100%', aspectRatio: 'auto' } : styles.videoBox;

    return (
        <>
            <Helmet>
                <title>{cinemaMode ? "Просмотр..." : `${item.title} - Chilly Anime`}</title>
                <meta name="description" content={`Смотреть ${item.title} онлайн.`} />
            </Helmet>

            <div
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: '#000', opacity: cinemaMode ? 0.95 : 0,
                    zIndex: 10000, pointerEvents: 'none', transition: 'opacity 0.5s'
                }}
            />

            <div style={cinemaMode ? {} : { maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

                <div style={{
                    padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    opacity: cinemaMode ? 0 : 1, pointerEvents: cinemaMode ? 'none' : 'auto', transition: 'opacity 0.3s'
                }}>
                    <div onClick={() => navigate('/')} style={{ fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', letterSpacing: '-1px' }}>
                        CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
                    </div>
                    <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
                        ✕ Назад
                    </button>
                </div>

                <div style={currentContainerStyle}>
                    <div style={{ ...styles.headerPanel, display: cinemaMode ? 'none' : 'flex' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.5px' }}>SERVER ONLINE</span>

                            {(item.vibixUrl || item.kodikUrl) && (
                                <div style={{ ...styles.tabsContainer, marginLeft: '15px' }}>
                                    {item.vibixUrl && (
                                        <button onClick={() => setActivePlayer('vibix')} style={{ ...styles.tabBtn, background: activePlayer === 'vibix' ? '#F43F5E' : 'transparent', color: activePlayer === 'vibix' ? '#fff' : '#94a3b8' }}>
                                            Vibix
                                        </button>
                                    )}
                                    {item.kodikUrl && (
                                        <button onClick={() => setActivePlayer('kodik')} style={{ ...styles.tabBtn, background: activePlayer === 'kodik' ? '#3B82F6' : 'transparent', color: activePlayer === 'kodik' ? '#fff' : '#94a3b8' }}>
                                            Kodik
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.actionsGroup}>
                            <button onClick={handleShare} title="Поделиться" style={{ ...styles.iconBtn, color: copied ? '#10b981' : '#fff' }}>
                                {copied ? '✓' : '🔗'}
                            </button>
                            <button onClick={toggleFav} title="Избранное" style={{ ...styles.iconBtn, color: isFav ? '#F43F5E' : '#fff', borderColor: isFav ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255,255,255,0.1)' }}>
                                {isFav ? '❤️' : '🤍'}
                            </button>
                            <button onClick={() => setCinemaMode(!cinemaMode)} title="Кинорежим" style={styles.iconBtn}>
                                💡
                            </button>
                        </div>
                    </div>

                    {cinemaMode && (
                        <button
                            onClick={() => setCinemaMode(false)}
                            style={{
                                position: 'absolute', top: '20px', right: '20px', zIndex: 1002,
                                background: 'rgba(0,0,0,0.5)', border: '1px solid #fff', color: '#fff',
                                padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            ВЫЙТИ ✕
                        </button>
                    )}

                    <div style={videoStyle}>
                        {currentUrl ? (
                            <iframe src={currentUrl} style={styles.iframe} allowFullScreen title="player" />
                        ) : (
                            <div style={styles.noPlayer}>
                                <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📡</div>
                                <p style={{ fontSize: '1.2rem', color: '#fff' }}>Нет сигнала</p>
                            </div>
                        )}
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