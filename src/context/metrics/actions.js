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

export const setSeasonDates = (dates) => ({
  type: ActionTypes.SET_SEASON_DATES,
  payload: dates,
});

export const setLoading = (isLoading) => ({
  type: ActionTypes.SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: ActionTypes.SET_ERROR,
  payload: error,
}); 