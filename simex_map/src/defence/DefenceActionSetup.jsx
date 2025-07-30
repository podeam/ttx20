import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { setActionTemp } from '../store/actionSlice';
import styles from './DefenceActionSetup.module.css';
import DefenceMenu from "./DefenceMenu";

const DefenceActionSetup = ({ sendValueUp }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [action, setAction] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [actionsList, setActionsList] = useState([]);

  const handleClick = (id) => {
    setAction(id);
    dispatch(setActionTemp(id));
  };
  
  const handleClickButton = () => {
    sendValueUp(3);
  }

  const cancelClick = () => {
    setStep(1);
    setAction(null);
  };

  useEffect(() => {
    fetch("/js/action.json")
      .then((res) => res.json())
      .then((actions) => {
        setActionsList(actions);
      });
  }, []);
  
  useEffect(() => {
    if( action == null ){ setDisabled(true); }
    else{ setDisabled(false); }
  }, [action]);

  return (
    <div className={styles.wrapperDAS}>
      <div className={styles.title}>Defence action setup</div>
      <DefenceMenu step={step} />
    <div className={styles.wrapperAL}>
      {
        actionsList.map((actionGroup) => (
          <div key={actionGroup.typeId}>
            <div className={styles.actionType}>{actionGroup.type}</div>
            <ul>
              {actionGroup.data.map((myaction) => (
                <li
                  key={myaction.id}
                  className={`${styles.action} ${
                    action === myaction.id ? styles.active : ''
                  }`}
                  onClick={() => handleClick(myaction.id)}
                >
                  {myaction.title}
                </li>
              ))}
            </ul>
          </div>
        ))
      }
    </div>
      <div className={styles.wrapperButton}>
        <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
        <button className={styles.buttonAdd} onClick={handleClickButton} disabled={disabled}>Select</button>
      </div>
      {/*
      <div className={styles.title}>Defence action setup</div>
      {step < 4 && <DefenceMenu step={step} />}
      {step === 1 && <ActionList sendValueUp={handleSetStepValue} />}
      {step === 2 && <ActionMapSelect lastAction={lastSelectedAction} />}
      {step === 3 && <DefenceSlider />}
      <div className={styles.wrapperButton}>
        <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
        <button className={styles.buttonAdd} onClick={handleClick} disabled={disabled}>{btext}</button>
      </div>
      */}
    </div>
  );
};

export default DefenceActionSetup;
