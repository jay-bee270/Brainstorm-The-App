import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { postsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext'; // Adjust import path as needed

function Search() {
  const { colors } = useTheme(); // Get theme colors
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      console.log('Searching for:', searchTerm);
      const response = await postsAPI.searchPosts(searchTerm);
      console.log('Search results:', response);
      
      if (response.data) {
        setResults(Array.isArray(response.data) ? response.data : []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error', 
        'Failed to search projects. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    Keyboard.dismiss();
  };

  const formatResultItem = (item) => {
    return {
      _id: item._id || item.id,
      title: item.title || 'Untitled Project',
      category: item.category || 'uncategorized',
      description: item.description || item.content || 'No description available',
      tags: item.tags || item.skills || [],
      contactMethod: item.contactMethod,
      contactInfo: item.contactInfo,
      createdAt: item.createdAt,
    };
  };

  const handleResultPress = (item) => {
    Alert.alert(
      item.title,
      `Category: ${item.category}\n\n${item.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => {
          console.log('Navigate to project:', item._id);
        }},
      ]
    );
  };

  const renderItem = ({ item }) => {
    const formattedItem = formatResultItem(item);
    
    return (
      <TouchableOpacity 
        style={[styles.resultItem, { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }]}
        onPress={() => handleResultPress(formattedItem)}
      >
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
            {formattedItem.title}
          </Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(formattedItem.category, colors) }
          ]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {formattedItem.category}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={3}>
          {formattedItem.description}
        </Text>
        
        {formattedItem.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {formattedItem.tags.slice(0, 4).map((tag, index) => (
              <View key={index} style={[styles.tag, { 
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}30`
              }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
            {formattedItem.tags.length > 4 && (
              <View style={[styles.moreTag, { 
                backgroundColor: `${colors.textSecondary}15`,
                borderColor: `${colors.textSecondary}30`
              }]}>
                <Text style={[styles.moreTagText, { color: colors.textSecondary }]}>
                  +{formattedItem.tags.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {formattedItem.contactMethod && (
          <View style={[styles.contactInfo, { borderTopColor: colors.border }]}>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              Contact via <Text style={[styles.contactMethod, { color: colors.primary }]}>
                {formattedItem.contactMethod}
              </Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category, themeColors) => {
    const colors = {
      gaming: `${themeColors.primary}15`,
      research: `${themeColors.primary}15`,
      development: `${themeColors.primary}15`,
      design: `${themeColors.primary}15`,
    };
    return colors[category] || `${themeColors.textSecondary}15`;
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Searching projects...
          </Text>
        </View>
      );
    }

    if (hasSearched && searchTerm && results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="search" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No results found
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No projects found for "{searchTerm}". Try different keywords or check your spelling.
          </Text>
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: colors.surface }]} 
            onPress={clearSearch}
          >
            <Text style={[styles.clearButtonText, { color: colors.text }]}>
              Clear Search
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="search" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Search Projects
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Find projects by title, description, tags, or skills
          </Text>
          <View style={[styles.searchTips, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}>
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>
            
            </Text>
            <Text style={[styles.tip, { color: colors.textSecondary }]}></Text>
            <Text style={[styles.tip, { color: colors.textSecondary }]}></Text>
            <Text style={[styles.tip, { color: colors.textSecondary }]}></Text>
            <Text style={[styles.tip, { color: colors.textSecondary }]}></Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Search
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Find collaboration opportunities
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]}>
            <FontAwesome5 
              name="search" 
              size={16} 
              color={colors.textSecondary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search projects, skills, tags..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                <FontAwesome5 name="times" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[
              styles.searchButton,
              { backgroundColor: colors.primary },
              !searchTerm.trim() && [styles.searchButtonDisabled, { backgroundColor: colors.surface }]
            ]} 
            onPress={handleSearch}
            disabled={!searchTerm.trim()}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results.length > 0 ? (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.primary }]}>
                {results.length} project{results.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity onPress={clearSearch}>
                <Text style={[styles.clearResultsText, { color: colors.textSecondary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item._id || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  clearIcon: {
    padding: 4,
  },
  searchButton: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearResultsText: {
    fontSize: 14,
  },
  resultsList: {
    paddingBottom: 16,
  },
  resultItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  moreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  moreTagText: {
    fontSize: 12,
  },
  contactInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  contactText: {
    fontSize: 12,
  },
  contactMethod: {
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  searchTips: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    marginBottom: 4,
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    fontWeight: '600',
  },
});

export default Search;