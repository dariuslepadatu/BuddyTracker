import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { protectedScreens, publicScreens } from './src/routes/allRoutes.ts';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/FontAwesome';
import {Platform, StyleSheet, View} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import AuthProtected from "./src/routes/AuthProtected.tsx";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Public Stack Navigator
function PublicScreens() {
    return (
        <Stack.Navigator>
            {publicScreens.map((screen, idx) => (
                <Stack.Screen
                    name={screen.name}
                    component={screen.component}
                    options={screen.options}
                    key={idx}
                />
            ))}
        </Stack.Navigator>
    );
}

// Protected Tab Navigator
const ProtectedScreens = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                animation: 'fade',
                headerShown: false,
                tabBarActiveTintColor: '#C03BDE',
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Profile') {
                        iconName = 'user';
                    } else if (route.name === 'Groups') {
                        iconName = 'group';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarBackground: () =>
                    Platform.OS === 'ios' ? (
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="light"
                            blurAmount={10}
                            reducedTransparencyFallbackColor="white"
                        />
                    ) : (
                        <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                    ),
            })}
        >
            {protectedScreens.map((screen, idx) => (
                <Tab.Screen
                    name={screen.name}
                    key={idx}
                    options={screen.options}
                >
                    {props => (
                        <AuthProtected>
                            <screen.component {...props} />
                        </AuthProtected>
                    )}
                </Tab.Screen>
            ))}
        </Tab.Navigator>
    );
};



export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Public">
                    {/* Public Stack */}
                    <Stack.Screen
                        name="Public"
                        component={PublicScreens}
                        options={{ headerShown: false }}
                    />

                    {/* Protected Tabs */}
                    <Stack.Screen
                        name="Protected"
                        component={ProtectedScreens}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
