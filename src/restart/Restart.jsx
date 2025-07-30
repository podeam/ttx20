"use client";
import styles from "./Restart.module.css";
import { Provider } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store/index';
import { useEffect } from "react";

import Header from "../components/Header";
import WrapperMap from '../components/WrapperMap';
import AttackHistory from '../components/AttackHistory';
import Countries from '../components/Countries';
import WrapperLostLoad from "../components/WrapperLostLoad";
import WrapperPrice from "../components/WrapperPrice";
import DefenceButton from "../defence/DefenceButton";

export default function Restart() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    useEffect(() => {
        const url1 = `${API_BASE_URL}restart_a`;
        fetch(url1)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
                })
            .then((data) => {
                console.log('Success:', data);
                location.href= '/';
                })
            .catch((error) => {
                console.error('Error:', error);
                });
            });
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
                        <Link to="/attack">Attack</Link> | <Link to="/defence">Defence</Link>
                    </nav>
                </div>
            </main>
        </Provider>
    );
}


