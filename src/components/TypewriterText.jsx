import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

/**
 * TypewriterText Component
 * Displays text with a typewriter effect (character by character)
 * Similar to Grok UI behavior
 */
const TypewriterText = ({ text, speed = 30, onComplete, startDelay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }

    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Start delay
    const startTimeout = setTimeout(() => {
      const type = () => {
        if (indexRef.current < text.length) {
          setDisplayedText(text.slice(0, indexRef.current + 1));
          indexRef.current += 1;
          timeoutRef.current = setTimeout(type, speed);
        } else {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      };
      type();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete, startDelay]);

  return (
    <Box
      component="span"
      sx={{
        '&::after': isComplete
          ? {}
          : {
              content: '"▊"',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 50%': { opacity: 1 },
                '51%, 100%': { opacity: 0 },
              },
            },
      }}
    >
      {displayedText}
    </Box>
  );
};

export default TypewriterText;

