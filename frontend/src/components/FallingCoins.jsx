import React, { useEffect, useState } from 'react';

const FallingCoins = ({ count = 15 }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    // Generate initial coins
    const initialCoins = Array.from({ length: count }, createRandomCoin);
    setCoins(initialCoins);

    // Animation loop
    const interval = setInterval(() => {
      setCoins(prevCoins => {
        return prevCoins.map(coin => {
          // Move coin down
          let newY = coin.y + coin.speed;
          
          // If coin is out of view, reset it at the top with new random properties
          if (newY > window.innerHeight + 50) {
            return createRandomCoin();
          }
          
          // Otherwise, update its position
          return { ...coin, y: newY };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [count]);

  // Function to create a new coin with random properties
  const createRandomCoin = () => {
    const size = Math.random() * 20 + 10; // 10-30px
    return {
      id: Math.random().toString(36).substring(7),
      x: Math.random() * window.innerWidth,
      y: -100 - Math.random() * 500, // Start above the screen at various distances
      size,
      opacity: Math.random() * 0.5 + 0.1, // 0.1-0.6 opacity
      rotate: Math.random() * 360,
      speed: Math.random() * 1 + 0.5, // 0.5-1.5 speed
      blur: Math.random() * 3 + 1, // 1-4px blur
      type: Math.random() > 0.5 ? 'circle' : 'hexagon', // Different coin shapes
    };
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      {coins.map(coin => (
        <div
          key={coin.id}
          className="absolute"
          style={{
            left: `${coin.x}px`,
            top: `${coin.y}px`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            backgroundColor: coin.type === 'hexagon' ? 'transparent' : '#f1c40f',
            opacity: coin.opacity,
            borderRadius: coin.type === 'circle' ? '50%' : '0',
            transform: `rotate(${coin.rotate}deg)`,
            filter: `blur(${coin.blur}px)`,
            boxShadow: '0 0 10px rgba(241, 196, 15, 0.5)',
            border: coin.type === 'hexagon' ? '2px solid #f1c40f' : 'none',
            clipPath: coin.type === 'hexagon' 
              ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
              : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default FallingCoins;
