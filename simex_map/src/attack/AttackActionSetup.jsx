import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addAction, removeAction, showHideHistory } from '../store/attackSlice';
import AttackMenu from "./AttackMenu";
import AttackActionList from "./AttackActionList";
import AttackSlider from "./AttackSlider";
import ListAttacks from "./ListAttacks";
import styles from './AttackActionSetup.module.css';


const AttackActionSetup = ({ sendValueUp }) => { 
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [disable, setDisable] = useState(true);
  const [disable2, setDisable2] = useState(false);
  const [buttonText, setButtonText] = useState('Select for attack');
  const lastAction = useSelector((state) => {
    const obj = state.attack;
    return obj ? obj : null;
  });
  const selectedAttackActions = useSelector((state) => state.attack.selectedAttackActions);

  const handleSetStepValue = (v) => {
    setStep(v);
    //console.log('Received from child: ', v);
  };
  const handleClick = () => {
    if(lastAction != null){
      setStep(step + 1); //passa allo slider
      setButtonText('Save');
      sendValueUp(100);
    }
    if(step == 2){
      const newAction = {
        currentElementNode: lastAction.currentElementNode,
        currentElementCarrier: lastAction.currentElementCarrier,
        currentElementType: lastAction.currentElementType,
        currentElementType2: lastAction.currentElementType2,
        currentElementPerc: lastAction.currentElementPerc,
      };
      dispatch(addAction(newAction));
      dispatch(removeAction());
      setButtonText('Add new action');
    }
    if(step === 3){
      setButtonText('Select for attack');
      sendValueUp(2);
      setDisable(true);
      setStep(1);
    }
  };
  const cancelClick = () => {
    //console.log(0);
    dispatch(removeAction());
    setStep(1);
  };
  const showHistory = () => {
    dispatch(showHideHistory());
  };
  useEffect(() => {
    if(lastAction.currentElementNode != ''){
      setDisable(false);
    }
  },[lastAction]);
  useEffect(() => {
    if(selectedAttackActions && selectedAttackActions.length == 1){
      setDisable2(true);
    }
    else{
      setDisable2(false);
    }
  },[selectedAttackActions]);
  useEffect(() => {
    //console.log(step);
    if(step == 1){
      setDisable(true);
      setButtonText('Select for attack');
    }
  },[step]);
  return (
    <div className={styles.attackplansetup}>
      <div className={styles.attackplantitle}>Attack plan setup</div>
      { step < 3 && <AttackMenu step={step} />}
      { step === 1 && <AttackActionList sendValueUp={handleSetStepValue} /> }
      { step === 2 && <AttackSlider /> }
      { step === 3 && <ListAttacks /> }
      { step <= 2 && <div className={styles.wrapperButton}>
          <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
          <button className={styles.buttonAdd} onClick={handleClick} disabled={disable}>{buttonText}</button>
        </div> }
      { step === 3 && <div className={styles.planactions}>
          <button className={styles.historybutton} onClick={showHistory}>Show history</button>
          <button className={styles.addactionbutton} onClick={handleClick} disabled={disable2}>Add new action</button>
        </div> }
    </div>
  );
};

export default AttackActionSetup;

