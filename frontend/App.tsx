// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {protectedScreens, publicScreens} from './src/routes/allRoutes.ts';



const Stack = createNativeStackNavigator();


export default function App() {
  return (
      <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
              {
                  publicScreens.map((screen, idx) => (
                      <Stack.Screen
                          name={screen.name}
                          component={screen.component}
                          options={screen.options}
                          key={idx} />
                  ))
              }
              {
                  protectedScreens.map((screen, idx) => (
                      <Stack.Screen
                          name={screen.name}
                          component={screen.component}
                          options={screen.options}
                          key={idx} />
                  ))
              }
          </Stack.Navigator>
      </NavigationContainer>
  );
}