import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <BottomBarItem
          key={index}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={item.active}
          onPress={handlePress}
        />
      ))}
    </View>
  );
};

const BottomBarItem = ({ to, icon, label, isActive, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.item, isActive && styles.itemActive]} 
      onPress={() => onPress(to)}
    >
      <FontAwesome5 
        name={icon} 
        size={20} 
        color={isActive ? '#10B981' : '#9CA3AF'} 
        style={styles.icon} 
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
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
  itemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default BottomBar;