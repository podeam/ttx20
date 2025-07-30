import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentAction } from '../store/actionSlice';
import styles from './MapModalBox.module.css';

const MapModalBoxBackup = ({bus, line, link, type, side, displaybox}) => { 
    //console.log(bus + ' | ' + line + ' | ' + link + ' | ' + type + ' | ' + side + ' | ' + displaybox);
    //console.log(bus);
    //console.log(line);
    //console.log(link);
    const dispatch = useDispatch();
    const selectedAction = useSelector((state) => state.action.selectedAction);
    const selectedActionTemp = useSelector((state) => state.action.selectedActionTemp);
    const defenceActionNumber = useSelector((state) => state.defence.actionNumber);
    const defenceStep = useSelector((state) => state.defence.step);
    const typeNewGen = useSelector((state) => state.action.typeNewGen);
    const [isVisible, setIsVisible] = useState(false);
    const [items, setItems] = useState(false);
    const [modalType, setModalType] = useState(null);
    //const [isActive, setIsActive] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
/*
    const names = { 
        "capacity": "Capacity", 
        "avg_flow_per_day": "Avg flow per day",
        "max_flow": "Max flow",
        "min_flow": "Min flow",
        "length": "Length"
    }
*/
    useEffect(() => {
    if(defenceStep == 3){
        setIsVisible(false);
    }
    }, [defenceStep]);
        

    useEffect(() => {
    if (displaybox) {
        setIsVisible(true);
    } else {
        setIsVisible(false);
    }
    }, [displaybox]);


    useEffect(() => {
        //console.log(bus);
        if (bus) {
            setIsVisible(true);
            setActiveKey('');
            setItems(bus);
            setModalType('gen');
            if( typeNewGen != '' ){
                bus.p_nom = bus.p_nom;
            }
        }
    }, [bus]);
    useEffect(() => {
        //console.log(line);
        if (line) {
            setIsVisible(true);
            setItems(line);
            setModalType('line');
        }
    }, [line]);
    useEffect(() => {
        if (link) {
            setIsVisible(true);
            setItems(link);
            setModalType('link');
        }
    }, [link]);

    const handleToggle = (e) => {
        //console.log(e);
        e.preventDefault();
        setIsVisible(false);
    };
    const handleRowClick = (key, power) => {
        //console.log(key);
        //setActiveKey(key);
        setActiveKey(prevKey => prevKey === key ? null : key);
        addStoreAction(key, power);
    };
    const addStoreAction = (key, value) => {
        //console.log(key);
        //console.log(value);
        if(side == 'defence'){
            let carrier = '';
            let name = '';
            if(selectedAction == 5) { 
                carrier = key + ' ' + typeNewGen; 
                
            }
            if(selectedAction == 2 && typeof key === 'object') {
                name = bus.name;
            }
            else{
                name = key;
            }
            const actionObj = { actionId: selectedAction, type: type, name: name, carrier: carrier, value: value, credit: 0, actionNumber: defenceActionNumber, defenceStep: defenceStep }; 
            dispatch(setCurrentAction(actionObj));
            //setIsVisible(false);
            }
    }
    useEffect(() => {
        if(side == 'defence'){
            if(selectedActionTemp == null && selectedAction > 0){
                setIsVisible(false);
                }
            }
        }, [selectedActionTemp, selectedAction]);
    return (
        <div>
        {isVisible && 
            <div className={styles.wrapperNL}>
                { modalType == 'gen' && <div>
                    <h3 className={styles.title}>Node { bus.name }</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <table>
                        <thead>
                            <tr>
                                <td>Carrier</td>
                                <td className={styles.alignright}>Available capacity(MW)</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="2">
                                    <div 
                                        className={`${styles.rowbodycontainer} ${activeKey === bus.name ? styles.active : ''}`}
                                        onClick={() => handleRowClick(bus.name, bus.p_nom)}
                                        >
                                        <div>{ bus.name }</div>
                                        <div>{ bus.p_nom }</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                }
                { modalType == 'line' &&  <div>
                    <h3 className={styles.title}>Line { line.name } info</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <table>
                        <thead>
                            <tr>
                                <td></td>
                                <td className={styles.alignright}>Available capacity(MW)</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="2">
                                    <div 
                                        className={`${styles.rowbodycontainer} ${activeKey === line.name ? styles.active : ''}`}
                                        onClick={() => handleRowClick(line.name, line.p_nom)}
                                        >
                                        <div>{ line.name }</div>
                                        <div>{ line.p_nom }</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                }
                { modalType == 'link' &&  <div>
                    <h3 className={styles.title}>Link { link.name } info</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <table>
                        <thead>
                            <tr>
                                <td></td>
                                <td className={styles.alignright}>Available capacity(MW)</td>
                            </tr>
                        </thead>
                    </table>
                    <div 
                        className={`${styles.rowbodycontainer} ${activeKey === link.name ? styles.active : ''}`}
                        onClick={() => handleRowClick(link.name, link.p_nom)}
                        >
                        <div>{ link.name }</div>
                        <div>{ link.p_nom }</div>
                    </div>
                </div>
                }
            </div>
            }
        </div>
  );
};

export default MapModalBoxBackup;