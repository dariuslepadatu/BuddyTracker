import React from 'react';
import {Button, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    return (
        <View>
            <Text>Home Page</Text>
            <Button title="Go to Login TEWS" onPress={() => navigation.navigate('Login')}/>
        </View>
    );
};

export default HomeScreen;
