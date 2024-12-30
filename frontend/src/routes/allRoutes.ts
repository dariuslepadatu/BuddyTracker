import LoginScreen from '../screens/login/LoginScreen.tsx';
import SplashScreen from '../screens/splash/SplashScreen.tsx';
import GroupsScreen from '../screens/groups/GroupsScreen.tsx';
import ProfileScreen from '../screens/profile/ProfileScreen.tsx';
import RegisterScreen from '../screens/register/RegisterScreen.tsx';

const protectedScreens = [
    {name: 'Groups', component: GroupsScreen, options: { headerShown: false }},
    {name: 'Profile', component: ProfileScreen, options: { headerShown: false }},
];

const publicScreens = [

    {name: 'Splash', component: SplashScreen, options: { headerShown: false }},
    {name: 'Login', component: LoginScreen, options: { headerShown: false}},
    {name: 'Register', component: RegisterScreen, options: { headerShown: false}},
];

// @ts-ignore
export {protectedScreens, publicScreens};