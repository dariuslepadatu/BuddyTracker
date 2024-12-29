import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const ProfileScreen = () => {


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
