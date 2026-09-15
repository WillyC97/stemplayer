import React, { useState, useEffect, useRef } from "react";
import styles from "./slider.module.css";

function ThemedSlider({ min, max, defaultValue, step, onChange, label, bipolar }) {
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const percent = (value - min) / (max - min);
    if (bipolar) {
      const center = 50;
      const pos = percent * 100;
      const left = Math.min(center, pos);
      const right = Math.max(center, pos);
      sliderRef.current.style.setProperty("--bipolar-left", `${left}%`);
      sliderRef.current.style.setProperty("--bipolar-right", `${right}%`);
    }
    sliderRef.current.style.setProperty(
      "--webkit-fill-percent",
      `${percent * 100}%`
    );
  }, [value, min, max, bipolar]);

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event);
  };

  return (
    <div className={styles.sliderContainer} style={label ? { position: 'relative' } : undefined}>
      {label && (
        <span style={{
          position: 'absolute',
          top: '-14px',
          left: 0,
          right: 0,
          fontSize: '8px',
          color: '#aaaaaa',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          {label}
        </span>
      )}
      <input
        ref={sliderRef}
        className={`${styles.slider} ${bipolar ? styles.bipolar : ''}`}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
      />
    </div>
  );
}

export default ThemedSlider;
