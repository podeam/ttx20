import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { showHideHistory } from '../store/actionSlice';
import styles from './DefenceHistory.module.css';

const AttackHistory = () => {
    const dispatch = useDispatch();
    const visibleHistory = useSelector((state) => state.action.showHistory);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionsDefence, setActionsDefence] = useState([]);

    const handleButtonClick = (item) => {
        //console.log(item);
        setSelectedItem(item[0]);
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
                setActionsDefence(data.actions_defence);
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
            <h2>Defence History</h2>
            <div className={styles.attackHistory2}>
                <div className={styles.attackHistoryMenu}>
                    {actionsDefence.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleButtonClick(item)}
                            className={styles.historyButton}
                        >
                            {index + 1}. Defence
                        </button>
                    ))}
                </div>
                <div className={styles.attackHistoryAction}>
                    {selectedItem && (
                        <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc' }}>
                            <div><strong>Def Type:</strong> {selectedItem.def_type}</div>
                            <div><strong>Index:</strong> {selectedItem.gen}</div>
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
