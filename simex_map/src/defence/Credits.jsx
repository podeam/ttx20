import { useSelector } from 'react-redux';
import styles from './Credits.module.css';
const Credits = () => {  
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const creditsInit = useSelector((state) => state.credits.creditsInit);
  const creditsRemaining = useSelector((state) => state.credits.creditsRemaining);
  const creditsSpent = useSelector((state) => state.credits.creditsSpent);
    return (
    <section className={styles.creditssection}>
      <h2 className={styles.creditsheading}>Credits</h2>
      <div className={styles.creditsdisplay}>
        <div className={styles.creditscurrent}>
          <p className={styles.creditslabel}>Current</p>
          <p className={styles.creditsvalue}>{creditsInit}</p>
        </div>
        <div className={styles.creditsneeded}>
          <p className={styles.creditslabel}>Needed by this plan</p>
          <p className={styles.creditsvalue}>{creditsSpent || 0}</p>
        </div>
        <div className={styles.creditsafter}>
          <p className={styles.creditslabel}>After attack</p>
          <p className={styles.creditsvalue}>{creditsRemaining || 0}</p>
        </div>
      </div>
  </section>
  );
};

export default Credits;