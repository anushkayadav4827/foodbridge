import { Box, Container, Typography, Button, Grid, Card, Avatar, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NatureIcon from '@mui/icons-material/Nature';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const LandingPage = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const features = [
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Under 2 Minutes',
      description: 'Post your surplus food in less time than it takes to make tea',
      color: '#2E7D32',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Verified Network',
      description: 'All NGOs and receivers are verified for your peace of mind',
      color: '#FF6F00',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Free Delivery',
      description: 'Community volunteers deliver food at no cost',
      color: '#0288D1',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Track Impact',
      description: 'See exactly how many meals you\'ve saved and CO₂ prevented',
      color: '#388E3C',
    },
  ];

  const stats = [
    { value: 50000, label: 'Meals Shared', suffix: '+' },
    { value: 25, label: 'Tonnes Saved', suffix: 'T' },
    { value: 500, label: 'Active Donors', suffix: '+' },
    { value: 150, label: 'NGO Partners', suffix: '+' },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Post Your Food',
      description: 'Take a photo, add quantity, and set pickup time',
      icon: <RestaurantIcon />,
    },
    {
      step: '2',
      title: 'Get Matched',
      description: 'Our smart system finds nearby receivers instantly',
      icon: <GroupsIcon />,
    },
    {
      step: '3',
      title: 'Coordinate Pickup',
      description: 'Receiver or volunteer picks up with a secure code',
      icon: <LocalShippingIcon />,
    },
    {
      step: '4',
      title: 'Make Impact',
      description: 'Track your contribution to ending hunger',
      icon: <FavoriteIcon />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
          color: 'white',
          pt: 8,
          pb: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NatureIcon sx={{ fontSize: 36 }} />
              FoodBridge
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" onClick={() => navigate('/about')}>
                About
              </Button>
              <Button color="inherit" onClick={() => navigate('/how-it-works')}>
                How It Works
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: '#2E7D32',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip
                  label="🌱 Fighting Hunger, One Meal at a Time"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 3,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="h1" sx={{ mb: 3, color: 'white' }}>
                  Share Food,
                  <br />
                  Share Hope
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, fontWeight: 400, lineHeight: 1.6 }}>
                  Connect surplus food with those who need it. Make donating as simple as posting a photo.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: '#2E7D32',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Start Donating
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                    onClick={() => navigate('/how-it-works')}
                  >
                    Learn More
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop"
                  alt="Food sharing"
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                />
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 12, position: 'relative', zIndex: 2 }}>
        <MotionCard
          ref={statsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#2E7D32', fontWeight: 800, mb: 1 }}>
                    {statsInView && (
                      <>
                        <CountUp end={stat.value} duration={2.5} separator="," />
                        {stat.suffix}
                      </>
                    )}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </MotionCard>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Why Choose FoodBridge?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              We've built the simplest, fastest, and most trustworthy way to share surplus food
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: `${feature.color}15`,
                      color: feature.color,
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            How It Works
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Four simple steps to make a real difference
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {howItWorks.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                sx={{ textAlign: 'center' }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: '#2E7D32',
                      fontSize: '2rem',
                    }}
                  >
                    {step.icon}
                  </Avatar>
                  <Chip
                    label={step.step}
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: '#FF6F00',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {step.description}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6F00 0%, #FFA726 100%)',
          color: 'white',
          py: 10,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 3, color: 'white' }}>
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, fontWeight: 400 }}>
              Join thousands of donors, receivers, and volunteers fighting hunger together
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: '#FF6F00',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
              onClick={() => navigate('/login')}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#3E2723', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NatureIcon />
                FoodBridge
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Making food donation as simple as posting a photo. Together, we can end hunger.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }} onClick={() => navigate('/about')}>
                  About Us
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }} onClick={() => navigate('/how-it-works')}>
                  How It Works
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Contact
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: contact@foodbridge.org
                <br />
                Phone: +91 98765 43210
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2025 FoodBridge. All rights reserved. Built with ❤️ for a hunger-free world.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
