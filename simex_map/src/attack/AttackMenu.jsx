import styles from './AttackMenu.module.css';
const AttackMenu = ({step}) => {
    return (
        <div className={styles.wrapperDM}>
          <div className={`${styles.box} ${step === 1  ? styles.active : ''}`}>Target</div>
          <div className={`${styles.space}`}></div>
          <div className={`${styles.box} ${step === 2  ? styles.active : ''}`}>Level</div>
        </div>
      );
};

export default AttackMenu;