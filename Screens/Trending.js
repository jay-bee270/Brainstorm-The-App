import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Trending() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default Trending;