import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import BalticsMap from "./BalticsMap";
import GenerationMix from "./GenerationMix";
import styles from "./WrapperMap.module.css";

const WrapperMap = ({ side, step }) => {
  const [activeComponent, setActiveComponent] = useState("A");
  const selectedAction = useSelector((state) => state.action.selectedAction);
  const action = useSelector((state) => state.action.selectedAction);

  useEffect(() => {
    if (side == "defence" && action == 0) {
      console.log(side + ' ' + action);
      setActiveComponent('A'); //DE
    }
  }, [action]);
  

  useEffect(() => {
    if (side === "attack" && step === 2) {
      setActiveComponent((prev) => (prev !== "AT" ? "AT" : prev));
    }
    if (side === "defence") {
      setActiveComponent((prev) => (prev !== "DE" ? "DE" : prev));
    }
  }, [step, side]);

  useEffect(() => {
    //console.log(selectedAction);
    fetch("/js/action.json")
      .then((res) => res.json())
      .then((actionGroups) => {
        let foundAction = null;
        for (const group of actionGroups) {
          const match = group.data.find((action) => action.id === selectedAction);
          if (match) {
            foundAction = match;
            break;
          }
        }
        if (foundAction && foundAction.map && foundAction.map !== activeComponent) {
          setActiveComponent(foundAction.map);
        }
        else{
          setActiveComponent('A');
        }
      });
      /*
      console.log(side + ' ' + selectedAction);
      if(side == 'defence' && selectedAction == 2){
        setActiveComponent('DEBG');
        console.log('ok');
      }
      */
  }, [selectedAction]);

  const renderComponent = useCallback(() => {
    //console.log(activeComponent);
    switch (activeComponent) {
      case "A":
      case "B":
      case "D":
      case "N":
      /*case "NB":*/
      case "L":
      case "C":
      case "LK":
      case "AT":
      case "DE":
      case "DEBG":
      case "DENPP":
      case "DEL":
      case "DELK":
        return (
          <BalticsMap mycomponent={activeComponent} side={side} />
        );
      case "G":
        return <GenerationMix side={side} />;
      default:
        return null;
    }
  }, [activeComponent, side]);

  return (
    <section className={styles.mapcolumn}>
      <nav className={styles.mapnavigation}>
        <ul className={styles.maptabs}>
          <li className={styles.maptab}>
            <a
              onClick={() => setActiveComponent("A")}
              className={activeComponent === "A" ? styles.active : ""}
            >
              Electricity flow
            </a>
          </li>
          <li className={styles.maptab}>
            <a
              onClick={() => setActiveComponent("B")}
              className={activeComponent === "B" ? styles.active : ""}
            >
              Base flow
            </a>
          </li>
          <li className={styles.maptab}>
            <a
              onClick={() => setActiveComponent("G")}
              className={activeComponent === "G" ? styles.active : ""}
            >
              Generation mix
            </a>
          </li>
          <li className={styles.maptab}>
            <a
              onClick={() => setActiveComponent("D")}
              className={activeComponent === "D" ? styles.active : ""}
            >
              Population & Industries
            </a>
          </li>
        </ul>
      </nav>
      <div className={styles.mapdisplay}>{renderComponent()}</div>
    </section>
  );
};

export default WrapperMap;
