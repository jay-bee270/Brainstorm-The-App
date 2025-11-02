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

function Search() {
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
    // You can navigate to project details or handle join action
    Alert.alert(
      item.title,
      `Category: ${item.category}\n\n${item.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => {
          // Navigate to project details screen
          console.log('Navigate to project:', item._id);
        }},
      ]
    );
  };

  const renderItem = ({ item }) => {
    const formattedItem = formatResultItem(item);
    
    return (
      <TouchableOpacity 
        style={styles.resultItem}
        onPress={() => handleResultPress(formattedItem)}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {formattedItem.title}
          </Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(formattedItem.category) }
          ]}>
            <Text style={styles.categoryText}>
              {formattedItem.category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.resultDescription} numberOfLines={3}>
          {formattedItem.description}
        </Text>
        
        {formattedItem.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {formattedItem.tags.slice(0, 4).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {formattedItem.tags.length > 4 && (
              <View style={styles.moreTag}>
                <Text style={styles.moreTagText}>
                  +{formattedItem.tags.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {formattedItem.contactMethod && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>
              Contact via <Text style={styles.contactMethod}>{formattedItem.contactMethod}</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      gaming: 'rgba(147, 51, 234, 0.1)',
      research: 'rgba(59, 130, 246, 0.1)',
      development: 'rgba(16, 185, 129, 0.1)',
      design: 'rgba(245, 158, 11, 0.1)',
    };
    return colors[category] || 'rgba(107, 114, 128, 0.1)';
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.emptyStateText}>Searching projects...</Text>
        </View>
      );
    }

    if (hasSearched && searchTerm && results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="search" size={48} color="#4B5563" />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            No projects found for "{searchTerm}". Try different keywords or check your spelling.
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="search" size={48} color="#4B5563" />
          <Text style={styles.emptyStateTitle}>Search Projects</Text>
          <Text style={styles.emptyStateText}>
            Find projects by title, description, tags, or skills
          </Text>
          <View style={styles.searchTips}>
            <Text style={styles.tipsTitle}>Try searching for:</Text>
            <Text style={styles.tip}>• "React Native"</Text>
            <Text style={styles.tip}>• "AI research"</Text>
            <Text style={styles.tip}>• "Game development"</Text>
            <Text style={styles.tip}>• "Web design"</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
          <Text style={styles.headerSubtitle}>Find collaboration opportunities</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome5 
              name="search" 
              size={16} 
              color="#6B7280" 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search projects, skills, tags..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                <FontAwesome5 name="times" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[
              styles.searchButton,
              !searchTerm.trim() && styles.searchButtonDisabled
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
              <Text style={styles.resultsCount}>
                {results.length} project{results.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.clearResultsText}>Clear</Text>
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
    backgroundColor: '#000000',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
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
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearIcon: {
    padding: 4,
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#374151',
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
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  clearResultsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resultsList: {
    paddingBottom: 16,
  },
  resultItem: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
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
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  categoryText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  resultDescription: {
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tagText: {
    color: '#10B981',
    fontSize: 12,
  },
  moreTag: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  moreTagText: {
    color: '#6B7280',
    fontSize: 12,
  },
  contactInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  contactText: {
    color: '#6B7280',
    fontSize: 12,
  },
  contactMethod: {
    color: '#10B981',
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
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  searchTips: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: 16,
  },
  tipsTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  clearButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Search;