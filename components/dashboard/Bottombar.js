import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const navItems = [
    { 
      to: 'Dashboard', 
      icon: 'home', 
      label: 'Home',
      active: route.name === 'Dashboard'
    },
    { 
      to: 'Gaming', 
      icon: 'gamepad', 
      label: 'Gaming',
      active: route.name === 'Gaming'
    },
    { 
      to: 'Development', 
      icon: 'code', 
      label: 'Dev',
      active: route.name === 'Development'
    },
    { 
      to: 'Research', 
      icon: 'book', 
      label: 'Research',
      active: route.name === 'Research'
    },
    { 
      to: 'MyPosts', 
      icon: 'bookmark', 
      label: 'My Posts',
      active: route.name === 'MyPosts'
    },
  ];

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ThemedContainer>
      {navItems.map((item, index) => (
        <BottomBarItem
          key={index}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={item.active}
          onPress={handlePress}
          colors={colors}
        />
      ))}
    </ThemedContainer>
  );
};

const ThemedContainer = ({ children }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surface, 
      borderTopColor: colors.border 
    }]}>
      {children}
    </View>
  );
};

const BottomBarItem = ({ to, icon, label, isActive, onPress, colors }) => {
  const iconColor = isActive ? colors.primary : colors.textSecondary;
  const labelColor = isActive ? colors.primary : colors.textSecondary;
  const backgroundColor = isActive ? `${colors.primary}20` : 'transparent';

  return (
    <TouchableOpacity 
      style={[
        styles.item, 
        { backgroundColor }
      ]} 
      onPress={() => onPress(to)}
    >
      <FontAwesome5 
        name={icon} 
        size={20} 
        color={iconColor} 
        style={styles.icon} 
      />
      <Text style={[
        styles.label, 
        { color: labelColor },
        isActive && styles.labelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    height: 70,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '600',
  },
});

export default BottomBar;