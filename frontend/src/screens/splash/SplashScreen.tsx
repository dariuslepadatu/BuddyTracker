import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import BuddyTrackerLogo from '../../../public/logos/buddytracker-high-resolution-logo-transparent.png';

const SplashScreen = () => {
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const timer = setTimeout(() => {
                navigation.navigate('Public', { screen: 'Login' });
            }, 1000);

            return () => clearTimeout(timer);
        }, [navigation])
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={BuddyTrackerLogo} // Use the imported logo
                    style={styles.logo}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 280, // Adjust width based on your logo's resolution
        height: 280, // Adjust height based on your logo's resolution
        resizeMode: 'contain',
    },

});

export default SplashScreen;
