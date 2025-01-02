import React, {useCallback, useEffect, useState} from 'react';
import {Button, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {useFocusEffect} from "@react-navigation/native";
import {getGroups, validate} from "../../helpers/backend_helper.ts";
import {Text, Surface, Searchbar} from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome';

const GroupsScreen = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    useFocusEffect(
        React.useCallback(() => {
            getGroups({})
                .then((response) => {
                    setGroups(response.groups);
                });
        }, [])
    );
    useEffect(() => {
        getGroups({search_query: searchQuery})
            .then((response) => {
                setGroups(response.groups);
            });
    }, [searchQuery]);
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchRow}>
                <Searchbar
                    style={styles.searchbar}
                    placeholder="Search"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
                <Icon name="plus-square-o" size={25} style={styles.icon} />
            </View>
            <ScrollView contentContainerStyle={[styles.scrollview, { paddingBottom: tabBarHeight }]}>
                {groups.length > 0 ? (
                    groups.map((group, idx) => (
                        <Surface key={idx} style={styles.surface} elevation={4}>
                            <Text style={styles.groupText}>
                                {group}
                            </Text>
                        </Surface>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No groups available</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%', // Fixează lățimea totală la 80% din ecran
        alignSelf: 'center', // Centrează pe ecran
        marginBottom: 20,
    },
    searchbar: {
        flex: 1, // Face Searchbar să ocupe cât mai mult spațiu
        marginRight: 10,
    },
    icon: {
        color: '#000',
    },
    scrollview: {
        flexGrow: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    surface: {
        width: '80%',
        alignSelf: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
    },
    groupText: {
        fontSize: 16,
        margin: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    },
});

export default GroupsScreen;