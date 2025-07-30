import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import MapModalBoxBackup from './MapModalBoxBackup';

const NodesLayerDefenceNewPP = ({ view, side, type }) => {
  const sourceListRef = useRef([]);
  const layersListRef = useRef([]);
  const iconLayersRef = useRef([]);
  const [bus, setBus] = useState('');
  //const [carrier, setCarrier] = useState('');
  const [busList, setBusList] = useState([]);
  const [displaybox, setDisplayBox] = useState(false);
  
  const carrier = useSelector((state) => state.action.typeNewGen);

  useEffect(() => {
    if (bus) setDisplayBox(true);
  }, [bus]);

  useEffect(() => {
    if (!view) return;

    let cancelled = false;

    fetch("/js/newpp_generators.json")
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
      if (busGroup.type === carrier) {
        busGroup.data.forEach((myaction) => {
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
            //console.log(myaction);
            const clickHandler = (e) => {
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
    });

    return () => {
      [...layersListRef.current, ...iconLayersRef.current].forEach((layerId) => {
        if (view.getLayer(layerId)) {
          view.removeLayer(layerId);
        }
      });

      sourceListRef.current.forEach((sourceId) => {
        if (view.getSource(sourceId)) {
          view.removeSource(sourceId);
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
        line=""
        link=""
        type={type}
        side={side}
        displaybox={displaybox}
      />
    </div>
  );
};

export default NodesLayerDefenceNewPP;
