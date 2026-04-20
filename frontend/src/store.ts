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
    getTopCustomers: builder.query<any[], void>({
      query: () => "/revenue/top-customers",
      providesTags: ["Revenue"],
    }),
    getOrderStatus: builder.query<any[], void>({
      query: () => "/revenue/order-status",
      providesTags: ["Revenue"],
    }),
    getShippingLatency: builder.query<any[], void>({
      query: () => "/revenue/latency",
      providesTags: ["Revenue"],
    }),
    getCustomerRetention: builder.query<any[], void>({
      query: () => "/revenue/retention",
      providesTags: ["Revenue"],
    }),
    searchOrders: builder.query<any, { customerName?: string, startDate?: string, endDate?: string }>({
      query: (params) => ({
        url: "/orders/search",
        params,
      }),
      providesTags: ["Revenue"],
    }),
    askChatbot: builder.mutation<{ response: string, sql?: string }, { message: string }>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
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
