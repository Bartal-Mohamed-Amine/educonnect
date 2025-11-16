import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'certificate' | 'software' | 'grant';
  category: string;
  provider: string;
  url: string;
  isFree: boolean;
  deadline?: string;
  location?: string;
  tags: string[];
  rating?: number;
  saved: boolean;
}

interface ResourcesState {
  resources: Resource[];
  filteredResources: Resource[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    category?: string;
    isFree?: boolean;
    searchQuery?: string;
  };
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Certification Google Data Analytics',
    description: 'Cours gratuit de Google pour maîtriser l\'analyse de données avec des outils professionnels.',
    type: 'certificate',
    category: 'Technology',
    provider: 'Google',
    url: 'https://coursera.org/...',
    isFree: true,
    deadline: '2024-12-31',
    tags: ['data', 'analytics', 'google', 'professional'],
    rating: 4.8,
    saved: false,
  },
  {
    id: '2',
    title: 'Bourse d\'Excellence Eiffel 2024',
    description: 'Bourse du gouvernement français pour étudiants internationaux en master et doctorat.',
    type: 'grant',
    category: 'Grants',
    provider: 'Campus France',
    url: 'https://campusfrance.org/...',
    isFree: true,
    deadline: '2024-01-15',
    tags: ['france', 'international', 'master', 'phd'],
    saved: true,
  },
  {
    id: '3',
    title: 'Adobe Creative Suite Étudiant',
    description: 'Licence étudiante gratuite pour tous les logiciels Adobe pendant 6 mois.',
    type: 'software',
    category: 'Design',
    provider: 'Adobe',
    url: 'https://adobe.com/education',
    isFree: true,
    deadline: '2024-06-30',
    tags: ['design', 'creative', 'adobe', 'student'],
    saved: false,
  },
  {
    id: '4',
    title: 'Introduction à l\'IA par Microsoft',
    description: 'Cours en ligne gratuit sur les fondamentaux de l\'intelligence artificielle.',
    type: 'course',
    category: 'AI',
    provider: 'Microsoft',
    url: 'https://microsoft.com/learn',
    isFree: true,
    tags: ['ai', 'machine-learning', 'microsoft', 'beginner'],
    rating: 4.6,
    saved: true,
  },
];

const initialState: ResourcesState = {
  resources: mockResources,
  filteredResources: mockResources,
  categories: ['Technology', 'Grants', 'Design', 'AI', 'Business', 'Science'],
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchResources = createAsyncThunk(
  'resources/fetch',
  async (filters?: any) => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockResources;
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.filteredResources = state.resources.filter(resource => {
        if (state.filters.type && resource.type !== state.filters.type) return false;
        if (state.filters.category && resource.category !== state.filters.category) return false;
        if (state.filters.isFree !== undefined && resource.isFree !== state.filters.isFree) return false;
        if (state.filters.searchQuery && !resource.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },
    toggleSaveResource: (state, action) => {
      const resource = state.resources.find(r => r.id === action.payload);
      if (resource) {
        resource.saved = !resource.saved;
      }
      const filteredResource = state.filteredResources.find(r => r.id === action.payload);
      if (filteredResource) {
        filteredResource.saved = !filteredResource.saved;
      }
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredResources = state.resources;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
        state.filteredResources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch resources';
      });
  },
});

export const { setFilters, toggleSaveResource, clearFilters } = resourcesSlice.actions;
export default resourcesSlice.reducer;