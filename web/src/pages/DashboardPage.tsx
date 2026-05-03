import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Stack, Chip, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../store';
import api from '../services/api';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NatureIcon from '@mui/icons-material/Nature';
import PeopleIcon from '@mui/icons-material/People';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalMealsDonated: number;
  totalKgSaved: number;
  co2Prevented: number;
  uniqueReceiversHelped: number;
  currentStreak: number;
  longestStreak: number;
}

interface Listing {
  id: string;
  title: string;
  status: string;
  quantityValue: number;
  quantityUnit: string;
  createdAt: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats and listings in parallel
      const [statsResponse, listingsResponse] = await Promise.all([
        api.get('/donors/me/stats').catch(() => ({ data: null })),
        api.get('/donors/me/listings?limit=5').catch(() => ({ data: { listings: [] } })),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (listingsResponse.data?.listings) {
        setRecentListings(listingsResponse.data.listings);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Meals Donated', 
      value: stats?.totalMealsDonated || 0, 
      icon: <RestaurantIcon />, 
      color: '#2E7D32' 
    },
    { 
      label: 'People Helped', 
      value: stats?.uniqueReceiversHelped || 0, 
      icon: <PeopleIcon />, 
      color: '#FF6F00' 
    },
    { 
      label: 'CO₂ Prevented', 
      value: `${stats?.co2Prevented || 0}kg`, 
      icon: <NatureIcon />, 
      color: '#0288D1' 
    },
    { 
      label: 'Current Streak', 
      value: `${stats?.currentStreak || 0} days`, 
      icon: <TrendingUpIcon />, 
      color: '#388E3C' 
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Welcome back, {user?.fullName || 'Friend'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here's what's happening with your food donations
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Listings
              </Typography>
              {recentListings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                    No listings yet
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/create-listing')}>
                    Create Your First Listing
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {recentListings.map((listing) => (
                    <Card key={listing.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {listing.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {listing.quantityValue} {listing.quantityUnit}
                            </Typography>
                          </Box>
                          <Chip 
                            label={listing.status} 
                            color={
                              listing.status === 'available' ? 'success' : 
                              listing.status === 'claimed' ? 'warning' : 
                              listing.status === 'completed' ? 'primary' : 
                              'default'
                            }
                            size="small"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate('/create-listing')}
                  >
                    Create New Listing
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RestaurantIcon />}
                  onClick={() => navigate('/create-listing')}
                >
                  Post Food
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/discover')}
                >
                  Find Food
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/impact')}
                >
                  View Impact
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {stats && stats.currentStreak > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Your Streaks
                </Typography>
                <Stack spacing={1}>
                  <Chip 
                    label={`🔥 ${stats.currentStreak} Day Streak`} 
                    color="secondary" 
                  />
                  {stats.longestStreak > stats.currentStreak && (
                    <Chip 
                      label={`🏆 Best: ${stats.longestStreak} Days`} 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
