import { useEffect, useState, useRef } from "react";
import maplibregl from 'maplibre-gl';
import { useSelector } from 'react-redux';
import styles from './LinesLayer.module.css';
import { getColorByPercentage } from "../utils/helper";
import MapModalBox from './MapModalBox';

const LinesLayerDefence = ({ view, type, side, displaybox }) => {
  const [line, setLine] = useState(null);
  const [displaybox2, setDisplaybox2] = useState(displaybox);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}lines_in_country`;
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const selectedTsValue = useSelector((state) => state.ts.selectedTsValue);

  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const listenersRef = useRef([]);

  useEffect(() => {
    if (!view) return;

    const abortController = new AbortController();

    const loadArrowImage = () => {
      if (!view.hasImage('arrow')) {
        view.loadImage('/images/arrow.png', (error, image) => {
          if (error || !image) {
            console.error("Failed to load arrow image:", error);
            return;
          }
          if (!view.hasImage('arrow')) {
            view.addImage('arrow', image);
          }
        });
      }
    };

    const fetchAndAddLines = async () => {
      try {
        loadArrowImage();
        const res = await fetch(url, { signal: abortController.signal });
        const response = await res.json();
        const lines = JSON.parse(response.data[0]);

        const countries = ["EE", "LV", "LT"];

        lines.forEach((lineItem, idx) => {
          const p1 = lineItem.bus0.substr(0, 2);
          const p2 = lineItem.bus1.substr(0, 2);
          const isInRegion = countries.includes(p1) || countries.includes(p2) || (p1 !== p2);
          if (!isInRegion) return;

          const { bus0_coordinates: bus0, bus1_coordinates: bus1 } = lineItem;

          const flow = selectedTs === ''
            ? lineItem.line_flows
            : lineItem.line_flows_t[selectedTs];

          const percentage = selectedTs === ''
            ? Math.abs(lineItem.average_utilization) * 100
            : Math.round(Math.abs(flow) * 100 / lineItem.capacity);

          const pointA = flow > 0 ? [bus0.x, bus0.y] : [bus1.x, bus1.y];
          const pointB = flow > 0 ? [bus1.x, bus1.y] : [bus0.x, bus0.y];
          const color = '#0bb6e0'; //getColorByPercentage(percentage);
          const width = Math.max(1, Math.round(lineItem.capacity / 1000));

          const lineId = `line-${idx}`;
          const arrowId = `arrow-layer-${idx}`;
          const sourceId = `line-source-${idx}`;
//console.log(bus0.x + ' ' + bus0.y + ' ' + bus1.x + ' ' + bus1.y + ' ' + lineItem.line_name);
          const route = {
            type: 'Feature',
            properties: { name: lineItem.line_name },
            geometry: {
              type: 'LineString',
              coordinates: [pointA, pointB],
            },
          };

          if (!view.getSource(sourceId)) {
            view.addSource(sourceId, {
              type: 'geojson',
              data: route,
            });

            view.addLayer({
              id: lineId,
              type: 'line',
              source: sourceId,
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': color, 'line-width': width * 3 },
            });

            view.addLayer({
              id: arrowId,
              type: 'symbol',
              source: sourceId,
              layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 100,
                'icon-image': 'arrow',
                'icon-size': 0.5,
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
              },
            });

            const clickHandler = (e) => {
              const feature = e.features?.[0];
              if (feature && feature.properties?.name) {
                setLine(feature.properties.name);
                setDisplaybox2(true);
              }
            };

            view.on('click', lineId, clickHandler);
            listenersRef.current.push({ type: 'click', layerId: lineId, handler: clickHandler });

            view.on('mouseenter', lineId, () => {
              view.getCanvas().style.cursor = 'pointer';
            });
            listenersRef.current.push({ type: 'mouseenter', layerId: lineId, handler: () => {
              view.getCanvas().style.cursor = 'pointer';
            }});

            view.on('mouseleave', lineId, () => {
              view.getCanvas().style.cursor = '';
            });
            listenersRef.current.push({ type: 'mouseleave', layerId: lineId, handler: () => {
              view.getCanvas().style.cursor = '';
            }});

            sourceListRef.current.push(sourceId);
            layersListRef.current.push(lineId, arrowId);
          }
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching or adding lines:", err);
        }
      }
    };

    fetchAndAddLines();

    return () => {
      //abortController.abort();

      listenersRef.current.forEach(({ type, layerId, handler }) => {
        if (view && view.off) {
          view.off(type, layerId, handler);
        }
      });
      listenersRef.current = [];

      layersListRef.current.forEach((layerId) => {
        if (view && view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });
      layersListRef.current = [];

      sourceListRef.current.forEach((sourceId) => {
        if (view && view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });
      sourceListRef.current = [];
    };
  }, [view, selectedTs]);

  return (
    <div>
      <MapModalBox
        bus=""
        line={line}
        link=""
        type={type}
        side={side}
        displaybox={displaybox2}
      />
      {selectedTs !== '' && (
        <div className={styles.wrapperLL}>
          <p>{selectedTsValue}</p>
        </div>
      )}
    </div>
  );
};

export default LinesLayerDefence;
