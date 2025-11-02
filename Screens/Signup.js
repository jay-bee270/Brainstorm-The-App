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
    <ScrollView style={styles.container}>
      <View style={styles.background} />
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Join BrainStorm</Text>
          <Text style={styles.subtitle}>
            Connect with like-minded creators and build amazing projects together
          </Text>

          <Signup />

          <View style={styles.loginRedirect}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    minHeight: "100%",
  },
  formContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.3)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "#374151",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 32,
    fontSize: 16,
  },
  loginRedirect: {
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 4,
  },
  loginLink: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});

export default SignupPage;
