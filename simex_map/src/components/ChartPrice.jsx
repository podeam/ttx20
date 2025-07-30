import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styles from './ChartPrice.module.css';

const ChartPrice = ({dataupdated, categories}) => { 
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const countryName = useSelector((state) => state.country.countryName);
  const options = {
    chart: { type: 'line', zoomType: 'x', height: 150  },
    title: { text: '' },
    xAxis: { categories: categories, tickInterval: 168},
    yAxis: { title: { text: '€/MWh' } },
    legend: { enabled: false },
    credits: { enabled: false },
    plotOptions: {
      series: {
          point: {
              events: {
                  click: function () {
                      dispatch(setTs(this.x));
                    }
                }
            }
        }
    },
    /*colors: ['#FF6F59'],*/
    series: dataupdated,
  };
  return (
    <div className={styles.wrapperChartPrice}>
      <h3 className={styles.title}>Electricity price fluctuations</h3>
      <p className={styles.subtitle}>{countryName}</p>
      <div><HighchartsReact highcharts={Highcharts} options={options} /></div>
    </div>
  );
};

export default ChartPrice;
