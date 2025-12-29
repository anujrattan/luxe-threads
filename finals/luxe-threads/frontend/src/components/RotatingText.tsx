import React, { useState, useEffect, useRef } from 'react';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export const RotatingText: React.FC<RotatingTextProps> = ({ 
  words, 
  interval = 3000,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start the rotation with smooth animation
    intervalRef.current = setInterval(() => {
      // Fade out current word smoothly
      setIsAnimating(true);
      
      // After fade out completes (600ms), change word
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        // Immediately start fade in for new word
        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      }, 600);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [words.length, interval]);

  // Calculate max width based on longest word to prevent layout shift
  const longestWord = words.reduce((a, b) => a.length > b.length ? a : b);
  const maxWidth = longestWord.length * 0.7; // Approximate width in em

  return (
    <span 
      className="inline-block relative" 
      style={{ 
        minWidth: `${maxWidth}em`,
        textAlign: 'left'
      }}
    >
      <span 
        key={`${currentIndex}-${isAnimating}`}
        className={`inline-block ${className} transition-all duration-600 ease-in-out ${
          isAnimating 
            ? 'opacity-0 transform translate-y-3 scale-98' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
};
