import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupLocations } from '../../../helpers/backend_helper.ts';
import ToastHelper from '../../../Components/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as base64Decode } from 'base-64';

const MapScreen = ({ route }) => {
    const { group } = route.params;
    const [groupLocations, setGroupLocations] = useState([]);
    const [apiKey, setApiKey] = useState('');
    const [userInfo, setUserInfo] = useState({});
    const [readyToRender, setReadyToRender] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const webViewRef = useRef(null);

    // Fetch user info
    useFocusEffect(
        React.useCallback(() => {
            const fetchUserInfo = async () => {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('Access token is missing');
                    return;
                }
                try {
                    const payloadBase64 = accessToken.split('.')[1];
                    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
                    const payload = JSON.parse(base64Decode(paddedBase64));
                    setUserInfo({
                        name: payload.name,
                        username: payload.preferred_username,
                        first_name: payload.given_name,
                        last_name: payload.family_name,
                        email: payload.email,
                    });
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            };
            fetchUserInfo();
        }, [])
    );

    // Fetch group locations
    useFocusEffect(
        React.useCallback(() => {
            getGroupLocations({ group_id: group })
                .then((response) => {
                    setGroupLocations(response || []);
                })
                .catch((error) => {
                    ToastHelper.error('Failed to fetch group info', error);
                });
        }, [group])
    );

    // Check if both `userInfo` and `groupLocations` are ready
    useEffect(() => {
        if (userInfo.username && groupLocations.length > 0) {
            setReadyToRender(true);
        }
    }, [userInfo, groupLocations]);

    // Handle map click to update selected points
    const handleMapClick = (longitude, latitude) => {
        setSelectedPoints((prevPoints) => {
            const updatedPoints = [...prevPoints, { longitude, latitude }];
            return updatedPoints.slice(-2); // Păstrează doar ultimele două puncte
        });
    };

    // Update route in WebView when selected points change
    useEffect(() => {
        if (selectedPoints.length === 2 && webViewRef.current) {
            webViewRef.current.injectJavaScript(`
                window.updateRoute(${JSON.stringify(selectedPoints)});
            `);
        }
    }, [selectedPoints]);

    const generateMapHtml = () => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
            <script src="https://js.arcgis.com/4.26/"></script>
            <style>
                html, body, #viewDiv {
                    padding: 0;
                    margin: 0;
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }
                .zoom-controls {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 100;
                }
                .zoom-controls button {
                    padding: 10px;
                    margin: 5px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .zoom-controls button:hover {
                    background-color: #f0f0f0;
                }
            </style>
        </head>
        <body>
            <div id="viewDiv"></div>
            <div class="zoom-controls">
                <button id="zoomIn">Zoom In</button>
                <button id="zoomOut">Zoom Out</button>
            </div>
            <script>
                require([
                    "esri/Map",
                    "esri/views/MapView",
                    "esri/Graphic",
                    "esri/rest/route",
                    "esri/rest/support/RouteParameters",
                    "esri/rest/support/FeatureSet",
                    "esri/config"
                ], function(Map, MapView, Graphic, route, RouteParameters, FeatureSet, esriConfig) {
                    const map = new Map({ basemap: "topo-vector" });

                    const view = new MapView({
                        container: "viewDiv",
                        map: map,
                        center: [-118.2437, 34.0522],
                        zoom: 10,
                    });

                    esriConfig.apiKey = "${apiKey}";

                    const locations = ${JSON.stringify(groupLocations)};
                    locations.forEach(loc => {
                        const point = { type: "point", longitude: loc.longitude, latitude: loc.latitude };
                        const markerSymbol = {
                            type: "simple-marker",
                            color: loc.user_id === "${userInfo.username}" ? "#00FF00" : "#FF0000",
                            size: "20px",
                            outline: { color: "white", width: 2 }
                        };
                        const markerGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
                        view.graphics.add(markerGraphic);
                    });

                    document.getElementById("zoomIn").addEventListener("click", () => view.goTo({ zoom: view.zoom + 1 }));
                    document.getElementById("zoomOut").addEventListener("click", () => view.goTo({ zoom: view.zoom - 1 }));

                    window.updateRoute = (points) => {
                        view.graphics.removeAll();

                        const [start, end] = points;
                        const routeParams = new RouteParameters({
                            stops: new FeatureSet({
                                features: [
                                    new Graphic({ geometry: { type: "point", longitude: start.longitude, latitude: start.latitude } }),
                                    new Graphic({ geometry: { type: "point", longitude: end.longitude, latitude: end.latitude } }),
                                ],
                            }),
                            returnDirections: true,
                        });

                        route.solve("https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World", routeParams)
                            .then((data) => {
                                const routeResult = data.routeResults[0].route;
                                routeResult.symbol = {
                                    type: "simple-line",
                                    color: [0, 0, 255, 0.5],
                                    width: 4,
                                };
                                view.graphics.add(routeResult);
                            })
                            .catch((error) => console.error(error));
                    };

                    view.on("click", (event) => {
                        const { longitude, latitude } = event.mapPoint;
                        window.ReactNativeWebView.postMessage(JSON.stringify({ longitude, latitude }));
                    });
                });
            </script>
        </body>
        </html>
    `;
    };

    if (!readyToRender) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Loading map...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: generateMapHtml() }}
                scrollEnabled={false}
                style={styles.webView}
                onMessage={(event) => {
                    const point = JSON.parse(event.nativeEvent.data);
                    handleMapClick(point.longitude, point.latitude);
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
    webView: { flex: 1 },
});

export default MapScreen;
