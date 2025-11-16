import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Deal {
  id: string;
  title: string;
  description: string;
  company: string;
  category: string;
  discount: string;
  originalPrice?: number;
  discountedPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  validUntil: string;
  requirements: string[];
  verified: boolean;
  saved: boolean;
  distance?: number;
}

interface DealsState {
  deals: Deal[];
  filteredDeals: Deal[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'MacBook Air M2 Étudiant -30%',
    description: 'Réduction exclusive pour étudiants sur le nouvel MacBook Air M2.',
    company: 'Apple',
    category: 'Technology',
    discount: '30%',
    originalPrice: 1299,
    discountedPrice: 909,
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      address: 'Apple Store Opéra, Paris',
    },
    validUntil: '2024-12-31',
    requirements: ['Carte étudiante valide', '18-25 ans'],
    verified: true,
    saved: false,
    distance: 2.3,
  },
  {
    id: '2',
    title: 'Forfait Étudiant Free Mobile',
    description: 'Forfait mobile 100Go pour étudiants avec roaming international.',
    company: 'Free Mobile',
    category: 'Telecom',
    discount: '50%',
    originalPrice: 19.99,
    discountedPrice: 9.99,
    validUntil: '2024-06-30',
    requirements: ['Justificatif étudiant', 'RIB'],
    verified: true,
    saved: true,
  },
  {
    id: '3',
    title: 'Repas Étudiant -50%',
    description: 'Menu étudiant complet avec entrée, plat, dessert à prix réduit.',
    company: 'CROUS Restaurant',
    category: 'Food',
    discount: '50%',
    originalPrice: 8.50,
    discountedPrice: 4.25,
    location: {
      latitude: 48.8423,
      longitude: 2.3445,
      address: 'Restaurant CROUS Jussieu',
    },
    validUntil: '2024-12-31',
    requirements: ['Carte étudiante'],
    verified: true,
    saved: false,
    distance: 1.8,
  },
  {
    id: '4',
    title: 'Logiciels Adobe Étudiants',
    description: 'Suite Creative Cloud complète à tarif étudiant réduit.',
    company: 'Adobe',
    category: 'Software',
    discount: '60%',
    originalPrice: 60.49,
    discountedPrice: 23.99,
    validUntil: '2024-08-31',
    requirements: ['Email universitaire', 'Justificatif inscription'],
    verified: true,
    saved: true,
  },
];

const initialState: DealsState = {
  deals: mockDeals,
  filteredDeals: mockDeals,
  categories: ['Technology', 'Telecom', 'Food', 'Software', 'Transport', 'Housing'],
  isLoading: false,
  error: null,
  userLocation: null,
};

export const fetchDeals = createAsyncThunk(
  'deals/fetch',
  async (location?: { latitude: number; longitude: number }) => {
    // Simulated API call with location-based filtering
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockDeals;
  }
);

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      // Calculate distances
      state.deals = state.deals.map(deal => {
        if (deal.location && state.userLocation) {
          const distance = calculateDistance(
            state.userLocation.latitude,
            state.userLocation.longitude,
            deal.location.latitude,
            deal.location.longitude
          );
          return { ...deal, distance };
        }
        return deal;
      });
    },
    filterByCategory: (state, action) => {
      if (action.payload === 'all') {
        state.filteredDeals = state.deals;
      } else {
        state.filteredDeals = state.deals.filter(deal => deal.category === action.payload);
      }
    },
    toggleSaveDeal: (state, action) => {
      const deal = state.deals.find(d => d.id === action.payload);
      if (deal) {
        deal.saved = !deal.saved;
      }
      const filteredDeal = state.filteredDeals.find(d => d.id === action.payload);
      if (filteredDeal) {
        filteredDeal.saved = !filteredDeal.saved;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deals = action.payload;
        state.filteredDeals = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch deals';
      });
  },
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

export const { setUserLocation, filterByCategory, toggleSaveDeal } = dealsSlice.actions;
export default dealsSlice.reducer;