import { useEffect, useState } from "react";
import styles from './MapModalBoxResults.module.css';
import ChartLostLoad from './ChartLostLoadModal';

const MapModalBoxResults = ({bus, line, link, type, side, displaybox}) => { 
    //console.log(bus + ' | ' + line + ' | ' + link + ' | ' + type + ' | ' + side + ' | ' + displaybox);
    const [isVisible, setIsVisible] = useState(false);
    const [items, setItems] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    let total_gen = 0;
    let sum_ens = 0;
    let mycategories = [];
    let dataupdated = [];

    useEffect(() => {
        if (displaybox) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [displaybox]);

    useEffect(() => {
        if (bus) {
            setIsVisible(true);
            //console.log(true);
            const url1 = `${API_BASE_URL}single_bus_gen_load`;
            fetch(url1, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({ bus_name: bus }).toString()
              })
            .then((res) => res.json())
            .then((item) => {
                item = item.data;
                console.log(item);
                setItems(item);
                setModalType('gen');
                sum_ens = Object.values(data).reduce((acc, curr) => acc + curr, 0);
                /***************** */
                const mydata = item.lost_load_time_series_MW;
                mycategories = Object.keys(mydata).map(ts => {
                    const date = new Date(parseInt(ts));
                    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // "01-Jan"
                });

                const values = Object.values(mydata);
                dataupdated = [{name: '', data: values }];
                setData(dataupdated);
                setCategories(mycategories);
            });
        }
    }, [bus]);

    const handleToggle = (e) => {
        //console.log(e);
        e.preventDefault();
        setIsVisible(false);
    };

    return (
        <div>
        {isVisible && 
            <div className={styles.wrapperNL}>
                { modalType == 'gen' && <div>
                    <div className={styles.title}>Node { items.bus }</div>
                    <a href="#" className={styles.close} onClick={handleToggle}><img src="images/close.png" alt="Close" /></a>
                    <div className={styles.rowcontainer}>
                        <div className={styles.title2}>Carrier</div>
                        <div className={styles.title2}>Generation</div>
                    </div>
                    <div className={styles.textrow}>
                        {Object.entries(items.energy_by_carrier_MWh)
                        .filter(([key]) => key && !key.includes("dsr") && !key.includes("lost-load"))
                        .map(([key, value]) => {
                            const power = value;
                            return { key, power };
                        })
                        .filter(item => item.power > 0)
                        .sort((a, b) => b.power - a.power) // descending order by power
                        .map(({ key, power }) => {
                            total_gen = total_gen + power;
                            return (
                            <div
                                key={key}
                                className={`${styles.rowbodycontainer}`} >
                                <div>{key}</div>
                                <div className={styles.alignright}>{Math.round(power)} MWh</div>
                            </div>
                            );
                        })}

                    </div>
                    <div className={styles.rowcontainer2}>
                        <div className={styles.title3}>Total node generation</div>
                        <div className={styles.title3}>{ Math.round(total_gen) } MWh</div>
                    </div>
                    <div className={styles.rowcontainer3}>
                        <div className={styles.title4}>Total node demand</div>
                        <div className={styles.title4}>{ Math.round(items.total_load_MWh) } MWh</div>
                    </div>
                    <div className={styles.rowcontainer4}>
                        <div className={styles.title5}>Total ENS</div>
                        <div className={styles.title5}>{ sum_ens } MWh</div>
                    </div>
                    <div>
                        <ChartLostLoad dataupdated={data} categories={categories} />
                    </div>
                </div>
                }
            </div>
            }
        </div>
  );
};

export default MapModalBoxResults;