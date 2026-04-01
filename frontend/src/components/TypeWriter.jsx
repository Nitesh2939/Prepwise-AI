import { useState, useEffect, useRef } from "react";

export default function TypeWriter({ text, speed = 25, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    idx.current = 0;
    if (!text) return;

    const iv = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(iv);
        onDone && onDone();
      }
    }, speed);

    return () => clearInterval(iv);
  }, [text]);

  return <span>{displayed}<span className="cursor">|</span></span>;
}