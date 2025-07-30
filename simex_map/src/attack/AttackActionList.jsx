import styles from './AttackActionList.module.css';
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import GeneratorData from './GeneratorData';
import LineData from './LineData';

const AttackActionList = () => {
    const [displayComponent, setDisplayComponent] = useState(false);
    const [gendata, setGendata] = useState({});
    const [timeseries, setTimeseries] = useState([]);
    const [flowseries, setFlowSeries] = useState([]);
    const lastAction = useSelector((state) => {
        const obj = state.attack;
        return obj ? obj : null;
      });
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
     useEffect(() => {
        //console.log(lastAction.currentElementNode);
        if(lastAction.currentElementNode != ''){
            /********************* */
            if(lastAction.currentElementType2 == 'gen'){
              const data = new URLSearchParams();
              data.append('bus_name', lastAction.currentElementNode);
              data.append('carrier', lastAction.currentElementCarrier);
              const url1 = `${API_BASE_URL}get_single_generator_timeseries`;
    
              fetch(url1, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: data.toString(),
                })
                  .then((response) => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                  })
                  .then((data) => {
                    //console.log('Success:', data);
                    const key = data.data[lastAction.currentElementNode + ' ' + lastAction.currentElementCarrier];
                    setGendata(key.static);
                    setTimeseries(key.time_series);
                    setDisplayComponent(true);
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
                }
            /********************* */
            /********************* */
            if(lastAction.currentElementType2 == 'line'){
              const data = new URLSearchParams();
              data.append('line_name', lastAction.currentElementNode);
              const url2 = `${API_BASE_URL}get_single_line`;
              fetch(url2, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: data.toString(),
                })
                  .then((response) => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                  })
                  .then((data) => {
                    //console.log('Success:', data);
                    data = JSON.parse(data.data);
                    //console.log(data);
                    const mydata = { 
                      "capacity": data.capacity, 
                      "length": data.length,
                      "avg_flow_per_day": data.avg_flow_per_day,
                      "max_flow": data.max_flow,
                      "min_flow": data.min_flow,
                      "buses": data.buses,
                    };

                    //console.log(data.timestamps);
                    setGendata(mydata);
                    setFlowSeries(data.flow_series);
                    setTimeseries(data.timestamps);
                    setDisplayComponent(true);
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
                }
            /********************* */
            if(lastAction.currentElementType2 == 'link'){
              const data = new URLSearchParams();
              data.append('link_name', lastAction.currentElementNode);
              const url3 = `${API_BASE_URL}get_single_link`;
              fetch(url3, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: data.toString(),
                })
                  .then((response) => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                  })
                  .then((data) => {
                    //console.log('Success:', data);
                    data = JSON.parse(data.data);
                    //console.log(data);
                    const mydata = { 
                      "capacity": data.capacity, 
                      "length": data.length,
                      "avg_flow_per_day": data.avg_flow_per_day,
                      "max_flow": data.max_flow,
                      "min_flow": data.min_flow,
                      "buses": data.buses,
                    };

                    //console.log(data.timestamps);
                    setGendata(mydata);
                    setFlowSeries(data.flow_series);
                    setTimeseries(data.timestamps);
                    setDisplayComponent(true);
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
                }
            /********************* */
        }
        },[lastAction]);

    return (
        <div className={styles.wrapperDAS}>
          { !displayComponent && <h3 className={styles.title}>&larr;&nbsp;Select a target on the map</h3>}
          { displayComponent && lastAction.currentElementType2 == 'gen' && <GeneratorData gendata={gendata} timeseries={timeseries} /> }
          { displayComponent && lastAction.currentElementType2 == 'line' && <LineData gendata={gendata} flowseries={flowseries} timeseries={timeseries} /> }
          { displayComponent && lastAction.currentElementType2 == 'link' && <LineData gendata={gendata} flowseries={flowseries} timeseries={timeseries} /> }
        </div>
      );
};

export default AttackActionList;