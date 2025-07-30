import { useEffect, useRef } from "react";
import { getColorFromScale } from "../utils/helper";
import { useDispatch, useSelector } from 'react-redux';
import "@arcgis/core/assets/esri/themes/light/main.css";

const PopulationData = ({ view }) => {
  const dispatch = useDispatch();
  const countries = useSelector((state) => state.country.countries);
  const selectedCountry = useSelector((state) => state.country.selectedCountry);
  const hasFetchedRef = useRef(false);
  const sourceListRef = useRef([]);
  const layers1ListRef = useRef([]);
  const layers2ListRef = useRef([]);
  const isMounted = useRef(true);


  useEffect(() => {
    //console.log(selectedCountry);
    if (!view) return;
    if (!view || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/js/baltic_states_eurostat_info.json")
    .then((res) => res.json())
    .then((data) => {
        let coords, color, name, info;
        const t = 'TOTAL_POP';
        const values = data.map(item => item[t]);
        const minPop = Math.min(...values);
        const maxPop = Math.max(...values);
        let x = 0;
        data.forEach((el)=>{
            if(el.CNTR_CODE == selectedCountry || selectedCountry == ''){
                coords = [el.geometry];
                color = getColorFromScale(el[t], minPop, maxPop);
                name = el.DATE;
                info = el.t;
                //console.log(x);
                //console.log(coords);
                
                const geojsonPolygon = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: coords,
                    },
                };
                const sourceId = "polygon-source-" + x;
                const layer1Id = "polygon-fill-" + x;
                const layer2Id = "polygon-outline-" + x;

                view.addSource(sourceId, {
                    type: "geojson",
                    data: geojsonPolygon
                });
                view.addLayer({
                    id: layer1Id,
                    type: "fill",
                    source: sourceId,
                    paint: {
                        "fill-color": color,
                        "fill-opacity": 0.4,
                        },
                    });
                view.addLayer({
                    id: layer2Id,
                    type: "line",
                    source: sourceId,
                    paint: {
                        "line-color": color,
                        "line-width": 2,
                        },
                    });
                sourceListRef.current.push(sourceId);
                layers1ListRef.current.push(layer1Id);
                layers2ListRef.current.push(layer2Id);
                }
            x++;
        });
    })
    .catch((error) => console.error("Error fetching line data:", error));

    isMounted.current = true;
    return () => {
    if (!view) return;

    layers1ListRef.current.forEach((layerId) => {
        try {
        if (view.getLayer(layerId)) {
            view.removeLayer(layerId);
        }
        } catch (e) {
        console.warn(`Failed to remove layer ${layerId}`, e);
        }
    });

    layers2ListRef.current.forEach((layerId) => {
        try {
        if (view.getLayer(layerId)) {
            view.removeLayer(layerId);
        }
        } catch (e) {
        console.warn(`Failed to remove layer ${layerId}`, e);
        }
    });

    sourceListRef.current.forEach((sourceId) => {
        try {
        if (view.getSource(sourceId)) {
            view.removeSource(sourceId);
        }
        } catch (e) {
        console.warn(`Failed to remove source ${sourceId}`, e);
        }
    });

    layers1ListRef.current = [];
    layers2ListRef.current = [];
    sourceListRef.current = [];
    };

  }, [view, selectedCountry]);
  return null;
};

export default PopulationData;
