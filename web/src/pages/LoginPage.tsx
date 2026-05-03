import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import NatureIcon from '@mui/icons-material/Nature';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import { setCredentials } from '../store/slices/authSlice';
import api from '../services/api';

const MotionPaper = motion(Paper);

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔵 [FRONTEND] Sending OTP request:', {
        phoneNumber,
        countryCode: '+91',
        fullPhone: `+91${phoneNumber}`,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1',
      });

      const response = await api.post('/auth/send-otp', {
        phoneNumber,
        countryCode: '+91',
      });

      console.log('✅ [FRONTEND] OTP sent successfully:', response.data);
      toast.success('OTP sent successfully!');
      setStep('otp');
    } catch (err: any) {
      console.error('❌ [FRONTEND] Send OTP failed:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || 'Failed to send OTP');
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔵 [FRONTEND] Verifying OTP:', {
        phoneNumber,
        otpCode,
        countryCode: '+91',
        fullPhone: `+91${phoneNumber}`,
      });

      const response = await api.post('/auth/verify-otp', {
        phoneNumber,
        otpCode,
        countryCode: '+91',
      });

      console.log('✅ [FRONTEND] OTP verified successfully:', {
        user: response.data.user,
        isNewUser: response.data.isNewUser,
      });

      const { user, token, refreshToken, isNewUser } = response.data;

      dispatch(setCredentials({ user, token, refreshToken }));

      if (isNewUser) {
        toast.success('Welcome to FoodBridge! Please complete your profile.');
        // TODO: Navigate to onboarding
        navigate('/dashboard');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ [FRONTEND] Verify OTP failed:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        phoneNumber,
        otpCode,
      });
      setError(err.response?.data?.error || 'Invalid OTP');
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          elevation={10}
          sx={{ p: 5, borderRadius: 4 }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <NatureIcon sx={{ fontSize: 48, color: '#2E7D32' }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                FoodBridge
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              {step === 'phone' ? 'Welcome! Let\'s get started' : 'Enter verification code'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {step === 'phone' ? (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                    setError('');
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 0.5 }} />
                      +91
                    </Box>
                  ),
                }}
                helperText="We'll send you a 6-digit verification code"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  We sent a code to +91 {phoneNumber}
                </Typography>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtpCode(value);
                      setError('');
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  inputProps={{
                    style: { fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' },
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOTP}
                disabled={loading || otpCode.length !== 6}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError('');
                }}
              >
                Change Phone Number
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleSendOTP}
                disabled={loading}
              >
                Resend OTP
              </Button>
            </Stack>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </MotionPaper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="text"
            sx={{ color: 'white' }}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
