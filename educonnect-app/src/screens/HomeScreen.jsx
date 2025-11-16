import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources } from '../store/slices/resourcesSlice';
import { fetchDeals } from '../store/slices/dealsSlice';
import { fetchPosts } from '../store/slices/communitySlice';
import { VStack, HStack, Avatar, Badge } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { filteredResources: resources = [] } = useSelector(state => state.resources || {});
  const { filteredDeals: deals = [] } = useSelector(state => state.deals || {});
  const { filteredPosts: posts = [] } = useSelector(state => state.community || {});

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchDeals());
    dispatch(fetchPosts());
  }, [dispatch]);
  const recentResources = resources.slice(0, 3);
  const trendingDeals = deals.filter(deal => deal.saved).slice(0, 3);
  const recentPosts = posts.slice(0, 2);

  const ResourceCard = ({ resource }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Resources', { resourceId: resource.id })}
    >
      <VStack space={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Badge colorScheme="success" variant="subtle">
            {resource.type}
          </Badge>
          {resource.isFree && (
            <Badge colorScheme="warning" variant="solid">
              GRATUIT
            </Badge>
          )}
        </HStack>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {resource.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {resource.description}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={styles.provider}>{resource.provider}</Text>
          {resource.rating && (
            <HStack alignItems="center" space={1}>
              <Icon name="star" size={16} color="#D4A574" />
              <Text style={styles.rating}>{resource.rating}</Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </TouchableOpacity>
  );

  const DealCard = ({ deal }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Deals', { dealId: deal.id })}
    >
      <VStack space={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Badge colorScheme="info" variant="subtle">
            {deal.category}
          </Badge>
          <Badge colorScheme="error" variant="solid">
            -{deal.discount}
          </Badge>
        </HStack>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {deal.title}
        </Text>
        <HStack alignItems="center" space={2}>
          <Text style={styles.originalPrice}>€{deal.originalPrice}</Text>
          <Text style={styles.discountedPrice}>€{deal.discountedPrice}</Text>
        </HStack>
        <Text style={styles.company}>{deal.company}</Text>
      </VStack>
    </TouchableOpacity>
  );

  const PostCard = ({ post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('Community', { postId: post.id })}
    >
      <HStack space={3} alignItems="flex-start">
        <Avatar size="sm" source={{ uri: `https://ui-avatars.com/api/?name=${post.author.name}` }} />
        <VStack flex={1} space={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.timestamp}>2h</Text>
          </HStack>
          <Text style={styles.postContent} numberOfLines={3}>
            {post.content}
          </Text>
          <HStack alignItems="center" space={4}>
            <HStack alignItems="center" space={1}>
              <Icon name="favorite" size={16} color={post.isLiked ? '#D4A574' : '#CBD5E0'} />
              <Text style={styles.interactionText}>{post.likes}</Text>
            </HStack>
            <HStack alignItems="center" space={1}>
              <Icon name="comment" size={16} color="#CBD5E0" />
              <Text style={styles.interactionText}>{post.comments.length}</Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <VStack space={2}>
          <Text style={styles.greeting}>
            Bonjour {user?.name || 'Étudiant'} 👋
          </Text>
          <Text style={styles.subtitle}>
            Découvrez de nouvelles opportunités aujourd'hui
          </Text>
        </VStack>
      </View>

      <View style={styles.section}>
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text style={styles.sectionTitle}>Ressources récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Resources')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </HStack>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={3}>
            {recentResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </HStack>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text style={styles.sectionTitle}>Deals populaires</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Deals')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </HStack>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={3}>
            {trendingDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </HStack>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text style={styles.sectionTitle}>Communauté</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Community')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </HStack>
        <VStack space={3}>
          {recentPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </VStack>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Sorts Mill Goudy',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  seeAll: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '500',
    fontFamily: 'Oranienbaum',
  },
  card: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  provider: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  rating: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '500',
  },
  originalPrice: {
    fontSize: 14,
    color: '#718096',
    textDecorationLine: 'line-through',
    fontFamily: 'Oranienbaum',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4A574',
    fontFamily: 'Oranienbaum',
  },
  company: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  timestamp: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  postContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    fontFamily: 'Oranienbaum',
  },
  interactionText: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;