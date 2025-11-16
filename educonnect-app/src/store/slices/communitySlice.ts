import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    university?: string;
  };
  content: string;
  category: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
}

interface CommunityState {
  posts: Post[];
  filteredPosts: Post[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'Sophie Martin',
      university: 'Sorbonne Université',
    },
    content: 'Quelqu\'un a déjà utilisé la bourse d\'excellence Eiffel ? Je cherche des conseils pour ma candidature en master. Merci !',
    category: 'Bourses',
    tags: ['master', 'eiffel', 'candidature'],
    timestamp: '2024-01-15T10:30:00Z',
    likes: 12,
    comments: [
      {
        id: 'c1',
        author: { id: 'user2', name: 'Pierre L.' },
        content: 'Oui ! Je l\'ai eu l\'année dernière. N\'hésite pas si tu as des questions !',
        timestamp: '2024-01-15T11:15:00Z',
      },
    ],
    isLiked: false,
  },
  {
    id: '2',
    author: {
      id: 'user3',
      name: 'Alex Chen',
      university: 'Université Paris Cité',
    },
    content: 'À partager : Free Mobile fait 50% de réduction sur leurs forfaits pour les étudiants jusqu\'à fin juin !',
    category: 'Deals',
    tags: ['mobile', 'reduction', 'free'],
    timestamp: '2024-01-14T16:45:00Z',
    likes: 28,
    comments: [],
    isLiked: true,
  },
  {
    id: '3',
    author: {
      id: 'user4',
      name: 'Fatima Al-Zahra',
      university: 'Université Lyon 2',
    },
    content: 'Conseil pour les étudiants en informatique : la certification Google Data Analytics est gratuite et super bien reconnue dans le milieu pro.',
    category: 'Cours',
    tags: ['google', 'data', 'certification', 'informatique'],
    timestamp: '2024-01-13T09:20:00Z',
    likes: 15,
    comments: [
      {
        id: 'c2',
        author: { id: 'user5', name: 'Thomas R.' },
        content: 'Totalement d\'accord ! Je l\'ai faite et ça m\'a ouvert des portes pour mon stage.',
        timestamp: '2024-01-13T14:30:00Z',
      },
    ],
    isLiked: false,
  },
];

const initialState: CommunityState = {
  posts: mockPosts,
  filteredPosts: mockPosts,
  categories: ['Bourses', 'Deals', 'Cours', 'Logement', 'Stage', 'Vie étudiante'],
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockPosts;
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData: { content: string; category: string; tags: string[] }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: 'currentUser',
        name: 'Vous',
        university: 'Votre université',
      },
      content: postData.content,
      category: postData.category,
      tags: postData.tags,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false,
    };
    
    return newPost;
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    filterByCategory: (state, action) => {
      if (action.payload === 'all') {
        state.filteredPosts = state.posts;
      } else {
        state.filteredPosts = state.posts.filter(post => post.category === action.payload);
      }
    },
    toggleLikePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
      const filteredPost = state.filteredPosts.find(p => p.id === action.payload);
      if (filteredPost) {
        filteredPost.isLiked = !filteredPost.isLiked;
        filteredPost.likes += filteredPost.isLiked ? 1 : -1;
      }
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
      }
      const filteredPost = state.filteredPosts.find(p => p.id === postId);
      if (filteredPost) {
        filteredPost.comments.push(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.filteredPosts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.filteredPosts.unshift(action.payload);
      });
  },
});

export const { filterByCategory, toggleLikePost, addComment } = communitySlice.actions;
export default communitySlice.reducer;