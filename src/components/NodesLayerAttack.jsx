import { useEffect, useState, useRef } from "react";
import styles from './NodesLayer.module.css';
import { removeStringFromKeys } from "../utils/helper";
import MapModalBox from './MapModalBox';

const NodesLayerAttack = ({ view, type, side, displaybox}) => {
  //console.log(displaybox);
  const [bus, setBus] = useState(null);
  const [displaybox2, setDisplaybox] = useState(displaybox);
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const isMounted = useRef(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}generators_in_country_attack`;
useEffect(() => {
  if (!view) return;
  let x = 0;

  fetch(url)
    .then((res) => res.json())
    .then((response) => {
      const buses = JSON.parse(response.data);
      let x = 0;
      let color = '#958382';
      let ray = 0;
      buses.forEach( (bus) => { 
          if (bus.attackable == 'Y') {color = '#0bb6e0';}
          else{color = '#958382';}
          const sourceId = `point${x}`;
          const layerId = `circle-layer${x}`;
          const long = bus.coordinates[0];
          const lat = bus.coordinates[1];
          //if(bus.ray_prod == 1 || bus.ray_prod == 2){ray = 7;}
          if(bus.ray_prod == 1 || bus.ray_prod == 2){ray = 8;}
          else if(bus.ray_prod == 3 || bus.ray_prod == 4){ray = 9;}
          else if(bus.ray_prod == 5 || bus.ray_prod == 6){ray = 10;}
          else if(bus.ray_prod == 7 || bus.ray_prod == 8){ray = 11;}
          else if(bus.ray_prod == 9 || bus.ray_prod == 10){ray = 12;}

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

            view.addLayer({
              id: layerId,
              type: 'circle',
              source: sourceId,
              metadata: { customId: bus.Id_bus },
              paint: {
                'circle-radius': ray,
                'circle-color': color,
                'circle-opacity': 1,
              },
            });
            if(color == '#0bb6e0'){
                view.on('click', layerId, function (e) {
                    const feature = e.features?.[0];
                    const featuresx = view.queryRenderedFeatures(e.point);
                    if (!featuresx.length) return;
                    const topFeature = featuresx[0];
                    if (topFeature.layer.id.startsWith('circle-layer')) {    
                        const coords = feature.geometry.coordinates;
                        const name = feature.layer.metadata?.customId || 'Unknown';
                        setBus(name);
                        setDisplaybox(true);
                    }
                });
                view.on('mouseenter', layerId, () => {
                view.getCanvas().style.cursor = 'pointer';
                });
                view.on('mouseleave', layerId, () => {
                view.getCanvas().style.cursor = '';
                });
            }
          }
          x++;
          sourceListRef.current.push(sourceId);
          layersListRef.current.push(layerId);
      });
    })
    .catch((err) => console.error("Failed to fetch generator data", err));

    isMounted.current = true;
    return () => {
      isMounted.current = false;

      layersListRef.current.forEach((layerId) => {
        if (view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      sourceListRef.current.forEach((sourceId) => {
        if (view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });

      // Optionally clear the refs
      layersListRef.current = [];
      sourceListRef.current = [];
    };
}, [view]);

  return (
    <div>
        <MapModalBox bus={bus} line="" link="" type={type} side={side} displaybox={displaybox2} />
        <div className={styles.legendAttack}>
            <div className={styles.boxg}><div className={styles.boxg2}></div><div>Attackable</div></div>
            <div className={styles.boxr}><div className={styles.boxr2}></div><div>Locked</div></div>
        </div>
    </div>
  );
};

export default NodesLayerAttack;
