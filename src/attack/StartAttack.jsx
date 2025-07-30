import { useDispatch } from 'react-redux';
import { showHideHistory } from '../store/attackSlice';
import styles from './StartAttack.module.css';

const StartAttack = ({ sendValueUp }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    sendValueUp(2);
  };
  const showHistory = () => {
    dispatch(showHideHistory());
  }
    return (
      <div className={styles.attackplan}>
        <div>
          <h2 className={styles.attackheading}>Start Attack</h2>
          <div className={styles.attackcontent}><img src="/images/defense_start.png" className={styles.img} /></div>
      </div>
      <div className={styles.planactions}>
        <button className={styles.historybutton} onClick={showHistory}>Show history</button>
        <button className={styles.addactionbutton} onClick={handleClick}>Add new action</button>
      </div>
        {/*
        <button className={styles.buttonHistory}>Show history</button>
        <button className={styles.buttonAdd} onClick={handleClick}>Add new action</button>
        */}
    </div>
  );
};

export default StartAttack;

