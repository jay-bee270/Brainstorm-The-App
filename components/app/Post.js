import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Post() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Find Your Team</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default Post;