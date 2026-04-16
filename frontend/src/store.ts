"use client";
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- RTK Query API ---
export const classicModelsApi = createApi({
  reducerPath: "classicModelsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Customers", "Revenue"],
  endpoints: (builder) => ({
    getCountries: builder.query<string[], void>({
      query: () => "/customers/countries",
    }),
    searchCustomers: builder.query<any, { keyword?: string; country?: string; offset?: number }>({
      query: (params) => ({
        url: "/customers/search",
        params,
      }),
      providesTags: ["Customers"],
    }),
    getRevenueYears: builder.query<number[], void>({
      query: () => "/revenue/years",
    }),
    getPivotData: builder.query<any, { detail: string }>({
      query: (params) => ({
        url: "/revenue/pivot",
        params,
      }),
      providesTags: ["Revenue"],
    }),
    getChartData: builder.query<any, { year: string }>({
      query: (params) => ({
        url: "/revenue/chart",
        params,
      }),
      providesTags: ["Revenue"],
    }),
  }),
});

// --- UI State Slice ---
interface FilterState {
  selectedYear: string;
  detailLevel: "productLine" | "productName";
  searchKeyword: string;
  searchCountry: string;
}

const initialState: FilterState = {
  selectedYear: "all",
  detailLevel: "productLine",
  searchKeyword: "",
  searchCountry: "",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload;
    },
    setDetailLevel: (state, action: PayloadAction<"productLine" | "productName">) => {
      state.detailLevel = action.payload;
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    setSearchCountry: (state, action: PayloadAction<string>) => {
      state.searchCountry = action.payload;
    },
  },
});

export const { setYear, setDetailLevel, setSearchKeyword, setSearchCountry } = filterSlice.actions;

// --- Store Configuration ---
export const store = configureStore({
  reducer: {
    [classicModelsApi.reducerPath]: classicModelsApi.reducer,
    filters: filterSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(classicModelsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
