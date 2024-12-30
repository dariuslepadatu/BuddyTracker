import LoginScreen from '../screens/login/LoginScreen.tsx';
import SplashScreen from '../screens/splash/SplashScreen.tsx';
import GroupsScreen from '../screens/groups/GroupsScreen.tsx';
import ProfileScreen from '../screens/profile/ProfileScreen.tsx';

const protectedScreens = [
    {name: 'Groups', component: GroupsScreen, options: { headerShown: false }},
    {name: 'Profile', component: ProfileScreen, options: { headerShown: false }},
];

const publicScreens = [

    {name: 'Home', component: SplashScreen, options: { headerShown: false }},
    {name: 'Login', component: LoginScreen, options: { headerShown: false}},


];

// @ts-ignore
export {protectedScreens, publicScreens};