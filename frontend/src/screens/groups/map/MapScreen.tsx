import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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
            </style>
        </head>
        <body>
            <div id="viewDiv"></div>
            <script>
                require([
                    "esri/Map",
                    "esri/views/MapView",
                    "esri/Graphic",
                    "esri/config",
                    "esri/rest/route",
                    "esri/rest/support/RouteParameters",
                    "esri/rest/support/FeatureSet"
                ], function(Map, MapView, Graphic, esriConfig, route, RouteParameters, FeatureSet) {
                    esriConfig.apiKey = "${apiKey}";

                    const map = new Map({
                        basemap: "topo-vector"
                    });

                    const view = new MapView({
                        container: "viewDiv",
                        map: map,
                        center: [-118.2437, 34.0522],
                        zoom: 10
                    });

                    // Adaugă locații pe hartă
                    const locations = ${JSON.stringify(groupLocations)};
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
                            outline: { color: "white", width: 2 }
                        };

                        const graphic = new Graphic({
                            geometry: point,
                            symbol: markerSymbol
                        });

                        view.graphics.add(graphic);
                    });

                    // Variabile pentru puncte selectate
                    let selectedPoints = [];

                    // Adaugă un eveniment de click pentru a selecta puncte
                    view.on("click", (event) => {
                        if (selectedPoints.length >= 2) {
                            selectedPoints = [];
                            view.graphics.removeAll();
                        }

                        const point = {
                            type: "point",
                            longitude: event.mapPoint.longitude,
                            latitude: event.mapPoint.latitude
                        };

                        selectedPoints.push(point);

                        const graphic = new Graphic({
                            geometry: point,
                            symbol: {
                                type: "simple-marker",
                                color: selectedPoints.length === 1 ? "blue" : "green",
                                size: "12px"
                            }
                        });
                        view.graphics.add(graphic);

                        if (selectedPoints.length === 2) {
                            getRoute(selectedPoints[0], selectedPoints[1]);
                        }
                    });

                    // Funcția pentru calcularea rutei
                    function getRoute(start, end) {
                        const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

                        const routeParams = new RouteParameters({
                            stops: new FeatureSet({
                                features: [
                                    new Graphic({ geometry: start }),
                                    new Graphic({ geometry: end })
                                ]
                            }),
                            returnDirections: true
                        });

                        route.solve(routeUrl, routeParams).then((response) => {
                            response.routeResults.forEach((result) => {
                                result.route.symbol = {
                                    type: "simple-line",
                                    color: [0, 0, 255],
                                    width: 3
                                };
                                view.graphics.add(result.route);
                            });
                        }).catch((error) => {
                            console.error("Route calculation failed:", error);
                        });
                    }
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
                key={`${JSON.stringify(groupLocations)}-${userInfo.username}`}
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
