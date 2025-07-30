import styles from './Header.module.css';


const GameTitle = () => {  
    return (
    <div className={styles.nameBlock}>
      <h1 className={styles.gameName}>SIMEX-BALTICS</h1>
      <p className={styles.gamePayoff}>
        An EC JRC game to enhance power grid resilience
      </p>
    </div>
  );
};

export default GameTitle;

