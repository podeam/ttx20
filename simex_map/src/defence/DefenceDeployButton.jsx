import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from "react";
import { showHideConfirm } from '../store/actionSlice';
import styles from './DefenceDeployButton.module.css';

const DefenceDeployButton = () => { 
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState(true);
  const [actionsToSend, setActions] = useState([]);
  const actions = useSelector((state) => {
    const arr = state.action.selectedActions;
    return arr;
  });


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
            setActions(merged);
        });
        if(actions.length > 0){setDisabled(false);}
    }, [actions]);

    const sendDefence = () => {
        //console.log(actionsToSend);
        dispatch(showHideConfirm());
      };

    return (
    <div className={styles.wbutton}>
      <button className={styles.button} onClick={sendDefence} disabled={disabled}>Deploy plan</button>
    </div>
  );
};

export default DefenceDeployButton;