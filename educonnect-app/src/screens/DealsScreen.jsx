import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals, setUserLocation, filterByCategory, toggleSaveDeal } from '../store/slices/dealsSlice';
import { VStack, HStack, Badge, IconButton } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';

const DealsScreen = () => {
  const dispatch = useDispatch();
  const { filteredDeals: deals, categories } = useSelector((state) => state.deals);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchDeals());
    requestLocation();
  }, [dispatch]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        dispatch(setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  useEffect(() => {
    dispatch(filterByCategory(selectedCategory));
  }, [selectedCategory, dispatch]);

  const filteredDeals = showNearbyOnly 
    ? deals.filter(deal => deal.distance && deal.distance < 5)
    : deals;

  const DealCard = ({ deal }) => (
    <TouchableOpacity
      style={styles.dealCard}
      onPress={() => { /* Navigate to detail */ }}
    >
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <Badge colorScheme="info" variant="subtle">
            {deal.category}
          </Badge>
          {deal.verified && (
            <HStack alignItems="center" space={1}>
              <Icon name="verified" size={16} color="#4CAF50" />
              <Text style={styles.verifiedText}>Vérifié</Text>
            </HStack>
          )}
        </HStack>

        <VStack space={2}>
          <Text style={styles.dealTitle} numberOfLines={2}>
            {deal.title}
          </Text>
          <Text style={styles.dealDescription} numberOfLines={3}>
            {deal.description}
          </Text>
        </VStack>

        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" space={2}>
            <Text style={styles.originalPrice}>€{deal.originalPrice}</Text>
            <Text style={styles.discountedPrice}>€{deal.discountedPrice}</Text>
            <Badge colorScheme="error" variant="solid">
              -{deal.discount}
            </Badge>
          </HStack>
          <IconButton
            icon={
              <Icon
                name={deal.saved ? 'favorite' : 'favorite-border'}
                size={24}
                color="#D4A574"
              />
            }
            onPress={() => dispatch(toggleSaveDeal(deal.id))}
          />
        </HStack>

        <Text style={styles.company}>{deal.company}</Text>

        {deal.location && (
          <HStack alignItems="center" space={1}>
            <Icon name="location-on" size={16} color="#718096" />
            <Text style={styles.location}>{deal.location.address}</Text>
            {deal.distance && (
              <Text style={styles.distance}>({deal.distance} km)</Text>
            )}
          </HStack>
        )}

        <HStack alignItems="center" space={1}>
          <Icon name="event" size={16} color="#718096" />
          <Text style={styles.validity}>Valable jusqu'au {new Date(deal.validUntil).toLocaleDateString()}</Text>
        </HStack>

        {deal.requirements.length > 0 && (
          <VStack space={1}>
            <Text style={styles.requirementsTitle}>Conditions :</Text>
            {deal.requirements.map((req, index) => (
              <HStack key={index} alignItems="center" space={2}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirement}>{req}</Text>
              </HStack>
            ))}
          </VStack>
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
        <Text style={styles.headerTitle}>Deals Étudiants</Text>
        <Text style={styles.headerSubtitle}>Économisez avec des offres exclusives</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.locationToggle}>
          <Text style={styles.toggleLabel}>Offres à proximité uniquement</Text>
          <Switch
            value={showNearbyOnly}
            onValueChange={setShowNearbyOnly}
            trackColor={{ false: '#E2E8F0', true: '#D4A574' }}
            thumbColor={showNearbyOnly ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.categoryFilters}>
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
      </View>

      <ScrollView
        style={styles.dealsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.dealsListContent}
      >
        <VStack space={4}>
          {filteredDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </VStack>
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
  controlsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  locationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  categoryFilters: {
    marginTop: 12,
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
  dealsList: {
    flex: 1,
  },
  dealsListContent: {
    padding: 20,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  dealDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    fontFamily: 'Oranienbaum',
  },
  originalPrice: {
    fontSize: 16,
    color: '#718096',
    textDecorationLine: 'line-through',
    fontFamily: 'Oranienbaum',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4A574',
    fontFamily: 'Oranienbaum',
  },
  company: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  distance: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  validity: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 8,
    fontFamily: 'Oranienbaum',
  },
  requirement: {
    fontSize: 12,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
});

export default DealsScreen;