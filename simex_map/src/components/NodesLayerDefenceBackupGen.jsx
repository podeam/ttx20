import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import MapModalBoxBackup from './MapModalBoxBackup';

const NodesLayerDefenceBackupGen = ({ view, side, type }) => {
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const iconLayersRef = useRef([]);
  const [bus, setBus] = useState('');
  //const [carrier, setCarrier] = useState('');
  const [busList, setBusList] = useState([]);
  const [displaybox, setDisplayBox] = useState(false);
  const [link, setLink] = useState(null);
  const [line, setLine] = useState(null);
  
  const carrier = useSelector((state) => state.action.typeNewGen);

  useEffect(() => {
    if (bus) setDisplayBox(true);
  }, [bus]);

  useEffect(() => {
    if (!view) return;

    let cancelled = false;

    fetch("/js/backup_generators.json")
      .then((res) => res.json())
      .then((response) => {
        if (!cancelled) {
          setBusList(response);
        }
      })
      .catch((err) => console.error("Failed to fetch generator data", err));

    return () => {
      cancelled = true;
    };
  }, [view]);

  useEffect(() => {
    //console.log(carrier);
    if (!view || busList.length === 0) return;
    let x = 0;
    busList.forEach((busGroup) => {
      if (busGroup.type === 'Generator' && carrier === 'Generator') {
        busGroup.data.forEach((myaction) => {
          //console.log(myaction);
          const { long, lat, name } = myaction;
          const radius = 10;
          const color = '#0bb6e0';
          const sourceId = `point${x}`;
          const circleLayerId = `circle-layer${x}`;

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
              id: circleLayerId,
              type: 'circle',
              source: sourceId,
              metadata: { customId: name || `Generator-${x}` },
              paint: {
                'circle-radius': radius * 2,
                'circle-color': color,
                'circle-opacity': 1,
              },
            });

            const clickHandler = (e) => {
              //console.log(myaction);
              const feature = e.features?.[0];
              const topFeature = view.queryRenderedFeatures(e.point)[0];
              if (topFeature?.layer?.id.startsWith('circle-layer')) {
                const selectedName = feature?.layer?.metadata?.customId || 'Unknown';
                
                setBus(myaction);
                setDisplayBox(true);
              }
            };

            view.on('click', circleLayerId, clickHandler);

            view.on('mouseenter', circleLayerId, () => {
              view.getCanvas().style.cursor = 'pointer';
            });
            view.on('mouseleave', circleLayerId, () => {
              view.getCanvas().style.cursor = '';
            });

            sourceListRef.current.push(sourceId);
            layersListRef.current.push(circleLayerId);
          }
          x++;
        });
      }
      if (busGroup.type === 'Line' && carrier === 'Line') {
        busGroup.data.forEach((myaction) => {
        /********************* */
        //console.log(myaction);
        const name2 = myaction.name;
        const color = '#0bb6e0';
        const pointA = [myaction.lat1, myaction.long1];
        const pointB = [myaction.lat2, myaction.long2];
        const lineId = `line-line-${x}`;
        const sourceId = `line-source-${x}`;
        const route = {
          type: 'Feature',
          properties: { name: name2 },
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
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': color,
              'line-width': 4, // or scale if needed
            },
          });
          // Add interactivity
          view.on('click', lineId, (e) => {
              const feature = e.features?.[0];
              const featuresx = view.queryRenderedFeatures(e.point);
              if (!featuresx.length) return;
              const topFeature = featuresx[0];
              if (!topFeature.layer.id.startsWith('circle-layer')) {
                  setLine(myaction);
                  setDisplayBox(true);
              }
          });

          view.on('mouseenter', lineId, () => {
            view.getCanvas().style.cursor = 'pointer';
          });
          view.on('mouseleave', lineId, () => {
            view.getCanvas().style.cursor = '';
          });
        }

        sourceListRef.current.push(sourceId);
        layersListRef.current.push(lineId);
        //layersListRef.current.push(lineId, arrowId);
        x++;
        });
      }
      if (busGroup.type === 'Link' && carrier === 'Link') {
        busGroup.data.forEach((myaction) => {
        /********************* */
        //console.log(myaction);
        const name2 = myaction.name;
        const color = '#0bb6e0';
        const pointA = [myaction.lat1, myaction.long1];
        const pointB = [myaction.lat2, myaction.long2];
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
              'line-width': 4,
            },
          });
          // Add interactivity
          view.on('click', lineId, (e) => {
              const feature = e.features?.[0];
              const featuresx = view.queryRenderedFeatures(e.point);
              if (!featuresx.length) return;
              const topFeature = featuresx[0];
              if (!topFeature.layer.id.startsWith('circle-layer')) {
                  setLink(myaction);
                  setDisplayBox(true);
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
      }
    });

    return () => {
      //console.log(layersListRef.current);
      //console.log(iconLayersRef.current);
      [...layersListRef.current, ...iconLayersRef.current].forEach((layerId) => {
        if (view.getLayer(layerId)) {
          view.removeLayer(layerId);
          //console.log(layerId);
        }
      });

      sourceListRef.current.forEach((sourceId) => {
        if (view.getSource(sourceId)) {
          view.removeSource(sourceId);
          //console.log(sourceId);
        }
      });

      layersListRef.current = [];
      iconLayersRef.current = [];
      sourceListRef.current = [];
    };
  }, [view, busList, carrier]);

  return (
    <div>
      <MapModalBoxBackup
        bus={bus}
        line={line}
        link={link}
        type={type}
        side={side}
        displaybox={displaybox}
      />
    </div>
  );
};

export default NodesLayerDefenceBackupGen;
