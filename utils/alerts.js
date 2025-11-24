import { Alert } from 'react-native';

export const showAlert = (title, message, type = 'info', onPress = null) => {
  const getButtonConfig = () => {
    switch (type) {
      case 'success':
        return { text: 'Continue', style: 'default' };
      case 'error':
        return { text: 'OK', style: 'destructive' };
      case 'warning':
        return { text: 'Understand', style: 'default' };
      default:
        return { text: 'OK', style: 'default' };
    }
  };

  const buttonConfig = getButtonConfig();

  Alert.alert(
    title,
    message,
    [
      { 
        ...buttonConfig, 
        style: type === 'error' ? 'destructive' : 'default',
        onPress: onPress
      }
    ],
    { cancelable: true }
  );
};

export const showConfirmation = (title, message, onConfirm, onCancel) => {
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
        text: 'Confirm',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};