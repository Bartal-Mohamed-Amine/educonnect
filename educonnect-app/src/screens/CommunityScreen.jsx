/* CommunityScreen.jsx */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost, filterByCategory, toggleLikePost, addComment } from '../store/slices/communitySlice';
import { Box, VStack, HStack, Avatar, Badge, IconButton, Button } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CommunityScreen() {
  const dispatch = useDispatch();
  const { filteredPosts: posts, categories } = useSelector((state) => state.community);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Vie étudiante');
  const [newPostTags, setNewPostTags] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterByCategory(selectedCategory));
  }, [selectedCategory, dispatch]);

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const tags = newPostTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      dispatch(
        createPost({
          content: newPostContent,
          category: newPostCategory,
          tags,
        })
      );
      setNewPostContent('');
      setNewPostTags('');
      setShowNewPostModal(false);
    }
  };

  const handleAddComment = (postId) => {
    const commentText = commentInputs[postId];
    if (commentText?.trim()) {
      const newComment = {
        id: Date.now().toString(),
        author: { id: 'currentUser', name: 'Vous' },
        content: commentText,
        timestamp: new Date().toISOString(),
      };
      dispatch(addComment({ postId, comment: newComment }));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    }
  };

  function PostCard({ post }) {
    const [showComments, setShowComments] = useState(false);

    return (
      <View style={styles.postCard}>
        <VStack space={3}>
          {/* Author row */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <HStack space={3} alignItems="center">
              <Avatar
                size="md"
                source={{
                  uri: `https://ui-avatars.com/api/?name=${post.author.name}`,
                }}
              />
              <VStack>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.university && (
                  <Text style={styles.university}>{post.author.university}</Text>
                )}
                <HStack alignItems="center" space={2}>
                  <Badge colorScheme="info" variant="subtle">
                    {post.category}
                  </Badge>
                  <Text style={styles.timestamp}>2h</Text>
                </HStack>
              </VStack>
            </HStack>
          </HStack>

          {/* Post body */}
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Tags */}
          {post.tags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={2}>
                {post.tags.map((tag, index) => (
                  <Badge key={index} colorScheme="coolGray" variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </HStack>
            </ScrollView>
          )}

          {/* Interaction bar */}
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={4}>
              <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => dispatch(toggleLikePost(post.id))}
              >
                <HStack alignItems="center" space={1}>
                  <Icon
                    name="favorite"
                    size={20}
                    color={post.isLiked ? '#D4A574' : '#CBD5E0'}
                  />
                  <Text
                    style={[
                      styles.interactionText,
                      post.isLiked && styles.interactionTextActive,
                    ]}
                  >
                    {post.likes}
                  </Text>
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => setShowComments(!showComments)}
              >
                <HStack alignItems="center" space={1}>
                  <Icon name="comment" size={20} color="#CBD5E0" />
                  <Text style={styles.interactionText}>{post.comments.length}</Text>
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton}>
                <HStack alignItems="center" space={1}>
                  <Icon name="share" size={20} color="#CBD5E0" />
                </HStack>
              </TouchableOpacity>
            </HStack>
          </HStack>

          {/* Comments section */}
          {showComments && (
            <VStack space={3} style={styles.commentsSection}>
              {post.comments.map((comment) => (
                <HStack key={comment.id} space={2} alignItems="flex-start">
                  <Avatar
                    size="xs"
                    source={{
                      uri: `https://ui-avatars.com/api/?name=${comment.author.name}`,
                    }}
                  />
                  <VStack flex={1}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                      <Text style={styles.commentTime}>1h</Text>
                    </HStack>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </VStack>
                </HStack>
              ))}

              {/* Add comment */}
              <HStack space={2} alignItems="flex-start">
                <Avatar
                  size="xs"
                  source={{ uri: 'https://ui-avatars.com/api/?name=Vous' }}
                />
                <VStack flex={1}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Ajouter un commentaire..."
                    value={commentInputs[post.id] || ''}
                    onChangeText={(text) =>
                      setCommentInputs({ ...commentInputs, [post.id]: text })
                    }
                    multiline
                  />
                  <Button
                    size="sm"
                    colorScheme="primary"
                    onPress={() => handleAddComment(post.id)}
                    style={styles.commentButton}
                  >
                    Commenter
                  </Button>
                </VStack>
              </HStack>
            </VStack>
          )}
        </VStack>
      </View>
    );
  }

  function FilterChip({ label, value, selected, onSelect }) {
    return (
      <TouchableOpacity
        style={[styles.filterChip, selected && styles.filterChipSelected]}
        onPress={() => onSelect(value)}
      >
        <Text
          style={[
            styles.filterChipText,
            selected && styles.filterChipTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Communauté</Text>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setShowNewPostModal(true)}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Partagez et discutez avec d'autres étudiants
        </Text>
      </View>

      {/* Category filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={2}>
            <FilterChip
              label="Tous"
              value="all"
              selected={selectedCategory === 'all'}
              onSelect={setSelectedCategory}
            />
            {categories.map((category) => (
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

      {/* Posts list */}
      <ScrollView
        style={styles.postsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsListContent}
      >
        <VStack space={4}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </VStack>
      </ScrollView>

      {/* New-post modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau post</Text>

            <VStack space={4}>
              {/* Category selector */}
              <VStack>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          newPostCategory === category && styles.categoryOptionSelected,
                        ]}
                        onPress={() => setNewPostCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            newPostCategory === category && styles.categoryOptionTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>
                </ScrollView>
              </VStack>

              {/* Message */}
              <VStack>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Partagez votre expérience ou posez une question..."
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  numberOfLines={4}
                />
              </VStack>

              {/* Tags */}
              <VStack>
                <Text style={styles.inputLabel}>
                  Tags (séparés par des virgules)
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ex: bourse, master, conseils"
                  value={newPostTags}
                  onChangeText={setNewPostTags}
                />
              </VStack>

              {/* Buttons */}
              <HStack justifyContent="space-between" space={3}>
                <Button flex={1} variant="outline" onPress={() => setShowNewPostModal(false)}>
                  Annuler
                </Button>
                <Button
                  flex={1}
                  colorScheme="primary"
                  onPress={handleCreatePost}
                  isDisabled={!newPostContent.trim()}
                >
                  Publier
                </Button>
              </HStack>
            </VStack>
          </View>
        </View>
      </Modal>
    </View>
  );
}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Sorts Mill Goudy',
  },
  newPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 4,
    fontFamily: 'Oranienbaum',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  postsList: {
    flex: 1,
  },
  postsListContent: {
    padding: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  university: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  timestamp: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  postContent: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 22,
    fontFamily: 'Oranienbaum',
  },
  interactionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  interactionText: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  interactionTextActive: {
    color: '#D4A574',
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  commentTime: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  commentContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    fontFamily: 'Oranienbaum',
  },
  commentInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
    minHeight: 80,
  },
  commentButton: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    fontFamily: 'Sorts Mill Goudy',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    fontFamily: 'Oranienbaum',
  },
  textInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  textArea: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
    minHeight: 100,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryOptionSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});