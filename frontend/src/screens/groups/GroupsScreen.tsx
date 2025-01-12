import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from "@react-navigation/native";
import { getGroups, createGroup } from "../../helpers/backend_helper.ts";
import { Text, Surface, Searchbar, IconButton } from "react-native-paper";
import CreateGroupDialog from "./dialog/CreateGroupDialog.tsx";
import ToastHelper from "../../Components/toast";

const GroupsScreen = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getGroups({})
                .then((response) => {
                    setGroups(response.groups);
                })
                .catch(() => setGroups([])); // Handle potential errors
        }, [])
    );

    useEffect(() => {
        ToastHelper.success('Group successfully created', 'E');
        setIsLoading(true);
        const delayDebounceFn = setTimeout(() => {
            getGroups({ search_query: searchQuery })
                .then((response) => {
                    setGroups(response.groups);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }, 500);

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [searchQuery]);

    const toggleHideCreateGroupDialog = () => {
        setShowCreateGroupDialog(!showCreateGroupDialog);
    };

    const handleCreateGroup = (name) => {
        const newGroups = [...groups, name];
        setGroups(newGroups);
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#C03BDE" />
                </View>
            ) : groups.length > 0 ? (
                <View>
                    <View style={styles.searchRow}>
                        <Searchbar
                            style={styles.searchbar}
                            placeholder="Search"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            clearIcon="close"
                            onClearIconPress={() => setSearchQuery('')}
                        />
                        <IconButton
                            icon="plus-circle-outline"
                            size={25}
                            onPress={() => setShowCreateGroupDialog(true)}
                        />
                    </View>
                    <ScrollView
                        contentInset={{ bottom: tabBarHeight }}
                        contentContainerStyle={[styles.scrollview, { paddingBottom: tabBarHeight }]}>
                        {groups.map((group, idx) => (
                            <Surface key={idx} style={styles.surface} elevation={4}>
                                <Text style={styles.groupText}>{group}</Text>
                            </Surface>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No groups available</Text>
                    <TouchableOpacity
                        onPress={() => setShowCreateGroupDialog(true)}
                        style={styles.registerLinkContainer}
                    >
                        <Text style={styles.registerLinkText}>Create your first group</Text>
                    </TouchableOpacity>
                </View>
            )}
            {showCreateGroupDialog && (
                <CreateGroupDialog hide={toggleHideCreateGroupDialog} handleCreateGroup={handleCreateGroup} />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    searchbar: {
        flex: 1,
        marginRight: 10,
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
        margin: 5,
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerLinkContainer: {
        alignItems: 'center',
    },
    registerLinkText: {
        color: '#1E90FF',
    },
});

export default GroupsScreen;
