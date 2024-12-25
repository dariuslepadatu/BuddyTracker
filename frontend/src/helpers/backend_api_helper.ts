import axios from 'axios';
import { refresh } from './backend_helper.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

AsyncStorage.getItem('accessToken').then((accessToken) => {
    if (accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
});


api.interceptors.response.use(
    response => {
        return response.data;
    },
    async (error) => {
        const status = error.response ? error.response.status : null;

        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {

                refresh({refreshToken: refreshToken})
                    .then(async response => {

                        await AsyncStorage.setItem('accessToken', response.access_token);
                        await AsyncStorage.setItem('refreshToken', response.refresh_token);

                        const token = response.access_token;
                        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;

                        return axios(originalRequest);
                    })
                    .catch(error => {
                        console.error('Error refreshing token:', error);

                    });

            }
        }


        if (status === 400) {
            console.error('Bad Request:', error.response.data);
        } else if (status === 403) {
            console.error('Forbidden:', error.response.data);
        } else if (status === 404) {
            console.error('Not Found:', error.response.data);
        } else if (status === 500) {
            console.error('Server Error:', error.response.data);
        } else {
            console.error('Unknown Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
