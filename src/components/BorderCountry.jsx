import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentAction, updateAction } from '../store/actionSlice';

const BorderCountry = ({ view }) => {
  const [selectedCountries, setSelectedCountries] = useState('');
  //const [selectedCountries, setSelectedCountries] = useState([]);
  const selectedCountriesRef = useRef([]);
  const dispatch = useDispatch();

  const listActions = useSelector((state) => state.action.selectedActions);
  const op = useRef(0);

  useEffect(() => {
    selectedCountriesRef.current = selectedCountries;
  }, [selectedCountries]);

  useEffect(() => {
    if (!view) return;

    const layerId = 'baltic-fill';
    const highlightLayerId = 'baltic-fill-highlight';
    view.setPaintProperty(layerId, 'fill-color', '#0bb6e0'); 
    if (!view.getLayer(highlightLayerId)) {
      view.addLayer({
        id: highlightLayerId,
        type: 'fill',
        source: 'baltic',
        paint: {
          'fill-color': '#FF7758',
          'fill-opacity': 1,
        },
        filter: ['in', 'ISO2', ...selectedCountriesRef.current],
      });
    }

    const handleClick = (e) => {
      view.setPaintProperty('baltic-fill', 'fill-color', '#0bb6e0'); 
      const feature = e.features?.[0];
      if (!feature) return;
      const iso2 = feature.properties.ISO2;

      const prev = selectedCountriesRef.current;
      /*
      const updated = prev.includes(iso2)
        ? prev.filter(code => code !== iso2)
        : [...prev, iso2];
      view.setFilter(highlightLayerId, ['in', 'ISO2', ...updated]);
      */
      const updated = iso2;
      view.setFilter(highlightLayerId, ['in', 'ISO2', updated]);

      const newLastAction = { actionId: 4, type: 'C', name: updated, credit: 0, percentage: 0 };
      const lastIndex = listActions.length - 1;

      const actionObj = { actionId: 4, type: 'C', name: updated, carrier: '', credit: 0, actionNumber: 0, defenceStep: 0 }; 
      dispatch(setCurrentAction(actionObj));
/*
      if (op.current === 0) {
        //dispatch(addAction(newLastAction));
        const actionObj = { actionId: 4, type: 'C', name: updated, carrier: '', credit: 0, actionNumber: 0, defenceStep: 0 }; 
        dispatch(setCurrentAction(actionObj));
        op.current = 1;
      } else {
        dispatch(setCurrentAction({}));
        //dispatch(updateAction({ id: lastIndex, updates: newLastAction }));
      }
*/
      setSelectedCountries(updated); // This updates state AFTER everything else
    };

    view.on('click', layerId, handleClick);
    return () => {
      view.off('click', layerId, handleClick);

      if (view.getLayer(layerId)) {
        view.setPaintProperty(layerId, 'fill-color', '#594543'); // your initial color
      }

      if (view.getLayer(highlightLayerId)) {
        view.removeLayer(highlightLayerId);
      }
    };

  }, [view]);

  return null;
};

export default BorderCountry;
