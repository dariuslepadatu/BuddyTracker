import React, {useEffect} from 'react';
import {View, Text, Button, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {login} from "../../helpers/backend_helper.ts";

const LoginScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        login({username: 'andrei', password:'andrei'})
            .then((response) => {
                console.log(response);
            })
        console.log('Login Screen');
    }, [])
    return (
        <SafeAreaView>

            <View>
                <Text>Login Paaeaege</Text>
                <Button title="Go to Home" onPress={() => navigation.navigate('Home')}/>
                <Button title="API" onPress={() => console.log(process.env.API_URL)}/>

            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;
