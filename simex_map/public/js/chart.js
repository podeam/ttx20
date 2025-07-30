function createLineChartData(data, target, title='', categories=''){
    /*
    categories = categories.map(ts => {
        ts = parseInt(ts);
        date = new Date(ts);
        return date.toISOString().slice(0, 16).replace("T", " ");
    });
    */
    Highcharts.chart(target, {
        title: {text: title },
        xAxis: {
            categories: categories,
            labels: {
                step: 1,
                rotation: -45,
                formatter: function () {
                    return Highcharts.dateFormat('%H:%M', this.value);
                }
            }
        },
        yAxis: {
            title: {text: '' }
            },
        series: data,
    }); 
}
function createLineChart(table, target, title=''){
    Highcharts.chart(target, {
        data: {
            table: table,
        },
        chart: {
            type: 'line'
        },
        title: {
            text: title
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true 
                    }
                }
            }
        });
    }
function createBarChartStacked(data){
    Highcharts.chart('countryCarrier', {
    chart: {type: 'column', height: 800},
    title: {text: ''},
    xAxis: {categories: ['EE', 'LT', 'LV']},
    yAxis: {
        min: 0,
        title: {text: ''},
        stackLabels: {enabled: true}
    },
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
    tooltip: {
        headerFormat: '<b>{category}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: { enabled: true }
        }
    },
    series: data
    });
}
function createBarChart(data, categories, target, title){
    Highcharts.chart(target, {
    chart: {
        type: 'column'
    },
    title: {
        text: title
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
            description: 'Countries'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    tooltip: {
        valueSuffix: ''
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: data
});
}
