import { useState, useEffect } from 'react';
import './ThemeToggle.css';

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className="theme-switch"
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
    >
      <span className={`theme-switch-option ${!dark ? 'active' : ''}`}>
        <i className="fas fa-sun" />
      </span>
      <span className={`theme-switch-option ${dark ? 'active' : ''}`}>
        <i className="fas fa-moon" />
      </span>
    </button>
  );
}

export default ThemeToggle;
