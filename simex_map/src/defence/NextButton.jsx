import { useEffect, useState } from "react";
import styles from './NextButton.module.css';

const NextButton = ({ disable, nextSetStepValue }) => { 
  const [step, setStep] = useState(1);
  const handleClick = () => {
    setStep(step + 1);
  };

  useEffect(() => {
    nextSetStepValue(step);
    },[step]);

  return (
          <button className={styles.buttonAdd} onClick={handleClick} disabled={disable}>Next step</button>
     );
};

export default NextButton;