import { Alert, Platform, ToastAndroid } from 'react-native';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

export function showSuccess(message: string) {
  showToast(message);
}

export function showError(message: string) {
  showToast(message);
}

export default { showSuccess, showError };
