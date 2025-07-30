import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import styles from './LinesLayer.module.css';
import { getColorByPercentage } from "../utils/helper";
import MapModalBox from './MapModalBox';

const LinesLayerAttack = ({ view, type, side, displaybox }) => {
  const [line, setLine] = useState(null);
  const [displaybox2, setDisplaybox] = useState(displaybox);
  const selectedTs = useSelector((state) => state.ts.selectedTs);
  const selectedTsValue = useSelector((state) => state.ts.selectedTsValue);
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const isMounted = useRef(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}lines_in_country`;

  useEffect(() => {
    if (!view) return;

    // Load arrow image only once
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

    const controller = new AbortController(); // for cleanup

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(response => {
        const lines = JSON.parse(response.data[0]);
        //console.log(lines);
        const countries = ["EE", "LV", "LT"];
        const linesAttack = ['181', '297', '295', '299', '301', '303', '180'];

        lines.forEach((line, x) => {
          const p1 = line.bus0.substr(0, 2);
          const p2 = line.bus1.substr(0, 2);
          const isInRegion = countries.includes(p1) || countries.includes(p2) || (p1 !== p2);
          if (!isInRegion) return;

          const bus0 = line.bus0_coordinates;
          const bus1 = line.bus1_coordinates;

          const flow = selectedTs === ''
            ? line.line_flows
            : line.line_flows_t[selectedTs];

          const percentage = selectedTs === ''
            ? Math.abs(line.average_utilization) * 100
            : Math.round(Math.abs(flow) * 100 / line.capacity);

          const pointA = flow > 0 ? [bus0.x, bus0.y] : [bus1.x, bus1.y];
          const pointB = flow > 0 ? [bus1.x, bus1.y] : [bus0.x, bus0.y];
          //const color = getColorByPercentage(percentage);
          const width = Math.max(1, Math.round(line.capacity / 1000));
          let color = '#958382';
          if (linesAttack.includes(line.line_name)) {
            color = '#0bb6e0';
          }
          else{
            color = '#958382';
          }

          const lineId = `line-${x}`;
          const arrowId = `arrow-layer-${x}`;
          const sourceId = `line-source-${x}`;

          const route = {
            type: 'Feature',
            properties: { name: line.line_name },
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
              paint: { 'line-color': color, 'line-width': width * 4 },
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
            if(color == '#0bb6e0'){
                view.on('click', lineId, (e) => {
                    const feature = e.features?.[0];
                    const featuresx = view.queryRenderedFeatures(e.point);
                    if (!featuresx.length) return;
                    const topFeature = featuresx[0];
                    if (!topFeature.layer.id.startsWith('circle-layer')) {                
                    setLine(feature.properties.name);
                    setDisplaybox(true);
                    }
                });
                view.on('mouseenter', lineId, () => {
                view.getCanvas().style.cursor = 'pointer';
                });
                view.on('mouseleave', lineId, () => {
                view.getCanvas().style.cursor = '';
                });
            }
          }
        sourceListRef.current.push(sourceId);
        layersListRef.current.push(lineId, arrowId);
        });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Error fetching lines:", err);
        }
      });

    isMounted.current = true;
    return () => {
      isMounted.current = false;

      // 🔁 Remove all layers first
      layersListRef.current.forEach((layerId) => {
        if (view && view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      // ✅ Now it's safe to remove sources
      sourceListRef.current.forEach((sourceId) => {
        if (view && view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });

      layersListRef.current = [];
      sourceListRef.current = [];
    };
  }, [view, selectedTs]);

  return (
    <div>
      <MapModalBox bus="" line={line} link="" type={type} side={side} displaybox={displaybox2} />
      {selectedTs !== '' && (
        <div className={styles.wrapperLL}>
          <p>{selectedTsValue}</p>
        </div>
      )}
    </div>
  );
};

export default LinesLayerAttack;
