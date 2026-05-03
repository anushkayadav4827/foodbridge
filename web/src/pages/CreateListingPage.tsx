import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Stack, Card, CardContent, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [formData, setFormData] = useState({
    title: '',
    quantityValue: '',
    pickupAddress: '',
    readyFrom: '',
    pickupBy: '',
  });

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use the base URL from environment variable, remove /api/v1 suffix for health check
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1').replace('/api/v1', '');
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };
    
    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.quantityValue || !formData.pickupAddress || !formData.readyFrom || !formData.pickupBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/listings', {
        title: formData.title,
        description: '',
        foodTypes: ['cooked_hot'],
        quantityValue: parseFloat(formData.quantityValue),
        quantityUnit: 'meals',
        isVegetarian: false,
        isVegan: false,
        isHalal: false,
        allergens: [],
        photoUrls: [],
        pickupAddress: formData.pickupAddress,
        pickupLatitude: 12.9716,
        pickupLongitude: 77.5946,
        readyFrom: new Date(formData.readyFrom).toISOString(),
        pickupBy: new Date(formData.pickupBy).toISOString(),
      });

      console.log('✅ Listing created:', response.data);
      toast.success('Listing created successfully! 🎉');
      
      // Wait a moment before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Failed to create listing:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to create listing';
      
      if (error.message === 'Network Error') {
        errorMessage = '🔌 Cannot connect to backend server.\n\n' +
                      'The backend may have restarted (clearing your session) or is not running.\n\n' +
                      '✅ Solution: Login again or check if backend is running on port 3005.';
      } else if (error.response?.status === 401) {
        errorMessage = '🔐 Session expired or invalid.\n\n' +
                      'The backend restarted and cleared all sessions.\n\n' +
                      '✅ Solution: Please login again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create Food Listing
        </Typography>
        <Chip 
          label={backendStatus === 'online' ? '🟢 Backend Online' : backendStatus === 'offline' ? '🔴 Backend Offline' : '🟡 Checking...'}
          color={backendStatus === 'online' ? 'success' : backendStatus === 'offline' ? 'error' : 'warning'}
          size="small"
        />
      </Box>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Share your surplus food with those who need it
      </Typography>

      {backendStatus === 'offline' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            ⚠️ Cannot connect to backend server
          </Typography>
          <Typography variant="body2">
            Make sure the backend is running on port 3005:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, fontSize: '0.85rem' }}>
            cd backend && npm run dev:mock
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                📝 Quick Listing Form
              </Typography>
              <Typography variant="body2">
                Full multi-step wizard with photo upload, map selection, and AI predictions coming in Step 2!
              </Typography>
            </Alert>

            {!localStorage.getItem('token') && (
              <Alert severity="warning">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🔐 Authentication Required
                </Typography>
                <Typography variant="body2">
                  You need to login first. If the backend restarted, your session was cleared.
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => navigate('/login')}
                  sx={{ mt: 1 }}
                >
                  Go to Login
                </Button>
              </Alert>
            )}

            <TextField
              fullWidth
              label="Food Title"
              placeholder="e.g., Fresh Biryani - 20 portions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Quantity (meals)"
              type="number"
              value={formData.quantityValue}
              onChange={(e) => setFormData({ ...formData, quantityValue: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Pickup Address"
              multiline
              rows={2}
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Ready From"
              type="datetime-local"
              value={formData.readyFrom}
              onChange={(e) => setFormData({ ...formData, readyFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: 300, // 5 minutes
                min: new Date().toISOString().slice(0, 16), // Prevent past dates
              }}
              helperText="When will the food be ready for pickup? (Use browser's date picker)"
              required
            />

            <TextField
              fullWidth
              label="Pickup By"
              type="datetime-local"
              value={formData.pickupBy}
              onChange={(e) => setFormData({ ...formData, pickupBy: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: 300, // 5 minutes
                min: formData.readyFrom || new Date().toISOString().slice(0, 16), // Must be after readyFrom
              }}
              helperText="Last time for pickup (Must be after 'Ready From' time)"
              required
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Post Listing'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateListingPage;
