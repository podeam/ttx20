import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getColorFromWhiteToRed } from "../utils/helper";
import voronoi_cells from "../utils/voronoi";

const PopulationAffectedVoronoi = ({ view }) => {
    const dispatch = useDispatch();
    const countries = useSelector((state) => state.country.countries);
    const selectedCountry = useSelector((state) => state.country.selectedCountry);
    const sourceListRef = useRef([]);
    const layers1ListRef = useRef([]);
    const layers2ListRef = useRef([]);
    const isMountedRef = useRef(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}lost_load`;

      useEffect(() => {
        console.log(selectedCountry);
        if (!view) return;
        isMountedRef.current = true;

        fetch(url)
            .then((res) => res.json())
            .then((response) => {
                if (!isMountedRef.current) return;
                let LostEnergyData = response.LostEnergyData;
                let layerIndex = 0;
                LostEnergyData.forEach((el) => {
                    let generator = el.Generator;
                    let lost_energy = el.Lost_Energy;
                    let toRemove = "lost-load";
                    let new_generator = generator.replace(toRemove, "");
                    if (lost_energy > 0) {
                        let percentage = Math.min(Math.round(lost_energy), 100);
                        let color = getColorFromWhiteToRed(percentage);
                        let x = 0;
                        voronoi_cells.forEach((el) => {
                            let busname = el.Name;
                            let coords = el.Coordinates;
                            if (new_generator === busname && (selectedCountry == '' || selectedCountry == busname.substring(0,2) )) {
                            
                            //console.log(coords);
                            
                            const geojsonPolygon = {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "Polygon",
                                    coordinates: coords,
                                },
                            };
                            const sourceId = `voronoi-source-${layerIndex}`;
                            const layerFillId = `voronoi-fill-${layerIndex}`;
                            const layerOutlineId = `voronoi-outline-${layerIndex}`;

                            view.addSource(sourceId, {
                                type: "geojson",
                                data: geojsonPolygon
                            });
                            view.addLayer({
                                id: layerFillId,
                                type: "fill",
                                source: sourceId,
                                paint: {
                                    "fill-color": color,
                                    "fill-opacity": 0.4,
                                    },
                                });
                            view.addLayer({
                                id: layerOutlineId,
                                type: "line",
                                source: sourceId,
                                paint: {
                                    "line-color": color,
                                    "line-width": 2,
                                    },
                                });
                            sourceListRef.current.push(sourceId);
                            layers1ListRef.current.push(layerFillId);
                            layers2ListRef.current.push(layerOutlineId);
                            layerIndex++;
                            }
                        });
                    }
                });
            })
            .catch((error) =>
                console.error("Error fetching lost_load data:", error)
            );

        return () => {
            isMountedRef.current = false;

            // Clean up all added layers and sources
            layers1ListRef.current.forEach((layerId) => {
                if (view.getLayer(layerId)) {
                    view.removeLayer(layerId);
                }
            });

            layers2ListRef.current.forEach((layerId) => {
                if (view.getLayer(layerId)) {
                    view.removeLayer(layerId);
                }
            });

            sourceListRef.current.forEach((sourceId) => {
                if (view.getSource(sourceId)) {
                    view.removeSource(sourceId);
                }
            });

            // Clear refs
            layers1ListRef.current = [];
            layers2ListRef.current = [];
            sourceListRef.current = [];
        };
    }, [view, selectedCountry]);

    return null;
};

export default PopulationAffectedVoronoi;
