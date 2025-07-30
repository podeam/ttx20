import styles from './LostLoad.module.css';
import {useSelector} from "react-redux";

const LostLoad = ({sumTot, sumPerc}) => {
    const countryName = useSelector((state) => state.country.countryName);
    return (
    <div className={ styles.wrapperLL }>
      <h3 className={styles.title}>Lost load total</h3>
      <p className={styles.subtitle}>{ countryName }</p>
      <div className={styles.box}>
        <span className={styles.value3}>{ sumPerc }</span>
        <span className={styles.label2}>%</span>&nbsp;
        <span className={styles.label3}>of total load</span>
      </div>
      <div className={styles.boxlast}>
        <span className={styles.value}>{ sumTot }</span>&nbsp;&nbsp;
        <span className={styles.value}>GWh</span>
      </div>
    </div>
  );
};

export default LostLoad;
