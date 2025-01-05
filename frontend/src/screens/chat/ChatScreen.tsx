import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, TextInput, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
            message: 'bagam meci de fotbal?',
        },
        {
            timestamp: '2025-01-05T12:59:11.113971',
            user_id: 'adi',
            message: 'nu frate',
        },
        {
            timestamp: '2025-01-05T12:59:40.983219',
            user_id: 'darius',
            message: 'urat ',
        },
    ]);

    const [userInfo, setUserInfo] = useState({});
    const [groupName, setGroupName] = useState("Prietenii"); // Setezi numele grupului
    const [currentUser, setCurrentUser] = useState("darius");
    const [newMessage, setNewMessage] = useState(''); // Câmpul pentru mesajul nou

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

    // Funcție pentru trimiterea unui mesaj
    const sendMessage = () => {
        if (newMessage.trim()) {
            const newMsg = {
                timestamp: new Date().toISOString(),
                user_id: currentUser,
                message: newMessage,
            };
            setMessages([...messages, newMsg]);
            setNewMessage(''); // Resetează câmpul de text după trimitere
            Keyboard.dismiss(); // Închide tastatura
        }
    };

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

            {/* Folosim KeyboardAvoidingView pentru a evita suprapunerea tastaturii */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContainer}
                />

                <View style={styles.inputContainer}>
                    {/* TextInput pentru a introduce mesajul */}
                    <TextInput
                        style={styles.textInput}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Scrie un mesaj..."
                    />
                    {/* Butonul de trimitere */}
                    <Button title="Trimite" onPress={sendMessage} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0edf2',
    },
    header: {
        padding: 16,
        backgroundColor: '#6200ee',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#ffffff',
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    surface: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#dcb2fd',
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
        elevation: 0, // Fără umbră pentru ceilalți utilizatori
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
        // position: 'absolute',
        height: 35,
        marginBottom: 50,
    },
});

export default ChatScreen;
