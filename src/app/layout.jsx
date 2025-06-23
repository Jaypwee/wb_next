import 'src/global.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { CONFIG } from 'src/global-config';
import { UserProvider } from 'src/context/user';
import { primary } from 'src/theme/core/palette';
import { MetricsProvider } from 'src/context/metrics';
import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider, LocalizationProvider } from 'src/locales';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { QueryProvider } from 'src/components/providers/query-provider';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/firebase';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  icons: [
    {
      rel: 'icon',
      url: `${CONFIG.assetsDir}/favicon.ico`,
    },
  ],
};

// ----------------------------------------------------------------------

async function getAppConfig() {
  if (CONFIG.isStaticExport) {
    return {
      cookieSettings: undefined,
      dir: defaultSettings.direction,
    };
  } else {
    const [settings] = await Promise.all([detectSettings()]);

    return {
      cookieSettings: settings,
      dir: settings.direction,
    };
  }
}

export default async function RootLayout({ children }) {
  const appConfig = await getAppConfig();

  return (
    <html lang="en" dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.enableSystemMode ? 'system' : themeConfig.defaultMode}
        />
        <UserProvider>
          <MetricsProvider>
            <I18nProvider lang={appConfig.i18nLang}>
              <AuthProvider>
                <SettingsProvider
                  cookieSettings={appConfig.cookieSettings}
                  defaultSettings={defaultSettings}
                >
                  <LocalizationProvider>
                    <AppRouterCacheProvider options={{ key: 'css' }}>
                      <ThemeProvider
                        modeStorageKey={themeConfig.modeStorageKey}
                        defaultMode={themeConfig.enableSystemMode ? 'system' : themeConfig.defaultMode}
                      >
                        <QueryProvider>
                          <MotionLazy>
                            <ProgressBar />
                            <SettingsDrawer defaultSettings={defaultSettings} />
                            {children}
                          </MotionLazy>
                        </QueryProvider>
                      </ThemeProvider>
                    </AppRouterCacheProvider>
                  </LocalizationProvider>
                </SettingsProvider>
              </AuthProvider>
            </I18nProvider>
          </MetricsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
