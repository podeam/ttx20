import styles from './ListAttacks.module.css';
import { useState } from "react";
import { useSelector } from 'react-redux';
import ConfirmDelete from "./ConfirmDelete";

const ListAttacks = () => {
    const [displayComponent, setDisplayComponent] = useState(false);
    const [mykey, setMyKey] = useState(null);
    const listAttackActions = useSelector((state) => state.attack.selectedAttackActions);
    //console.log(listAttackActions);

    const handleCancel = (v) => {
      setDisplayComponent(v);
    };

    const deleteThisAction = (index) => {
      //console.log(index);
      setMyKey(index);
      setDisplayComponent(true);
    }

  return (
    <div className={styles.attackcontent}>
      { displayComponent && <ConfirmDelete mykey={mykey} sendValueUp={handleCancel} /> }
      <div className={styles.attackcontent2}>
        <ul className={styles.actionlist}>
        {listAttackActions.map((item, index) => (
            <li className={styles.actionitem} key={index}>
              <div className={styles.actiondetails}>
                <div className={styles.actioninfo}>
                    <h3 className={styles.actiontitle}>{ item.currentElementType2 == "gen" ? "Generator" : item.currentElementType2 } - { item.currentElementPerc }% damage</h3>
                    <p className={styles.actionlocation}>{ item.currentElementNode } - { item.currentElementCarrier }</p>
                    <p className={styles.actioncredits}>3.500 credits cost</p>
                </div>
                <button className={styles.deleteaction} onClick={() => deleteThisAction(index)}>
                  <img alt="delete icon" src="images/actionDelete.svg" />
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
    </div>
  );
};

export default ListAttacks;


