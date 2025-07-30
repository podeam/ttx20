import styles from './ConfirmDeploy.module.css';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

const ConfirmDeploy = () => {
    const dispatch = useDispatch();
    const [disabled, setDisabled] = useState(true);
    const [actionsToSend, setActions] = useState([]);
    const [isVisible, setIsVisible] = useState(true);
    const [loaderVisible, setLoaderVisible] = useState(false);
    //const listAttackActions = useSelector((state) => state.attack.selectedAttackActions);
    const showHideConfirm = useSelector((state) => state.action.showConfirm);
    const actions = useSelector((state) => {
        const arr = state.action.selectedActions;
        return arr;
    });
    const cancelClick = () => {
        setIsVisible(false);
        setLoaderVisible(false);
    }
    /*
    const handleClick = () => {
        setLoaderVisible(true);
    }
    */

    useEffect(() => {
        if(showHideConfirm){
          setIsVisible(true);
        }
        else{
          setIsVisible(false);
        }
    }, [showHideConfirm]);

    useEffect(() => {
        if (!actions) return;
        fetch("/js/action.json")
            .then((res) => res.json())
            .then((items) => {
                const flattenedData = items.flatMap(group => group.data);
                const merged = actions.map(sa => {
                const match = flattenedData.find(fd => fd.id === sa.actionId);
                    return match ? { ...match, ...sa } : sa;
                    });
                setActions(merged);
            });
        if(actions.length > 0){setDisabled(false);}
    }, [actions]);    


    const sendDefence = () => {
        //console.log(actionsToSend);
        //dispatch(showHideConfirm());
        setLoaderVisible(true);
        let objToSend = [];
        actionsToSend.forEach((item) => {
          console.log(item);
          let country = item.name.substr(0, 2);
          switch(item.actionId){
            case 1: //protection
            const str = item.carrier;
            const toRemove = item.name;
            const carrier = str.replace(toRemove, "");
              objToSend.push({"def_type": item.tag, "bus": item.name, "link": "", "line": "", "gen": item.carrier, "country":"", "carrier":carrier, "userdata":item.percentage, "step":item.defenceStep});
              break;
            case 2: //enable backup [todo]
              if(item.name == "EE0 7 oil" || item.name == "LT0 1 CCGT"){
                objToSend.push({
                  "def_type": item.tag, 
                  "bus": item.name, 
                  "link": "", 
                  "line": "", 
                  "gen": item.name, 
                  "country": "", 
                  "carrier":item.carrier, 
                  "userdata":item.percentage, 
                  "step":item.defenceStep
                });
              }
              if(item.name == "relation/8184630+2" || item.name == "relation/8185455+2"){
                objToSend.push({
                  "def_type": item.tag, 
                  "bus": "", 
                  "link": item.name, 
                  "line": "", 
                  "gen": "", 
                  "country": "", 
                  "carrier": "", 
                  "userdata":item.percentage, 
                  "step":item.defenceStep
                });
              }
              if(item.name == "line 297"){
                objToSend.push({
                  "def_type": item.tag, 
                  "bus": "", 
                  "link": "", 
                  "line": item.name, 
                  "gen": "", 
                  "country": "", 
                  "carrier": "", 
                  "userdata":item.percentage, 
                  "step":item.defenceStep
                });
              }
              break;
            case 3: //Increase line capacity
              objToSend.push({"def_type": item.tag, "bus": "", "link": "", "line": item.name, "gen": item.carrier, "country": "", "carrier": "", "userdata":item.percentage, "step":item.defenceStep});
              break;
            case 4: //Limit users' demand [todo]
              objToSend.push({"def_type": item.tag, "bus": "", "link": "", "line": "", "gen": "", "country": country, "carrier": "", "userdata":item.percentage, "step":item.defenceStep});
              break;
            case 5: //Build a new power plant
              objToSend.push({"def_type": item.tag, "bus": item.name, "link": "", "line": "", "gen": item.carrier, "country":"", "carrier":item.carrier, "userdata":item.percentage, "step":item.defenceStep});
              break;
            case 6: //Increase interconnector capacity
              objToSend.push({"def_type": item.tag, "bus": "", "link": item.name, "line": "", "gen": "", "country":country, "carrier": "", "userdata":item.percentage, "step":item.defenceStep});
              break;
            }
        });
        console.log(objToSend);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const url = `${API_BASE_URL}defence`;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(objToSend),
        })
        .then((response) => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
            })
        .then((data) => {
            console.log(data);
            //navigate('/');
            location.href = '/start_d';
            })
        .catch((error) => {
            console.error('Error:', error);
            });
      };    

    if (!isVisible) { return null; }
    return (
        <div className={styles.confirmDeploy}>
            {loaderVisible && <div className={styles.loaderWrapper}>
                <div><img src="public/images/loaderAnimation.png" alt="loader animation" /></div>
                <div className={styles.loaderText}>Executing your 1st defence plan and gathering its effects</div>
            </div>}
            {!loaderVisible && <div className={styles.buttonWrapper}>
                <p>Plan simulation. Are you sure to go ahead?</p>
                <button className={styles.buttonCancel} onClick={cancelClick}>Cancel</button>
                <button className={styles.buttonConfirm} onClick={sendDefence}>Confirm</button>
            </div>}
        </div>
        );
    };

export default ConfirmDeploy;

