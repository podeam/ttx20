import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const GenerationMix = () => { 
  const [data, setData] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url1 = `${API_BASE_URL}generation_country_carrier`;
  const url2 = `${API_BASE_URL}hydro`;

  useEffect(() => {
    fetch(url1)
    .then((res) => res.json())
    .then((response) => {
      let str = '[';
      let dataArray  = [];
      let data = JSON.parse(response.data);
      for (const [key, value] of Object.entries(data)) {
          str += '{"name": " ' + key + ' ", "data": ['
          for (const [key2, value2] of Object.entries(value)) {
              dataArray.push(Math.round(value2/1000));
          }
          str += dataArray.toString() + ']},';
          dataArray = [];
      }
      str = str.substring(0, (str.length-1));
      str += ']';
      fetch(url2)
      .then((res) => res.json())
      .then((response) => {
              let dataNew = JSON.parse(str);
              let gen_hydro_ee = response.gen_hydro['EE'];
              let gen_hydro_lt = response.gen_hydro['LT'];
              let gen_hydro_lv = response.gen_hydro['LV'];
              let gen_hydro = { name: 'hydro', data: [gen_hydro_ee, gen_hydro_lt, gen_hydro_lv]};
              dataNew.push(gen_hydro);
              let gen_phs_in_ee = response.phs_in['EE'];
              let gen_phs_in_lt = response.phs_in['LT'];
              let gen_phs_in_lv = response.phs_in['LV'];
              let gen_phs_in = { name: 'phs_in', data: [gen_phs_in_ee, gen_phs_in_lt, gen_phs_in_lv]};
              dataNew.push(gen_phs_in);
              let gen_phs_out_ee = response.phs_out['EE'];
              let gen_phs_out_lt = response.phs_out['LT'];
              let gen_phs_out_lv = response.phs_out['LV'];
              let gen_phs_out = { name: 'phs_out', data: [gen_phs_out_ee, gen_phs_out_lt, gen_phs_out_lv]};
              dataNew.push(gen_phs_out);
              const filteredData = dataNew
                  .filter(item => item.name.trim() !== '')
                  .map(item => ({ ...item, name: item.name.trim() }));
              //console.log(filteredData);
              //createBarChartStacked(filteredData);
              setData(filteredData);
              });
        });
    }, []);
  const options = {
    chart: {type: 'column', height: 650},
    title: {text: ''},
    colors: ['#491581', '#69CACF', '#2D6A1B', '#0012F5', '#0012F5', '#0012F5', '#000000', '#0012F5', '#F7D046', '#F7D046', '#808080'],
    xAxis: {categories: ['EE', 'LT', 'LV']},
    yAxis: {
        title: {text: ''},
        stackLabels: {enabled: true}
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: { enabled: true }
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.y === 0 ? null : this.y;
          }
        }
      }
    },    
    /*
    legend: {
        align: 'right',
        x: 70,
        verticalAlign: 'top',
        y: 70,
        floating: true,
        backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    */
    tooltip: {
        headerFormat: '<b>{category}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    series: data
  };
  return (
    <article>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </article>
  );
};

export default GenerationMix;
