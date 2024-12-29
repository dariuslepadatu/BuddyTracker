import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { protectedScreens, publicScreens } from './src/routes/allRoutes.ts';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
function ProtectedScreens() {
    return (
        <Tab.Navigator  screenOptions={{ headerShown: false, tabBarActiveTintColor: '#C03BDE' }}>
            {protectedScreens.map((screen, idx) => (
                <Tab.Screen
                    name={screen.name}
                    component={screen.component}
                    options={screen.options}
                    key={idx}
                />
            ))}
        </Tab.Navigator>
    );
}

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
