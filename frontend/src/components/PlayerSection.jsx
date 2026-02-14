import React, { useState, useEffect } from 'react';

const styles = {
    // Оптимизация: Убрали backdrop-filter: blur(20px), заменили на более плотный цвет.
    // На 4K мониторах blur на большом блоке - это убийца FPS.
    container: {
        marginBottom: '60px', borderRadius: '24px', overflow: 'hidden',
        background: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7)',
        transform: 'translateZ(0)'
    },
    headerPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(255,255,255,0.03)' },
    tabsContainer: { display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '12px' },
    tabBtn: { padding: '8px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontSize: '0.9rem' },
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    noPlayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030712', color: '#64748b' },
    details: { padding: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 20px 0', color: '#fff', letterSpacing: '-1px' },
    meta: { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap' },
    rating: { color: '#000', background: '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '1rem' },
    tag: { padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600' },
    description: { color: '#94a3b8', lineHeight: '1.7', fontSize: '1.1rem', maxWidth: '900px' }
};

export const PlayerSection = ({ item }) => {
    const [activePlayer, setActivePlayer] = useState(null);

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
            <div style={styles.headerPanel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ color: '#fff', fontWeight: '700', letterSpacing: '0.5px', fontSize: '0.9rem' }}>SERVER ONLINE</span>
                </div>

                {(item.vibixUrl || item.kodikUrl) && (
                    <div style={styles.tabsContainer}>
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

            <div style={styles.videoBox}>
                {currentUrl ? (
                    <iframe src={currentUrl} style={styles.iframe} allowFullScreen title="player" />
                ) : (
                    <div style={styles.noPlayer}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📡</div>
                        <p style={{ fontSize: '1.2rem', color: '#fff' }}>Нет сигнала</p>
                    </div>
                )}
            </div>

            <div style={styles.details}>
                <h2 style={styles.title}>{item.title}</h2>
                <div style={styles.meta}>
                    <span style={styles.rating}>{item.rating}</span>
                    <span style={styles.tag}>{item.year}</span>
                    <span style={styles.tag}>{item.status}</span>
                </div>
                <p style={styles.description}>{item.description}</p>
            </div>
        </div>
    );
};