import styles from './LineData.module.css';
import ChartGeneratorTs from './ChartGeneratorTs';

const LineData = ({gendata, flowseries, timeseries}) => {
    const keys = timeseries;
    const values = flowseries;
    const datachart =[{
      name: "Line history",
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
                <p className={styles.title}><span className={styles.text}>{ gendata.buses.from } - { gendata.buses.to }</span></p>
                <p className={styles.title}>Length<br /><span className={styles.text}>{ Math.round(gendata.length) }Km.</span></p>
                <p className={styles.title}>Capacity<br /><span className={styles.text}>{ Math.round(gendata.capacity) } MW</span></p>
            </div>
            {/*
            <div className={styles.wrapperData2}>
                <p className={styles.title}>Avg flow per day<br /><span className={styles.text}>{ Math.round(gendata.avg_flow_per_day) } MW</span></p>
                <p className={styles.title}>Min flow<br /><span className={styles.text}>{ Math.round(gendata.min_flow) } MW</span></p>
                <p className={styles.title}>Max flow<br /><span className={styles.text}>{ Math.round(gendata.max_flow) } MW</span></p>
            </div>
            */}
          </div>
          <div><ChartGeneratorTs dataupdated={datachart} categories={categories} type="Line" /></div>
        </div>
      );
};

export default LineData;

