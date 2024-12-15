import LoginScreen from '../screens/login/LoginScreen.tsx';
import HomeScreen from '../screens/home/HomeScreen';

const protectedScreens = [
];

const publicScreens = [
    // authentication Page

    {name: 'Home', component: HomeScreen, options: { headerShown: false }},
    {name: 'Login', component: LoginScreen, options: { headerShown: false }},


];

// @ts-ignore
export {protectedScreens, publicScreens};