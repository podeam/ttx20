import {useSelector} from "react-redux";
import styles from './ElectricityPrice.module.css';

const ElectricityPrice = ({pmin, pmax, pavg}) => { 
  const countryName = useSelector((state) => state.country.countryName); 
  return (
  <div className={styles.wrapperEP}>
    <h3 className={styles.title}>Average electricity price</h3>
    <p className={styles.subtitle}>{ countryName }</p>
    <div className={styles.box}>
      <span className={styles.label1}>Max</span>&nbsp;&nbsp;
      <span className={styles.value}>{ pmax }</span>&nbsp;&nbsp;
      <span className={styles.label2}>€/MWh</span>
    </div>
    <div>
      <span className={styles.label1}>Min</span>&nbsp;&nbsp;
      <span className={styles.value}>{ pmin }</span>&nbsp;&nbsp;
      <span className={styles.label2}>€/MWh</span>
    </div>
    <div className={styles.box}>
      <span className={styles.value3}>{ pavg }&nbsp;</span>
      <span className={styles.label3}>€/MWh</span>
    </div>
  </div>
);
};

export default ElectricityPrice;