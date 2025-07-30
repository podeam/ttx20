import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import ChartLostLoad from './ChartLostLoad';
import LostLoad from './LostLoad';
import styles from './WrapperLostLoad.module.css';

const WrapperLostLoad = ({chart}) => {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState([]);
  const [perc, setPerc] = useState([]);
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const countryName = useSelector((state) => state.country.countryName);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}lost_load`;
  let sumTot = 0, sumTotLoad = 0, sumPercLoad = 0;
  let dataupdated = [];

  useEffect(() => {
    fetch(url)
    .then((res) => res.json())
    .then((response) => {
        //console.log(response);
        const data1 = response.EE_loads;
        const data2 = response.LT_loads;
        const data3 = response.LV_loads;
        let sum_EE_load = 0; if(response.EE_loads) sum_EE_load = data1.reduce((sum, item) => sum + item.EE_total_load, 0);
        let sum_LT_load = 0; if(response.LT_loads) sum_LT_load = data2.reduce((sum, item) => sum + item.LT_total_load, 0);
        let sum_LV_load = 0; if(response.LV_loads) sum_LV_load = data3.reduce((sum, item) => sum + item.LV_total_load, 0);

        let i = 0, arr1=[], arr2=[], arr3=[], summedArray, maxLength;
        const LV_loads = response.LV_loads;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let date,mydate;
        let categories = [];
        if(data1){
          categories = data1.map(item => {
            const date = new Date(item.data);
            return date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short'
            });
          });
        }
        //console.log(data1);
        //console.log(categories);
      setCategories(categories);
      if(response.EE_SummedValues) { arr1 = response.EE_SummedValues; }
      if(response.LT_SummedValues) { arr2 = response.LT_SummedValues; }
      if(response.LV_SummedValues) { arr3 = response.LV_SummedValues; }
      const sumEE = Math.round((arr1.reduce((acc, num) => acc + num, 0)) / 1000);
      const sumLT = Math.round((arr2.reduce((acc, num) => acc + num, 0)) / 1000);
      const sumLV = Math.round((arr3.reduce((acc, num) => acc + num, 0)) / 1000);

        switch(selectedCountry){
          case '':
            i = 0;
            summedArray = [];
            if( arr1 == undefined) { arr1 = []; }
            if( arr2 == undefined) { arr2 = []; }
            if( arr3 == undefined) { arr3 = []; }
            maxLength = Math.max(arr1.length, arr2.length, arr3.length);
            for (let i = 0; i < maxLength; i++) {
              const a = i < arr1.length ? arr1[i] : 0;
              const b = i < arr2.length ? arr2[i] : 0;
              const c = i < arr3.length ? arr3[i] : 0;
              summedArray.push(a + b + c);
            }
            dataupdated = [{name: 'Lost Loads', data: summedArray}]
            sumTot = (sumEE + sumLT + sumLV);
            if(sumTot > 0){
              sumTotLoad = Math.round((sum_EE_load + sum_LT_load + sum_LV_load)/1000);
              sumPercLoad = (Math.round(((sumTot * 100) / sumTotLoad)*10))/10;
            }
            break;
          case 'EE':
            dataupdated = [{name: 'EE_lost_loads', data: response.EE_SummedValues}];
            sumTot = sumEE;
            if(sumTot > 0){
              sumTotLoad = Math.round((sum_EE_load)/1000);
              sumPercLoad = (Math.round(((sumTotLoad * 100) / sumTot)*10))/10;
            }
            break;
          case 'LT':
            dataupdated = [{name: 'LT_lost_loads', data: response.LT_SummedValues}];
            sumTot = sumLT;
            if(sumTot > 0){
              sumTotLoad = Math.round((sum_LT_load)/1000);
              sumPercLoad = (Math.round(((sumTot * 100) / sumTotLoad)*10))/10;
            }
            break;
          case 'LV':
            dataupdated = [{name: 'LV_lost_loads', data: response.LV_SummedValues}];
            sumTot = sumLV;
            if(sumTot > 0){
              sumTotLoad = Math.round((sum_LV_load)/1000);
              sumPercLoad = (Math.round(((sumTot * 100) / sumTotLoad)*10))/10;
            }
            break;
          default:
            i = 0;
            summedArray = [];
            arr1 = response.EE_SummedValues;
            arr2 = response.LT_SummedValues;
            arr3 = response.LV_SummedValues;
            if( arr1 == undefined) { arr1 = []; }
            if( arr2 == undefined) { arr2 = []; }
            if( arr3 == undefined) { arr3 = []; }
            maxLength = Math.max(arr1.length, arr2.length, arr3.length);

            for (let i = 0; i < maxLength; i++) {
              const a = i < arr1.length ? arr1[i] : 0;
              const b = i < arr2.length ? arr2[i] : 0;
              const c = i < arr3.length ? arr3[i] : 0;
              summedArray.push(a + b + c);
            }
            dataupdated = [{name: 'Lost Loads', data: summedArray}]
            sumTot = (sumEE + sumLT + sumLV);
            if(sumTot > 0){
              sumTotLoad = Math.round((sum_EE_load + sum_LT_load + sum_LV_load)/1000);
              sumPercLoad = (Math.round(((sumTot * 100) / sumTotLoad)*10))/10;
            }
            break;
        }
        setData(dataupdated);
        setTotal(sumTot);
        setPerc(sumPercLoad);
      });
    }, [selectedCountry, selectedTs]);
  return (
      <div className={styles.wrapperLL}>
        <div>{ chart && <ChartLostLoad dataupdated={data} categories={categories} />}</div>
        <div><LostLoad sumTot={total} sumPerc={perc} /></div>
      </div>
  );
};

export default WrapperLostLoad;
