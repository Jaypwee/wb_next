'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { PayPalDonationButton } from 'src/components/paypal-donation';

// ----------------------------------------------------------------------

export function DonationsView() {
  const handleDonationSuccess = (details) => {
    console.log('Donation successful:', details);
    // You can add custom success handling here
    // For example, show a success message, update user status, etc.
  };

  const handleDonationError = (error) => {
    console.error('Donation error:', error);
    // You can add custom error handling here
  };

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Support War Beast App!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your donations help me maintain the servers and add new features.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Donation Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Paypal Donation (DOES NOT WORK YET!)
                </Typography>
                
                <PayPalDonationButton
                  onSuccess={handleDonationSuccess}
                  onError={handleDonationError}
                  sx={{ 
                    border: 'none',
                    bgcolor: 'transparent',
                    p: 0,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* KakaoTalk Donation Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  KakaoTalk Donation
                </Typography>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    href="https://link.kakaopay.com/_/ha79dxw"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: '#3C1E1E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify icon="simple-icons:kakaotalk" width={16} sx={{ color: 'white' }} />
                      </Box>
                    }
                    sx={{
                      bgcolor: '#FFCD00',
                      color: '#3C1E1E',
                      fontWeight: 'bold',
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: '#F5C400',
                      },
                      '&:active': {
                        bgcolor: '#E6B800',
                      },
                      boxShadow: '0 4px 12px rgba(255, 205, 0, 0.3)',
                    }}
                  >
                    카카오페이로 후원하기
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                    카카오톡톡을 통해 간편하게 후원할 수 있습니다.
                    <br />
                    여러분의 후원에 감사드립니다.
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF9E6', borderRadius: 1, border: '1px solid #FFCD00' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Iconify icon="material-symbols:info-outline" width={16} sx={{ color: '#F5C400', mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#8B6914' }}>
                      카카오페이 정보
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8B6914', lineHeight: 1.4 }}>
                    • 카카오톡 앱에서 링크를 열어주세요
                    <br />
                    • 카카오페이 계정이 필요합니다
                    <br />
                    • 페이팔보다 빠르고 안전한 후원이 보장됩니다.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
} 