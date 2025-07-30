import { useSelector } from 'react-redux';
import styles from './Credits.module.css';
const Credits = () => {  
  const creditsAttackInit = useSelector((state) => state.credits.creditsAttackInit);
  const creditsAttackRemaining = useSelector((state) => state.credits.creditsAttackRemaining);
  const creditsAttackSpent = useSelector((state) => state.credits.creditsAttackSpent);
    return (
        <section className={styles.creditssection}>
          <h2 className={styles.creditsheading}>Credits</h2>
          <div className={styles.creditsdisplay}>
            <div className={styles.creditscurrent}>
              <p className={styles.creditslabel}>Current</p>
              <p className={styles.creditsvalue}>{creditsAttackInit}</p>
            </div>
            <div className={styles.creditsneeded}>
              <p className={styles.creditslabel}>Needed by this plan</p>
              <p className={styles.creditsvalue}>{creditsAttackSpent || 0}</p>
            </div>
            <div className={styles.creditsafter}>
              <p className={styles.creditslabel}>After attack</p>
              <p className={styles.creditsvalue}>{creditsAttackRemaining || 0}</p>
            </div>
          </div>
        </section>
  );
};

export default Credits;
