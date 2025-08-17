'use client';

import dayjs from 'dayjs';
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
  setSelectedKvkMetrics,
} from './actions';

// ----------------------------------------------------------------------

const initialState = {
  selectedSeason: '',
  startDate: '',
  endDate: '',
  selectedMetrics: null,
  selectedKvkMetrics: null,
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
    setStartDate: (date) => {
      const currentEnd = state.endDate;
      dispatch(setStartDate(date));

      if (!currentEnd) return;

      const extractIso = (value) => {
        if (typeof value !== 'string') return null;
        const match = value.match(/(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : null;
      };

      const startIso = extractIso(date);
      const endIso = extractIso(currentEnd);

      if (startIso && endIso) {
        const start = dayjs(startIso);
        const end = dayjs(endIso);
        if (!start.isBefore(end)) {
          dispatch(setEndDate(''));
        }
      }
    },
    setEndDate: (date) => dispatch(setEndDate(date)),
    setSelectedMetrics: (metrics) => dispatch(setSelectedMetrics(metrics)),
    setSelectedKvkMetrics: (kvkMetrics) => dispatch(setSelectedKvkMetrics(kvkMetrics)),
    setOverview: (overview) => dispatch(setOverview(overview)),
    setSeasonDates: (dates) => dispatch(setSeasonDates(dates)),
    setSeasonInfo: (info) => dispatch(setSeasonInfo(info)),
    setSeasonDatesCache: (metricType, seasonName, dates) => dispatch(setSeasonDatesCache(metricType, seasonName, dates)),
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