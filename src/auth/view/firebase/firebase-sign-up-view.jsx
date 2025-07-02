'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import {
  signUp,
} from '../../context/firebase';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function FirebaseSignUpView() {
  const router = useRouter();
  const { t } = useTranslate();
  const showPassword = useBoolean();

  const [errorMessage, setErrorMessage] = useState('');

  const SignUpSchema = zod.object({
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Email must be a valid email address!' }),
    password: zod
      .string()
      .min(1, { message: 'Password is required!' })
      .min(6, { message: 'Password must be at least 6 characters!' }),
    gameuid: zod
      .string()
      .min(1, { message: t('auth.signUp.errors.gameuidRequired') })
      .regex(/^\d{6,8}$/, { message: t('auth.signUp.errors.gameuidInvalid') }),
    nationality: zod.string().min(1, { message: t('auth.signUp.errors.nationalityRequired') }),
    mainTroops: zod.string().min(1, { message: t('auth.signUp.errors.mainTroopsRequired') }),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    nickname: '',
    gameuid: '',
    nationality: 'korean',
    mainTroops: 'allRounder'
  };

  const mainTroopsOptions = [
    { label: t('auth.signUp.infantry'), value: 'infantry' },
    { label: t('auth.signUp.cavalry'), value: 'cavalry' },
    { label: t('auth.signUp.archer'), value: 'archer' },
    { label: t('auth.signUp.mage'), value: 'mage' },
  ];

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        gameuid: data.gameuid,
        nationality: data.nationality,
        mainTroops: data.mainTroops,
      });

      router.push(paths.auth.firebase.signIn);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
      >
        <Field.Text
          name="gameuid"
          label={t('auth.signUp.gameuid')}
          placeholder={t('auth.signUp.gameuidPlaceholder')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <Box
        sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
      >
        <Field.Select name="nationality" label={t('auth.signUp.nationality')}>
          <MenuItem key='korean' value="korean">
            🇰🇷 한국
          </MenuItem>
          <MenuItem key='vietnam' value="vietnam">
            🇻🇳 Vietnam
          </MenuItem>
          <MenuItem key='russia' value="russia">
            🇷🇺 Russia
          </MenuItem>
          <MenuItem key='usa' value="usa">
            🇺🇸 U.S.
          </MenuItem>
          <MenuItem key='china' value="china">
            🇨🇳 China
          </MenuItem>
          <MenuItem key='international' value="international">
            🌍 International
          </MenuItem>
        </Field.Select>

        <Field.Select name="mainTroops" label={t('auth.signUp.mainTroops')}>
          {mainTroopsOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>
      </Box>

      <Field.Text name="email" label={t('auth.common.email')} slotProps={{ inputLabel: { shrink: true } }} />

      <Field.Text
        name="password"
        label={t('auth.common.password')}
        placeholder="6+ characters"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Create account..."
      >
        {t('auth.signUp.createAccount')}
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title={t('auth.signUp.title')}
        description={
          <>
            {t('auth.signUp.alreadyHaveAccount')}{' '}
            <Link component={RouterLink} href={paths.auth.firebase.signIn} variant="subtitle2">
              {t('auth.signUp.signIn')}
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

    </>
  );
}
