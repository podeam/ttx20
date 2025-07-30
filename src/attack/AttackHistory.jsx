import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showHideHistory } from '../store/attackSlice';
import styles from './AttackHistory.module.css';

const AttackHistory = () => {
    const dispatch = useDispatch();
    const visibleHistory = useSelector((state) => state.attack.showHistory);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionsAttack, setActionsAttack] = useState([]);

    const handleButtonClick = (item) => {
        setSelectedItem(item);
    };

    const hideHistory = () => {
        dispatch(showHideHistory());
    };

    useEffect(() => {
        if (visibleHistory) {
            fetch('/status.json', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                console.log("Fetched actions_attack:", data.actions_attack);
                setActionsAttack(data.actions_attack);
            })
            .catch((error) => {
                console.error('Error fetching status.json:', error);
            });
        }
    }, [visibleHistory]);

    if (!visibleHistory) {
        return null;
    }

    return (
        <div className={styles.attackHistory}>
            <h2>Attack History</h2>
            <div className={styles.attackHistory2}>
                <div className={styles.attackHistoryMenu}>
                    {actionsAttack.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleButtonClick(item)}
                            className={styles.historyButton}
                        >
                            {index + 1}. Attack
                        </button>
                    ))}
                </div>
                <div className={styles.attackHistoryAction}>
                    {selectedItem && (
                        <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc' }}>
                            <div><strong>Def Type:</strong> {selectedItem.def_type}</div>
                            <div><strong>Index:</strong> {selectedItem.index}</div>
                            <div><strong>Userdata:</strong> {selectedItem.userdata}</div>
                        </div>
                    )}
                    <button onClick={hideHistory} style={{ marginTop: '12px', padding: '6px 12px' }}>
                        Back to plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttackHistory;
