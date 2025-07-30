import { useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import LinesLayer from "./LinesLayer";
import LinesLayerAttack from "./LinesLayerAttack";
import LinesLayerDefence from "./LinesLayerDefence";
import LinksLayer from "./LinksLayer";
import LinksLayerAttack from "./LinksLayerAttack";
import LinksLayerDefence from "./LinksLayerDefence";
import NodesLayer from "./NodesLayer";
import NodesLayerAttack from "./NodesLayerAttack";
import NodesLayerDefence from "./NodesLayerDefence";
import NodesLayerDefenceNewPP from "./NodesLayerDefenceNewPP";
import NodesLayerDefenceBackupGen from "./NodesLayerDefenceBackupGen";
import BaseFlow from "./BaseFlow";
import BorderCountry from "./BorderCountry";
// import PopulationAffectedVoronoi from './PopulationAffectedVoronoi';
import PopulationData from './PopulationData';

const BalticsMap = ({ mycomponent, side, displaybox }) => {
  //console.log(mycomponent);
  const mapContainer = useRef(null);
  const mapRef = useRef(null); // <== persist map instance
  const [view, setView] = useState(null);
  const selectedCountry = useSelector((state) => state.country.selectedCountry);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          glyphs: '/font/{fontstack}/{range}.pbf',
          sources: {},
          layers: [],
        },
        center: [21, 57],
        zoom: 5,
        maxZoom: 7,
        attributionControl: false,
      });

      map.scrollZoom.disable();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

      map.on('style.load', () => {
        map.addLayer({
          id: 'background-color',
          type: 'background',
          paint: { 'background-color': '#1D2224' },
        });
      });

      map.on('load', async () => {
        const arrowImage = await map.loadImage('/images/arrow.png');
        map.addImage('arrow', arrowImage.data);

        const targetIcon = await map.loadImage('/images/attackSite.png');
        map.addImage('custom-marker', targetIcon.data);

        const europeData = await fetch('/europe.geojson').then(res => res.json());
        map.addSource('europe', { type: 'geojson', data: europeData });
        map.addLayer({
          id: 'europe-fill',
          type: 'fill',
          source: 'europe',
          paint: { 'fill-color': '#39394C', 'fill-opacity': 1 },
        });
        map.addLayer({
          id: 'europe-line',
          type: 'line',
          source: 'europe',
          paint: { 'line-color': '#1D2224', 'line-width': 1 },
        });

        const balticData = await fetch('/europe_01.geojson').then(res => res.json());
        map.addSource('baltic', { type: 'geojson', data: balticData });
        map.addLayer({
          id: 'baltic-fill',
          type: 'fill',
          source: 'baltic',
          paint: { 'fill-color': '#594543', 'fill-opacity': 1 },
        });
        map.addLayer({
          id: 'baltic-line',
          type: 'line',
          source: 'baltic',
          paint: { 'line-color': '#1D2224', 'line-width': 2 },
        });

        map.addSource('country-centroids', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [ /* your hardcoded centroids */ ]
          }
        });

        map.addLayer({
          id: 'country-labels',
          type: 'symbol',
          source: 'country-centroids',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 16,
            'text-font': ['Open Sans Regular'],
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#EEEEEE'
          }
        });

        // Add highlight layer once on load
        map.addLayer({
          id: 'baltic-line-highlight',
          type: 'line',
          source: 'baltic',
          paint: {
            'line-color': '#FF0000',
            'line-width': 3,
          },
          filter: ['==', 'ISO2', ''],
        });

        setView(map);
        mapRef.current = map;
      });
    }

    return () => {
      //mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    //console.log(selectedCountry);
    const map = mapRef.current;
    if (!map || !map.getLayer('baltic-line-highlight')) return;
    map.setFilter('baltic-line-highlight', ['==', ['get', 'ISO2'], selectedCountry || '']);
    /*****************************************DEBUG */
    /*
    if (map && map.getStyle) {
      const allLayers = map.getStyle().layers;
      console.log("All layer IDs:", allLayers.map(layer => layer.id));
    }    
    */
    /*****************************************DEBUG */
    if(mycomponent == 'DE' || mycomponent == 'DEBG' || mycomponent == 'DENPP' || mycomponent == 'DEL' || mycomponent == 'DELK' ){
      if (map.getLayer('baltic-line-highlight')) {
        map.removeLayer('baltic-line-highlight');
      }
      if (map.getLayer('baltic-fill-highlight')) {
        map.removeLayer('baltic-fill-highlight');
      }
    }

  }, [selectedCountry,mycomponent]);
/*
setTimeout(() => {
const layers = view.getStyle().layers;
console.log(layers);
}, 5000);
*/
  return (
    <div>
      <div
        style={{ width: "890px", height: "636px", marginTop: "10px", position: "relative", borderRadius: "0 0 10px 10px" }}
        ref={mapContainer}
      >
        {mycomponent === "A" && view && (
          <>
            <LinesLayer view={view} side={side} type="X" displaybox={displaybox} />
            <NodesLayer view={view} side={side} type="X" displaybox={displaybox} />
            <LinksLayer view={view} side={side} type="X" displaybox={displaybox} />
          </>
        )}
        {mycomponent === "B" && view && <BaseFlow view={view} />}
        {mycomponent === "D" && view && <PopulationData view={view} />}
        {mycomponent === "LK" && view && <LinksLayer view={view} type="X" side={side} displaybox={displaybox} />}
        {mycomponent === "L" && view && <LinesLayer view={view} type="X" side={side} displaybox={displaybox} />}
        {mycomponent === "N" && view && <NodesLayerDefence view={view} type="N" side={side} displaybox={displaybox} />}
        {mycomponent === "C" && view && <BorderCountry view={view} />}
        {mycomponent === "AT" && view && (
          <>
            <NodesLayerAttack view={view} side={side} type="X" displaybox={displaybox} />
            <LinesLayerAttack view={view} side={side} type="X" displaybox={displaybox} />
            <LinksLayerAttack view={view} side={side} type="X" displaybox={displaybox} />
          </>
        )}
        {mycomponent === "DE" && view && (
          <>
            <LinesLayerDefence view={view} side={side} type="X" displaybox={displaybox} />
            <LinksLayerDefence view={view} side={side} type="X" displaybox={displaybox} />
            <NodesLayerDefence view={view} side={side} type="X" />
          </>
        )}
        {mycomponent === "DEBG" && view && (
          <>
            <NodesLayerDefenceBackupGen view={view} side={side} type="2" />
          </>
        )}
        {mycomponent === "DENPP" && view && (
          <>
            <NodesLayerDefenceNewPP view={view} side={side} type="5" />
          </>
        )}
        {mycomponent === "DEL" && view && (
          <>
            <LinesLayerDefence view={view} side={side} type="3" />
          </>
        )}
        {mycomponent === "DELK" && view && (
          <>
            <LinksLayerDefence view={view} side={side} type="6" />
          </>
        )}
      </div>
    </div>
  );
};

export default BalticsMap;
