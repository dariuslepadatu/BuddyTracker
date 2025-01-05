import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface, Searchbar, IconButton } from "react-native-paper";
import {useFocusEffect} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            "timestamp": "2025-01-05T12:57:03.862941",
            "user_id": "darius",
            "message": "NU"
        },
        {
            "timestamp": "2025-01-05T12:57:05.885631",
            "user_id": "darius",
            "message": "NU"
        },
        {
            "timestamp": "2025-01-05T12:57:07.906519",
            "user_id": "darius",
            "message": "NU"
        },
        {
            "timestamp": "2025-01-05T12:57:08.376130",
            "user_id": "darius",
            "message": "NU"
        },
        {
            "timestamp": "2025-01-05T12:57:08.844594",
            "user_id": "darius",
            "message": "NU"
        },
        {
            "timestamp": "2025-01-05T12:57:11.113971",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:11.557976",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:11.995067",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:12.347635",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:12.705860",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:13.310324",
            "user_id": "darius",
            "message": "DA"
        },
        {
            "timestamp": "2025-01-05T12:57:15.983219",
            "user_id": "darius",
            "message": "EE"
        },
        {
            "timestamp": "2025-01-05T12:57:16.562960",
            "user_id": "darius",
            "message": "EE"
        }
    ]);
    const [userInfo, setUserInfo] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            const printUserDetails = async () => {
                const accessToken = await AsyncStorage.getItem('accessToken');
                try {
                    const payloadBase64 = accessToken.split('.')[1];
                    const payload = JSON.parse(atob(payloadBase64));
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
        <SafeAreaView>
         <View>
             <Text>
                 Hello this is the chat screen
             </Text>
             {messages.map((item, index) => (
                 <View key={index}>
                     <Text>
                         {item.timestamp}
                     </Text>
                     <Text>
                         {item.message}
                     </Text>
                     <Text>
                         {item.user_id}
                     </Text>
                 </View>
             ))}
         </View>
        </SafeAreaView>
    );
};

export default ChatScreen;
