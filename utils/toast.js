import { Alert, ToastAndroid, Platform } from 'react-native';

export const showToast = {
  success: (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else {
      // For iOS, use Alert or a custom toast solution
      Alert.alert('Success', message, [{ text: 'OK' }]);
    }
  },
  
  error: (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else {
      // For iOS, use Alert or a custom toast solution
      Alert.alert('Error', message, [{ text: 'OK' }]);
    }
  },
  
  // Additional toast types for better UX
  info: (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else {
      Alert.alert('Info', message, [{ text: 'OK' }]);
    }
  },
  
  // Custom alert for important messages
  alert: (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },
  
  // Confirmation dialog
  confirm: (title, message, onConfirm, onCancel) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'OK',
          onPress: onConfirm,
        },
      ],
      { cancelable: false }
    );
  }
};