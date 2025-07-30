import styles from './GeneratorData.module.css';
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import ChartGeneratorTs from './ChartGeneratorTs';

const GeneratorData = ({gendata, timeseries}) => {
    //console.log(gendata);
    //console.log(timeseries);
    const keys = Object.keys(timeseries);     // Array of timestamps
    const values = Object.values(timeseries); // Array of numbers
    const datachart =[{
      name: "Generation history",
      data: values
    }];
    const categories = keys.map(item => {
      const date = new Date(item);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
    });
    //console.log(keys);
    //console.log(categories);
    return (
        <div className={styles.wrapperDAS}>
          <div className={styles.wrapperData}>
            <div className={styles.wrapperData2}>
                <p className={styles.title}>Node<br /><span className={styles.text}>{ gendata.bus }</span></p>
                <p className={styles.title}>Carrier<br /><span className={styles.text}>{ gendata.carrier }</span></p>
            </div>
            <div className={styles.wrapperData2}>
                <p className={styles.title}>Nominal power<br /><span className={styles.text}>{ Math.round(gendata.p_nom) }MW</span></p>
            </div>
          </div>
          <div><ChartGeneratorTs dataupdated={datachart} categories={categories} type="Generator" /></div>
        </div>
      );
};

export default GeneratorData;