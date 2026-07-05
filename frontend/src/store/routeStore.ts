import { create } from "zustand";

export interface RouteResult {
  coordinates: [number, number][];
  distance_km: number;
  duration_min: number;
  avg_safety_score: number;
}

interface RouteState {
  fastest: RouteResult | null;
  safe: RouteResult | null;
  timeDifference: number;
  explanation: string[];
  selectedRoute: "fastest" | "safe" | null;
  setRoutes: (data: {
    fastest: RouteResult;
    safe: RouteResult;
    time_difference_min: number;
    explanation: string[];
  }) => void;
  selectRoute: (route: "fastest" | "safe") => void;
  clearRoutes: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  fastest: null,
  safe: null,
  timeDifference: 0,
  explanation: [],
  selectedRoute: null,
  setRoutes: (data) =>
    set({
      fastest: data.fastest,
      safe: data.safe,
      timeDifference: data.time_difference_min,
      explanation: data.explanation,
      selectedRoute: null,
    }),
  selectRoute: (route) => set({ selectedRoute: route }),
  clearRoutes: () =>
    set({
      fastest: null,
      safe: null,
      timeDifference: 0,
      explanation: [],
      selectedRoute: null,
    }),
}));
