import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Stack, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../services/api';
import { setCredentials } from '../store/slices/authSlice';

const MotionPaper = motion(Paper);

const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useParams<{ role: 'donor' | 'receiver' | 'volunteer' }>();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/complete-onboarding', {
        fullName: formData.fullName,
        role: role,
        profilePhoto: null,
        donorData: role === 'donor' ? {
          donorType: 'restaurant',
          address: '123 Main St',
          latitude: 12.9716,
          longitude: 77.5946,
        } : undefined,
        receiverData: role === 'receiver' ? {
          receiverType: 'ngo',
          address: '123 Main St',
          latitude: 12.9716,
          longitude: 77.5946,
          preferredRadiusKm: 5,
        } : undefined,
        volunteerData: role === 'volunteer' ? {
          vehicleType: 'two_wheeler',
          maxDeliveryDistanceKm: 10,
        } : undefined,
      });

      dispatch(setCredentials({ 
        user: response.data.user, 
        token: localStorage.getItem('token') || '', 
        refreshToken: localStorage.getItem('refreshToken') || '' 
      }));

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete onboarding');
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
          sx={{ p: 4, borderRadius: 4 }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
            Complete Your Profile
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
            {role === 'donor' && 'Set up your donor profile to start sharing food'}
            {role === 'receiver' && 'Set up your receiver profile to start claiming food'}
            {role === 'volunteer' && 'Set up your volunteer profile to start delivering food'}
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Alert severity="info">
              <Typography variant="body2">
                For this demo, we'll use default location and settings. You can update these later in your profile.
              </Typography>
            </Alert>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !formData.fullName.trim()}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default OnboardingPage;
