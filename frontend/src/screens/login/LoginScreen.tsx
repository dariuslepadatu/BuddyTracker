import React, {useEffect} from 'react';
import { View, Text, Button } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {login} from "../../helpers/backend_helper.ts";

const LoginScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        login({username: 'darius', password:'darius'})
            .then((response) => {
                console.log(response.data);
            })
        console.log('Login Screen');
    }, [])
    return (
        <View>
            <Text>Login Page</Text>
            <Button title="Go to Home" onPress={() => navigation.navigate('Home')}/>
            <Button title="API" onPress={() => console.log(process.env.API_URL)}/>

        </View>
    );
};

export default LoginScreen;
