import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Login from "../components/auth/Login";

const LoginPage = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.background} />
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Continue building amazing projects with your team
          </Text>
          <Login />
          
          <View style={styles.signupRedirect}>
            <Text style={styles.signupText}>
              Don't  have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign up</Text>
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
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    minHeight: '100%',
  },
  formContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#374151',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  signupRedirect: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  signupLink: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default LoginPage;