import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Signup from "../components/auth/Signup";

const SignupPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <Signup navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
});

export default SignupPage;