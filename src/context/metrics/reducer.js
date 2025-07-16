// ----------------------------------------------------------------------

export const ActionTypes = {
  SET_SELECTED_SEASON: 'SET_SELECTED_SEASON',
  SET_START_DATE: 'SET_START_DATE',
  SET_END_DATE: 'SET_END_DATE',
  SET_SELECTED_METRICS: 'SET_SELECTED_METRICS',
  SET_SELECTED_KVK_METRICS: 'SET_SELECTED_KVK_METRICS',
  SET_SEASON_DATES: 'SET_SEASON_DATES',
  SET_SEASON_INFO: 'SET_SEASON_INFO',
  SET_SEASON_DATES_CACHE: 'SET_SEASON_DATES_CACHE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_OVERVIEW: 'SET_OVERVIEW',
};

// ----------------------------------------------------------------------

export function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SELECTED_SEASON:
      return {
        ...state,
        selectedSeason: action.payload,
        startDate: '', // Reset dates when season changes
        endDate: '',
      };

    case ActionTypes.SET_START_DATE:
      return {
        ...state,
        startDate: action.payload,
        endDate: '', // Reset end date when start date changes
      };

    case ActionTypes.SET_END_DATE:
      return {
        ...state,
        endDate: action.payload,
      };

    case ActionTypes.SET_SELECTED_METRICS:
      return {
        ...state,
        selectedMetrics: action.payload,
      };

    case ActionTypes.SET_SELECTED_KVK_METRICS:
      return {
        ...state,
        selectedKvkMetrics: action.payload,
      };

    case ActionTypes.SET_SEASON_DATES:
      return {
        ...state,
        seasonDates: action.payload,
      };

    case ActionTypes.SET_SEASON_INFO:
      return {
        ...state,
        seasonInfo: action.payload,
      };

    case ActionTypes.SET_SEASON_DATES_CACHE:
      return {
        ...state,
        seasonDatesCache: {
          ...state.seasonDatesCache,
          [action.payload.seasonName]: action.payload.dates,
        },
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionTypes.SET_OVERVIEW:
      return {
        ...state,
        overview: action.payload,
      };

    default:
      return state;
  }
} 