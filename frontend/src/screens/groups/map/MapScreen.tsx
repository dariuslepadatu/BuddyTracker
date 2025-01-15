import React, { useState, useEffect } from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
import {useFocusEffect} from "@react-navigation/native";
import {getGroupLocations} from "../../../helpers/backend_helper.ts";
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
                    overflow: hidden; /* Previne derularea */
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
                    "esri/config"
                ], function(Map, MapView, Graphic, esriConfig) {
                    const map = new Map({
                        basemap: "topo-vector"
                    });

                    const locations = ${JSON.stringify(groupLocations)};
                    
                    const userLocation = locations.find((loc) => loc.user_id === "${userInfo.username}");
                    const center = userLocation ? [userLocation.longitude, userLocation.latitude] : [-118.2437, 34.0522];

                    const view = new MapView({
                        container: "viewDiv",
                        map: map,
                        center: center,
                        zoom: 10
                    });

                    locations.forEach(loc => {
                        const point = {
                        type: "point",
                        longitude: loc.longitude,
                        latitude: loc.latitude
                    };

                    const markerSymbol = {
                        type: "simple-marker",
                        color: loc.user_id === "${userInfo.username}" ? "#00FF00" : "#FF0000", // Verde pentru utilizator curent, roșu pentru ceilalți
                        size: "20px", // Dimensiune mai mare pentru a imita "Find My"
                        outline: {
                            color: "white", // Margine albă
                            width: 2 // Grosime margine
                        }
                    };
                    
                    const textSymbol = {
                        type: "text",
                        color: "black",
                        haloColor: "white", // Contur alb pentru text
                        haloSize: "2px",
                        text: loc.user_id, 
                        xoffset: 0,
                        yoffset: -20, // Poziționează textul deasupra punctului
                        font: {
                            size: 12,
                            family: "Arial, sans-serif",
                            weight: "bold" // Text îngroșat pentru lizibilitate
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
                    
                    view.graphics.addMany([markerGraphic, labelGraphic]);

                    });

                    document.getElementById("zoomIn").addEventListener("click", () => {
                        view.goTo({ zoom: view.zoom + 1 }, { duration: 500, easing: "ease-in-out" });
                    });

                    document.getElementById("zoomOut").addEventListener("click", () => {
                        view.goTo({ zoom: view.zoom - 1 }, { duration: 500, easing: "ease-in-out" });
                    });

                    esriConfig.apiKey = "${apiKey}";
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
