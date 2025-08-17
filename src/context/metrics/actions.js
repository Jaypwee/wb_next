import { ActionTypes } from './reducer';

// ----------------------------------------------------------------------

export const setSelectedSeason = (season) => ({
  type: ActionTypes.SET_SELECTED_SEASON,
  payload: season,
});

export const setStartDate = (date) => ({
  type: ActionTypes.SET_START_DATE,
  payload: date,
});

export const setEndDate = (date) => ({
  type: ActionTypes.SET_END_DATE,
  payload: date,
});

export const setSelectedMetrics = (metrics) => ({
  type: ActionTypes.SET_SELECTED_METRICS,
  payload: metrics,
});

export const setSelectedKvkMetrics = (kvkMetrics) => ({
  type: ActionTypes.SET_SELECTED_KVK_METRICS,
  payload: kvkMetrics,
});

export const setSeasonDates = (dates) => ({
  type: ActionTypes.SET_SEASON_DATES,
  payload: dates,
});

export const setSeasonInfo = (info) => ({
  type: ActionTypes.SET_SEASON_INFO,
  payload: info,
});

export const setSeasonDatesCache = (metricType, seasonName, dates) => ({
  type: ActionTypes.SET_SEASON_DATES_CACHE,
  payload: { metricType, seasonName, dates },
});

export const setLoading = (isLoading) => ({
  type: ActionTypes.SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: ActionTypes.SET_ERROR,
  payload: error,
});

export const setOverview = (overview) => ({
  type: ActionTypes.SET_OVERVIEW,
  payload: overview,
}); 