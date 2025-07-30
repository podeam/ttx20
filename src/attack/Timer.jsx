import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css';
import TimerAlert from './TimerAlert';

const Timer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20 * 60);
    useEffect(() => {
      if (timeLeft <= 0) return;
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 10);
        if(timeLeft == 1){
          setIsModalOpen(true);
        }
      }, 10000);
      return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return { m, s };
      };

    const { m, s } = formatTime(timeLeft);

    return (
      <article className={styles.timerwidget}>
        <h2 className={styles.widgettitle}>Timer</h2>
        <div className={styles.timerdisplay}>
          <p className={styles.timerlabel}>Remaining time</p>
          <p className={styles.timervalue}>
            <span>{m}</span>
            <span className={styles.timeunit}>m</span>&nbsp;
            <span>{s}</span>
            <span className={styles.timeunit}>s</span>
          </p>
        </div>
        <TimerAlert isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </article>
  );
};

export default Timer;
