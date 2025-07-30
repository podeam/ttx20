import styles from './TimerAlert.module.css';

const TimerAlert = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2>My Modal</h2>
          <p>This is a modal dialog controlled by props.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
};

export default TimerAlert;