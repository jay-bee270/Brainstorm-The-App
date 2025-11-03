import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import Login from "../components/auth/Login";

const LoginPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <Login navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});

export default LoginPage;