import styles from './DefenceMenu.module.css';

const DefenceMenu = ({step}) => { 
  return (
  <div className={styles.wrapperDM}>
    <div className={`${styles.box} ${step === 1  ? styles.active : ''}`}>Type</div>
    <div className={`${styles.space}`}></div>
    <div className={`${styles.box} ${step === 2  ? styles.active : ''}`}>Site</div>
    <div className={`${styles.space}`}></div>
    <div className={`${styles.box} ${step === 3  ? styles.active : ''}`}>Level</div>
  </div>
);
};

export default DefenceMenu;
