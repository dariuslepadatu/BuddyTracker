import LoginScreen from '../screens/login/LoginScreen.tsx';
import HomeScreen from '../screens/home/HomeScreen';
import GroupsScreen from '../screens/groups/GroupsScreen.tsx';
import ProfileScreen from '../screens/profile/ProfileScreen.tsx';

const protectedScreens = [
    {name: 'Login', component: LoginScreen, options: { headerShown: false}},
    {name: 'Groups', component: GroupsScreen, options: { headerShown: false }},
    {name: 'Profile', component: ProfileScreen, options: { headerShown: false }},
];

const publicScreens = [

    {name: 'Home', component: HomeScreen, options: { headerShown: false }},


];

// @ts-ignore
export {protectedScreens, publicScreens};