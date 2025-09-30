import { useState, useEffect } from 'react';
import './styles/Typewriter.css';

const Typewriter = ({ text, speed = 30, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      onDone?.();
    }
  }, [index, text, speed]);

  return <span>{displayed}<span className="blinking-cursor">|</span></span>;
};

export default Typewriter;