import { useSelector, useDispatch } from 'react-redux';
import { setCountry } from '../store/countrySlice';
import styles from './Countries.module.css';

const Countries = () => {
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const countries = [
    { name: 'Estonia', code: 'EE' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Lithuania', code: 'LT' }
  ];
    return (
    <article className={styles.wrapperCountries}>
      <h3 className={ styles.title }>Affected countries</h3>
      {countries.map((country) => (
          <div key={country.code}><button
            key={country.code}
            className={`${ styles.country } ${selectedCountry === country.code  ? styles.active : ''}`}
            onClick={() => dispatch(setCountry(country.code))}
          >
            {country.name}
          </button></div>
        ))}
    </article>
  );
};

export default Countries;