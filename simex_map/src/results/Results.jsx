"use client";
import styles from "./Results.module.css";
import { Provider } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store/index';

import Header from "../components/Header";
import WrapperMap from '../components/WrapperMap';
import AttackHistory from '../components/AttackHistory';
import Countries from '../components/Countries';
import WrapperLostLoad from "../components/WrapperLostLoad";
import WrapperPrice from "../components/WrapperPrice";
import DefenceButton from "../defence/DefenceButton";

export default function Results() {
    return (
        <Provider store={store}>
            <main className={styles.gamedashboard}>
              <img src="images/wrapper.png" className={styles.backgroundimage} alt="Dashboard background" />
                <Header round1="1" round2="Result" />
                <div className={styles.dashboardcontent}>
                    <div className={styles.dashboardgrid}>
                        <div><WrapperMap /></div>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div><AttackHistory /></div>
                                <div><Countries /></div>
                            </div>
                            <WrapperLostLoad chart={true} />
                            <WrapperPrice />
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <DefenceButton />
                </div>
                <div style={{position: "absolute", bottom: "20px", zIndex: "100"}}>
                    <nav>
                        <Link to="/start_a">Attack</Link> | <Link to="/start_d">Defence</Link> | <Link to="/restart">Restart</Link>
                    </nav>
                </div>
            </main>
        </Provider>
    );
}


