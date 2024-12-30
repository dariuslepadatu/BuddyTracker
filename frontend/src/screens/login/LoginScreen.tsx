import React, {useState} from 'react';
import {View, SafeAreaView, TouchableOpacity, Button} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

import {login} from '../../helpers/backend_helper.ts';
import ToastHelper from '../../Components/toast';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        username: '',
        password: ''
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Username is required')
            .test('no-spaces', 'Username cannot contain spaces', (value) => !/\s/.test(value)),

        password: Yup.string()
            .required('Password is required')
            .test('no-spaces', 'Username cannot contain spaces', (value) => !/\s/.test(value)),
    });

    const handleLogin = async (values) => {
        login(values)
            .then(async (response) => {
                await AsyncStorage.setItem('accessToken', response.access_token);
                await AsyncStorage.setItem('refreshToken', response.refresh_token);
                navigation.navigate('Protected', {screen: 'Groups'});
            })
            .catch((error) => {
                ToastHelper.error('Login Failed', error);
            })
    };
    return (
        <SafeAreaView style={{ backgroundColor: '#fff', flex: 1, padding: 20, justifyContent:'center',alignItems: 'center'}}>
            <Toast />
            <Text variant="displayMedium" style={{ marginBottom: 50 }}>
                Login
            </Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                    <View style={{ width: '80%', gap: 20}}>
                        <View>
                            <TextInput
                                label="Username"
                                mode="outlined"
                                value={values.username}
                                onChangeText={handleChange('username')}
                                onFocus={() => {}}
                                onBlur={handleBlur('username')}
                                error={touched.username && errors.username ? true : false}
                            />
                            {touched.username && errors.username && (
                                <Text style={{ color: 'red', fontSize: 12 }}>{errors.username}</Text>
                            )}
                        </View>
                        <View>
                            <TextInput
                                label="Password"
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                value={values.password}
                                onChangeText={handleChange('password')}
                                onFocus={() => {}}
                                onBlur={handleBlur('password')}
                                error={touched.password && errors.password ? true : false}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />
                            {touched.password && errors.password && (
                                <Text style={{ color: 'red', fontSize: 12 }}>{errors.password}</Text>
                            )}
                        </View>
                        <Button title="Submit" onPress={handleSubmit} color='#C03BDE'/>
                    </View>
                )}
            </Formik>
        </SafeAreaView>
    );
};

export default LoginScreen;
