import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentAction } from '../store/actionSlice';
import { setAction } from '../store/attackSlice';
import styles from './MapModalBox.module.css';

const MapModalBox = ({bus, line, link, type, side, displaybox}) => { 
    //console.log(bus + ' | ' + line + ' | ' + link + ' | ' + type + ' | ' + side + ' | ' + displaybox);
    const dispatch = useDispatch();
    const selectedAction = useSelector((state) => state.action.selectedAction);
    const selectedActionTemp = useSelector((state) => state.action.selectedActionTemp);
    const defenceActionNumber = useSelector((state) => state.defence.actionNumber);
    const selectedAttackActions = useSelector((state) => state.attack.selectedAttackActions);
    const defenceStep = useSelector((state) => state.defence.step);
    const [isVisible, setIsVisible] = useState(false);
    const [items, setItems] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const names = { 
        "capacity": "Capacity", 
        "avg_flow_per_day": "Avg flow per day",
        "max_flow": "Max flow",
        "min_flow": "Min flow",
        "length": "Length"
    }

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
        if(selectedAttackActions && selectedAttackActions.length == 1){
            setIsVisible(false);
        }
    },[selectedAttackActions]);

    useEffect(() => {
        if (bus) {
            setIsVisible(true);
            setActiveKey('');
            //console.log(true);
            const url1 = `${API_BASE_URL}single_bus_gen_easy`;
            fetch(url1, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({ bus_name: bus }).toString()
              })
            .then((res) => res.json())
            .then((items) => {
                items = JSON.parse(items.data);
                //console.log(items);
                setItems(items);
                setModalType('gen');
                });
        }
    }, [bus]);
    useEffect(() => {
        if (line) {
            setIsVisible(true);
            setActiveKey('');
            //console.log(true);
            const url2 = `${API_BASE_URL}get_single_line`;
            fetch(url2, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({ line_name: line }).toString()
              })
            .then((res) => res.json())
            .then((items) => {
                items = JSON.parse(items.data);
                console.log(items);
                setItems(items);
                setModalType('line');
                });
        }
    }, [line]);
    useEffect(() => {
        if (link) {
            setIsVisible(true);
            setActiveKey('');
            //console.log(true);
            const url3 = `${API_BASE_URL}get_single_link`;
            fetch(url3, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({ link_name: link }).toString()
              })
            .then((res) => res.json())
            .then((items) => {
                items = JSON.parse(items.data);
                //console.log(items);
                setItems(items);
                setModalType('link');
                });
        }
    }, [link]);

    const handleToggle = (e) => {
        //console.log(e);
        e.preventDefault();
        setIsVisible(false);
    };
    const handleRowClick = (key, power) => {
        //console.log(key);
        setActiveKey(key);
        addStoreAction(key, 'gen', power);
    };
    const addStoreAction = (key, type, value) => {
        //console.log(key);
        //console.log(type);
        if(side == 'defence'){
            let actionObj = { };
            if(type == 'gen'){
                actionObj = { 
                    actionId: selectedAction, 
                    type: type, 
                    name: bus, 
                    carrier: key, 
                    value: value, 
                    credit: 0, 
                    actionNumber: defenceActionNumber, 
                    defenceStep: defenceStep 
                }; 
            }
            if(type == 'line'){
                setIsActive(true);
                actionObj = { 
                    actionId: selectedAction, 
                    type: type, 
                    name: key, 
                    value: value, 
                    carrier: '', 
                    credit: 0, 
                    actionNumber: defenceActionNumber, 
                    defenceStep: defenceStep 
                }; 
            }
            if(type == 'link'){
                setIsActive(true);
                actionObj = { 
                    actionId: selectedAction, 
                    type: type, 
                    name: key, 
                    carrier: '', 
                    value: value, 
                    credit: 0, 
                    actionNumber: defenceActionNumber, 
                    defenceStep: defenceStep 
                }; 
            }
            dispatch(setCurrentAction(actionObj));
            //setIsVisible(false);
            }
    if(side == 'attack'){
        if(modalType == 'gen'){
            //console.log(bus);
            //console.log(key);
            const toRemove = bus + " ";
            const carrier = key.replace(toRemove, "");
            const name = bus + ' ' + key;
            const actionObj = { type: 'attack', type2: 'gen', node: bus, carrier: carrier}; 
            dispatch(setAction(actionObj));
            setIsActive(prev => !prev);
        }
        if(modalType == 'line'){
            setIsActive(true);
            const name = bus + ' ' + key;
            const actionObj = { type: 'attack', type2: 'line', node: line, carrier: ''}; 
            dispatch(setAction(actionObj));
        }
        if(modalType == 'link'){
            setIsActive(true);
            const name = bus + ' ' + key;
            const actionObj = { type: 'attack', type2: 'link', node: link, carrier: ''}; 
            dispatch(setAction(actionObj));
        }            
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
                    <h3 className={styles.title}>Node { bus } composition</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <div className={styles.rowcontainer}>
                        <div>Carrier</div>
                        <div>Available Capacity (MW)</div>
                    </div>
                    <div>
                        {Object.entries(items.p_nom)
                        .filter(([key]) => key && !key.includes("dsr") && !key.includes("lost-load"))
                        .map(([key, value]) => {
                            const power = value * items.p_max_pu[key];
                            return { key, power };
                        })
                        .filter(item => item.power > 0)
                        .sort((a, b) => b.power - a.power) // descending order by power
                        .map(({ key, power }) => {
                            const isActive = key === activeKey;
                            const isGray = Math.round(power) <= 200;

                            return (
                            <div
                                key={key}
                                onClick={!isGray ? () => handleRowClick(key, power) : undefined}
                                className={`${styles.rowbodycontainer} ${isActive ? styles.active : isGray ? styles.gray : ''}`} >
                                <div>{key}</div>
                                <div className={styles.alignright}>{Math.round(power)}</div>
                            </div>
                            );
                        })}

                    </div>
                </div>
                }
                { modalType == 'line' &&  <div>
                    <h3 className={styles.title}>Transmission line</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <div className={styles.rowcontainer}>
                        <div>Line ID</div>
                        <div>Capacity (MW)</div>
                    </div>
                        {Object.entries(items).map(([key, value]) => {
                            //console.log(key);
                            if (key !== "" && value > 0 && key == 'capacity') {
                                //const isActive = key === activeKey;
                                let label = 'MW';
                                if(key == 'length') { label = 'Km'; }
                                return (
                                <div
                                    key={key}
                                    onClick={() => addStoreAction(line, 'line', Math.round(value))}
                                    className={`${styles.rowbodycontainer} ${isActive ? styles.active : ''}`} >
                                    <div>{line}</div>
                                    <div className={styles.alignright}>{Math.round(value)}</div>
                                </div>
                                );
                            }
                        return null;
                        })}
                </div>
                }
                { modalType == 'link' &&  <div>
                    <h3 className={styles.title}>Link</h3>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <div className={styles.rowcontainer}>
                        <div>Link ID</div>
                        <div>Capacity (MW)</div>
                    </div>
                        {Object.entries(items).map(([key, value]) => {
                        if (key == "capacity" && value > 0) {
                            return (
                                <div
                                    key={key}
                                    onClick={() => addStoreAction(link, 'link', Math.round(value))}
                                    className={`${styles.rowbodycontainer} ${isActive ? styles.active : ''}`} >
                                    <div>{link}</div>
                                    <div className={styles.alignright}>{Math.round(value)}</div>
                                </div>
                            );
                        }
                        return null;
                        })}
                </div>
                }
            </div>
            }
        </div>
  );
};

export default MapModalBox;