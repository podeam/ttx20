import { useEffect, useRef } from "react";
import {calculateOffsetPoint, getColorByPercentage } from "../utils/helper";
import "@arcgis/core/assets/esri/themes/light/main.css";

const BaseFlow = ({ view }) => {
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const isMounted = useRef(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = `${API_BASE_URL}flow_between_countries`;

  useEffect(() => {
    if (!view) return;
    fetch(url)
    .then((res) => res.json())
    .then((response) => {
        //console.log(response);
        let data = JSON.parse(response.data);
        let countries = data.countries;
        //console.log(typeof(countries));
        //console.log(countries);
        let flow = data.flow_from_to;
        const array =[
            {"DE": [10.4515, 51.1657]},
            {"PL": [19.1451, 51.9194]},
            {"DK": [9.5018, 56.2639] },
            {"SE": [18.6435, 60.1282]}, 
            {"EE": [25.0237, 58.5975]},
            {"LV": [24.1050, 56.9462]},
            {"FI": [24.9458, 60.1920]},
            {"NO": [12.7522, 64.5830]},
            {"LT": [25.2796, 54.6871]}
        ]
        let countryCode1, coords1, countryCode2, coords2, myflow, item, result1, result2, color, nameline, wl, i = 0, description, width;
        for (let key in countries) {
            item = countries[key];
            if(flow[i] > 0){
                countryCode1 = item[0];
                countryCode2 = item[1];
                }
            else{
                countryCode1 = item[1];
                countryCode2 = item[0];
            }
            coords1 = [];
            coords2 = [];
            result1 = array.find(obj => obj.hasOwnProperty(countryCode1));
            coords1 = result1 ? result1[countryCode1] : undefined;
            result2 = array.find(obj => obj.hasOwnProperty(countryCode2));
            coords2 = result2 ? result2[countryCode2] : undefined;
            if(coords1 != undefined && coords2 != undefined){
                myflow = Math.round(Math.abs(flow[i])/1000);
                color =  'orange'; 
                nameline = countryCode1 + ' ' + countryCode2
                description = ''
                wl = Math.round(myflow/300);
                if(wl == 0 && myflow > 0) { wl = 1; }
                if(isNaN(wl)) { wl = 1; }
                /*
                coords = calculateOffsetPoint(coords1, coords2, 0.1);
                coords2 = [coords[0], coords[1]];
                mypaths = [coords1, coords2]
                */
                /******************************************************************* */
                const lineId = `line-${i}`;
                const arrowId = `arrow-layer-${i}`;
                const sourceId = `line-source-${i}`;

                const route = {
                    type: 'Feature',
                    properties: { name: nameline },
                    geometry: {
                    type: 'LineString',
                    coordinates: [coords1, coords2],
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
                    paint: { 'line-color': color, 'line-width': wl * 4 },
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
                    sourceListRef.current.push(sourceId);
                    layersListRef.current.push(lineId, arrowId);
                }
                /******************************************************************* */
                /*
                const polyline = {
                    type: "polyline",
                    paths: [mypaths]
                    };
                const lineSymbol = {
                    type: "simple-line",
                    color: color,
                    width: wl,
                    marker: {
                        type: "line-marker",
                        placement: "end",
                        size: 15
                    }
                };
                const myLine = {
                    type: 'line',
                    title: nameline,
                    description: description
                }
                const polylineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: lineSymbol,
                    attributes: myLine
                    });
                graphicsLayer.add(polylineGraphic);
                */
                i++;
                }
            }
    })
    .catch((error) => console.error("Error fetching line data:", error));
    isMounted.current = true;
    return () => {
      isMounted.current = false;

      // 🔁 Remove all layers first
      layersListRef.current.forEach((layerId) => {
        if (view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      // ✅ Now it's safe to remove sources
      sourceListRef.current.forEach((sourceId) => {
        if (view.getSource(sourceId)) {
          view.removeSource(sourceId);
        }
      });

      layersListRef.current = [];
      sourceListRef.current = [];
    };
  }, [view]);
  return null;
};

export default BaseFlow;
