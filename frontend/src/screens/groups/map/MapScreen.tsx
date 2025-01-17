import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
import { useFocusEffect } from "@react-navigation/native";
import { getGroupLocations } from "../../../helpers/backend_helper.ts";
import ToastHelper from "../../../Components/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as base64Decode } from 'base-64';

const MapScreen = ({ route }) => {
    const { group } = route.params;
    const [groupLocations, setGroupLocations] = useState([]);
    const [apiKey, setApiKey] = useState('');
    const [userInfo, setUserInfo] = useState({});
    const [readyToRender, setReadyToRender] = useState(false);

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
                    "esri/layers/GraphicsLayer",
                    "esri/rest/route",
                    "esri/rest/support/RouteParameters",
                    "esri/rest/support/FeatureSet",
                    "esri/config"
                ], function(Map, MapView, Graphic, GraphicsLayer, route, RouteParameters, FeatureSet, esriConfig) {
                    esriConfig.apiKey = "${apiKey}";

                    const map = new Map({
                        basemap: "topo-vector"
                    });

                    const view = new MapView({
                        container: "viewDiv",
                        map: map,
                        center: [-118.2437, 34.0522], // Default center
                        zoom: 10
                    });

                    const graphicsLayer = new GraphicsLayer();
                    map.add(graphicsLayer);

                    const locations = ${JSON.stringify(groupLocations)};
                    
                    // Add user locations to the map
                    locations.forEach(loc => {
                        const point = {
                            type: "point",
                            longitude: loc.longitude,
                            latitude: loc.latitude
                        };

                        const markerSymbol = {
                            type: "simple-marker",
                            color: loc.user_id === "${userInfo.username}" ? "#00FF00" : "#FF0000",
                            size: "20px",
                            outline: {
                                color: "white",
                                width: 2
                            }
                        };

                        const textSymbol = {
                            type: "text",
                            color: "black",
                            haloColor: "white",
                            haloSize: "2px",
                            text: loc.user_id,
                            xoffset: 0,
                            yoffset: -20,
                            font: {
                                size: 12,
                                family: "Arial, sans-serif",
                                weight: "bold"
                            }
                        };

                        const markerGraphic = new Graphic({
                            geometry: point,
                            symbol: markerSymbol
                        });

                        const labelGraphic = new Graphic({
                            geometry: point,
                            symbol: textSymbol
                        });

                        graphicsLayer.addMany([markerGraphic, labelGraphic]);
                    });

                    // Routing logic
                    let startPoint, endPoint;
                    view.on("click", (event) => {
                        if (!startPoint) {
                            startPoint = {
                                type: "point",
                                longitude: event.mapPoint.longitude,
                                latitude: event.mapPoint.latitude
                            };

                            const startGraphic = new Graphic({
                                geometry: startPoint,
                                symbol: {
                                    type: "simple-marker",
                                    color: "blue",
                                    size: "10px",
                                    outline: {
                                        color: "white",
                                        width: 2
                                    }
                                }
                            });
                            graphicsLayer.add(startGraphic);
                        } else if (!endPoint) {
                            endPoint = {
                                type: "point",
                                longitude: event.mapPoint.longitude,
                                latitude: event.mapPoint.latitude
                            };

                            const endGraphic = new Graphic({
                                geometry: endPoint,
                                symbol: {
                                    type: "simple-marker",
                                    color: "green",
                                    size: "10px",
                                    outline: {
                                        color: "white",
                                        width: 2
                                    }
                                }
                            });
                            graphicsLayer.add(endGraphic);

                            const routeParams = new RouteParameters({
                                stops: new FeatureSet({
                                    features: [
                                        new Graphic({ geometry: startPoint }),
                                        new Graphic({ geometry: endPoint })
                                    ]
                                }),
                                returnDirections: true
                            });

                            route.solve("https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World", routeParams)
                                .then((data) => {
                                    data.routeResults.forEach((result) => {
                                        const routeGraphic = new Graphic({
                                            geometry: result.route.geometry,
                                            symbol: {
                                                type: "simple-line",
                                                color: "blue",
                                                width: 4
                                            }
                                        });
                                        graphicsLayer.add(routeGraphic);
                                    });
                                });
                        }
                    });

                    // Zoom controls
                    document.getElementById("zoomIn").addEventListener("click", () => {
                        view.goTo({ zoom: view.zoom + 1 }, { duration: 500 });
                    });

                    document.getElementById("zoomOut").addEventListener("click", () => {
                        view.goTo({ zoom: view.zoom - 1 }, { duration: 500 });
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
                key={`${JSON.stringify(groupLocations)}-${userInfo.username}`} // Force re-render on changes
                originWhitelist={['*']}
                source={{ html: generateMapHtml() }}
                scrollEnabled={false}
                style={styles.webView}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    webView: {
        flex: 1,
    },
});

export default MapScreen;
