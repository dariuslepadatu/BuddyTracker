import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, TextInput, FlatList, TouchableOpacity, Text, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupLocations } from '../../../helpers/backend_helper.ts';
import ToastHelper from '../../../Components/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as base64Decode } from 'base-64';

const MapScreen = ({ route }) => {
    const { group } = route.params;
    const [groupLocations, setGroupLocations] = useState([]);
    const [apiKey, setApiKey] = useState('AAPTxy8BH1VEsoebNVZXo8HurAdjI7kDqNtW_NVMq0DreHLMRx7Zu3s_TI87x2MWfEcx6LPVz_2CDLrmtOkf8o3kbe7nmv-hd57D8Ij4E1BWzMjsZgUbSownTf6-nRQnxcWFKo9cMzdI_t5V2fbSqaFv-BQ3duGXqNTa6obM7UyyE_DY49R7FE7_xg5jVjJJHq0i4ipZ65-RgBeQumUW-pwKfCVYmtr_3KGJ9lK6XMkoeqo.AT1_7CnoYY9g');
    const [userInfo, setUserInfo] = useState({});
    const [readyToRender, setReadyToRender] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
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

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            // Dacă textul este gol, resetează lista de rezultate
            setFilteredResults([]);
        } else {
            // Filtrează locațiile
            const results = groupLocations.filter((loc) =>
                loc.user_id.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredResults(results);
        }
    };


    const handleSelectFriend = (friend) => {
        setSearchText(friend.user_id);
        setFilteredResults([]);
        if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
                window.centerMap(${friend.longitude}, ${friend.latitude});
            `);
        }
    };

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
                .distance-info {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 14px;
                    z-index: 1000;
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
                    let selectedPoints = [];

                    locations.forEach(loc => {
                        const point = { type: "point", longitude: loc.longitude, latitude: loc.latitude };
                        const markerSymbol = {
                            type: "simple-marker",
                            color: loc.user_id === "${userInfo.username}" ? "#00FF00" : "#FF0000",
                            size: "20px",
                            outline: { color: "white", width: 2 }
                        };
                        const labelSymbol = {
                            type: "text",
                            color: "black",
                            text: loc.user_id,
                            xoffset: 0,
                            yoffset: -20,
                            font: { size: 12, family: "Arial" }
                        };
                        const markerGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
                        const labelGraphic = new Graphic({ geometry: point, symbol: labelSymbol });
                        view.graphics.addMany([markerGraphic, labelGraphic]);
                    });

                    const routeUrl = "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

                    const updateDistanceInfo = (distance) => {
                        document.getElementById("distanceInfo").innerText = \`Distance: \${distance.toFixed(2)} km\`;
                    };

                    const calculateRoute = () => {
                        if (selectedPoints.length === 2) {
                            const [start, end] = selectedPoints;

                            const routeParams = new RouteParameters({
                                stops: new FeatureSet({
                                    features: [
                                        new Graphic({ geometry: { type: "point", longitude: start.longitude, latitude: start.latitude } }),
                                        new Graphic({ geometry: { type: "point", longitude: end.longitude, latitude: end.latitude } }),
                                    ],
                                }),
                                returnDirections: true,
                            });

                            route.solve(routeUrl, routeParams)
                                .then((data) => {
                                    if (data.routeResults.length > 0) {
                                        const routeResult = data.routeResults[0].route;
                                        const distance = data.routeResults[0].directions.totalLength;

                                        // Add route to the map
                                        routeResult.symbol = {
                                            type: "simple-line",
                                            color: [0, 0, 255, 0.8],
                                            width: 4,
                                        };
                                        view.graphics.add(routeResult);

                                        // Update distance info
                                        updateDistanceInfo(distance);
                                    }
                                })
                                .catch((error) => console.error("Error calculating route:", error));
                        }
                    };

                    view.on("click", (event) => {
                        const point = {
                            type: "point",
                            longitude: event.mapPoint.longitude,
                            latitude: event.mapPoint.latitude,
                        };

                        const markerSymbol = {
                            type: "simple-marker",
                            color: [0, 255, 0],
                            size: "10px",
                            outline: { color: [255, 255, 255], width: 2 },
                        };

                        const markerGraphic = new Graphic({
                            geometry: point,
                            symbol: markerSymbol,
                        });

                        view.graphics.add(markerGraphic);
                        selectedPoints.push(point);

                        if (selectedPoints.length === 2) {
                            calculateRoute();
                        }

                        if (selectedPoints.length > 2) {
                            selectedPoints.shift();
                            view.graphics.removeAll();
                        }
                    });

                    // Define zoom functions
                    window.zoomIn = () => {
                        view.goTo({ zoom: view.zoom + 1 }, { duration: 500, easing: "ease-in-out" });
                    };

                    window.zoomOut = () => {
                        view.goTo({ zoom: view.zoom - 1 }, { duration: 500, easing: "ease-in-out" });
                    };

                    window.centerMap = (longitude, latitude) => {
                        view.goTo({ center: [longitude, latitude], zoom: 14 });
                    };
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
            <View style={styles.controlsContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search for a friend..."
                    value={searchText}
                    onChangeText={handleSearch}
                />
                <Button title="Zoom In" onPress={() => webViewRef.current.injectJavaScript('window.zoomIn();')} />
                <Button title="Zoom Out" onPress={() => webViewRef.current.injectJavaScript('window.zoomOut();')} />
            </View>
            {filteredResults.length > 0 && (
                <FlatList
                    data={filteredResults}
                    keyExtractor={(item) => item.user_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectFriend(item)} style={styles.resultItem}>
                            <Text>{item.user_id}</Text>
                        </TouchableOpacity>
                    )}
                    style={[styles.searchResults, { width: '90%' }]} // Aceeași lățime ca bara de căutare
                />
            )}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: generateMapHtml() }}
                scrollEnabled={false}
                style={styles.webView}
            />
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    webView: { flex: 1 },
    controlsContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchBar: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    searchResults: {
        maxHeight: 150,
        position: 'absolute',
        top: 60, // Apare sub bara de căutare
        left: 10,
        zIndex: 1001,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    resultItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});


export default MapScreen;
