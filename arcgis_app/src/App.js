import React, { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';

import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

import Point from '@arcgis/core/geometry/Point';

import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Polyline from '@arcgis/core/geometry/Polyline';

import esriConfig from '@arcgis/core/config';

// import logo from './logo.svg';
import './App.css';

function App() {
  const mapRef = new useRef(null);

  const [selectedPoint, setSelectedPoint] = useState(0); // To keep track of selected point in dropdown

  // Aici pui punctul tau
  const point1 = new Point ({
    longitude: 26,
    latitude: 44.3
  });

  const point2 = new Point ({
    longitude: 26.2,
    latitude: 44.5
  });

  const points = [point1, point2];

  useEffect(() => { 
    if(!mapRef?.current) return;

    esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAdjI7kDqNtW_NVMq0DreHLMRx7Zu3s_TI87x2MWfEcx6LPVz_2CDLrmtOkf8o3kbe7nmv-hd57D8Ij4E1BWzMjsZgUbSownTf6-nRQnxcWFKo9cMzdI_t5V2fbSqaFv-BQ3duGXqNTa6obM7UyyE_DY49R7FE7_xg5jVjJJHq0i4ipZ65-RgBeQumUW-pwKfCVYmtr_3KGJ9lK6XMkoeqo.AT1_7CnoYY9g';

    const map = new Map({
      basemap: 'osm'
    });

    const view = new MapView({
      map: map,
      container: mapRef.current,
      zoom:13,
      center: [26.1, 44.43] // aici trebuie sa pui punctul de centru al hartii
    })
    
    const graphicsLayer = new GraphicsLayer();
    view.map.add(graphicsLayer);

    points.forEach(point => {
      // aici modifici cum arata punctul
      const simpleMarkerSymbol = new SimpleMarkerSymbol({
        color: "red"
      });
  
      const graphicPoint = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol
      });
      
      graphicsLayer.add(graphicPoint);
    });


    // +++++++++++++++++++++++++++ Route calculation function +++++++++++++++++++++++++++
    const calculateRoute = async (stops) => {
      const routeUrl =
        'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World'; // Route service URL

      const params = {
        stops: stops.map((stop) => `${stop.longitude},${stop.latitude}`).join(';'),
        f: 'json',
        token: esriConfig.apiKey,
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${routeUrl}/solve?${queryString}`);
      const data = await response.json();

      if (data.routes && data.routes.features.length > 0) {
        const route = data.routes.features[0].geometry;

        // Create a graphic for the route
        const routeGraphic = new Graphic({
          geometry: new Polyline({
            paths: route.paths,
          }),
          symbol: new SimpleLineSymbol({
            color: 'blue',
            width: 4,
          }),
        });

        graphicsLayer.add(routeGraphic);
      }
    };

    const routeStops = [
      { latitude: 44.4268, longitude: 26.1025 }, // si aici trebuie sa pui punctul de centru al hartii
      points[0], 
    ];
    calculateRoute(routeStops);

    return() => view && view.destroy();
  }, []);

  return (
    <div className="App" ref={mapRef}></div>
  );
}

export default App;

// <span> AICI AR FI HARTA </span>
