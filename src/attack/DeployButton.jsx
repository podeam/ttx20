"use client";
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { archiveCurrentActions, showHideConfirm } from '../store/attackSlice';
import styles from "../results/results.module.css";

export default function DeployButton() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [disable, setDisable] = useState(true);
    const listAttackActions = useSelector((state) => state.attack.selectedAttackActions);
    //console.log(listAttackActions);
    useEffect(() => {
        if(listAttackActions.length !== 0){
            setDisable(false);
            }
        else{
            setDisable(true);
        }
        },[listAttackActions]);

    const handleClick = () => {
        dispatch(showHideConfirm());
    };        

    return (
        <button className={styles.deploybutton} onClick={handleClick} disabled={disable}>Deploy plan</button>
    );
}

