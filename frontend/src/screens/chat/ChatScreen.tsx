import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            timestamp: '2025-01-05T12:57:03.862941',
            user_id: 'darius',
            message: 'salut',
        },
        {
            timestamp: '2025-01-05T12:57:11.113971',
            user_id: 'alex',
            message: 'hei',
        },
        {
            timestamp: '2025-01-05T12:57:15.983219',
            user_id: 'darius',
            message: 'bagam meci de fotbal? 🥺',
        },
    ]);

    const [userInfo, setUserInfo] = useState({});
    const [groupName, setGroupName] = useState("Prietenii"); // Setezi numele grupului
    const [currentUser, setCurrentUser] = useState("darius");

    useFocusEffect(
        useCallback(() => {
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

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.user_id === currentUser;

        return (
            <Surface style={[styles.surface, isCurrentUser ? styles.currentUserSurface : styles.otherUserSurface]}>
                <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer]}>
                    <Text style={[styles.userName, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
                        {item.user_id}
                    </Text>
                    <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>
            </Surface>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.groupName}>{groupName}</Text> {/* Afișează numele grupului */}
            </View>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#6200ee',
        alignItems: 'center',
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#ffffff',
    },
    listContainer: {
        padding: 16,
    },
    surface: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        maxWidth: '80%',
        marginHorizontal: 16,
        shadowOpacity: 0,  // Elimină umbra globală pentru a nu provoca probleme de separare
    },
    currentUserSurface: {
        backgroundColor: '#e0e0e0',
        elevation: 0, // Adăugăm doar umbra pentru mesajele utilizatorului curent
    },
    otherUserSurface: {
        backgroundColor: '#ffffff',
        elevation: 4, // Fără umbră pentru ceilalți utilizatori
    },
    messageContainer: {
        flexDirection: 'column',
        width: '100%',  // Asigurăm că containerul are lățimea completă
    },
    currentUserMessageContainer: {
        alignItems: 'flex-end', // Mesajele utilizatorului curent vor fi aliniate la dreapta
    },
    otherUserMessageContainer: {
        alignItems: 'flex-start', // Mesajele celorlalți utilizatori vor fi aliniate la stânga
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: '#6200ee',
    },
    messageText: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#888888',
        textAlign: 'right',
    },
    currentUserText: {
        textAlign: 'right', // Textul utilizatorului curent va fi aliniat la dreapta
    },
    otherUserText: {
        textAlign: 'left', // Textul celorlalți utilizatori va fi aliniat la stânga
    },
});

export default ChatScreen;



