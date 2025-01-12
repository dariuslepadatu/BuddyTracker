import React, { useCallback, useState, useRef } from 'react'; // Importă useRef
import { SafeAreaView, StyleSheet, View, FlatList, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages, sendMessageToServer } from '../../helpers/backend_helper.ts'; // Importă funcțiile de backend

const ChatScreen = ({route}) => {
    const { group } = route.params;
    const [messages, setMessages] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const fetchMessages = async () => {
                try {
                    const fetchedMessages = await getMessages({ "group_id":group });
                    setMessages(fetchedMessages.messages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }, [group])
    );


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
    
    const sendMessage = async () => {
        if (newMessage.trim()) {
            const newMsg = {
                group_id: group,
                user_id: userInfo.username,
                message: newMessage,
            };
            try {
                await sendMessageToServer(newMsg); // Trimite mesajul către server
                let msgToSave = {
                    user_id: userInfo.username,
                    message: newMessage,
                    timestamp: new Date().toISOString(),
                }
                setMessages([...messages, msgToSave]);
                setNewMessage('');
                Keyboard.dismiss();

                // Scroll automat la ultimul mesaj
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.user_id === userInfo.username;

        return (
            <Surface style={[styles.surface, isCurrentUser ? styles.usernameSurface : styles.otherUserSurface]}>
                <View style={[styles.messageContainer, isCurrentUser ? styles.usernameMessageContainer : styles.otherUserMessageContainer]}>
                    <Text style={[styles.userName, isCurrentUser ? styles.usernameText : styles.otherUserText]}>
                        {item.user_id}
                    </Text>
                    <Text style={[styles.messageText, isCurrentUser ? styles.usernameText : styles.otherUserText]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.timestamp, isCurrentUser ? styles.usernameText : styles.otherUserText]}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>
            </Surface>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Folosim KeyboardAvoidingView pentru a evita suprapunerea tastaturii */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <FlatList
                    ref={flatListRef} // Atribuie referința la FlatList
                    data={messages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} // Scroll la încărcare
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
    group: {
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
        maxWidth: '80%',
        marginHorizontal: 16,
        alignSelf: 'flex-start', // Default: mesajele sunt aliniate la stânga
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

export default ChatScreen;
