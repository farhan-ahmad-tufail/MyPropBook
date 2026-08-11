import React, { useState, useEffect } from 'react';

export default function AnimatedCounter({ value, duration = 800, prefix = '', suffix = '', formatter }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out expo easing function
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (numericValue - startValue) * easeProgress;
      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const display = formatter
    ? formatter(count)
    : `${prefix}${Math.round(count).toLocaleString('en-IN')}${suffix}`;

  return <span>{display}</span>;
}
