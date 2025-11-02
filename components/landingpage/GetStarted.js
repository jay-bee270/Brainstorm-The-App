import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function GetStarted() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Sign Up & Create Your Profile
          </Text>
          <Text style={styles.cardText}>
            Join BrainStorm with a quick signup. Set up your profile with your interests—gaming, 
            coding, or research.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Post or Explore Projects
          </Text>
          <Text style={styles.cardText}>
            Post your own project or gaming session, OR Browse existing posts to find 
            something that interests you
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Connect & Get Started..
          </Text>
          <Text style={styles.cardText}>
            Start working together—no distractions, just collaboration!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default GetStarted;