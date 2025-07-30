import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSelector, useDispatch } from 'react-redux';
import styles from './ChartLostLoadModal.module.css';

const ChartLostLoad = ({dataupdated, categories}) => {
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const countryName = useSelector((state) => state.country.countryName);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const selectedTsValue = useSelector((state) => state.ts.selectedTsValue);
  
  const options = {
    chart: { type: 'column', zoomType: 'x', height: 150, events:{
      load: function(){
        this.customIcons = [];
      }
    }},
    title: { text: '' },
    xAxis: { categories: categories, tickInterval: 168},
    yAxis: { min: 0, max: 1250, title: { text: 'MW' }},
    legend: { enabled: false },
    credits: { enabled: false },
    plotOptions: {
      series: {
          point: {
              events: {
                /*
                  click: function () {
                      dispatch(setTs(this.x));
                      dispatch(setTsValue(categories[this.x]));
                      let chart = this.series.chart;
                      chart.customIcons.forEach(icon => icon.destroy());
                      chart.customIcons = [];
                      let icon = chart.renderer.image(
                        'https://cdn-icons-png.flaticon.com/128/1828/1828817.png',
                        this.plotX + chart.plotLeft - 10,
                        this.plotY + chart.plotTop - 40,
                        20, 20
                      ).add();
                      chart.customIcons.push(icon);
                    }
                */
                }
            }
        }
    },
    colors: ['#FF6F59'],
    series: dataupdated,
  };
  return (
    <div className={styles.wrapperChartLostLoad}>
      <div><HighchartsReact highcharts={Highcharts} options={options} /></div>
    </div>
  );
};

export default ChartLostLoad;
