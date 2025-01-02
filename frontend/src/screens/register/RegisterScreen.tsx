import React, {useEffect, useState} from 'react';
import { View, SafeAreaView, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

import {register, validate} from '../../helpers/backend_helper.ts';
import ToastHelper from '../../Components/toast';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }
            validate()
                .then(() => {
                    navigation.navigate('Protected', {screen: 'Groups'})
                })
        };
        checkAuth();
    }, []);

    const initialValues = {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Username is required')
            .test('no-spaces', 'Username cannot contain spaces', (value) => !/\s/.test(value)),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),

        first_name: Yup.string()
            .required('First name is required'),

        last_name: Yup.string()
            .required('Last name is required'),

        password: Yup.string()
            .required('Password is required'),

        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const handleRegister = async (values) => {
        register(values)
            .then(() => {
                navigation.navigate('Public', { screen: 'Login' });
            })
            .catch((error) => {
                ToastHelper.error('Registration Failed', error);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Toast />
            <Text variant="displayMedium" style={styles.title}>
                Register
            </Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleRegister}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                    <View style={styles.form}>
                        <View>
                            <TextInput
                                label="Username"
                                mode="outlined"
                                value={values.username}
                                onChangeText={handleChange('username')}
                                onFocus={() => { }}
                                onBlur={handleBlur('username')}
                                error={touched.username && errors.username ? true : false}
                            />
                            {touched.username && errors.username && (
                                <Text style={styles.errorText}>{errors.username}</Text>
                            )}
                        </View>
                        <View>
                            <TextInput
                                label="Email"
                                mode="outlined"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onFocus={() => { }}
                                onBlur={handleBlur('email')}
                                error={touched.email && errors.email ? true : false}
                            />
                            {touched.email && errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}
                        </View>
                        <View style={styles.row}>
                            <View style={styles.half}>
                                <TextInput
                                    label="First Name"
                                    mode="outlined"
                                    value={values.first_name}
                                    onChangeText={handleChange('first_name')}
                                    onFocus={() => { }}
                                    onBlur={handleBlur('first_name')}
                                    error={touched.first_name && errors.first_name ? true : false}
                                />
                                {touched.first_name && errors.first_name && (
                                    <Text style={styles.errorText}>{errors.first_name}</Text>
                                )}
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    label="Last Name"
                                    mode="outlined"
                                    value={values.last_name}
                                    onChangeText={handleChange('last_name')}
                                    onFocus={() => { }}
                                    onBlur={handleBlur('last_name')}
                                    error={touched.last_name && errors.last_name ? true : false}
                                />
                                {touched.last_name && errors.last_name && (
                                    <Text style={styles.errorText}>{errors.last_name}</Text>
                                )}
                            </View>
                        </View>
                        <View>
                            <TextInput
                                label="Password"
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                value={values.password}
                                onChangeText={handleChange('password')}
                                onFocus={() => { }}
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
                                <Text style={styles.errorText}>{errors.password}</Text>
                            )}
                        </View>
                        <View>
                            <TextInput
                                label="Confirm Password"
                                mode="outlined"
                                secureTextEntry={!showConfirmPassword}
                                value={values.confirm_password}
                                onChangeText={handleChange('confirm_password')}
                                onFocus={() => { }}
                                onBlur={handleBlur('confirm_password')}
                                error={touched.confirm_password && errors.confirm_password ? true : false}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />
                            {touched.confirm_password && errors.confirm_password && (
                                <Text style={styles.errorText}>{errors.confirm_password}</Text>
                            )}
                        </View>
                        <Button title="Submit" onPress={handleSubmit} color='#C03BDE' />
                    </View>
                )}
            </Formik>
            <TouchableOpacity
                onPress={() => navigation.navigate('Public', { screen: 'Login' })}
                style={styles.linkContainer}
            >
                <Text style={styles.linkText}>Already registered? Log in</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 50,
    },
    form: {
        width: '80%',
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    half: {
        flex: 1,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
    linkContainer: {
        position: 'absolute',
        bottom: 50,
    },
    linkText: {
        color: '#1E90FF',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
