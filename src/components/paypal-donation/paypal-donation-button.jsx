'use client';

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PayPalDonationButton({ 
  amount = '10.00', 
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  sx,
  ...other 
}) {
  const [{ isPending, isResolved }] = usePayPalScriptReducer();
  const [donationAmount, setDonationAmount] = useState(amount);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [error, setError] = useState(null);

  const predefinedAmounts = ['5.00', '10.00', '25.00', '50.00'];

  const createOrder = (data, actions) => actions.order.create({
      purchase_units: [
        {
          amount: {
            value: donationAmount,
            currency_code: currency,
          },
          description: 'Donation to support our project',
        },
      ],
    });

  const onApprove = (data, actions) => {
    setError(null);
    return actions.order.capture().then((details) => {
      toast.success('Donation successful! Thank you for your support!');
      if (onSuccess) {
        onSuccess(details);
      }
    });
  };

  const onErrorHandler = (err) => {
    toast.error('Payment failed. Please try again.');
    setError('Payment failed. Please try again.');
    if (onError) {
      onError(err);
    }
  };

  const onCancelHandler = (data) => {
    if (onCancel) {
      onCancel(data);
    }
  };

  return (
    <Box sx={{ p: 2, ...sx }} {...other}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="payments:paypal" width={20} />
          Support Me
        </Typography>
        
        {/* Amount Selection */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {predefinedAmounts.map((amt) => (
            <Button
              key={amt}
              size="small"
              variant={donationAmount === amt ? 'contained' : 'outlined'}
              onClick={() => {
                setDonationAmount(amt);
                setIsCustomAmount(false);
              }}
              sx={{ minWidth: 'auto', px: 1.5, py: 0.5 }}
              disabled={isPending}
            >
              ${amt}
            </Button>
          ))}
          <Button
            size="small"
            variant={isCustomAmount ? 'contained' : 'outlined'}
            onClick={() => setIsCustomAmount(true)}
            sx={{ minWidth: 'auto', px: 1.5, py: 0.5 }}
            disabled={isPending}
          >
            Other
          </Button>
        </Box>

        {isCustomAmount && (
          <Box sx={{ mt: 1 }}>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                opacity: isPending ? 0.6 : 1,
              }}
            />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* PayPal Buttons */}
      {isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 45, mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Loading PayPal...
          </Typography>
        </Box>
      )}

      {isResolved && (
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'donate',
            height: 35,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          onCancel={onCancelHandler}
        />
      )}
    </Box>
  );
} 