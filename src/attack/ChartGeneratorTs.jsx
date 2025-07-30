import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import styles from './ChartGeneratorTs.module.css';
const ChartGeneratorTs = ({dataupdated, categories, type}) => { 
  const options = {
    chart: { type: 'column', zoomType: 'x', height: 150, events:{
      load: function(){
        this.customIcons = [];
      }
    }},
    title: { text: '' },
    xAxis: { categories: categories, tickInterval: 168},
    yAxis: { title: { text: 'MW' }},
    legend: { enabled: false },
    credits: { enabled: false },
    colors: ['#3C9BF4'],
    series: dataupdated,
  };
  return (
    <div className={styles.wrapperChartGeneratorTs}>
      <h3 className={styles.title}>{type} History</h3>
      <div><HighchartsReact highcharts={Highcharts} options={options} /></div>
    </div>
  );
};

export default ChartGeneratorTs;
