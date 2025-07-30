import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addAction, setActionTemp, setCurrentAction } from '../store/actionSlice';
import { setCreditsRemaining, setCreditsSpent } from '../store/creditsSlice';
import styles from './DefenceSlider.module.css';
import DefenceMenu from "./DefenceMenu";

const DefenceSlider = ({ sendValueUp }) => {
  const step = 3;
  const dispatch = useDispatch();
  const [value, setValue] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [inputStep, setInputStep] = useState(10);
  const [actionLocal, setActionLocal] = useState(null);
  const [label, setLabel] = useState('Protection level');
  const [disabled, setDisabled] = useState(true);
  const [symbol, setSimbol] = useState('%');

  const listActions = useSelector((state) => state.action.selectedActions);
  const selectedAction = useSelector((state) => state.action.selectedAction);
  const currentAction = useSelector((state) => state.action.currentAction);
  const typeNewGen = useSelector((state) => state.action.typeNewGen);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  const handleClickButton = () => {
    const costIndex = Math.max(Math.floor(value / 10) - 1, 0);
    const cost = actionLocal?.credits?.[costIndex] ?? 0;

    const newLastAction = {
      actionId: currentAction?.actionId ?? null,
      type: currentAction?.type ?? "",
      name: currentAction?.name ?? "",
      carrier: currentAction?.carrier ?? "",
      credit: cost,
      percentage: value,
      value: currentAction?.value ?? 0,
    };

    //console.log("Adding Action:", newLastAction);

    dispatch(setActionTemp(null));
    dispatch(setCurrentAction({}));
    dispatch(addAction(newLastAction));
    sendValueUp(5);
  };

  const cancelClick = () => {
    setActionLocal(null);
    dispatch(setActionTemp(null));
    dispatch(setCurrentAction({}));
    sendValueUp(1);
  };

  useEffect(() => {
    if (!currentAction) return;

    switch (currentAction.actionId) {
      case 1:
        setLabel(`<strong>Add protection</strong><div>&#64; ${currentAction.carrier ?? ""} (${Math.round(currentAction.value)} MW)</div>`);
        setMin(0);
        setMax(50);
        setInputStep(5);
        setSimbol('%');
        break;
      case 2:
        setLabel(`<strong>Add standby/maintenance generator</strong><div>&#64; ${currentAction.name ?? ""} (${Math.round(currentAction.value)} MW)</div>`);
        setMin(0);
        setMax(100);
        setInputStep(100);
        setSimbol('%');
        break;
      case 3:
        setLabel(`<strong>Increase line capacity</strong><div>&#64; Line ${currentAction.name ?? ""} (${Math.round(currentAction.value)} MW)</div>`);
        setMin(0);
        setMax(100);
        setInputStep(100);
        setSimbol('%');
        break;
      case 4:
        let country = '';
        if(currentAction.name == 'EE'){ country = 'Estonia'; }
        if(currentAction.name == 'LT'){ country = 'Lithuania'; }
        if(currentAction.name == 'LV'){ country = 'Latvia'; }

        setLabel(`<strong>Limit users's demand</strong><div>&#64; ${country}</div>`);
        setMin(0);
        setMax(30);
        setInputStep(10);
        setSimbol('%');
        break;
      case 5:
        setLabel(`<strong>Build new ${typeNewGen} power plant</strong><div>&#64; ${currentAction.name ?? currentAction.carrier ?? ""} (${Math.round(currentAction.value)} MW)</div>`);
        setMin(0);
        setMax(100);
        setInputStep(100);
        setSimbol('%');
        break;
      case 6:
        setLabel(`<strong>Increase link capacity</strong><div>&#64; ${currentAction.name ?? ""} (${Math.round(currentAction.value)} MW)</div>`);
        setMin(1);
        setMax(2);
        setInputStep(0.5);
        setSimbol('%');
        break;
      default:
        setLabel('Protection level');
        setMin(0);
        setMax(100);
        setInputStep(10);
        setSimbol('X');
        break;
    }
    setValue(0);
  }, [currentAction, typeNewGen]);

  useEffect(() => {
    const totalCredits = listActions.reduce((sum, item) => sum + (item.credit ?? 0), 0);
    dispatch(setCreditsRemaining(totalCredits));
    dispatch(setCreditsSpent(totalCredits));
    setDisabled(value <= 0);
  }, [value, listActions, dispatch]);

  useEffect(() => {
    if (!selectedAction) return;

    fetch("/js/action.json")
      .then((res) => res.json())
      .then((actions) => {
        const selected = actions
          .flatMap(group => group.data)
          .find(item => item.id === selectedAction);
        setActionLocal(selected ?? null);
      })
      .catch((err) => console.error("Failed to load actions:", err));
  }, [selectedAction]);

  const costIndex = Math.max(Math.floor(value / 10) - 1, 0);
  const cost = value > 0 ? actionLocal?.credits?.[costIndex] : undefined;

  return (
    <div className={styles.wrapperDAS}>
      <div className={styles.title}>&nbsp;</div>
      <DefenceMenu step={step} />
      <div className={styles.wrapperDS}>
        <div className={styles.sliderTitle} dangerouslySetInnerHTML={{ __html: label }} />
        <p className={styles.percentage}>
            <label>{value}</label><label>{symbol}</label>
        </p>
        <input
          type="range"
          min={min}
          max={max}
          step={inputStep}
          value={value}
          onChange={handleChange}
        />
        <div className={styles.cost}>
          {cost !== undefined && <p>{cost} credits cost</p>}
        </div>
        {selectedAction == 1 && (
          <>
            <div className={styles.details}>Details</div>
            <div className={styles.optional}>
              {actionLocal && <span>{actionLocal.text}</span>}
            </div>
          </>
        )}
      </div>
      <div className={styles.wrapperButton}>
        <button className={styles.buttonCancel} onClick={cancelClick}>
          Cancel
        </button>
        <button
          className={styles.buttonAdd}
          onClick={handleClickButton}
          disabled={disabled}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default DefenceSlider;
