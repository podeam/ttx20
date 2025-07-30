import styles from './ConfirmDeploy.module.css';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { archiveCurrentActions, showHideConfirm } from '../store/attackSlice';

const ConfirmDeploy = () => {
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState(true);
    const [loaderVisible, setLoaderVisible] = useState(false);
    const listAttackActions = useSelector((state) => state.attack.selectedAttackActions);
    const showHideConfirm = useSelector((state) => state.attack.showConfirm);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}attack`;

    const cancelClick = () => {
        setIsVisible(false);
        setLoaderVisible(false);
    }
    const handleClick = () => {
        setLoaderVisible(true);
        let obj;
        let dataSend = [];
        listAttackActions.map((item)=>{
            obj = { 
                "def_type": item.currentElementType2, 
                "index": item.currentElementNode + ' ' + item.currentElementCarrier,
                "userdata": item.currentElementPerc
            }
            dataSend.push(obj);
        });
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(dataSend),
        })
        .then((response) => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
            })
        .then((data) => {
            //console.log(data);
            //navigate('/');
            location.href = '/start_a';
            })
        .catch((error) => {
            console.error('Error:', error);
            });

        dispatch(archiveCurrentActions());
    }

    useEffect(() => {
        if(showHideConfirm){
            setIsVisible(true);
        }
        else{
            setIsVisible(false);
        }
        }, [showHideConfirm]);


    if (!isVisible) { return null; }
    return (
        <div className={styles.confirmDeploy}>
            {loaderVisible && <div className={styles.loaderWrapper}>
                <div><img src="public/images/loaderAnimation.png" alt="loader animation" /></div>
                <div className={styles.loaderText}>Executing your 1st attack plan and gathering its effects</div>
            </div>}
            {!loaderVisible && <div className={styles.buttonWrapper}>
                <p>Plan simulation. Are you sure to go ahead?</p>
                <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
                <button className={styles.buttonConfirm} onClick={handleClick}>Confirm</button>
            </div>}
        </div>
        );
    };

export default ConfirmDeploy;

