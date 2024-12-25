import React, {useEffect} from 'react';
import {View, Text, Button, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {getUsers, login} from "../../helpers/backend_helper.ts";

const LoginScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        login({username: 'andrei', password:'andrei'})
            .then(async (response) => {
                await AsyncStorage.setItem('accessToken', response.access_token);
                await AsyncStorage.setItem('refreshToken', response.refresh_token);
            })
        console.log('Login Screen');
    }, [])


    const printAllUsers =  () => {
        getUsers()
            .then(async (response) => {
             console.log(response)
            })
    };


    const printAllKeysAndValues = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            console.log('All keys:', allKeys);

            const keyValuePairs = await AsyncStorage.multiGet(allKeys);

            keyValuePairs.forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });
        } catch (error) {
            console.error('Error retrieving keys and values from AsyncStorage:', error);
        }
    };

    return (
        <SafeAreaView>

            <View>
                <Text>Login Paaeaege</Text>
                <Button title="Go to Home" onPress={() => navigation.navigate('Home')}/>
                <Button title="API" onPress={() => console.log(process.env.API_URL)}/>
                <Button title="Display Async Storage" onPress={() => printAllKeysAndValues()}/>
                <Button title="Display users" onPress={() => printAllUsers()}/>

            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;
