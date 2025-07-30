import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setAction, setActionTemp, setTypeNewGen, removeAction } from '../store/actionSlice';
import styles from './ActionMapSelect.module.css';
import DefenceMenu from "./DefenceMenu";

const ActionMapSelect = ({ sendValueUp }) => {
  const dispatch = useDispatch();
  const selectedActionTemp = useSelector((state) => state.action.selectedActionTemp);
  const selectedAction = useSelector((state) => state.action.selectedAction);
  const selectedActions = useSelector((state) => state.action.selectedActions);
  const currentAction = useSelector((state) => state.action.currentAction);
  
  const [step, setStep] = useState(2);
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [title, setTitle] = useState('');

  const handleClick = (item) => {
    dispatch(setTypeNewGen(item));
    setSelected(item);
  }

  const handleClickButton = () => {
    //dispatch(setActionTemp(null));
    sendValueUp(4);
  }
  const cancelClick = () => {
    setAction(null);
    dispatch(setAction(null));
    dispatch(setActionTemp(null));
    dispatch(removeAction(selectedActions.length - 1));
    setStep(1);
    sendValueUp(1);
  };
  useEffect(() => {
    dispatch(setAction(selectedActionTemp));
    if(selectedActionTemp == 2){
      setList(['Generator', 'Link', 'Line']);
    }
    else{
      if(selectedActionTemp == 5){
        setList(['Nuclear', 'CCGT']);
      }
      else{
        setList([]);
      }
    }
  }, [selectedActionTemp]);
  useEffect(() => {
    if(Object.keys(currentAction).length !== 0) {
      setDisabled(false);
      handleClickButton();
    }
  }, [currentAction]);

  useEffect(() => {
    switch (selectedAction) {
      case 1:
        setTitle('Select site on map');
        break;
      case 2:
        setTitle('Select the type');
        break;
      case 3:
        setTitle('Select the line to increase its capacity');
        break;
      case 4:
        setTitle('Select country in which to limit users\' demand');
        break;
      case 5:
        setTitle('Select the type of power plant');
        break;
      case 6:
        setTitle('Select the link to increase its capacity');
        break;
      }
  }, [selectedAction]);
  
  return (
      <div className={styles.wrapperDAS}>
        <div className={styles.title}>Defence action setup</div>
          <DefenceMenu step={step} />
          <div className={styles.wrapperAMS}>
          <div className={styles.title}>{title}</div>
          <div className={styles.wrapperList}>
            <ul>
            {list.map((item, index) => (
              <li 
                key={index} 
                className={`${styles.action} ${item === selected ? styles.active : '' }`}
                onClick={() => handleClick(item)} >{item}</li>
            ))}
            </ul>
          </div>
        </div>
        <div className={styles.wrapperButton}>
          <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
          <button className={styles.buttonAdd} onClick={handleClickButton} disabled={disabled}>Select</button>
        </div>
    </div>
  );
};

export default ActionMapSelect;