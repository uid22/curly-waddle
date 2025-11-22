import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 50, enabled: boolean = true) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, enabled]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return displayText;
};
