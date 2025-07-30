import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import ChartPrice from './ChartPrice';
import ElectricityPrice from './ElectricityPrice';
import ElectricityEmpty from './ElectricityEmpty';
import styles from './WrapperPrice.module.css';

const WrapperPrice = () => {
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prices, setPrices] = useState({
    pmin: 0,
    pmax: 0,
    pavg: 0,
  });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}prices`;
  let price = 0, lpmin = 0, lpmax = 0, lpavg = 0;
  useEffect(() => {
    fetch(url)
    .then((res) => res.json())
    .then((response) => {
      //console.log(response);
      const prices_ts = JSON.parse(response.data[1]);
      let dataupdated = [], data_ee = [], data_lt = [], data_lv = [], categories = [];
      const prices_ts_ee = prices_ts['EE'];
      const prices_ts_lt = prices_ts['LT'];
      const prices_ts_lv = prices_ts['LV'];
      for (const key in prices_ts_ee) {
        if (prices_ts_ee.hasOwnProperty(key)) {
          price = Math.round(prices_ts_ee[key]*100)/100;
          data_ee.push(price);
          const date = new Date(key);
          const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          categories.push(formatted);
        }
      }
      setCategories(categories);
      for (const key in prices_ts_lt) {
        if (prices_ts_lt.hasOwnProperty(key)) {
          price = Math.round(prices_ts_lt[key]*100)/100;
          data_lt.push(price);
        }
      }
      for (const key in prices_ts_lv) {
        if (prices_ts_lv.hasOwnProperty(key)) {
          price = Math.round(prices_ts_lv[key]*100)/100;
          data_lv.push(price);
        }
      }
      switch(selectedCountry){
        case '':
            data_ee = { name: 'price_ts_ee', data: data_ee };
            data_lt = { name: 'price_ts_lt', data: data_lt };
            data_lv = { name: 'price_ts_lv', data: data_lv };
            dataupdated = [data_ee, data_lt, data_lv];
            lpmin = 0;
            lpmax = 0;
            lpavg = 0;
            break;
          case 'EE':
            dataupdated = [{ name: 'price_ts_ee', data: data_ee }];
            lpmin = Math.min(...data_ee);
            lpmax = Math.max(...data_ee);
            lpavg = data_ee.reduce((acc, val) => acc + val, 0) / data_ee.length;
            break;
        case 'LT':
            dataupdated = [{ name: 'price_ts_lt', data: data_lt }];
            lpmin = Math.min(...data_lt);
            lpmax = Math.max(...data_lt);
            lpavg = data_lt.reduce((acc, val) => acc + val, 0) / data_lt.length;
            break;
        case 'LV':
            dataupdated = [{ name: 'price_ts_lv', data: data_lv }];
            lpmin = Math.min(...data_lv);
            lpmax = Math.max(...data_lv);
            lpavg = data_lv.reduce((acc, val) => acc + val, 0) / data_lv.length;
            break;
        default:
            data_ee = { name: 'price_ts_ee', data: data_ee };
            data_lt = { name: 'price_ts_lt', data: data_lt };
            data_lv = { name: 'price_ts_lv', data: data_lv };
            dataupdated = [data_ee, data_lt, data_lv];
            lpmin = 0;
            lpmax = 0;
            lpavg = 0;
            break;
      }
    lpavg = (Math.round(lpavg*100))/100;
    setData(dataupdated);
    setPrices({ pmin: lpmin, pmax: lpmax, pavg: lpavg });
    });
  }, [selectedCountry, selectedTs]);
  return (
      <div className={styles.wrapperP}>
        {selectedCountry == '' && <ElectricityEmpty /> }
        {selectedCountry != '' && <ChartPrice dataupdated={data} categories={categories} /> }
        {selectedCountry != '' && <ElectricityPrice pmin={prices.pmin}  pmax={prices.pmax}  pavg={prices.pavg} /> }
      </div>
  );
};

export default WrapperPrice;
