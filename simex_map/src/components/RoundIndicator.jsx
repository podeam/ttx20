import styles from './Header.module.css';
const RoundIndicator = ({round1, round2}) => {  
    return (
    <div className={styles.gameRound}>
      <span className={styles.roundNumber}>{round1}</span>
      <span className={styles.roundSuffix}>st</span>{" "}
      <span className={styles.roundType}>{round2}</span>
    </div>
  );
};

export default RoundIndicator;

