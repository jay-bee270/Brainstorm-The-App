import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../Screens/Splash";
import OnboardingScreen from "../Screens/Onboarding";
import SignupPage from "../Screens/Signup";
import LoginPage from "../Screens/Login";
import Dashboard from "../Screens/Dashboard";
import Gaming from "../Screens/Gaming";
import Development from "../Screens/Development";
import Research from "../Screens/Research";
import MyPosts from "../Screens/MyPosts";
import Settings from "../Screens/Settings";
import Profile from "../Screens/Profile";
import Search from "../components/dashboard/Search";
import Layout from "../components/dashboard/Layout";

const Stack = createNativeStackNavigator();

// Create individual wrapped components
const DashboardWithLayout = (props) => (
  <Layout>
    <Dashboard {...props} />
  </Layout>
);

const GamingWithLayout = (props) => (
  <Layout>
    <Gaming {...props} />
  </Layout>
);

const DevelopmentWithLayout = (props) => (
  <Layout>
    <Development {...props} />
  </Layout>
);

const ResearchWithLayout = (props) => (
  <Layout>
    <Research {...props} />
  </Layout>
);

const MyPostsWithLayout = (props) => (
  <Layout>
    <MyPosts {...props} />
  </Layout>
);

const SettingsWithLayout = (props) => (
  <Layout>
    <Settings {...props} />
  </Layout>
);

const ProfileWithLayout = (props) => (
  <Layout>
    <Profile {...props} />
  </Layout>
);

const SearchWithLayout = (props) => (
  <Layout>
    <Search {...props} />
  </Layout>
);

function RouterPath() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' }
        }}
      >
        {/* Auth & Onboarding Routes (No Layout) */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Signup" component={SignupPage} />
        <Stack.Screen name="Login" component={LoginPage} />
        
        {/* Main App Routes (With Layout - Navbar + BottomBar) */}
        <Stack.Screen name="Dashboard" component={DashboardWithLayout} />
        <Stack.Screen name="Gaming" component={GamingWithLayout} />
        <Stack.Screen name="Development" component={DevelopmentWithLayout} />
        <Stack.Screen name="Research" component={ResearchWithLayout} />
        <Stack.Screen name="MyPosts" component={MyPostsWithLayout} />
        <Stack.Screen name="Settings" component={SettingsWithLayout} />
        <Stack.Screen name="Profile" component={ProfileWithLayout} />
        <Stack.Screen name="Search" component={SearchWithLayout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RouterPath;