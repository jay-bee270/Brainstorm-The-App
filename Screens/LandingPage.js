import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/landingpage/Navbar";
import Avatar from "../components/landingpage/Avatar";
import Footer from "../components/landingpage/Footer";
import GetStarted from "../components/landingpage/GetStarted";

const { width } = Dimensions.get('window');

function LandingPage() {
  const navigation = useNavigation();

  const features = [
    { title: "Gaming", icon: "🎮", desc: "Find your perfect gaming squad" },
    { title: "Development", icon: "💻", desc: "Connect with fellow developers" },
    { title: "Research", icon: "🔬", desc: "Collaborate on research projects" }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Navbar />

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Inspired by the movie "Hero Mode" 🎬</Text>
              </View>
              <Text style={styles.heroTitle}>
                BrainStorm – Where Innovation Meets Collaboration 🚀
              </Text>
              <Text style={styles.heroSubtitle}>
                Just like in "Hero Mode", we believe in the power of collaboration. 
                Find your perfect team, build amazing projects, and make your ideas come to life.
              </Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate("Signup")}
                >
                  <Text style={styles.primaryButtonText}>Start Collaborating</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {/* Scroll to features */}}
                >
                  <Text style={styles.secondaryButtonText}>Learn More ↓</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroAvatar}>
              <Avatar />
            </View>
          </View>

          {/* Movie Inspiration Quote */}
          <View style={styles.quoteSection}>
            <Text style={styles.quoteText}>
              "Like in Hero Mode, where a young programmer saves the day through collaboration and innovation, 
              BrainStorm empowers creators to come together and build something extraordinary."
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What We Offer</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* How It Works Section */}
          <View style={styles.howItWorksSection}>
            <Text style={styles.howItWorksTitle}>How It Works</Text>
            <Text style={styles.howItWorksSubtitle}>
              Tired of searching for the perfect team? BrainStorm connects you with like-minded collaborators instantly.
            </Text>
          </View>

          {/* Get Started Section */}
          <View style={styles.getStartedSection}>
            <GetStarted />
          </View>

          <Footer />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    paddingTop: 80,
  },
  heroContent: {
    marginBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 20,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#D1D5DB',
    marginBottom: 32,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroAvatar: {
    alignItems: 'center',
    marginTop: 20,
  },
  quoteSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    margin: 20,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  quoteText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    padding: 20,
    marginTop: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  featureDesc: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 16,
  },
  howItWorksSection: {
    padding: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  howItWorksTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  howItWorksSubtitle: {
    color: '#D1D5DB',
    fontSize: 18,
    textAlign: 'center',
    maxWidth: 400,
  },
  getStartedSection: {
    marginTop: 40,
  },
});

export default LandingPage;