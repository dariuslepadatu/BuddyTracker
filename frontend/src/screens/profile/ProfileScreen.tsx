import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
const ProfileScreen = () => {


    useFocusEffect(
        React.useCallback(() => {
            // console.log("A");
            // const printUserDetails = async () => {
            //     const accessToken = await AsyncStorage.getItem('accessToken');
            //     console.log(accessToken);
            // }
            // printUserDetails();
        }, [])
    );

    return (
        <SafeAreaView >
            <View >
                <Text>Profile</Text>
                <FontAwesome name="user-circle" size={30} color="#4F8EF7" />
            </View>
        </SafeAreaView>
    );
};


export default ProfileScreen;
