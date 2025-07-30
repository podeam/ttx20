import styles from './Legend.module.css';

const Legend = () => {
  return (
        <div className={styles.legend}>
            <div>LINE FLOW:</div>
            <div className={styles.box} id={styles.box3}></div>
            <div>Normal</div>
            <div className={styles.box} id={styles.box2}></div>
            <div>High</div>
            <div className={styles.box} id={styles.box1}></div>
            <div>Critical</div>
        </div>
  );
};

export default Legend;
