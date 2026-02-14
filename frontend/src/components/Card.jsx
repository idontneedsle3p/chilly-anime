import React, { memo } from 'react';

const styles = {
    card: {
        position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        aspectRatio: '2/3', background: 'rgba(30,30,40,0.6)',
        // Оптимизация: Уменьшили размытие и добавили border, чтобы не мылить на 4k
        border: '1px solid rgba(255,255,255,0.1)',
        transform: 'translateZ(0)', // Включает аппаратное ускорение
        willChange: 'transform',
    },
    poster: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    ratingBadge: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fbbf24',
        padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    overlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '15px'
    },
    title: { color: '#fff', fontSize: '1rem', fontWeight: '700', margin: '0 0 4px 0', lineHeight: '1.3', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
    year: { color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontWeight: '600', opacity: 0.9 }
};

// Memo предотвращает перерисовку всех карточек при вводе в поиск
export const Card = memo(({ item, onClick }) => (
    <div className="glass-card" style={styles.card} onClick={() => onClick(item)}>
        <img
            src={item.poster}
            style={styles.poster}
            alt=""
            loading="lazy"
            decoding="async" // Важно для плавного скролла
        />
        <div style={styles.ratingBadge}>{item.rating}</div>
        <div style={styles.overlay}>
            <p style={styles.title}>{item.title}</p>
            <p style={styles.year}>{item.year} • {item.status}</p>
        </div>
    </div>
));