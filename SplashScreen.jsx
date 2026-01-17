import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onDismiss }) => {
    const [visible, setVisible] = useState(true);
    const [closing, setClosing] = useState(false);

    const handleClick = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            onDismiss();
        }, 800); // Animation duration
    };

    if (!visible) return null;

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: '#0f172a',
                cursor: 'pointer',
                overflow: 'hidden',
                opacity: closing ? 0 : 1,
                transition: 'opacity 0.8s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <img
                src="/splash_bg.jpg"
                alt="Loading..."
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Ensures the image covers the screen
                    objectPosition: 'center'
                }}
            />
        </div>
    );
};

export default SplashScreen;
