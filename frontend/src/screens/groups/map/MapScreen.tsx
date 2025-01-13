import React, { useCallback, useState, useRef } from 'react'; // Importă useRef
import {
    SafeAreaView,
    StyleSheet,
    ScrollView, TouchableOpacity, Button, View,
} from 'react-native';
import {List, Surface, Text} from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getGroup, getGroupLocations, getMessages, sendMessageToServer} from '../../../helpers/backend_helper.ts';
import { decode as base64Decode } from 'base-64';
import ToastHelper from "../../../Components/toast";
import Toast from "react-native-toast-message";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";

const MapScreen = ({route}) => {
    const { group } = route.params;
    const [groupLocations, setGroupLocations] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    useFocusEffect(
        React.useCallback(() => {
            getGroupLocations({group_id: group})
                .then((response) => {
                    setGroupLocations(response);
                })
                .catch((error) => {
                    ToastHelper.error('Failed to fetch group info', error);
                })
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            const printUserDetails = async () => {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('Access token is missing');
                    return;
                }

                try {
                    // Split the token to get the payload
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
            printUserDetails();
        }, [])
    );



    return (
        <SafeAreaView style={styles.container}>
            <Text>MAP</Text>
            {groupLocations.map((item, index) => (
                <View>
                    <Text>{item.user_id} {item.latitude} {item.longitude}</Text>
                </View>
            ))}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        backgroundColor: '#6200ee',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    group: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#ffffff',
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    scrollview: {
        flexGrow: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    surface: {
        width: '95%',
        alignSelf: 'center',
        padding: 4,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 4,
    },
    memberSurface: {
    },
    invitedSurface: {
        backgroundColor: '#e3f2fd', // Light pink for invited users
    },
    memberText: {
        fontSize: 16,
    },
    invitedText: {
        fontSize: 16,
    },
    usernameSurface: {
        backgroundColor: '#e0e0e0',
        alignSelf: 'flex-end', // Mesajele utilizatorului curent la dreapta
    },
    otherUserSurface: {
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start', // Mesajele altor utilizatori la stânga
    },
    messageContainer: {
        flexDirection: 'column',
        width: '100%',
    },
    usernameMessageContainer: {
        alignItems: 'flex-end', // Tot textul este aliniat complet la dreapta
    },
    otherUserMessageContainer: {
        alignItems: 'flex-start', // Textul celorlalți utilizatori la stânga
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: '#6200ee',
        textAlign: 'right', // Aliniere la dreapta pentru utilizatorul curent
    },
    messageText: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        textAlign: 'right', // Aliniere la dreapta pentru mesaj
    },
    timestamp: {
        fontSize: 12,
        color: '#888888',
        textAlign: 'right', // Aliniere la dreapta pentru timestamp
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'space-between',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingLeft: 10,
        marginRight: 10,
        fontSize: 16,
        height: 50,
        marginBottom: 50
    },
});

export default MapScreen;
