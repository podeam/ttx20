"use client";
import React, { useState } from 'react';
import styles from "../results/results.module.css";
import { Provider } from 'react-redux';
import store from '../store/index';
import Header from '../components/Header';
import Timer from '../attack/Timer';
import Credits from '../attack/Credits';
import WrapperMap from '../components/WrapperMap';
import StartAttack from '../attack/StartAttack';
import AttackActionSetup from '../attack/AttackActionSetup';
import DeployButton from '../attack/DeployButton';
import ConfirmDeploy from '../attack/ConfirmDeploy';
import AttackHistory from '../attack/AttackHistory';

export default function Attack() {
    const [stepValue, setStepValue] = useState(1);
    const [displaybox, setDisplayBox] = useState(null);

    const handleSetStepValue = (v) => {
        //console.log(v);
        if(v == 100){
            setDisplayBox(false);
            //console.log('spegni modal');
        }
        else{
            setStepValue(v);
            setDisplayBox(true);
        }
        //console.log('Received from attack child: ', v);
      };
    return (
    <Provider store={store}>
        <main className={styles.gamedashboard}>
            <img src="./images/wrapper.png" className={styles.backgroundimage} alt="Dashboard background" />
            <Header round1="1" round2="Attack" />
            <section className={styles.dashboardcontent}>
                <ConfirmDeploy />
                <AttackHistory />
                <div className={styles.dashboardgrid}>
                    <aside className={styles.statuscolumn}>
                        <Timer />
                        <Credits />
                    </aside>
                    
                    <section className={styles.mapcolumn}>
                        <WrapperMap side='attack' step={stepValue} displaybox={displaybox} />
                    </section>

                    <section className={styles.attackcolumn}>
                        { stepValue == 1 && <StartAttack sendValueUp={handleSetStepValue} />}
                        { stepValue == 2 && <AttackActionSetup sendValueUp={handleSetStepValue} stepValue={stepValue} />}
                    </section>
                </div>
            </section>
            <footer>
                <DeployButton />
            </footer>
            <div><a href="/">Go back</a></div>
        </main>
    </Provider>
    );
}


