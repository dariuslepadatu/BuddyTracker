import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

const showToast = (type, text1, text2) => {
    Toast.show({
        type,
        text1: text1 || '',
        text2: text2 || '',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 100 : 60,
    });
};

const ToastHelper = {
    success: (text1, text2) => showToast('success', text1, text2),
    error: (text1, text2) => showToast('error', text1, text2),
    warning: (text1, text2) => showToast('warning', text1, text2),
};

export default ToastHelper;
