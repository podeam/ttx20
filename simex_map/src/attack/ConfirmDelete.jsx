import styles from './ListAttacks.module.css';
import { useDispatch } from 'react-redux';
import { deleteAction } from '../store/attackSlice';

const ConfirmDelete = ({mykey, sendValueUp}) => {
    console.log(mykey);
    const dispatch = useDispatch();
    const cancelClick = () => {
      sendValueUp(false);
    }
    const handleClick = () => {
      dispatch(deleteAction(mykey));
      sendValueUp(false);
    }

  return (
        <div className={styles.confirmDelete}>
            <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
            <button className={styles.buttonAdd} onClick={handleClick}>Confirm</button>
        </div>
  );
};

export default ConfirmDelete;

