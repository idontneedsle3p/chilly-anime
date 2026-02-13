import React, { useState, useEffect } from 'react';

const styles = {
    container: { marginBottom: '50px', borderRadius: '24px', overflow: 'hidden', background: '#000', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    // Новые стили для вкладок
    tabsContainer: { display: 'flex', gap: '10px', padding: '15px 20px', background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tabBtn: { padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontSize: '0.9rem' },
    // Старые стили
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0a0a0a' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    noPlayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#161d2b', color: '#64748b', textAlign: 'center', padding: '20px' },
    details: { padding: '30px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' },
    title: { fontSize: '2rem', fontWeight: '800', marginBottom: '15px', color: '#fff', letterSpacing: '-0.5px' },
    meta: { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' },
    rating: { color: '#fbbf24', fontWeight: '700', fontSize: '1.1rem' },
    tag: { padding: '5px 15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.9rem' },
    description: { color: '#cbd5e1', lineHeight: '1.7', fontSize: '1.05rem', maxWidth: '800px' }
};

export const PlayerSection = ({ item }) => {
    const [activePlayer, setActivePlayer] = useState(null);

    // Автоматический выбор плеера при открытии нового аниме
    useEffect(() => {
        if (item) {
            if (item.vibixUrl) setActivePlayer('vibix');
            else if (item.kodikUrl) setActivePlayer('kodik');
            else setActivePlayer(null);
        }
    }, [item]);

    if (!item) return null;

    const currentUrl = activePlayer === 'vibix' ? item.vibixUrl : item.kodikUrl;

    return (
        <div style={styles.container}>
            {/* Отрисовываем вкладки только если есть хотя бы один плеер */}
            {(item.vibixUrl || item.kodikUrl) && (
                <div style={styles.tabsContainer}>
                    {item.vibixUrl && (
                        <button
                            onClick={() => setActivePlayer('vibix')}
                            style={{
                                ...styles.tabBtn,
                                background: activePlayer === 'vibix' ? '#F43F5E' : 'rgba(255,255,255,0.05)',
                                color: activePlayer === 'vibix' ? '#fff' : '#94a3b8'
                            }}
                        >
                            Vibix
                        </button>
                    )}
                    {item.kodikUrl && (
                        <button
                            onClick={() => setActivePlayer('kodik')}
                            style={{
                                ...styles.tabBtn,
                                background: activePlayer === 'kodik' ? '#3B82F6' : 'rgba(255,255,255,0.05)', // Синий цвет для Kodik
                                color: activePlayer === 'kodik' ? '#fff' : '#94a3b8'
                            }}
                        >
                            Kodik
                        </button>
                    )}
                </div>
            )}

            <div style={styles.videoBox}>
                {currentUrl ? (
                    <iframe src={currentUrl} style={styles.iframe} allowFullScreen title="player" />
                ) : (
                    <div style={styles.noPlayer}>
                        <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '10px' }}>Плеер не найден</p>
                        <p>К сожалению, для этого тайтла видео временно недоступно.</p>
                    </div>
                )}
            </div>

            <div style={styles.details}>
                <h2 style={styles.title}>{item.title}</h2>
                <div style={styles.meta}>
                    <span style={styles.rating}>★ {item.rating}</span>
                    <span style={styles.tag}>{item.year}</span>
                    <span style={styles.tag}>{item.status}</span>
                </div>
                <p style={styles.description}>{item.description}</p>
            </div>
        </div>
    );
};