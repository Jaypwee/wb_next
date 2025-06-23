import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/firebase/action';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, sx, fullWidth = true, ...other }) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, onClose, router]);

  return (
    <Button
      variant="soft"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
      fullWidth={fullWidth}
    >
      Sign Out
    </Button>
  );
}
