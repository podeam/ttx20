import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setStep2 } from '../store/defenceStepSlice';
import { setActionNumber } from '../store/defenceStepSlice';
import { setAction, removeAction, showHideHistory } from '../store/actionSlice';
import styles from './DefenceActionList.module.css';

const DefenceActionList = ({ sendValueUp }) => {
    const [actionsDisplay, setActions] = useState([]);
    const dispatch = useDispatch();
    const handleClick = () => {
        dispatch(setAction(0));
        dispatch(setActionNumber());
        dispatch(setStep2(2));
        sendValueUp(2);
        };
    const actions = useSelector((state) => {
    const arr = state.action.selectedActions;
    //console.log(arr);
    return arr;
});
const removeStoreAction = (index) => {
    //console.log(index);
    dispatch(removeAction(index));
}
  const showHistory = () => {
    dispatch(showHideHistory());
  }

useEffect(() => {
    if (!actions) return;
    fetch("/js/action.json")
        .then((res) => res.json())
        .then((items) => {
            const flattenedData = items.flatMap(group => group.data);
            const merged = actions.map(sa => {
            const match = flattenedData.find(fd => fd.id === sa.actionId);
                return match ? { ...match, ...sa } : sa;
                });
            //console.log(merged);
            setActions(merged);
        });
    }, [actions]);
    return (
        <div className={styles.wrapperNDP}>
            <div className={styles.title}>Plan setup</div>
            {actionsDisplay.map((item, index) => (
                <div className={styles.wrapperAction} key={index}>
                    <p className={styles.text1}>{ item.title }</p>
                    <p className={styles.text2}>&#64; { item.name }</p>
                    <p className={styles.text3}>{ item.credit } credits</p>
                    <img src="/images/actionDelete.svg" alt="Delete" onClick={() => removeStoreAction(index)} />
                </div>
            ))}
            <div className={styles.wrapperButton}>
                <button className={styles.buttonCancel} onClick={showHistory}>Show History</button>
                <button className={styles.buttonSave} onClick={handleClick}>Add new action</button>
            </div>
        </div>
    );
    };

export default DefenceActionList;