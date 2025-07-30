import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAction } from '../store/attackSlice';
import { setCreditsRemaining, setCreditsSpent } from '../store/creditsSlice';
import styles from './AttackSlider.module.css';

const AttackSlider = () => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(30);
    const [action, setAction] = useState(null);
    const handleChange = (e) => {
        setValue(Number(e.target.value));
    };
    const lastAction = useSelector((state) => {
      const obj = state.attack;
      return obj ? obj : null;
    });
    useEffect(() => {
      if (!lastAction) return;
  
      fetch("/js/actionAttack.json")
        .then((res) => res.json())
        .then((actions) => {
          const selected = actions.find(item => item.id === 1);
          setAction(selected);
        });
    }, [lastAction, value]);

    useEffect(() => {
      const costIndex = (value / 10) - 1;
      const cost = action?.credits?.[costIndex];
      //console.log(cost);
      dispatch(updateAction(value));
      /*
      const totalCredits = listActions.reduce((sum, item) => sum + item.credit, 0);
      dispatch(setCreditsRemaining(totalCredits));
      */
    }, [value]);

  return (
    <div className={styles.wrapperAS}>
      <p><label>{value}</label>% destruction</p>
      <input
        type="range"
        min="0"
        max="100"
        step="10"
        value={value}
        onChange={handleChange}
      />
      <hr />
      { /* action && <p>{action.text}</p> */ }
      <hr />
      { /* cost !== undefined && <p>{cost} credits cost</p> */ }
    </div>
  );
};

export default AttackSlider;
