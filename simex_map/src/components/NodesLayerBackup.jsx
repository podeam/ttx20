import React, { useEffect } from "react";
import { loadModules } from "esri-loader";
import "@arcgis/core/assets/esri/themes/light/main.css";
import styles from './NodesLayer.module.css';
import { removeStringFromKeys } from "../utils/helper";
import MapModalBox from './MapModalBox';

const NodesLayer = ({ view, bus, type }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}generators_backup`;
    useEffect(() => {
    if (!view) return;
    let graphicsLayer;
    loadModules(["esri/Graphic", "esri/layers/GraphicsLayer"]).then(([Graphic, GraphicsLayer]) => {
      graphicsLayer = new GraphicsLayer();
      view.map.add(graphicsLayer);
      fetch(url)
        .then((res) => res.json())
        .then((response) => {
            const buses = JSON.parse(response.data[0]);
            const generators = JSON.parse(response.data[1]);
            //const buses2 = JSON.parse(response.data[2]);
            //const buses3 = JSON.parse(response.data[3]);
            console.log(buses);
            const jsonObject = buses.x;
            const jsonObjecty = buses.y;
            let x = 0, v = 0, value = 0, w = 0, lostloadvalue = 0, color = '', long = 0, lat = 0, description = '';
            Object.keys(jsonObject).forEach(key => {
                if(generators[x][0] == key){
                    if (buses && buses[0] && buses[key]) {
                        v = Math.round(buses[0][key]);
                        }
                    else{
                        v = 0;
                        }
                    value = v;
                    long = jsonObject[key];
                    lat = jsonObjecty[key];
                    color = 'green';
                    w = buses['ray_load'][key];
                    if( w < 1 ) { w = 1; }

                    const point = {
                        type: "point",
                        longitude: long,
                        latitude: lat
                        };
                    const simpleMarkerSymbol = {
                        type: "simple-marker",
                        color: color,
                        outline: {
                            color: color,
                            width: w
                        }
                    };
                    const myBus = {
                        type: 'bus',
                        title: key,
                        value: value
                    }
                    const pointGraphic = new Graphic({
                        geometry: point,
                        symbol: simpleMarkerSymbol,
                        attributes: myBus
                        });
                    graphicsLayer.add(pointGraphic);
                    x++;
                    }
                else{
                    //console.log(0);
                    }
                });
        })
        .catch((error) => console.error("Error fetching line data:", error));
    });

    return () => {
      if (graphicsLayer) view.map.remove(graphicsLayer);
    };
  }, [view]);
  return (
    <div>
        <MapModalBox bus={bus} type={type} />
    </div>
  );
};

export default NodesLayer;
