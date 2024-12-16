import React from 'react';
import { View, Text, Button } from 'react-native';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = ({  }) => {
    const navigation = useNavigation();
    return (
        <View>
            <Text>Login Page</Text>
            <Button title="Go to Home" onPress={() => navigation.navigate('Home')}/>
            <Button title="API" onPress={() => console.log(process.env.API_URL)}/>
            <Button title="DATA" onPress={() => console.log(process.env.DATA)}/>

        </View>
    );
};

export default LoginScreen;
