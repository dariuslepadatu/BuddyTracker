import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {getGroups, setLocation} from "../../helpers/backend_helper.ts";
import {Text, Surface, Searchbar, IconButton} from "react-native-paper";
import ChatScreen from "./chat/ChatScreen.tsx";
import Icon from "react-native-vector-icons/FontAwesome";
import CreateGroupDialog from "./dialog/CreateGroupDialog.tsx";
import GroupInfoScreen from "./groupInfo/GroupInfoScreen.tsx";
import Geolocation from "react-native-geolocation-service";
import ToastHelper from "../../Components/toast";
import Toast from "react-native-toast-message";
import MapScreen from "./map/MapScreen.tsx";

const Stack = createNativeStackNavigator();

const GroupsListScreen = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Stare pentru loader
    const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
    const navigation = useNavigation();



    useFocusEffect(
        useCallback(() => {
            const fetchLocation = () => {
                Geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
                        console.log('Geolocation position', position);
                    },
                    (error) => {
                        // setLocationError(error.message);
                        ToastHelper.error('Geolocation position error', error);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            };
            fetchLocation();

        }, [])
    );



    useFocusEffect(
        useCallback(() => {
            getGroups({})
                .then((response) => {
                    setGroups(response.groups);
                });
        }, [])
    );

    useEffect(() => {
        setIsLoading(true);
        const delayDebounceFn = setTimeout(() => {
            getGroups({ search_query: searchQuery })
                .then((response) => {
                    setGroups(response.groups);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }, 400);

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
                <IconButton
                    icon="plus-circle-outline"
                    size={25}
                    onPress={() => setShowCreateGroupDialog(true)}
                />
            </View>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#C03BDE" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={[styles.scrollview, { paddingBottom: tabBarHeight }]}>
                    {groups.length > 0 ? (
                        groups.map((group, idx) => (
                            <Surface
                                key={idx}
                                style={styles.surface}
                                elevation={4}
                                onTouchEnd={() => navigation.navigate('Chat', { group })}
                            >
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
            )}
            {showCreateGroupDialog && (
                <CreateGroupDialog hide={toggleHideCreateGroupDialog} handleCreateGroup={handleCreateGroup} />
            )}
        </SafeAreaView>
    );
};

const GroupsScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="GroupsList"
                component={GroupsListScreen}
                options={{ title: 'Groups', headerShown: false }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route, navigation }) => ({
                    title: route.params.group || 'Chat',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon
                                name="info-circle"
                                size={20}
                                color="#C03BDE"
                                style={{ marginRight: 15 }}
                                onPress={() => {
                                    navigation.navigate('GroupInfoScreen', { group: route.params.group });
                                }}
                            />
                            <Icon
                                name="map"
                                size={20}
                                color="#C03BDE"
                                onPress={() => {
                                    navigation.navigate('MapScreen', { group: route.params.group });
                                }}
                            />
                        </View>
                    ),
                    headerLeft: () => (
                        <Icon
                            name="arrow-left"
                            size={20}
                            color="#C03BDE"
                            style={{ marginLeft: 15 }}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name="GroupInfoScreen"
                component={GroupInfoScreen}
                options={({ route, navigation }) => ({
                    title: `${route.params.group} Info`,
                    headerLeft: () => (
                        <Icon
                            name="arrow-left"
                            size={20}
                            color="#C03BDE"
                            style={{ marginLeft: 15 }}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={({ route, navigation }) => ({
                    title: `${route.params.group} Map`,
                    headerLeft: () => (
                        <Icon
                            name="arrow-left"
                            size={20}
                            color="#C03BDE"
                            style={{ marginLeft: 15 }}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GroupsScreen;
