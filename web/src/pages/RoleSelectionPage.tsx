import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Stack, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NatureIcon from '@mui/icons-material/Nature';

const MotionCard = motion(Card);

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'donor' | 'receiver' | 'volunteer'>('donor');

  const roles = [
    {
      value: 'donor',
      title: 'Donor',
      icon: <RestaurantIcon sx={{ fontSize: 60 }} />,
      description: 'I have surplus food to share',
      details: 'Restaurants, supermarkets, caterers, households, or anyone with extra food',
      color: '#2E7D32',
    },
    {
      value: 'receiver',
      title: 'Receiver',
      icon: <VolunteerActivismIcon sx={{ fontSize: 60 }} />,
      description: 'I need food for my community',
      details: 'NGOs, shelters, community kitchens, schools, or individuals in need',
      color: '#FF6F00',
    },
    {
      value: 'volunteer',
      title: 'Volunteer',
      icon: <LocalShippingIcon sx={{ fontSize: 60 }} />,
      description: 'I want to help deliver food',
      details: 'Help transport food from donors to receivers in your area',
      color: '#0288D1',
    },
  ];

  const handleContinue = () => {
    navigate(`/onboarding/${selectedRole}`);
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
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <NatureIcon sx={{ fontSize: 48, color: 'white' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
              FoodBridge
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
            How would you like to help?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
            Choose your primary role (you can add more roles later)
          </Typography>
        </Box>

        <RadioGroup value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)}>
          <Stack spacing={3} sx={{ mb: 4 }}>
            {roles.map((role, index) => (
              <MotionCard
                key={role.value}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  cursor: 'pointer',
                  border: selectedRole === role.value ? `3px solid ${role.color}` : '3px solid transparent',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => setSelectedRole(role.value as any)}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <FormControlLabel
                      value={role.value}
                      control={<Radio />}
                      label=""
                      sx={{ m: 0 }}
                    />
                    <Box
                      sx={{
                        bgcolor: `${role.color}15`,
                        color: role.color,
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {role.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {role.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.primary', mb: 1, fontWeight: 500 }}>
                        {role.description}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {role.details}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </MotionCard>
            ))}
          </Stack>
        </RadioGroup>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinue}
            sx={{
              bgcolor: 'white',
              color: '#2E7D32',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            }}
          >
            Continue
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default RoleSelectionPage;
