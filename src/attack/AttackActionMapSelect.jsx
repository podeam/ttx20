import { useDispatch, useSelector } from 'react-redux';
import { removeAction } from '../store/actionSlice';
import styles from './ActionMapSelect.module.css';

const ActionMapSelect = ({lastAction}) => {

    return (
    <div className={styles.wrapperAMS}>
        <h3 className={styles.title}>Attack action setup</h3>
        
    </div>
  );
};

export default ActionMapSelect;