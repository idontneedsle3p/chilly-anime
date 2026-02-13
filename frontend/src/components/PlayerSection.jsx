import React, { useState, useEffect } from 'react';

const styles = {
    container: { marginBottom: '60px', borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' },
    headerPanel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(0,0,0,0.3)' },
    tabsContainer: { display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '14px' },
    tabBtn: { padding: '8px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', border: 'none', transition: 'all 0.3s', fontSize: '0.9rem' },
    videoBox: { position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
    noPlayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030712', color: '#64748b' },
    details: { padding: '40px', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' },
    title: { fontSize: '2.5rem', fontWeight: '800', margin: '0 0 20px 0', color: '#fff', letterSpacing: '-1px' },
    meta: { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap' },
    rating: { color: '#111827', background: '#fbbf24', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '1rem' },
    tag: { padding: '6px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' },
    description: { color: '#94a3b8', lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '900px' }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ color: '#fff', fontWeight: '800', letterSpacing: '1px' }}>ONLINE PLAYER</span>
                </div>

                {(item.vibixUrl || item.kodikUrl) && (
                    <div style={styles.tabsContainer}>
                        {item.vibixUrl && (
                            <button onClick={() => setActivePlayer('vibix')} style={{ ...styles.tabBtn, background: activePlayer === 'vibix' ? '#F43F5E' : 'transparent', color: activePlayer === 'vibix' ? '#fff' : '#94a3b8', boxShadow: activePlayer === 'vibix' ? '0 4px 15px rgba(244,63,94,0.4)' : 'none' }}>
                                Vibix HD
                            </button>
                        )}
                        {item.kodikUrl && (
                            <button onClick={() => setActivePlayer('kodik')} style={{ ...styles.tabBtn, background: activePlayer === 'kodik' ? '#3B82F6' : 'transparent', color: activePlayer === 'kodik' ? '#fff' : '#94a3b8', boxShadow: activePlayer === 'kodik' ? '0 4px 15px rgba(59,130,246,0.4)' : 'none' }}>
                                Kodik Reserve
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
                        <p style={{ fontSize: '1.2rem', color: '#fff' }}>Сигнал потерян</p>
                        <p>Видео недоступно в обеих базах данных.</p>
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