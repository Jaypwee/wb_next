'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { makeAuthenticatedRequest } from 'src/lib/token-utils';
import { uploadUserAvatar, updateUserProfile } from 'src/services/user';

import { Iconify } from 'src/components/iconify';
import { UploadAvatar } from 'src/components/upload';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { updatePassword } from 'src/auth/context/firebase';

// ----------------------------------------------------------------------

const ProfileSchema = zod.object({
  mainTroops: zod.enum(['infantry', 'archer', 'cavalry', 'mage'], {
    required_error: 'Main troops selection is required!',
  }),
  nationality: zod.string().min(1, { message: 'Nationality is required!' }),
});

const PasswordSchema = zod.object({
  currentPassword: zod.string().min(1, { message: 'Current password is required!' }),
  newPassword: zod
    .string()
    .min(1, { message: 'New password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
  confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

export function UserSettingsView() {
  const router = useRouter();
  const { user } = useAuthContext();
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isAvatarPending, startAvatarTransition] = useTransition();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileMethods = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      mainTroops: user?.mainTroops || 'infantry',
      nationality: user?.nationality || 'korean',
    },
  });

  const passwordMethods = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitProfile = profileMethods.handleSubmit(async (data) => {
    startProfileTransition(async () => {
      try {
        await updateUserProfile(user.uid, data);
      } catch (error) {
        console.error('Error updating profile:', error);
        profileMethods.setError('root', { message: error.message });
      }
    });
  });

  const onSubmitPassword = passwordMethods.handleSubmit(async (data) => {
    startPasswordTransition(async () => {
      try {
        await updatePassword({ 
          currentPassword: data.currentPassword, 
          newPassword: data.newPassword 
        });
        
        // Reset form and show success message
        passwordMethods.reset();

      } catch (error) {
        console.error('Error updating password:', error);
        
        // Handle specific Firebase errors
        let errorMessage = 'Failed to update password';
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'New password is too weak';
        } else if (error.code === 'auth/requires-recent-login') {
          errorMessage = 'Please sign in again to update your password';
        }
        
        passwordMethods.setError('root', { message: errorMessage });
      }
    });
  });

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    startAvatarTransition(async () => {
      try {
        await makeAuthenticatedRequest(uploadUserAvatar(user.uid, avatarFile));
        setAvatarFile(null);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    });
  };

  const handleDropAvatar = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Avatar Upload */}
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <UploadAvatar
              file={avatarFile}
              onDrop={handleDropAvatar}
              onDelete={() => setAvatarFile(null)}
              currentAvatar={user?.avatarUrl}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of 5 MB
                </Typography>
              }
            />

            {avatarFile && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleAvatarUpload}
                disabled={isAvatarPending}
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                sx={{ mt: 3 }}
              >
                {isAvatarPending ? 'Uploading...' : 'Upload Avatar'}
              </Button>
            )}
          </Card>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Profile Information" />
            <CardContent>
              <Form methods={profileMethods} onSubmit={onSubmitProfile}>
                {profileMethods.formState.errors.root && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {profileMethods.formState.errors.root.message}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field.Select
                      name="mainTroops"
                      label="Main Troops"
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="infantry">Infantry</MenuItem>
                      <MenuItem value="archer">Archer</MenuItem>
                      <MenuItem value="cavalry">Cavalry</MenuItem>
                      <MenuItem value="mage">Mage</MenuItem>
                    </Field.Select>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field.Select
                      name="nationality"
                      label="Nationality"
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="korean">
                        🇰🇷 한국
                      </MenuItem>
                      <MenuItem value="vietnam">
                        🇻🇳 Vietnam
                      </MenuItem>
                      <MenuItem value="russia">
                        🇷🇺 Russia
                      </MenuItem>
                      <MenuItem value="usa">
                        🇺🇸 U.S.
                      </MenuItem>
                      <MenuItem value="china">
                        🇨🇳 China
                      </MenuItem>
                      <MenuItem value="international">
                        🌍 International
                      </MenuItem>
                    </Field.Select>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isProfilePending}
                      startIcon={<Iconify icon="eva:save-fill" />}
                    >
                      {isProfilePending ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Change Password" />
            <CardContent>
              <Form methods={passwordMethods} onSubmit={onSubmitPassword}>
                {passwordMethods.formState.errors.root && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {passwordMethods.formState.errors.root.message}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field.Text
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      label="Current Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              <Iconify
                                icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      label="New Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              <Iconify
                                icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              <Iconify
                                icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isPasswordPending}
                      startIcon={<Iconify icon="eva:lock-fill" />}
                    >
                      {isPasswordPending ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 