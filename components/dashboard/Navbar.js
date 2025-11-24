import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surface, 
        borderBottomColor: colors.border 
      }
    ]}>
      <View style={styles.leftSection}>
        <Text style={[styles.logo, { color: colors.primary }]}>
          BrainStorm
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[
            styles.iconButton, 
            { 
              backgroundColor: colors.primary,
              ...(isDarkMode ? styles.iconButtonDark : styles.iconButtonLight)
            }
          ]}
          onPress={() => navigation.navigate('Search')}
        >
          <FontAwesome5 
            name="search" 
            size={16} 
            color={isDarkMode ? "#000000" : "#000000"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.iconButton, 
            { 
              backgroundColor: colors.primary,
              ...(isDarkMode ? styles.iconButtonDark : styles.iconButtonLight)
            }
          ]}
          onPress={() => navigation.navigate('Profile')}
        >
          <FontAwesome5 
            name="user" 
            size={16} 
            color={isDarkMode ? "#000000" : "#000000"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton, 
            { 
              backgroundColor: colors.primary,
              ...(isDarkMode ? styles.iconButtonDark : styles.iconButtonLight)
            }
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <FontAwesome5 
            name="cog" 
            size={16} 
            color={isDarkMode ? "#000000" : "#000000"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Extra padding at top
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Navbar;