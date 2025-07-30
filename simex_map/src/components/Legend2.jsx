import styles from './Legend2.module.css';

const Legend2 = () => {
  return (
    <div className={styles.legend2}>
        <div className={styles.boxg}><div>NODE ENERGY BALANCE:</div></div>
        <div className={styles.boxg}><div className={styles.boxg2}></div><div>Normal</div></div>
        <div className={styles.boxr}><div className={styles.boxr2}></div><div>Lost Load</div></div>
    </div>
  );
};

export default Legend2;
