'use client';

import { useContext, useReducer, createContext } from 'react';

import { reducer } from './reducer';
import {
  setError,
  setEndDate,
  setLoading,
  setOverview,
  setStartDate,
  setSeasonInfo,
  setSeasonDates,
  setSelectedSeason,
  setSelectedMetrics,
  setSeasonDatesCache,
} from './actions';

// ----------------------------------------------------------------------

const initialState = {
  selectedSeason: '',
  startDate: '',
  endDate: '',
  selectedMetrics: null,
  overview: null,
  seasonInfo: null,
  seasonDatesCache: {},
  seasonDates: {
    startDate: null,
    endDate: null,
  },
  isLoading: false,
  error: null,
};

// ----------------------------------------------------------------------

const MetricsContext = createContext(null);

// ----------------------------------------------------------------------

export function MetricsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setSelectedSeason: (season) => dispatch(setSelectedSeason(season)),
    setStartDate: (date) => dispatch(setStartDate(date)),
    setEndDate: (date) => dispatch(setEndDate(date)),
    setSelectedMetrics: (metrics) => dispatch(setSelectedMetrics(metrics)),
    setOverview: (overview) => dispatch(setOverview(overview)),
    setSeasonDates: (dates) => dispatch(setSeasonDates(dates)),
    setSeasonInfo: (info) => dispatch(setSeasonInfo(info)),
    setSeasonDatesCache: (seasonName, dates) => dispatch(setSeasonDatesCache(seasonName, dates)),
    setLoading: (isLoading) => dispatch(setLoading(isLoading)),
    setError: (error) => dispatch(setError(error)),
  };

  return (
    <MetricsContext.Provider
      value={{
        ...state,
        ...actions,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

// ----------------------------------------------------------------------

export const useMetricsContext = () => {
  const context = useContext(MetricsContext);

  if (!context) {
    throw new Error('useMetricsContext must be used within a MetricsProvider');
  }

  return context;
}; 