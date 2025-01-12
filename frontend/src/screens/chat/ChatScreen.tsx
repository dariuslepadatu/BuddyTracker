import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages, sendMessageToServer } from '../../helpers/backend_helper.ts'; // Importă funcțiile de backend

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [groupName, setGroupName] = useState("ILuvOnePiece");
    const [currentUser, setCurrentUser] = useState("darius");
    const [newMessage, setNewMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchMessages = async () => {
                try {
                    const fetchedMessages = await getMessages({ "user_id":currentUser, "group_id":groupName }); // Obține mesajele grupului
                    console.log("MESSAGES:", fetchedMessages);
                    setMessages(fetchedMessages.messages); // Setează mesajele primite
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }, [groupName]) // Se apelează de fiecare dată când se schimbă `groupName`
    );

    const sendMessage = async () => {
        if (newMessage.trim()) {
            const newMsg = {
                group_id: groupName,
                user_id: currentUser,
                message: newMessage,
            };
            try {
                await sendMessageToServer(newMsg); // Trimite mesajul către server
                let msgToSave = {
                    user_id: currentUser,
                    message: newMessage,
                    timestamp: new Date().toISOString(),
                }
                setMessages([...messages, msgToSave]);
                setNewMessage('');
                Keyboard.dismiss();
            } catch (error) {
                console.error('Error sending message:', error);
            }
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
                <Text style={styles.groupName}>{groupName}</Text>
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
        height: 35,
        marginBottom: 50,
    },
});

export default ChatScreen;
