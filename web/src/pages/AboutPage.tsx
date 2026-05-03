import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
          About FoodBridge
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
          FoodBridge is a platform that connects surplus food with those who need it. We make donating food as simple as posting a photo.
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
