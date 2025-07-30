import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSelector, useDispatch } from 'react-redux';
import { setTs } from '../store/tsSlice';
import styles from './ChartLostLoad.module.css';
const ChartLostLoad = ({dataupdated, categories}) => {
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const countryName = useSelector((state) => state.country.countryName);
  const options = {
    chart: { type: 'column', zoomType: 'x'  },
    title: { text: `Lost load history<br>` + countryName },
    xAxis: { categories: categories, tickInterval: 24},
    yAxis: { min: 0, max: 1250, title: { text: 'MWh' } },
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
    colors: ['#FF6F59'],
    series: dataupdated,
  };
  return (
    <div>
      <h3>Lost Load History</h3>
      <div className={styles.wrapperChartLostLoad}><HighchartsReact highcharts={Highcharts} options={options} /></div>
    </div>
  );
};

export default ChartLostLoad;
