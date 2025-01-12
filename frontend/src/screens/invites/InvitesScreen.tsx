import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from "@react-navigation/native";
import {acceptInvitation, deleteInvitation, getGroups, getInvitations} from "../../helpers/backend_helper.ts";
import {Text, Surface, Searchbar, IconButton} from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome';
import ToastHelper from "../../Components/toast";
import Toast from "react-native-toast-message";


const InvitesScreen = ({ navigation }) => {
    const tabBarHeight = useBottomTabBarHeight();
    const [invitations, setInvitations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getInvitations({})
                .then((response) => {
                    setInvitations(response.invitations);
                });
        }, [])
    );

    useEffect(() => {
        setIsLoading(true);
        const delayDebounceFn = setTimeout(() => {
            getInvitations({ search_query: searchQuery })
                .then((response) => {
                    setInvitations(response.invitations);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }, 400);

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [searchQuery]);

    const handleAcceptInvitation = (group_id) => {
        console.log(group_id)
        acceptInvitation({group_id: group_id})
            .then((response) => {
                let newInvitations = [...invitations];
                newInvitations.splice(invitations.indexOf(group_id), 1);
                setInvitations(newInvitations);
            })
            .catch((error) => {
                ToastHelper.error("Accept invitation failed", error);
            });
    }


    const handleDeleteInvitation = (group_id) => {
        deleteInvitation({group_id: group_id})
            .then((response) => {
                let newInvitations = [...invitations];
                newInvitations.splice(invitations.indexOf(group_id), 1);
                setInvitations(newInvitations);
            })
            .catch((error) => {
                ToastHelper.error("Accept invitation failed", error);
            });
    }
    return (
        <SafeAreaView style={styles.container}>
            <Toast/>
            <View style={styles.searchRow}>
                <Searchbar
                    style={styles.searchbar}
                    placeholder="Search"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    clearIcon="close"
                    onClearIconPress={() => setSearchQuery('')}
                />

            </View>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#C03BDE" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={[styles.scrollview, { paddingBottom: tabBarHeight }]}>
                    {invitations.length > 0 ? (
                        invitations.map((group, idx) => (
                            <Surface
                                key={idx}
                                style={styles.surface}
                                elevation={4}
                            >
                                <View style={styles.row}>
                                    <Text style={styles.groupText}>
                                        {group}
                                    </Text>
                                    <View style={styles.iconContainer}>
                                        <Icon name="check" size={30} color="green" style={styles.icon} onPress={() => handleAcceptInvitation(group)}/>
                                        <Icon name="close" size={30} color="red" style={styles.icon} onPress={() => handleDeleteInvitation(group)}/>
                                    </View>
                                </View>
                            </Surface>

                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No invites</Text>
                        </View>
                    )}
                </ScrollView>
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
        width: '70%',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    groupText: {
        fontSize: 18,
        flex: 1,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: 15,
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
});



export default InvitesScreen;
