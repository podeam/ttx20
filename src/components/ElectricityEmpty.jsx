import styles from './ElectricityEmpty.module.css';

const ElectricityEmpty = () => { 
  return (
  <div className={styles.wrapperEE}>
    <h3 className={styles.title}>Electricity price fluctuations</h3>
    <div className={styles.parent}><p className={styles.subtitle}>Filter affected country in order to display electricity price data</p></div>
  </div>
);
};

export default ElectricityEmpty;