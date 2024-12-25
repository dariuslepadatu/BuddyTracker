import React from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView>

            <View>
                <Text>Home Pagaaaaaaae</Text>
                <Button title="Go to Login TEWS" onPress={() => navigation.navigate('Login')}/>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
