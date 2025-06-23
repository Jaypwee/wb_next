import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }) {
  const { unauthenticated } = useAuthContext();

  // Only show the Sign In button if user is unauthenticated
  if (!unauthenticated) {
    return null;
  }

  return (
    <Button
      component={RouterLink}
      href={CONFIG.auth.redirectPath}
      variant="outlined"
      sx={sx}
      {...other}
    >
      Sign in
    </Button>
  );
}
