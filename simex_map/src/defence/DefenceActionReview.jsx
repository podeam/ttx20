import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import styles from './DefenceActionReview.module.css';


const DefenceActionReview = ({ sendValueUp }) => {
  const [action, setAction] = useState({title:'', text:''});
  const handleClick = () => {
    sendValueUp(4);
  };

  const lastSelectedAction = useSelector((state) => {
    const arr = state.action.selectedActions;
    return arr.length > 0 ? arr[arr.length - 1] : null;
  });

  //console.log(lastSelectedAction);

  useEffect(() => {
    if (!lastSelectedAction) return;

  fetch("/js/action.json")
    .then((res) => res.json())
    .then((actions) => {
        const selected = actions
        .flatMap(group => group.data)
        .find(item => item.id === lastSelectedAction.actionId);
        //console.log(selected);
        setAction(selected);
      });
  }, [lastSelectedAction]);

  return (
    <div className={styles.wrapperDAR}>
      <div className={styles.title}>Defence action review</div>
      <div className={styles.wrapperAction}>
        <p className={styles.text1}>{ action.title && action.title || '' }</p>
        <p className={styles.text2}>{ action.text && action.text || '' }</p>
        <p className={styles.text3}>{lastSelectedAction.credit && `${lastSelectedAction.credit} credits cost`}</p>
        <img src="/images/actionDelete.svg" alt="Delete" />
      </div>
      <div className={styles.wrapperButton}>
        <button className={styles.buttonCancel}>Cancel</button>
        <button className={styles.buttonSave} onClick={handleClick}>Save</button>
      </div>
    </div>
  );
};

export default DefenceActionReview;