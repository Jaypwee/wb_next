// ----------------------------------------------------------------------

export const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    }
  },
  // USER
  user: {
    settings: `${ROOTS.DASHBOARD}/user/settings`,
  },
  // LEADERSHIP
  leadership: `/leadership`,
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    admin: `${ROOTS.DASHBOARD}/admin`,
    donations: `${ROOTS.DASHBOARD}/donations`,
    schedule: `${ROOTS.DASHBOARD}/schedule`,
    metrics: {
      root: `${ROOTS.DASHBOARD}/metrics`,
      merits: `${ROOTS.DASHBOARD}/metrics/merits`,
      kills: `${ROOTS.DASHBOARD}/metrics/kills`,
      deads: `${ROOTS.DASHBOARD}/metrics/deads`,
      mana: `${ROOTS.DASHBOARD}/metrics/mana-spent`,
    },
    kvk: {
      root: `${ROOTS.DASHBOARD}/kvk`,
      overview: `${ROOTS.DASHBOARD}/kvk/overview`,
      detailed: `${ROOTS.DASHBOARD}/kvk/detailed`,
    },
  },
};
