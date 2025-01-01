import React, { useState } from 'react';
import {Button, SafeAreaView, StyleSheet, View} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutDialog from "./dialog/LogoutDialog.tsx";

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState({});
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

    const toggleHideLogoutDialog = () => {
        setShowLogoutDialog(!showLogoutDialog);
    }

    const handleLogout = () => {
        AsyncStorage.removeItem('accessToken');
        AsyncStorage.removeItem('refreshToken');
        navigation.navigate('Public', {screen: 'Login'});
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text variant="displayMedium" style={styles.title}>
                Profile
            </Text>
            <View style={styles.infoContainer}>
                <Surface style={styles.surface} elevation={4}>
                    <Text style={styles.infoLabel}>Username:</Text>
                    <Text style={styles.infoValue}>{userInfo.username || 'N/A'}</Text>
                </Surface>
                <Surface style={styles.surface} elevation={4}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{userInfo.name || 'N/A'}</Text>
                </Surface>
                <Surface style={styles.surface} elevation={4}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{userInfo.email || 'N/A'}</Text>
                </Surface>
                <Surface style={styles.surface} elevation={4}>
                    <Text style={styles.infoLabel}>First Name:</Text>
                    <Text style={styles.infoValue}>{userInfo.first_name || 'N/A'}</Text>
                </Surface>
                <Surface style={styles.surface} elevation={4}>
                    <Text style={styles.infoLabel}>Last Name:</Text>
                    <Text style={styles.infoValue}>{userInfo.last_name || 'N/A'}</Text>
                </Surface>
                <Button title="Logout" onPress={() => setShowLogoutDialog(true)} color='#FF0000' />

            </View>
            {
                showLogoutDialog && (
                    <LogoutDialog hide={toggleHideLogoutDialog} handleLogout={handleLogout} />
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 20,
    },
    infoContainer: {
        width: '80%',
        gap: 10,
    },
    surface: {
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
});

export default ProfileScreen;
