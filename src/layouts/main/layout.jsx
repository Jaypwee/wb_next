'use client';

import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';

import { Logo } from 'src/components/logo';

import { useAuthContext } from 'src/auth/hooks';

import { NavMobile } from './nav/mobile';
import { NavDesktop } from './nav/desktop';
import { Footer, HomeFooter } from './footer';
import { MainSection } from '../core/main-section';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { navData as mainNavData } from '../nav-config-main';
import { SignInButton } from '../components/sign-in-button';
import { SignOutButton } from '../components/sign-out-button';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';

// ----------------------------------------------------------------------

export function MainLayout({ sx, cssVars, children, slotProps, layoutQuery = 'md' }) {
  const pathname = usePathname();

  const { authenticated } = useAuthContext();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const { value: popoverOpen, onFalse: onPopoverClose, onTrue: onPopoverOpen } = useBoolean();
  const [anchorEl, setAnchorEl] = useState(null);

  const isHomePage = pathname === '/';

  const navData = slotProps?.nav?.data ?? mainNavData;

  const renderHeader = () => {
    const headerSlots = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={(theme) => ({
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
            })}
          />
          <NavMobile data={navData} open={open} onClose={onClose} />

          {/** @slot Logo */}
          <Logo sx={{ paddingTop: 1, paddingBottom: 1 }} />
        </>
      ),
      rightArea: (
        <>
          {/** @slot Nav desktop */}
          <NavDesktop
            data={navData}
            sx={(theme) => ({
              display: 'none',
              [theme.breakpoints.up(layoutQuery)]: { mr: 2.5, display: 'flex' },
            })}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            {/** @slot Settings button */}
            <LanguagePopover
              data={[
                { value: 'en', label: 'English', countryCode: 'US' },
                { value: 'ko', label: 'Korean', countryCode: 'KR' },
              ]}
            />
            <SettingsButton />

            {/** @slot Sign out button */}
            {authenticated && (
              <SignOutButton
                variant="contained"
                fullWidth={false}
                sx={(theme) => ({
                  display: 'none',
                  [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                })}
              />
            )}

            {/** @slot Sign in button */}
            <SignInButton />

            {/** @slot Purchase button */}
            <Button
              variant="contained"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
                onPopoverOpen();
              }}
              sx={(theme) => ({
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              })}
            >
              Apply
            </Button>
          </Box>
        </>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={slotProps?.header?.slotProps}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () =>
    isHomePage ? (
      <HomeFooter sx={slotProps?.footer?.sx} />
    ) : (
      <Footer sx={slotProps?.footer?.sx} layoutQuery={layoutQuery} />
    );

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={cssVars}
      sx={sx}
    >
      {renderMain()}

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={() => {
          onPopoverClose();
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Apply feature coming soon!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Application feature is curringly work in progress. Stay tuned!
          </Typography>
        </Box>
      </Popover>
    </LayoutSection>
  );
}
