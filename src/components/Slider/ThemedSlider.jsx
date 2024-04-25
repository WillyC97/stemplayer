import React, { useState, useEffect, useRef } from "react";
import styles from "./slider.module.css";

function ThemedSlider({ min, max, defaultValue, step, onChange }) {
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef();

  useEffect(() => {
    const percent = (value - min) / (max - min);
    sliderRef.current.style.setProperty(
      "--webkit-fill-percent",
      `${percent * 100}%`
    );
  }, [value, min, max]);

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event);
  };

  return (
    <div className={styles.sliderContainer}>
      <input
        ref={sliderRef}
        className={styles.slider}
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
