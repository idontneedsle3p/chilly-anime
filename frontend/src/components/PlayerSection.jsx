import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PUBLISHER_ID = import.meta.env.VITE_PUBLISHER_ID;

const styles = {
    container: {
        marginBottom: '60px', borderRadius: '24px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.5s ease', background: 'rgba(20, 20, 30, 0.6)', backdropFilter: 'blur(20px)'
    },
    containerCinema: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 10001, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    headerPanel: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    tabsContainer: { display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '5px', borderRadius: '14px' },
    tabBtn: { padding: '8px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', color: '#fff', transition: '0.3s' },
    iconBtn: {
        background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff',
        width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: '0.2s'
    },
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    details: { padding: '30px' },
    title: { fontSize: '2rem', fontWeight: '800', margin: '0 0 15px 0', color: '#fff' },
    tag: { padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', fontSize: '0.9rem', color: '#cbd5e1' },
    meta: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' },
    cinemaBackBtn: {
        position: 'absolute', top: '20px', right: '20px', zIndex: 10002,
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
        border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700'
    }
};

export const PlayerSection = ({ cinemaMode, setCinemaMode, lowGraphics, toggleGraphics }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [item, setItem] = useState(location.state?.item || null);
    const [activePlayer, setActivePlayer] = useState(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCinemaMode(false);
        setItem(null);
    }, [id, setCinemaMode]);

    useEffect(() => {
        if (!item) {
            fetch(`${apiUrl}/anime/${id}`).then(res => res.json()).then(data => setItem(data)).catch(() => navigate('/'));
        }
    }, [id, item, navigate]);

    useEffect(() => {
        if (item) {
            document.title = `${item.title} | Chilly Anime`;
            if (item.vibixSdkParams && PUBLISHER_ID) setActivePlayer('vibix');
            else setActivePlayer('kodik');

            const favs = JSON.parse(localStorage.getItem('chilly_favs') || '[]');
            setIsFav(favs.some(f => f.id === item.id));
        }
    }, [item]);

    useEffect(() => {
        if (activePlayer === 'vibix' && window.RendexSDK) {
            const timer = setTimeout(() => {
                try { window.RendexSDK.init(); } catch (e) { console.error(e); }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activePlayer, item]);

    const toggleFav = () => {
        let favs = JSON.parse(localStorage.getItem('chilly_favs') || '[]');
        if (isFav) favs = favs.filter(f => f.id !== item.id);
        else favs.push(item);
        localStorage.setItem('chilly_favs', JSON.stringify(favs));
        setIsFav(!isFav);
    };

    const share = () => {
        navigator.share ? navigator.share({ title: item.title, url: window.location.href }) : alert('Ссылка скопирована!');
    };

    if (!item) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Загрузка...</div>;

    return (
        <>
            <Helmet><title>{item.title} | Chilly Anime</title></Helmet>

            {cinemaMode && (
                <button style={styles.cinemaBackBtn} onClick={() => setCinemaMode(false)}>Выйти из режима кино ✕</button>
            )}

            <div style={cinemaMode ? {} : { maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

                <div style={{ padding: '15px 0', display: 'flex', justifyContent: 'space-between', opacity: cinemaMode ? 0 : 1 }}>
                    <div onClick={() => navigate('/')} style={{ fontWeight: '800', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span></div>
                    <button onClick={() => navigate(-1)} style={{ ...styles.tabBtn, background: 'rgba(255,255,255,0.1)' }}>Назад</button>
                </div>

                <div style={cinemaMode ? styles.containerCinema : styles.container}>
                    {!cinemaMode && (
                        <div style={styles.headerPanel}>
                            <div style={styles.tabsContainer}>
                                {item.vibixSdkParams && (
                                    <button
                                        onClick={() => setActivePlayer('vibix')}
                                        style={{ ...styles.tabBtn, background: activePlayer === 'vibix' ? '#F43F5E' : 'transparent', boxShadow: activePlayer === 'vibix' ? '0 4px 15px rgba(244, 63, 94, 0.3)' : 'none' }}
                                    >
                                        Vibix
                                    </button>
                                )}
                                <button
                                    onClick={() => setActivePlayer('kodik')}
                                    style={{ ...styles.tabBtn, background: activePlayer === 'kodik' ? '#3B82F6' : 'transparent', boxShadow: activePlayer === 'kodik' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none' }}
                                >
                                    Kodik
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={toggleFav} style={{ ...styles.iconBtn, color: isFav ? '#F43F5E' : '#fff' }} title="В избранное">{isFav ? '❤️' : '🤍'}</button>
                                <button onClick={share} style={styles.iconBtn} title="Поделиться">🔗</button>
                                <button onClick={() => setCinemaMode(true)} style={styles.iconBtn} title="Кинотеатр">💡</button>
                            </div>
                        </div>
                    )}

                    <div style={cinemaMode ? { ...styles.videoBox, height: '100%', aspectRatio: 'auto' } : styles.videoBox}>
                        {activePlayer === 'vibix' && item.vibixSdkParams && (
                            <div style={{ width: '100%', height: '100%' }}>
                                <ins className="rendex-sdk"
                                    data-publisher-id={PUBLISHER_ID}
                                    data-type={item.vibixSdkParams.type}
                                    data-id={item.vibixSdkParams.id}
                                    data-width="100%"
                                    data-height="100%"
                                ></ins>
                            </div>
                        )}
                        {activePlayer === 'kodik' && (
                            <iframe src={item.kodikUrl} style={styles.iframe} allowFullScreen title="kodik" />
                        )}
                    </div>

                    {!cinemaMode && (
                        <div style={styles.details}>
                            <h2 style={styles.title}>{item.title}</h2>
                            <div style={styles.meta}>
                                <span style={{ ...styles.tag, background: '#fbbf24', color: '#000', fontWeight: '800' }}>★ {item.rating}</span>
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