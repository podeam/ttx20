import { useEffect, useState, useRef } from "react";
import styles from './NodesLayer.module.css';
import { removeStringFromKeys } from "../utils/helper";
import MapModalBoxResults from './MapModalBoxResults';
import Legend from './Legend';
import Legend2 from './Legend2';

const NodesLayer = ({ view, type, side, displaybox}) => {
  //console.log(view);
  const [bus, setBus] = useState(null);
  const [displaybox2, setDisplaybox] = useState(displaybox);
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const isMounted = useRef(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}generators_in_country`;
  useEffect(() => {
    //console.log(view);
  if (!view) {
      return;
  }

  let x = 0;

  fetch(url)
    .then((res) => res.json())
    .then((response) => {
      const buses = JSON.parse(response.data[0]);
      const generators = JSON.parse(response.data[1]);
      const buses3 = JSON.parse(response.data[3]);
      let lostload = JSON.parse(response.data[4]);
      lostload = removeStringFromKeys(lostload, 'lost-load');

      const jsonObject = buses.x;
      const jsonObjecty = buses.y;

      Object.keys(jsonObject).forEach((key) => {
        if (generators[x]?.[0] === key) {
          const long = jsonObject[key];
          const lat = jsonObjecty[key];

          const lostloadvalue = parseFloat(lostload[key] || 0);
          const value = Math.round(buses3?.[0]?.[key] || 0);
          const radius = Math.max(buses['ray_load'][key] || 1, 1);

          let color = 'rgba(181, 216, 57, 1)';
          if (lostloadvalue > 0) color = 'rgba(250, 87, 87, 1)';
          else if (lostloadvalue !== 0) color = 'orange';

          const sourceId = `point${x}`;
          const layerId = `circle-layer${x}`;

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
              metadata: {
                customId: key,
              },
              paint: {
                'circle-radius': radius * 1.25,
                'circle-color': color,
                'circle-opacity': 1,
              },
            });
            sourceListRef.current.push(sourceId);
            layersListRef.current.push(layerId);

            /**/ 
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
            /**/
          }
          x++;
        }
      });
    })
    .catch((err) => console.error("Failed to fetch generator data", err));

    isMounted.current = true;
    return () => {
      isMounted.current = false;
      layersListRef.current.forEach((layerId) => {
        //console.log(typeof view.getLayer);
        if (view && typeof view.getLayer === 'function') {
            //console.log(view.getLayer(layerId));
            const layer = view.getLayer(layerId);
            if (layer) {
                view.removeLayer(layerId);
            }
        }
        /*
        if (view && view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
        */
      });

      sourceListRef.current.forEach((sourceId) => {
        if (view && typeof view.getSource === 'function') {
            const layer = view.getLayer(sourceId);
            if (layer) {
                view.removeLayer(sourceId);
            }
        }
        if (view && view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });

      layersListRef.current = [];
      sourceListRef.current = [];
    };
}, [view]);

  return (
    <div>
        <MapModalBoxResults bus={bus} line="" link="" type={type} side={side} displaybox={displaybox2} />
        <Legend />
        <Legend2 />
    </div>
  );
};

export default NodesLayer;
