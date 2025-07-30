"use client";
import React, { useState } from 'react';
import styles from "./Defence.module.css";
import { Provider } from 'react-redux';
import store from '../store/index';

import Header from '../components/Header';
import Credits from './Credits';
//import WrapperLostLoad from'../components/WrapperLostLoad';
import Timer from '../attack/Timer';
import WrapperMap from '../components/WrapperMap';
import StartDefence from './StartDefence';
import DefenceActionSetup from './DefenceActionSetup';
import ActionMapSelect from "./ActionMapSelect";
import DefenceSlider from "./DefenceSlider";
import DefenceActionList from "./DefenceActionList";
import DefenceDeployButton from "./DefenceDeployButton";
import DefenceHistory from "./DefenceHistory";
import ConfirmDeploy from './ConfirmDeploy';

export default function Defence() {         
    const [stepValue, setStepValue] = useState(1);
    const handleSetStepValue = (v) => {
        setStepValue(v);
        //console.log('Received from child: ', v);
      };
    return (
        <Provider store={store}>
            <main className={styles.gamedashboard}>
              <img src="images/wrapper.png" className={styles.backgroundimage} alt="Dashboard background" />
                <Header round1="1" round2="Defence" />
                <div className={styles.dashboardcontent}>
                    <ConfirmDeploy />
                    <DefenceHistory />
                    <div className={styles.dashboardgrid}>
                        <div>
                            <Timer />
                            <Credits />
                            {/*<WrapperLostLoad chart={false} />*/}
                        </div>
                        <div className={styles.center_column}><WrapperMap side='defence' /></div>
                        <section className={styles.defencecolumn}>
                            { stepValue == 1 && <StartDefence sendValueUp={handleSetStepValue} />}
                            { stepValue == 2 && <DefenceActionSetup sendValueUp={handleSetStepValue} stepValue={stepValue} />}
                            { stepValue == 3 && <ActionMapSelect sendValueUp={handleSetStepValue} />}
                             {stepValue == 4 && <DefenceSlider sendValueUp={handleSetStepValue} />}
                            { stepValue == 5 && <DefenceActionList sendValueUp={handleSetStepValue} />}
                        </section>
                    </div>
                </div>
                <div>
                    <DefenceDeployButton />
                </div>
                <div><a href="/">Go back</a></div>
            </main>
        </Provider>
    );
}


