import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Listing {
  id: string;
  title: string;
  description?: string;
  photoUrls: string[];
  quantity: number;
  quantityUnit: string;
  foodTypes: string[];
  isVegetarian?: boolean;
  pickupAddress: string;
  pickupBy: string;
  urgencyLevel: string;
  distance?: number;
  donorName: string;
  donorRating?: number;
}

interface ListingsState {
  items: Listing[];
  loading: boolean;
  error: string | null;
  filters: {
    radius: number;
    foodTypes: string[];
    dietary: string[];
  };
}

const initialState: ListingsState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    radius: 5,
    foodTypes: [],
    dietary: [],
  },
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Listing[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<ListingsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearListings: (state) => {
      state.items = [];
    },
  },
});

export const { setListings, setLoading, setError, setFilters, clearListings } =
  listingsSlice.actions;
export default listingsSlice.reducer;
