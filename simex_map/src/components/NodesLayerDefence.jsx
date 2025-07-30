import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import styles from './NodesLayer.module.css';
import { removeStringFromKeys } from "../utils/helper";
import MapModalBox from './MapModalBox';

const NodesLayerDefence = ({ view, type, side }) => {
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const iconLayersRef = useRef([]);
  const [bus, setBus] = useState('');
  const [displaybox, setDisplayBox] = useState(false);
  const selectedTargets = useSelector((state) => state.attack.previousAttackActions);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}generators_in_country`;

  useEffect(() => {
    if (bus) setDisplayBox(true);
  }, [bus]);

  useEffect(() => {
    if (!view) return;

    let cancelled = false;
    let x = 0;
    const color = '#0bb6e0';
    fetch(url)
      .then((res) => res.json())
      .then((response) => {
        if (cancelled) return;

        const buses = JSON.parse(response.data[0]);
        const generators = JSON.parse(response.data[1]);
        const buses3 = JSON.parse(response.data[3]);
        let lostload = removeStringFromKeys(JSON.parse(response.data[4]), 'lost-load');

        const jsonObject = buses.x;
        const jsonObjecty = buses.y;

        Object.keys(jsonObject).forEach((key) => {
          if (generators[x]?.[0] !== key) return;

          const long = jsonObject[key];
          const lat = jsonObjecty[key];
          const lostloadvalue = parseFloat(lostload[key] || 0);
          const radius = Math.max(buses.ray_load?.[key] || 1, 1);
//console.log(lat + ' ' + long + ' ' + key );
          
          //if (lostloadvalue > 0) color = '#fa5757';
          //else if (lostloadvalue !== 0) color = 'orange';

          const sourceId = `point${x}`;
          const circleLayerId = `circle-layer${x}`;
          const iconLayerId = `icon-layer${x}`;
          if (!view.getSource(sourceId)) {
            view.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [long, lat],
                },
              },
            });

            const shouldAddIcon = selectedTargets[0]?.some(item => item.currentElementNode === key);
            if (shouldAddIcon) {
              //console.log(key);
              view.addLayer({
                id: iconLayerId,
                type: "symbol",
                source: sourceId,
                layout: {
                  "icon-image": "custom-marker",
                  "icon-size": 1,
                  "icon-anchor": "bottom"
                }
              });
              iconLayersRef.current.push(iconLayerId);
            }


            view.addLayer({
              id: circleLayerId,
              type: 'circle',
              source: sourceId,
              metadata: { customId: key },
              paint: {
                'circle-radius': radius * 2,
                'circle-color': color,
                'circle-opacity': 1,
              },
            });

            view.on('click', circleLayerId, function (e) {
              const feature = e.features?.[0];
              const topFeature = view.queryRenderedFeatures(e.point)[0];
              if (topFeature?.layer?.id.startsWith('circle-layer')) {
                const name = feature?.layer?.metadata?.customId || 'Unknown';
                setBus(name);
                setDisplayBox(true);
              }
            });

            view.on('mouseenter', circleLayerId, () => {
              view.getCanvas().style.cursor = 'pointer';
            });
            view.on('mouseleave', circleLayerId, () => {
              view.getCanvas().style.cursor = '';
            });

            sourceListRef.current.push(sourceId);
            layersListRef.current.push(circleLayerId);
          }

          x++;
        });
      })
      .catch((err) => console.error("Failed to fetch generator data", err));

    return () => {
      cancelled = true;

      [...layersListRef.current, ...iconLayersRef.current].forEach((layerId) => {
        if (view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      sourceListRef.current.forEach((sourceId) => {
        if (view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });

      layersListRef.current = [];
      iconLayersRef.current = [];
      sourceListRef.current = [];
    };
  }, [view]);

  return (
    <div>
      <MapModalBox bus={bus} line="" link="" type={type} side={side} displaybox={displaybox} />

      <div className={styles.legend}>
        <p>Max</p>
        <div className={styles.box} id={styles.box1}></div>
        <div className={styles.box} id={styles.box2}></div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className={styles.box}></div>
        ))}
        <div className={styles.box} id={styles.box10}></div>
        <p>0%</p>
      </div>
      {/*
      <div className={styles.legend2}>
        <div className={styles.boxg}>
          <div className={styles.boxg2}></div>
          <div>Lost N</div>
        </div>
        <div className={styles.boxr}>
          <div className={styles.boxr2}></div>
          <div>Lost Y</div>
        </div>
      </div>
      */}
    </div>
  );
};

export default NodesLayerDefence;
