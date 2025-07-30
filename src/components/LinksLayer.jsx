import { useEffect, useState, useRef } from "react";
import maplibregl from 'maplibre-gl';
import { useSelector } from 'react-redux';
import { getColorByPercentage } from "../utils/helper";
import MapModalBox from './MapModalBox';


const LinksLayer = ({ view, type, side, displaybox }) => {
  const [link, setLink] = useState(null);
  const [displaybox2, setDisplaybox] = useState(displaybox);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}links`;
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const hasFetchedRef = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    //if (!view || hasFetchedRef.current) return;
    if (!view) return;
    hasFetchedRef.current = true;

    const controller = new AbortController(); // for cleanup
    
    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((response) => {
        const links1 = JSON.parse(response.data[0]);
        const links2 = JSON.parse(response.data[1]);
        //console.log(links1);
        let x = 0;
        links1.forEach((item) => {
          const bus0 = item.bus0;
          const bus1 = item.bus1;
          const name = `${bus0} ${bus1}`;
          const name2 = item.Link;
          const id = name2;

          let l = Math.round(item.length);
          let color = "#E27728"; // fallback color
          let description = '';
          let pointA = null, pointB = null;
          let percentage = 0;

          const match = links2.find((el) => el.line_name === item.Link);

          if (match && item.Link !== 'TYNDP2020_33' && item.Link !== 'relation/3392010+2' && item.Link !== "relation/8184631+2") {

            const flow = match.line_flows;
            const flowAbs = Math.abs(flow);
            percentage = Math.round((flowAbs * 100) / (720 * item.p_nom));
            color = getColorByPercentage(percentage);

            if (percentage === 0) color = '#CCCCCC';

            description = `
              Carrier: ${item.carrier}<br>
              ${l} Km.<br>
              Flow: ${Math.round(flow)}<br>
              Link: ${item.Link}
            `;

            // Determine direction
            if (flow > 0) {
              pointA = [parseFloat(item.x), parseFloat(item.y)];
              pointB = [parseFloat(item.x_bus1), parseFloat(item.y_bus1)];
            } else {
              pointA = [parseFloat(item.x_bus1), parseFloat(item.y_bus1)];
              pointB = [parseFloat(item.x), parseFloat(item.y)];
            }
          }

          if (!pointA || !pointB) return; // skip if points are not valid

          const lineId = `link-line-${x}`;
          const sourceId = `link-source-${x}`;

          const route = {
            type: 'Feature',
            properties: { name: name2 },
            geometry: {
              type: 'LineString',
              coordinates: [pointA, pointB],
            },
          };

          if (!view.getSource(sourceId)) {
            //console.log(sourceId);
            view.addSource(sourceId, {
              type: 'geojson',
              data: route,
            });

            view.addLayer({
              id: lineId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': color,
                'line-width': 4, // or scale if needed
              },
            });

            view.on('click', lineId, (e) => {
                const feature = e.features?.[0];
                const featuresx = view.queryRenderedFeatures(e.point);
                if (!featuresx.length) return;
                const topFeature = featuresx[0];
                if (!topFeature.layer.id.startsWith('circle-layer')) {
                    setLink(feature.properties.name);
                    setDisplaybox(true);
                }
            });

            view.on('mouseenter', lineId, () => {
              view.getCanvas().style.cursor = 'pointer';
            });
            view.on('mouseleave', lineId, () => {
              view.getCanvas().style.cursor = '';
            });
            sourceListRef.current.push(sourceId);
            layersListRef.current.push(lineId);
            //layersListRef.current.push(lineId, arrowId);
          }
          x++;
        });
      })
      .catch((error) => console.error("Error fetching link data:", error));
      //}, 3000);
    isMounted.current = true;
    return () => {

      isMounted.current = false;

      layersListRef.current.forEach((layerId) => {
        if (view && view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      sourceListRef.current.forEach((sourceId) => {
        //console.log('Delete ' + sourceId);
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
      <MapModalBox bus="" line="" link={link} type={type} side={side} displaybox={displaybox2} />
    </div>
  );
};

export default LinksLayer;
