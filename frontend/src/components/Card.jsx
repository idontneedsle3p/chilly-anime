import React, { useState } from 'react';

// Иконка звезды для рейтинга
const StarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FBBF24' }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 7.3L18.18 22 12 18.27 5.82 22l1.18-5.43-5-7.3 6.91-1.01L12 2z" />
    </svg>
);

export const Card = ({ item, onClick, lowGraphics }) => {
    const [isHovered, setIsHovered] = useState(false);

    const styles = {
        // Главный контейнер карточки (теперь это колонка: картинка сверху, текст снизу)
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px', // Отступ между постером и текстом
            cursor: 'pointer',
        },
        // Контейнер только для картинки
        imageBox: {
            position: 'relative',
            width: '100%',
            aspectRatio: '2 / 3',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#1e1e28', // Фон на время загрузки
            boxShadow: (isHovered && !lowGraphics) ? '0 10px 20px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.3s ease',
        },
        poster: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: (isHovered && !lowGraphics) ? 'scale(1.05)' : 'scale(1)',
        },
        ratingBadge: {
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 2,
        },
        // Контейнер для текста под картинкой
        infoBox: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '0 4px', // Небольшой отступ по бокам, чтобы текст не прилипал к краям
        },
        title: {
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: '700',
            color: '#f8fafc',
            lineHeight: '1.3',
            // Обрезаем текст троеточием, если он длиннее 2 строк
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        meta: {
            margin: 0,
            fontSize: '0.8rem',
            color: '#94a3b8',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        dot: {
            width: '4px',
            height: '4px',
            backgroundColor: '#64748b',
            borderRadius: '50%',
        }
    };

    // Форматируем год, чтобы отрезать "-01-01", если вдруг придет полная дата
    const year = item.year ? String(item.year).split('-')[0] : '—';
    const status = item.status || 'Неизвестно';

    return (
        <div
            style={styles.wrapper}
            onClick={() => onClick(item)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* БЛОК 1: ПОСТЕР */}
            <div style={styles.imageBox}>
                <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    style={styles.poster}
                />
                {/* Рейтинг поверх постера */}
                {item.rating && item.rating !== '0.0' && (
                    <div style={styles.ratingBadge}>
                        <StarIcon />
                        {item.rating}
                    </div>
                )}
            </div>

            {/* БЛОК 2: ТЕКСТ ПОД ПОСТЕРОМ */}
            <div style={styles.infoBox}>
                <h3 style={styles.title} title={item.title}>
                    {item.title}
                </h3>
                <div style={styles.meta}>
                    <span>{year}</span>
                    <span style={styles.dot}></span>
                    <span style={{ color: status === 'Онгоинг' ? '#3B82F6' : '#94a3b8' }}>
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
};