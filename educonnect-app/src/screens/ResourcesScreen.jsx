import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources, setFilters, toggleSaveResource } from '../store/slices/resourcesSlice';
import { Box, VStack, HStack, Badge, IconButton } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResourcesScreen = () => {
  const dispatch = useDispatch();
  const { filteredResources: resources, categories, filters, isLoading } = useSelector(state => state.resources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({
      searchQuery,
      type: selectedType === 'all' ? undefined : selectedType,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    }));
  }, [searchQuery, selectedType, selectedCategory, dispatch]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return 'school';
      case 'certificate': return 'workspace-premium';
      case 'software': return 'computer';
      case 'grant': return 'attach-money';
      default: return 'description';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return '#4CAF50';
      case 'certificate': return '#2196F3';
      case 'software': return '#FF9800';
      case 'grant': return '#9C27B0';
      default: return '#607D8B';
    }
  };

  const ResourceCard = ({ resource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => { /* Navigate to detail */ }}
    >
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack alignItems="center" space={2}>
            <Icon
              name={getTypeIcon(resource.type)}
              size={20}
              color={getTypeColor(resource.type)}
            />
            <Badge colorScheme="success" variant="subtle">
              {resource.type.toUpperCase()}
            </Badge>
          </HStack>
          <IconButton
            icon={
              <Icon
                name={resource.saved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color="#D4A574"
              />
            }
            onPress={() => dispatch(toggleSaveResource(resource.id))}
          />
        </HStack>

        <VStack space={2}>
          <Text style={styles.resourceTitle} numberOfLines={2}>
            {resource.title}
          </Text>
          <Text style={styles.resourceDescription} numberOfLines={3}>
            {resource.description}
          </Text>
        </VStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text style={styles.provider}>{resource.provider}</Text>
          <HStack alignItems="center" space={2}>
            {resource.rating && (
              <HStack alignItems="center" space={1}>
                <Icon name="star" size={16} color="#D4A574" />
                <Text style={styles.rating}>{resource.rating}</Text>
              </HStack>
            )}
            {resource.isFree && (
              <Badge colorScheme="warning" variant="solid">
                GRATUIT
              </Badge>
            )}
          </HStack>
        </HStack>

        {resource.deadline && (
          <HStack alignItems="center" space={1}>
            <Icon name="event" size={16} color="#718096" />
            <Text style={styles.deadline}>Jusqu'au {new Date(resource.deadline).toLocaleDateString()}</Text>
          </HStack>
        )}

        {resource.tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={2}>
              {resource.tags.map((tag, index) => (
                <Badge key={index} colorScheme="coolGray" variant="outline">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </ScrollView>
        )}
      </VStack>
    </TouchableOpacity>
  );

  const FilterChip = ({ label, value, selected, onSelect }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={() => onSelect(value)}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ressources</Text>
        <Text style={styles.headerSubtitle}>Découvrez des opportunités gratuites</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des ressources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#718096"
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={2}>
            <FilterChip
              label="Tous"
              value="all"
              selected={selectedType === 'all'}
              onSelect={setSelectedType}
            />
            {['course', 'certificate', 'software', 'grant'].map(type => (
              <FilterChip
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={type}
                selected={selectedType === type}
                onSelect={setSelectedType}
              />
            ))}
          </HStack>
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Catégorie :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={2}>
            <FilterChip
              label="Toutes"
              value="all"
              selected={selectedCategory === 'all'}
              onSelect={setSelectedCategory}
            />
            {categories.map(category => (
              <FilterChip
                key={category}
                label={category}
                value={category}
                selected={selectedCategory === category}
                onSelect={setSelectedCategory}
              />
            ))}
          </HStack>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.resourcesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resourcesListContent}
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          <VStack space={4}>
            {resources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </VStack>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Sorts Mill Goudy',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 4,
    fontFamily: 'Oranienbaum',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    fontFamily: 'Oranienbaum',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resourcesList: {
    flex: 1,
  },
  resourcesListContent: {
    padding: 20,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    fontFamily: 'Oranienbaum',
  },
  provider: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  rating: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '500',
  },
  deadline: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4A5568',
    marginTop: 20,
    fontFamily: 'Oranienbaum',
  },
});

export default ResourcesScreen;