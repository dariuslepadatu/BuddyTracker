import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {validate} from "../helpers/backend_helper.ts";
import ToastHelper from "../Components/toast";

const AuthProtected = ({ children }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }
            validate({'access_token': accessToken})
                .then(() => {
                    setIsAuthenticated(true);
                    setLoading(false);
                })
                .catch((error) => {
                    ToastHelper.error('Login Failed', error);
                    navigation.navigate('Public', {screen: 'Login'});
                });
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#C03BDE" />
            </View>
        );
    }
    if (!isAuthenticated) {
        navigation.navigate('Public', {screen: 'Login'});
    }

    return children;
};

export default AuthProtected;