'use client';

import { useState, useEffect } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export function PayPalProviderWrapper({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render PayPal provider until component is mounted on client
  if (!isMounted) {
    return children;
  }

  if (!CONFIG.paypal.clientId) {
    console.warn('PayPal Client ID is not configured. PayPal features will not work.');
    return children;
  }

  const paypalOptions = {
    clientId: CONFIG.paypal.clientId,
    currency: CONFIG.paypal.currency,
    intent: CONFIG.paypal.intent,
    components: 'buttons',
    debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  );
} 